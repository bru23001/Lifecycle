"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { traceLinkConfidenceSchema, traceLinkRelationSchema } from "@/lib/trace-link-relations";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";

const inputSchema = z.object({
  projectId: z.string().min(1),
  linkId: z.string().min(1),
  relation: traceLinkRelationSchema,
  rationale: z
    .string()
    .trim()
    .min(3, "Rationale is required (3–500 characters).")
    .max(500, "Rationale must be 500 characters or fewer."),
  confidence: traceLinkConfidenceSchema,
  evidenceReference: z.string().trim().max(500).optional().default(""),
  verificationNote: z.string().trim().max(2000).optional().default(""),
  /** When true, sets `lastVerifiedAt` to now on save. */
  recordVerification: z.boolean().optional().default(false),
});

export type UpdateTraceLinkResult = { ok: true } | { ok: false; error: string };

export async function updateTraceLink(raw: z.input<typeof inputSchema>): Promise<UpdateTraceLinkResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, linkId, relation, rationale, confidence, evidenceReference, verificationNote, recordVerification } =
    parsed.data;

  const user = await requireCurrentUser();

  const link = await prisma.traceLink.findFirst({
    where: { id: linkId, projectId, deletedAt: null },
    select: { id: true, fromKind: true, fromId: true, toKind: true, toId: true },
  });
  if (!link) {
    return { ok: false, error: "Trace link not found." };
  }

  const dup = await prisma.traceLink.findFirst({
    where: {
      projectId,
      deletedAt: null,
      id: { not: linkId },
      fromKind: link.fromKind,
      fromId: link.fromId,
      toKind: link.toKind,
      toId: link.toId,
      relation,
    },
    select: { id: true },
  });
  if (dup) {
    return { ok: false, error: "Another link with the same endpoints and relation already exists." };
  }

  await prisma.traceLink.update({
    where: { id: linkId },
    data: {
      relation,
      rationale,
      confidence,
      evidenceReference: evidenceReference.trim(),
      verificationNote,
      ...(recordVerification ? { lastVerifiedAt: new Date() } : {}),
    },
  });

  await recordAudit({
    action: "trace_link.updated",
    subjectKind: "trace_link",
    subjectId: linkId,
    projectId,
    actorId: user.id,
    metadata: {
      relation,
      rationale,
      confidence,
      evidenceReference: evidenceReference.trim(),
      verificationNote,
      recordVerification,
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "trace_link.updated",
    request_id: requestId,
    projectId,
    linkId,
    relation,
  });

  return { ok: true };
}
