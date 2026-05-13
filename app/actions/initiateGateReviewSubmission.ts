"use server";

import { z } from "zod";

import { recordAudit } from "@/lib/server/audit";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";

const inputSchema = z.object({
  projectId: z.string().min(1),
  gateCode: z.string().min(1),
});

export type InitiateGateReviewSubmissionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Records the *intent* to submit a gate review.
 *
 * The actual decision is recorded later by `recordGateReview` once the user
 * confirms on the Gate Review screen. This action is the pre-decision
 * audit/telemetry hook for the Submit Gate Review modal, so we have a
 * tamper-resistant trail of who initiated the submission and when.
 *
 * CYBERCUBE 2.7 (IR) / 4.5 (Observability): emits an `AuditEntry` and a
 * structured log line. No PII is written: `gateCode` and `projectId` are
 * non-personal CC-PIDs.
 */
export async function initiateGateReviewSubmission(
  raw: z.infer<typeof inputSchema>,
): Promise<InitiateGateReviewSubmissionResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, gateCode } = parsed.data;

  await recordAudit({
    action: "gate_review.submission_initiated",
    subjectKind: "project",
    subjectId: projectId,
    projectId,
    metadata: { gateCode },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "gate_review.submission_initiated",
    request_id: requestId,
    projectId,
    gateCode,
  });

  return { ok: true };
}
