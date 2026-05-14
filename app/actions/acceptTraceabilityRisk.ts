"use server";

import { z } from "zod";

import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";
import { loadTraceabilityMatrix } from "@/lib/server/traceability";

const inputSchema = z.object({
  projectId: z.string().min(1),
  gapId: z.string().min(1),
  gapSummary: z.string().max(600),
  riskImpact: z.string().min(3).max(600),
  justification: z.string().trim().min(10, "Justification must be at least 10 characters.").max(2000),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Review date must be YYYY-MM-DD."),
  approverRequired: z.boolean(),
});

export type AcceptTraceabilityRiskResult = { ok: true } | { ok: false; error: string };

export async function acceptTraceabilityRisk(raw: z.input<typeof inputSchema>): Promise<AcceptTraceabilityRiskResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, gapId, gapSummary, riskImpact, justification, reviewDate, approverRequired } = parsed.data;
  const user = await requireCurrentUser();

  const matrix = await loadTraceabilityMatrix(projectId);
  const gap = matrix.traceabilityGaps.find((g) => g.id === gapId);
  if (!gap) {
    return { ok: false, error: "Gap not found for this project (it may have been resolved)." };
  }

  await recordAudit({
    action: "traceability.accepted_risk",
    subjectKind: "traceability_gap",
    subjectId: gapId,
    projectId,
    actorId: user.id,
    metadata: {
      gapType: gap.type,
      objectId: gap.objectId,
      gapSummary,
      riskImpact,
      justification,
      reviewDate,
      approverRequired,
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "traceability.accepted_risk",
    request_id: requestId,
    projectId,
    gapId,
    approver_required: approverRequired,
  });

  return { ok: true };
}
