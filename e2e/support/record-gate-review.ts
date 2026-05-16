import {
  recordGateReviewCore,
  type RecordGateReviewInput,
  type RecordGateReviewResult,
} from "@/lib/server/record-gate-review-core";
import { SOLO_WORKSPACE_USER_EMAIL } from "@/lib/server/current-user";

import { getE2ePrisma } from "./db";

export type { RecordGateReviewInput, RecordGateReviewResult };

/** Records a gate decision against the isolated E2E database (no server action import). */
export async function recordGateReviewForE2e(
  raw: RecordGateReviewInput,
): Promise<RecordGateReviewResult> {
  const prisma = getE2ePrisma();
  const user = await prisma.user.findUnique({
    where: { email: SOLO_WORKSPACE_USER_EMAIL },
    select: { id: true },
  });
  return recordGateReviewCore(prisma, raw, {
    submittedById: user?.id ?? null,
    writeAudit: true,
  });
}
