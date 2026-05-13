import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { indexLatestGateDecisions } from "@/lib/gateStatus";
import { canOpenGateReview } from "@/lib/phaseTransitions";
import { ALL_GATES } from "@/lib/server/helpers";
import { clampWorkspacePhase } from "@/lib/workspacePhases";

type ApprovalTx = Prisma.TransactionClient;

export const OPEN_APPROVAL_STATUSES = ["pending", "in_review", "changes_requested"] as const;

type CreateArtifactApprovalInput = {
  projectId: string;
  artifactId: string;
  submittedById?: string | null;
  priority?: "low" | "medium" | "high" | "critical";
};

type AppendGateReviewOutcomeInput = {
  projectId: string;
  gateId: string;
  decision: "Accepted" | "Conditional" | "Returned" | "Deferred" | "Rejected";
  nextAction: string;
  authorityName: string;
  authorityRole: string;
  submittedById?: string | null;
};

function mapGateDecisionToApprovalStatus(
  decision: AppendGateReviewOutcomeInput["decision"],
): "approved" | "changes_requested" {
  if (decision === "Accepted" || decision === "Conditional") {
    return "approved";
  }
  return "changes_requested";
}

export async function createArtifactApproval(
  tx: ApprovalTx,
  input: CreateArtifactApprovalInput,
) {
  return tx.approval.create({
    data: {
      projectId: input.projectId,
      approvalType: "artifact_review",
      artifactId: input.artifactId,
      status: "in_review",
      priority: input.priority ?? "medium",
      submittedById: input.submittedById ?? null,
    },
  });
}

/**
 * Resolve the open gate review approval for this gate (or create one) and append a decision comment.
 */
export async function appendGateReviewOutcome(
  tx: ApprovalTx,
  input: AppendGateReviewOutcomeInput,
) {
  const status = mapGateDecisionToApprovalStatus(input.decision);
  const existing = await tx.approval.findFirst({
    where: {
      projectId: input.projectId,
      approvalType: "gate_review",
      gateId: input.gateId,
      status: { in: [...OPEN_APPROVAL_STATUSES] },
    },
    orderBy: { createdAt: "desc" },
  });

  const approval =
    existing
      ? await tx.approval.update({
          where: { id: existing.id },
          data: {
            status,
            submittedById: input.submittedById ?? existing.submittedById ?? null,
          },
        })
      : await tx.approval.create({
          data: {
            projectId: input.projectId,
            approvalType: "gate_review",
            gateId: input.gateId,
            status,
            priority: "medium",
            submittedById: input.submittedById ?? null,
          },
        });

  const body = [
    `Decision: ${input.decision}`,
    `Authority: ${input.authorityName} (${input.authorityRole})`,
    `Next action: ${input.nextAction}`,
  ].join("\n");

  await tx.approvalComment.create({
    data: {
      approvalId: approval.id,
      authorId: input.submittedById ?? null,
      body,
    },
  });

  return approval;
}

/**
 * Close open artifact_review rows for the same project + template except the kept artifact (newer draft wins).
 */
export async function closeSupersededArtifactApprovals(
  tx: ApprovalTx,
  input: { projectId: string; templateId: string; keepArtifactId: string },
) {
  const stale = await tx.approval.findMany({
    where: {
      projectId: input.projectId,
      approvalType: "artifact_review",
      status: { in: [...OPEN_APPROVAL_STATUSES] },
      artifactId: { not: input.keepArtifactId },
      artifact: { templateId: input.templateId },
    },
    select: { id: true },
  });
  if (stale.length === 0) return;
  await tx.approval.updateMany({
    where: { id: { in: stale.map((s) => s.id) } },
    data: { status: "superseded" },
  });
}

function isArtifactApprovedJson(data: unknown): boolean {
  const d = data as Record<string, unknown>;
  const s = d.documentStatus ?? d.approvalStatus;
  return s === "Approved";
}

/**
 * Ensures DB rows exist for eligible gate queues and latest draft artifacts (dev / pre-migration).
 */
export async function backfillMissingApprovals() {
  const projects = await prisma.project.findMany({
    where: { archivedAt: null },
    include: {
      gateDecisions: { orderBy: { createdAt: "desc" } },
      artifacts: { orderBy: { createdAt: "desc" } },
    },
  });

  const openGates = await prisma.approval.findMany({
    where: {
      approvalType: "gate_review",
      status: { in: [...OPEN_APPROVAL_STATUSES] },
    },
    select: { projectId: true, gateId: true },
  });
  const openGateKey = new Set(
    openGates.map((r) => `${r.projectId}:${r.gateId ?? ""}`),
  );

  for (const project of projects) {
    const phase = clampWorkspacePhase(project.currentPhase);
    const decisionsRows = project.gateDecisions.map((d) => ({
      gateId: d.gateId,
      decision: d.decision,
      evidencePassSnapshot: d.evidencePassSnapshot,
      createdAt: d.createdAt,
    }));
    const latestByGate = indexLatestGateDecisions(decisionsRows);

    for (const gate of ALL_GATES) {
      const eligibility = canOpenGateReview(phase, gate, latestByGate);
      if (!eligibility.ok) continue;
      const latest = latestByGate.get(gate);
      const advanced =
        latest &&
        (latest.decision === "Accepted" || latest.decision === "Conditional") &&
        latest.evidencePassSnapshot;
      if (advanced) continue;
      const key = `${project.id}:${gate}`;
      if (openGateKey.has(key)) continue;
      await prisma.approval.create({
        data: {
          projectId: project.id,
          approvalType: "gate_review",
          gateId: gate,
          status: "pending",
          priority: gate === "G4" || gate === "G8" ? "high" : "medium",
        },
      });
      openGateKey.add(key);
    }

    const latestByTemplate = new Map<string, (typeof project.artifacts)[0]>();
    for (const a of project.artifacts) {
      if (!latestByTemplate.has(a.templateId)) latestByTemplate.set(a.templateId, a);
    }

    for (const art of latestByTemplate.values()) {
      if (art.status !== "Draft") continue;
      if (isArtifactApprovedJson(art.dataJson)) continue;

      await prisma.$transaction(async (tx) => {
        await closeSupersededArtifactApprovals(tx, {
          projectId: project.id,
          templateId: art.templateId,
          keepArtifactId: art.id,
        });
        const hasOpen = await tx.approval.findFirst({
          where: {
            projectId: project.id,
            artifactId: art.id,
            approvalType: "artifact_review",
            status: { in: [...OPEN_APPROVAL_STATUSES] },
          },
        });
        if (!hasOpen) {
          await createArtifactApproval(tx, {
            projectId: project.id,
            artifactId: art.id,
            submittedById: null,
          });
        }
      });
    }
  }
}
