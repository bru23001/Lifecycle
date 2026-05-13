"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { logInfo } from "@/lib/server/logger";
import { appendGateReviewOutcome } from "@/lib/server/approval-writes";
import { getCurrentUser } from "@/lib/server/current-user";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";
import { evaluateGateForProject } from "@/lib/gateRules";
import {
  canOpenGateReview,
  isAdvanceDecision,
  nextPhaseAfterGateDecision,
  type GateReviewDecision,
} from "@/lib/phaseTransitions";
import { indexLatestGateDecisions } from "@/lib/gateStatus";
import { clampWorkspacePhase } from "@/lib/workspacePhases";

const gateIdSchema = z.enum([
  "G1",
  "G2",
  "G3",
  "G4",
  "G5",
  "G6",
  "G7",
  "G8",
  "G9",
  "G10",
]);
const decisionSchema = z.enum([
  "Accepted",
  "Conditional",
  "Returned",
  "Deferred",
  "Rejected",
]);

const inputSchema = z.object({
  projectId: z.string().min(1),
  gateId: gateIdSchema,
  decision: decisionSchema,
  authorityName: z.string().trim().min(2, "Authority name is required."),
  authorityRole: z.string().trim().min(2, "Authority role is required."),
  nextAction: z.string().trim().min(5, "Next action must be specific (min 5 characters)."),
});

export type RecordGateReviewResult =
  | { ok: true; newPhase: number }
  | { ok: false; error: string; blockingMessages?: string[] };

export async function recordGateReview(
  raw: z.infer<typeof inputSchema>,
): Promise<RecordGateReviewResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { projectId, gateId, decision, authorityName, authorityRole, nextAction } =
    parsed.data;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const decisions = await prisma.gateDecision.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      gateId: true,
      decision: true,
      evidencePassSnapshot: true,
      createdAt: true,
    },
  });
  const latestByGate = indexLatestGateDecisions(decisions);

  const phase = clampWorkspacePhase(project.currentPhase);

  const eligibility = canOpenGateReview(phase, gateId, latestByGate);
  if (!eligibility.ok) {
    return { ok: false, error: eligibility.reason };
  }

  const evaluation = await evaluateGateForProject(projectId, gateId);
  const evidencePass = evaluation.pass;

  if (isAdvanceDecision(decision as GateReviewDecision) && !evidencePass) {
    const blocking = evaluation.checks
      .filter((c) => !c.ok)
      .map((c) => c.message);
    return {
      ok: false,
      error:
        "Accepted and Conditional decisions require all gate evidence checks to pass. Remediate the artifacts below, then re-submit.",
      blockingMessages: blocking.length ? blocking : undefined,
    };
  }

  const newPhase = clampWorkspacePhase(
    nextPhaseAfterGateDecision(
      gateId,
      decision as GateReviewDecision,
      evidencePass,
      phase,
    ),
  );

  const currentUser = await getCurrentUser();

  const gateDecisionId = await prisma.$transaction(async (tx) => {
    const created = await tx.gateDecision.create({
      data: {
        projectId,
        gateId,
        decision,
        authorityName,
        authorityRole,
        nextAction,
        evidencePassSnapshot: evidencePass,
      },
    });
    await tx.project.update({
      where: { id: projectId },
      data: { currentPhase: newPhase },
    });
    await appendGateReviewOutcome(tx, {
      projectId,
      gateId,
      decision,
      nextAction,
      authorityName,
      authorityRole,
      submittedById: currentUser?.id ?? null,
    });
    return created.id;
  });

  await recordAudit({
    action: "gate_review.recorded",
    subjectKind: "gate_decision",
    subjectId: gateDecisionId,
    projectId,
    metadata: {
      gateId,
      decision,
      newPhase,
      evidencePass,
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "gate_review.recorded",
    request_id: requestId,
    projectId,
    gateId,
    decision,
    newPhase,
    evidencePass,
  });

  return { ok: true, newPhase };
}