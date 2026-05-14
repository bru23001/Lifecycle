"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";
import { loadTraceabilityMatrix } from "@/lib/server/traceability";

const prioritySchema = z.enum(["low", "medium", "high"]);

const inputSchema = z.object({
  projectId: z.string().min(1),
  gapId: z.string().min(1),
  gapSummary: z.string().max(600),
  ownerUserId: z.string().min(1, "Owner is required."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD."),
  priority: prioritySchema,
  instructions: z.string().max(2000).optional(),
});

export type AssignTraceabilityRemediationResult = { ok: true } | { ok: false; error: string };

export async function assignTraceabilityRemediation(
  raw: z.input<typeof inputSchema>,
): Promise<AssignTraceabilityRemediationResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, gapId, gapSummary, ownerUserId, dueDate, priority, instructions } = parsed.data;
  const user = await requireCurrentUser();

  const matrix = await loadTraceabilityMatrix(projectId);
  const gap = matrix.traceabilityGaps.find((g) => g.id === gapId);
  if (!gap) {
    return { ok: false, error: "Gap not found for this project (it may have been resolved)." };
  }

  const owner = await prisma.user.findFirst({
    where: { id: ownerUserId, active: true },
    select: { id: true, email: true, name: true },
  });
  if (!owner) {
    return { ok: false, error: "Selected owner was not found or is inactive." };
  }

  await recordAudit({
    action: "traceability.remediation_assigned",
    subjectKind: "traceability_gap",
    subjectId: gapId,
    projectId,
    actorId: user.id,
    metadata: {
      gapType: gap.type,
      objectId: gap.objectId,
      gapSummary,
      assigneeUserId: ownerUserId,
      assigneeLabel: owner.name?.trim() || owner.email,
      dueDate,
      priority,
      instructions: instructions ?? "",
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "traceability.remediation_assigned",
    request_id: requestId,
    projectId,
    gapId,
    priority,
  });

  return { ok: true };
}
