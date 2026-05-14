"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";

const inputSchema = z.object({
  projectId: z.string().min(1),
  linkId: z.string().min(1),
  reason: z.string().trim().min(5, "Deletion reason must be at least 5 characters.").max(1000),
});

export type DeleteTraceLinkResult = { ok: true } | { ok: false; error: string };

export async function deleteTraceLink(raw: z.input<typeof inputSchema>): Promise<DeleteTraceLinkResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, linkId, reason } = parsed.data;
  const user = await requireCurrentUser();

  const link = await prisma.traceLink.findFirst({
    where: { id: linkId, projectId, deletedAt: null },
    select: { id: true, fromKind: true, fromId: true, toKind: true, toId: true, relation: true },
  });
  if (!link) {
    return { ok: false, error: "Trace link not found or already removed." };
  }

  await prisma.traceLink.update({
    where: { id: linkId },
    data: { deletedAt: new Date() },
  });

  await recordAudit({
    action: "trace_link.soft_deleted",
    subjectKind: "trace_link",
    subjectId: linkId,
    projectId,
    actorId: user.id,
    metadata: {
      reason,
      fromKind: link.fromKind,
      fromId: link.fromId,
      toKind: link.toKind,
      toId: link.toId,
      relation: link.relation,
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "trace_link.soft_deleted",
    request_id: requestId,
    projectId,
    linkId,
  });

  return { ok: true };
}
