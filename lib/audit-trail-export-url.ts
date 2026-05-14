import type { AuditExportFormat } from "@/lib/audit-trail-export";

export type BuildAuditTrailExportUrlInput = {
  projectId: string;
  /** ISO-8601 date or datetime; empty/null → unbounded. */
  from?: string | null;
  to?: string | null;
  actions?: string[] | null;
  actorIds?: string[] | null;
  format: AuditExportFormat;
};

/**
 * Builds `/api/projects/{id}/audit/export?...` for the Export Audit Trail
 * Modal. Pure; URL-encoded via `URLSearchParams`. Empty inputs are omitted.
 */
export function buildAuditTrailExportUrl(input: BuildAuditTrailExportUrlInput): string {
  const q = new URLSearchParams();
  q.set("format", input.format);
  if (input.from?.trim()) q.set("from", input.from.trim());
  if (input.to?.trim()) q.set("to", input.to.trim());
  if (input.actions && input.actions.length > 0) {
    q.set("actions", dedupe(input.actions).join(","));
  }
  if (input.actorIds && input.actorIds.length > 0) {
    q.set("actorIds", dedupe(input.actorIds).join(","));
  }
  return `/api/projects/${encodeURIComponent(input.projectId)}/audit/export?${q.toString()}`;
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}
