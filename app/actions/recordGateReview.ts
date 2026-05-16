"use server";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { logInfo } from "@/lib/server/logger";
import { getCurrentUser } from "@/lib/server/current-user";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";
import {
  recordGateReviewCore,
  type RecordGateReviewInput,
  type RecordGateReviewResult,
} from "@/lib/server/record-gate-review-core";

export type { RecordGateReviewResult };

export async function recordGateReview(
  raw: RecordGateReviewInput,
): Promise<RecordGateReviewResult> {
  const currentUser = await getCurrentUser();
  const result = await recordGateReviewCore(prisma, raw, {
    submittedById: currentUser?.id ?? null,
    writeAudit: false,
  });

  if (!result.ok) {
    return result;
  }

  const { projectId, gateId, decision } = raw;
  const gateDecision = await prisma.gateDecision.findFirst({
    where: { projectId, gateId },
    orderBy: { createdAt: "desc" },
    select: { id: true, evidencePassSnapshot: true },
  });

  if (gateDecision) {
    await recordAudit({
      action: "gate_review.recorded",
      subjectKind: "gate_decision",
      subjectId: gateDecision.id,
      projectId,
      metadata: {
        gateId,
        decision,
        newPhase: result.newPhase,
        evidencePass: gateDecision.evidencePassSnapshot,
      },
    });
  }

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "gate_review.recorded",
    request_id: requestId,
    projectId,
    gateId,
    decision,
    newPhase: result.newPhase,
    evidencePass: gateDecision?.evidencePassSnapshot,
  });

  return result;
}
