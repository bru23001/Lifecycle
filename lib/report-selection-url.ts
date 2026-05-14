import {
  REPORT_DETAIL_PATHS,
  reportDetailPath,
} from "@/lib/reports-detail-paths";

/**
 * Stable keys for the six report types surfaced in the Report Selection
 * Modal (matches the export route's `?key=` set in
 * `app/api/projects/[id]/reports/export/route.ts`).
 */
export type ReportSelectionKey =
  | "lifecycleStatus"
  | "gateDecision"
  | "traceability"
  | "missingEvidence"
  | "approvalHistory"
  | "fullProjectEvidencePackage";

export const REPORT_SELECTION_KEYS: readonly ReportSelectionKey[] = [
  "lifecycleStatus",
  "gateDecision",
  "traceability",
  "missingEvidence",
  "approvalHistory",
  "fullProjectEvidencePackage",
];

export type ReportSelectionFormat = "view" | "csv" | "json" | "pdf";

export const REPORT_SELECTION_FORMATS: readonly ReportSelectionFormat[] = [
  "view",
  "csv",
  "json",
  "pdf",
];

export type ReportSelectionInput = {
  projectId: string;
  reportKey: ReportSelectionKey;
  format: ReportSelectionFormat;
  /** ISO-8601 date (yyyy-mm-dd) or empty. */
  startDate?: string | null;
  endDate?: string | null;
};

export type ReportSelectionTarget =
  | { mode: "navigate"; href: string }
  | { mode: "download"; href: string };

/**
 * Maps a selection to a target the modal can act on.
 *
 *  - `format === "view"` → navigate to the corresponding `/reports/{segment}`
 *    detail page, surfacing date-range filters via the existing reports URL
 *    convention (`?dateRange=custom&startDate=...&endDate=...`).
 *  - else → trigger the existing single-report export endpoint
 *    (`/api/projects/{id}/reports/export?key=...&format=...&...`).
 *
 * Pure: no I/O, no React. Suitable for unit tests + reuse from the modal.
 */
export function buildReportSelectionTarget(
  input: ReportSelectionInput,
): ReportSelectionTarget {
  const q = new URLSearchParams();
  const start = input.startDate?.trim() || "";
  const end = input.endDate?.trim() || "";
  const hasRange = Boolean(start || end);

  if (hasRange) {
    q.set("dateRange", "custom");
    if (start) q.set("startDate", start);
    if (end) q.set("endDate", end);
  }

  if (input.format === "view") {
    const segment = SEGMENT_BY_KEY[input.reportKey];
    const base = reportDetailPath(input.projectId, segment);
    return {
      mode: "navigate",
      href: q.size > 0 ? `${base}?${q.toString()}` : base,
    };
  }

  q.set("key", input.reportKey);
  q.set("format", input.format);
  return {
    mode: "download",
    href: `/api/projects/${encodeURIComponent(input.projectId)}/reports/export?${q.toString()}`,
  };
}

const SEGMENT_BY_KEY: Record<ReportSelectionKey, keyof typeof REPORT_DETAIL_PATHS> = {
  lifecycleStatus: "lifecycleStatus",
  gateDecision: "gateDecisions",
  traceability: "traceability",
  missingEvidence: "missingEvidence",
  approvalHistory: "approvalHistory",
  fullProjectEvidencePackage: "evidencePackage",
};

export function reportSelectionLabel(key: ReportSelectionKey): string {
  switch (key) {
    case "lifecycleStatus":
      return "Lifecycle Status Report";
    case "gateDecision":
      return "Gate Decision Report";
    case "traceability":
      return "Traceability Report";
    case "missingEvidence":
      return "Missing Evidence Report";
    case "approvalHistory":
      return "Approval History Report";
    case "fullProjectEvidencePackage":
      return "Full Project Evidence Package";
    default: {
      const _exhaustive: never = key;
      void _exhaustive;
      return String(key);
    }
  }
}
