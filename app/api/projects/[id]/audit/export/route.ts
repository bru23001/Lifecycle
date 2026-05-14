import { NextResponse } from "next/server";

import { maskEmail, redactSensitive } from "@/lib/audit-event-details";
import {
  formatContentMeta,
  parseAuditExportSearchParams,
  serializeAuditCsv,
  serializeAuditJson,
  type AuditExportRow,
} from "@/lib/audit-trail-export";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { projectDisplayCode } from "@/lib/server/helpers";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";

/** Maximum rows returned in a single export. STD-OPS-003 §5: no unbounded responses. */
const MAX_EXPORT_ROWS = 5_000;

/**
 * `GET /api/projects/[id]/audit/export?from=&to=&actions=&actorIds=&format=`
 *
 * Streams the project's audit trail in CSV / JSON / PDF.
 *
 * CYBERCUBE hooks:
 *   - STD-SEC-004 §AuthZ: `requireCurrentUser` + scoped project lookup.
 *   - STD-DAT-004 §Multi-tenancy: `projectId` is the trust boundary; the
 *     Prisma `where` clause is project-filtered.
 *   - STD-DAT-001 §Logging: redact sensitive metadata + mask actor emails
 *     on the read path (defense-in-depth even though the writer scrubs too).
 *   - 6.1 §"Records Mgmt" + STD-OPS-003 §1: exporting audit content is
 *     itself recorded in `AuditEntry` with `audit_trail.exported` so the
 *     evidence package retains chain-of-custody.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await context.params;
  const url = new URL(req.url);
  const { filter, format, error } = parseAuditExportSearchParams(url.searchParams);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const user = await requireCurrentUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, slug: true, vaultFolder: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const rows = await prisma.auditEntry.findMany({
    where: {
      projectId,
      ...(filter.from || filter.to
        ? {
            createdAt: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
      ...(filter.actions && filter.actions.length > 0
        ? { action: { in: filter.actions } }
        : {}),
      ...(filter.actorIds && filter.actorIds.length > 0
        ? { actorId: { in: filter.actorIds } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: MAX_EXPORT_ROWS,
    include: { actor: { select: { name: true, email: true } } },
  });

  const exportRows: AuditExportRow[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    action: row.action,
    subjectKind: row.subjectKind,
    subjectId: row.subjectId,
    actor: actorForExport(row.actor),
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? redactSensitive(row.metadata as Record<string, unknown>)
        : {},
  }));

  const body =
    format === "csv" ? serializeAuditCsv(exportRows) : serializeAuditJson(exportRows);
  const meta = formatContentMeta(format);
  const filename = `audit-trail-${projectDisplayCode(project.vaultFolder, project.slug).toLowerCase()}-${new Date()
    .toISOString()
    .slice(0, 10)}.${meta.extension}`;

  await recordAudit({
    action: "audit_trail.exported",
    subjectKind: "project",
    subjectId: projectId,
    projectId,
    actorId: user.id,
    metadata: {
      format,
      rowCount: exportRows.length,
      from: filter.from?.toISOString() ?? null,
      to: filter.to?.toISOString() ?? null,
      actionCount: filter.actions?.length ?? 0,
      actorCount: filter.actorIds?.length ?? 0,
      capped: rows.length >= MAX_EXPORT_ROWS,
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "audit_trail.exported",
    request_id: requestId,
    projectId,
    format,
    rowCount: exportRows.length,
    capped: rows.length >= MAX_EXPORT_ROWS,
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": meta.contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function actorForExport(actor: { name: string | null; email: string } | null): string {
  if (!actor) return "System";
  const label = actor.name?.trim() || maskEmail(actor.email);
  return label;
}
