"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";

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

const inputSchema = z.object({
  projectId: z.string().min(1),
  gateId: gateIdSchema,
  assignmentIds: z.array(z.string().min(1)).min(1, "Select at least one pending approver."),
  message: z.string().trim().max(2000, "Message is too long."),
  includeDueDate: z.boolean(),
  includeReviewLink: z.boolean(),
});

export type SendGateApproverRemindersResult =
  | { ok: true; recipientCount: number }
  | { ok: false; error: string };

/**
 * Records a reminder intent for pending gate approvers. Email delivery is not
 * wired in this workspace build; the audit trail captures the operation for
 * governance review (CYBERCUBE 4.5 / 6.1).
 */
export async function sendGateApproverReminders(
  raw: z.infer<typeof inputSchema>,
): Promise<SendGateApproverRemindersResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { projectId, gateId, assignmentIds, message, includeDueDate, includeReviewLink } =
    parsed.data;

  await requireCurrentUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const rows = await prisma.gateApproverAssignment.findMany({
    where: { projectId, gateId, id: { in: assignmentIds } },
    select: { id: true },
  });
  if (rows.length !== assignmentIds.length) {
    return { ok: false, error: "One or more approver assignments are invalid." };
  }

  await recordAudit({
    action: "gate_review.approver_reminder_sent",
    subjectKind: "project",
    subjectId: projectId,
    projectId,
    metadata: {
      gateId,
      assignmentIds,
      includeDueDate,
      includeReviewLink,
      messageLength: message.length,
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "gate_review.approver_reminder_sent",
    request_id: requestId,
    projectId,
    gateId,
    recipientCount: assignmentIds.length,
  });

  return { ok: true, recipientCount: assignmentIds.length };
}
