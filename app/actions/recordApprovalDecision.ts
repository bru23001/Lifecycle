"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { OPEN_APPROVAL_STATUSES } from "@/lib/server/approval-writes";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";

const inputSchema = z.object({
  approvalId: z.string().min(1),
  decision: z.enum(["approve", "request_changes", "reject"]),
  comments: z.string().optional(),
  requiredChanges: z.array(z.string()).optional(),
});

export type RecordApprovalDecisionResult = { ok: true } | { ok: false; error: string };

function isOpenApprovalStatus(status: string): boolean {
  return (OPEN_APPROVAL_STATUSES as readonly string[]).includes(status);
}

export async function recordApprovalDecision(
  raw: z.infer<typeof inputSchema>,
): Promise<RecordApprovalDecisionResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { approvalId, decision, comments, requiredChanges } = parsed.data;

  const user = await requireCurrentUser();

  const row = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: { artifact: true, project: { select: { id: true, name: true } } },
  });

  if (!row) {
    return { ok: false, error: "Approval not found." };
  }

  if (row.approvalType !== "artifact_review") {
    return {
      ok: false,
      error: "Gate reviews must be decided from the Gate Review screen (evidence + phase rules).",
    };
  }

  if (!isOpenApprovalStatus(row.status)) {
    return { ok: false, error: "This approval is already closed." };
  }

  const nextStatus =
    decision === "approve"
      ? "approved"
      : decision === "request_changes"
        ? "changes_requested"
        : "rejected";

  const bodyLines = [
    `Decision: ${decision}`,
    comments?.trim() ? `Comments: ${comments.trim()}` : null,
    ...(requiredChanges ?? []).map((c, i) => (c.trim() ? `Change ${i + 1}: ${c.trim()}` : null)).filter(Boolean),
  ].filter(Boolean) as string[];

  const body =
    bodyLines.length > 0
      ? bodyLines.join("\n")
      : `Decision recorded: ${nextStatus}`;

  await prisma.$transaction(async (tx) => {
    await tx.approval.update({
      where: { id: approvalId },
      data: { status: nextStatus, submittedById: user.id },
    });
    await tx.approvalComment.create({
      data: {
        approvalId,
        authorId: user.id,
        body,
      },
    });
  });

  await recordAudit({
    action: "approval.decision_recorded",
    subjectKind: "approval",
    subjectId: approvalId,
    projectId: row.projectId,
    metadata: {
      approvalType: row.approvalType,
      decision,
      nextStatus,
      artifactId: row.artifactId,
    },
  });

  logInfo({
    message: "approval.decision_recorded",
    approvalId,
    projectId: row.projectId,
    decision,
    nextStatus,
  });

  return { ok: true };
}
