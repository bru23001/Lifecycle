import type { ProjectListItem, ProjectStatus } from "@/types/projects.types";

export const PROJECT_LIST_SORT_KEYS = ["updated", "created", "name", "progress", "gate", "missing"] as const;
export type ProjectListSortKey = (typeof PROJECT_LIST_SORT_KEYS)[number];

const STATUSES: readonly ProjectStatus[] = [
  "In Progress",
  "Blocked",
  "Pending",
  "Not Started",
] as const;

export type ParsedProjectsListQuery = {
  q: string;
  sort: ProjectListSortKey;
  /** Empty string means any status. */
  status: ProjectStatus | "";
  ownerContains: string;
  /** 1–14 inclusive, or null for any phase. */
  phase: number | null;
  /** When true, only projects with at least one open approval. */
  gatePendingOnly: boolean;
  /** When true, only projects with incomplete / unlinked evidence. */
  missingEvidenceOnly: boolean;
  updatedFrom: Date | null;
  updatedToExclusive: Date | null;
};

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : undefined;
}

function parseSort(raw: string | undefined): ProjectListSortKey {
  const v = raw?.trim().toLowerCase();
  if (v && (PROJECT_LIST_SORT_KEYS as readonly string[]).includes(v)) {
    return v as ProjectListSortKey;
  }
  return "updated";
}

function parseStatus(raw: string | undefined): ProjectStatus | "" {
  const v = raw?.trim() as ProjectStatus;
  if (v && (STATUSES as readonly string[]).includes(v)) return v;
  return "";
}

function parsePhase(raw: string | undefined): number | null {
  const v = raw?.trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1 || n > 14) return null;
  return n;
}

function parseDateStart(raw: string | undefined): Date | null {
  const v = raw?.trim();
  if (!v) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** End of local calendar day in UTC approximation: use next day 00:00 UTC exclusive when value is YYYY-MM-DD. */
function parseDateEndExclusive(raw: string | undefined): Date | null {
  const v = raw?.trim();
  if (!v) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

export function parseProjectsListQuery(sp: {
  q?: string | string[];
  sort?: string | string[];
  f_status?: string | string[];
  f_owner?: string | string[];
  f_phase?: string | string[];
  f_gate?: string | string[];
  f_missing?: string | string[];
  f_from?: string | string[];
  f_to?: string | string[];
}): ParsedProjectsListQuery {
  return {
    q: (searchParamFirst(sp.q) ?? "").trim(),
    sort: parseSort(searchParamFirst(sp.sort)),
    status: parseStatus(searchParamFirst(sp.f_status)),
    ownerContains: (searchParamFirst(sp.f_owner) ?? "").trim(),
    phase: parsePhase(searchParamFirst(sp.f_phase)),
    gatePendingOnly: (searchParamFirst(sp.f_gate) ?? "").trim().toLowerCase() === "pending",
    missingEvidenceOnly: searchParamFirst(sp.f_missing) === "1",
    updatedFrom: parseDateStart(searchParamFirst(sp.f_from)),
    updatedToExclusive: parseDateEndExclusive(searchParamFirst(sp.f_to)),
  };
}

export type ProjectListFilterRow = ProjectListItem & {
  updatedAtMs: number;
  createdAtMs: number;
  openApprovalsCount: number;
  lastGateDecisionAtMs: number;
};

export function rowMatchesListQuery(row: ProjectListFilterRow, q: ParsedProjectsListQuery): boolean {
  if (q.q) {
    const needle = q.q.toLowerCase();
    const hay = `${row.name} ${row.code}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  if (q.status && row.status !== q.status) return false;
  if (q.ownerContains) {
    const o = q.ownerContains.toLowerCase();
    if (!row.owner.toLowerCase().includes(o)) return false;
  }
  if (q.phase != null && row.currentPhase !== q.phase) return false;
  if (q.gatePendingOnly && row.openApprovalsCount === 0) return false;
  if (q.missingEvidenceOnly && row.missingEvidenceCount === 0) return false;
  if (q.updatedFrom != null && row.updatedAtMs < q.updatedFrom.getTime()) return false;
  if (q.updatedToExclusive != null && row.updatedAtMs >= q.updatedToExclusive.getTime()) return false;
  return true;
}

export function sortProjectListRows(rows: ProjectListFilterRow[], sort: ProjectListSortKey): ProjectListFilterRow[] {
  const copy = [...rows];
  const cmpNum = (a: number, b: number) => (a === b ? 0 : a < b ? 1 : -1);
  copy.sort((a, b) => {
    switch (sort) {
      case "created":
        return cmpNum(a.createdAtMs, b.createdAtMs);
      case "name":
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      case "progress":
        return cmpNum(a.progressPercent, b.progressPercent);
      case "gate": {
        const byPending = cmpNum(a.openApprovalsCount, b.openApprovalsCount);
        if (byPending !== 0) return byPending;
        return cmpNum(a.lastGateDecisionAtMs, b.lastGateDecisionAtMs);
      }
      case "missing":
        return cmpNum(a.missingEvidenceCount, b.missingEvidenceCount);
      case "updated":
      default:
        return cmpNum(a.updatedAtMs, b.updatedAtMs);
    }
  });
  return copy;
}

export function stripProjectListFilterRow(row: ProjectListFilterRow): ProjectListItem {
  /* eslint-disable @typescript-eslint/no-unused-vars -- strip server-only sort fields */
  const { updatedAtMs, createdAtMs, openApprovalsCount, lastGateDecisionAtMs, ...rest } = row;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return rest;
}

/** Query string (no leading `?`) preserving list filters; omit empty defaults. */
export function serializeProjectsListFilters(q: ParsedProjectsListQuery): string {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (q.sort !== "updated") p.set("sort", q.sort);
  if (q.status) p.set("f_status", q.status);
  if (q.ownerContains) p.set("f_owner", q.ownerContains);
  if (q.phase != null) p.set("f_phase", String(q.phase));
  if (q.gatePendingOnly) p.set("f_gate", "pending");
  if (q.missingEvidenceOnly) p.set("f_missing", "1");
  if (q.updatedFrom != null) p.set("f_from", q.updatedFrom.toISOString().slice(0, 10));
  if (q.updatedToExclusive != null) {
    const end = new Date(q.updatedToExclusive.getTime() - 86400000);
    p.set("f_to", end.toISOString().slice(0, 10));
  }
  return p.toString();
}
