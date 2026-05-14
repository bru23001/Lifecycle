/**
 * Pure serializers for the audit-trail export route.
 *
 * Kept I/O-free for unit testing. The HTTP layer
 * (`app/api/projects/[id]/audit/export/route.ts`) imports these helpers.
 */

export type AuditExportFormat = "csv" | "json" | "pdf";

export type AuditExportRow = {
  id: string;
  createdAt: string;
  action: string;
  subjectKind: string;
  subjectId: string;
  actor: string;
  metadata: Record<string, unknown>;
};

/** RFC 4180-style CSV cell escaping. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "string" ? value : JSON.stringify(value);
  if (s === "") return "";
  const needsQuoting = /[",\n\r]/.test(s);
  if (!needsQuoting) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

const CSV_COLUMNS: { key: keyof AuditExportRow; label: string }[] = [
  { key: "id", label: "id" },
  { key: "createdAt", label: "createdAt" },
  { key: "action", label: "action" },
  { key: "subjectKind", label: "subjectKind" },
  { key: "subjectId", label: "subjectId" },
  { key: "actor", label: "actor" },
  { key: "metadata", label: "metadata" },
];

export function serializeAuditCsv(rows: AuditExportRow[]): string {
  const header = CSV_COLUMNS.map((c) => csvCell(c.label)).join(",");
  const lines = rows.map((row) =>
    CSV_COLUMNS.map((c) => {
      const v = row[c.key];
      return c.key === "metadata" ? csvCell(JSON.stringify(v)) : csvCell(v);
    }).join(","),
  );
  return [header, ...lines].join("\r\n");
}

export function serializeAuditJson(rows: AuditExportRow[]): string {
  return JSON.stringify(rows, null, 2);
}

export type AuditExportFilter = {
  from?: Date | null;
  to?: Date | null;
  actions?: string[] | null;
  actorIds?: string[] | null;
};

/** Parses `?from=...&to=...&actions=a,b&actorIds=u1,u2&format=csv` into typed filters. */
export function parseAuditExportSearchParams(sp: URLSearchParams): {
  filter: AuditExportFilter;
  format: AuditExportFormat;
  error: string | null;
} {
  const fromRaw = sp.get("from");
  const toRaw = sp.get("to");
  const actionsRaw = sp.get("actions");
  const actorIdsRaw = sp.get("actorIds");
  const formatRaw = (sp.get("format") ?? "json").toLowerCase();

  if (!["csv", "json", "pdf"].includes(formatRaw)) {
    return {
      filter: {},
      format: "json",
      error: `Unknown export format: ${formatRaw}`,
    };
  }

  const from = parseIsoDate(fromRaw);
  if (fromRaw && !from) {
    return { filter: {}, format: "json", error: "Invalid `from` date." };
  }
  const to = parseIsoDate(toRaw);
  if (toRaw && !to) {
    return { filter: {}, format: "json", error: "Invalid `to` date." };
  }

  return {
    filter: {
      from: from ?? null,
      to: to ?? null,
      actions: splitCsvParam(actionsRaw),
      actorIds: splitCsvParam(actorIdsRaw),
    },
    format: formatRaw as AuditExportFormat,
    error: null,
  };
}

function parseIsoDate(raw: string | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function splitCsvParam(raw: string | null): string[] | null {
  if (!raw) return null;
  const out = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return out.length > 0 ? out : null;
}

/** Mime-type + filename extension per format. */
export function formatContentMeta(format: AuditExportFormat): {
  contentType: string;
  extension: string;
} {
  switch (format) {
    case "csv":
      return { contentType: "text/csv; charset=utf-8", extension: "csv" };
    case "json":
      return { contentType: "application/json; charset=utf-8", extension: "json" };
    case "pdf":
      // We don't carry a PDF generator in this repo; match the existing
      // reports-export precedent (`app/api/projects/[id]/reports/export/route.ts`)
      // which emits a JSON body with a `.pdf` filename.
      return { contentType: "application/json; charset=utf-8", extension: "pdf" };
    default: {
      const _exhaustive: never = format;
      void _exhaustive;
      return { contentType: "application/octet-stream", extension: "bin" };
    }
  }
}
