import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { normalizeGateParam } from "@/lib/gateNormalize";
import { projectAuditTrailListHref } from "@/lib/projects-url";

type PageProps = {
  params: Promise<{ id: string; auditEventId: string }>;
};

function metaGateId(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const g = (metadata as Record<string, unknown>).gateId;
  return typeof g === "string" ? g : null;
}

/**
 * Per-event deep-link: prefer the gate-scoped audit trail with the drawer open.
 * Falls back to the global project audit tab when the event has no `gateId` in metadata.
 */
export default async function ProjectAuditEventPage({ params }: PageProps) {
  const { id, auditEventId } = await params;
  const event = await prisma.auditEntry.findFirst({
    where: { id: auditEventId, projectId: id },
    select: { id: true, metadata: true },
  });
  if (!event) {
    notFound();
  }
  const gateRaw = metaGateId(event.metadata);
  const gate = gateRaw ? normalizeGateParam(gateRaw) : null;
  if (!gate) {
    redirect(projectAuditTrailListHref(id, { openAuditEventId: auditEventId }));
  }
  redirect(
    `/projects/${id}/audit?gate=${encodeURIComponent(gate)}&openAuditEvent=${encodeURIComponent(auditEventId)}`,
  );
}
