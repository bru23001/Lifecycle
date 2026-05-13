import { reportsFiltersToSearchParams } from "@/lib/reports-url";
import type { FullProjectEvidencePackageSummary, ReportsFilters } from "@/types/reports.types";

export type EvidencePackageScopeKey =
  | "artifacts"
  | "evidence"
  | "gateDecisions"
  | "traceability"
  | "approvals"
  | "auditManifest";

export type EvidencePackageScopes = Record<EvidencePackageScopeKey, boolean>;

/** Query keys appended to `/reports/evidence-package/configure` and export `GET`. */
export const EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS: Record<EvidencePackageScopeKey, string> = {
  artifacts: "pkg_art",
  evidence: "pkg_evd",
  gateDecisions: "pkg_gate",
  traceability: "pkg_trc",
  approvals: "pkg_apr",
  auditManifest: "pkg_aud",
};

export const EVIDENCE_PACKAGE_SCOPE_KEYS: readonly EvidencePackageScopeKey[] = [
  "artifacts",
  "evidence",
  "gateDecisions",
  "traceability",
  "approvals",
  "auditManifest",
];

function parseBoolParam(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw === "") return fallback;
  const v = raw.toLowerCase();
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  if (v === "1" || v === "true" || v === "yes" || v === "on") return true;
  return fallback;
}

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = searchParams[key];
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Defaults follow server “includes*” flags so empty sections start unchecked.
 */
export function defaultEvidencePackageScopes(
  summary: Pick<
    FullProjectEvidencePackageSummary,
    | "includesArtifacts"
    | "includesEvidenceFiles"
    | "includesGateDecisions"
    | "includesTraceabilityLinks"
    | "includesApprovalRecords"
    | "includesAuditManifest"
  >,
): EvidencePackageScopes {
  return {
    artifacts: summary.includesArtifacts,
    evidence: summary.includesEvidenceFiles,
    gateDecisions: summary.includesGateDecisions,
    traceability: summary.includesTraceabilityLinks,
    approvals: summary.includesApprovalRecords,
    auditManifest: summary.includesAuditManifest,
  };
}

export function parseEvidencePackageScopesFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  summary: FullProjectEvidencePackageSummary,
): EvidencePackageScopes {
  const d = defaultEvidencePackageScopes(summary);
  return {
    artifacts: parseBoolParam(
      getParam(searchParams, EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS.artifacts),
      d.artifacts,
    ),
    evidence: parseBoolParam(
      getParam(searchParams, EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS.evidence),
      d.evidence,
    ),
    gateDecisions: parseBoolParam(
      getParam(searchParams, EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS.gateDecisions),
      d.gateDecisions,
    ),
    traceability: parseBoolParam(
      getParam(searchParams, EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS.traceability),
      d.traceability,
    ),
    approvals: parseBoolParam(
      getParam(searchParams, EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS.approvals),
      d.approvals,
    ),
    auditManifest: parseBoolParam(
      getParam(searchParams, EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS.auditManifest),
      d.auditManifest,
    ),
  };
}

export function evidencePackageScopesToSearchParams(scopes: EvidencePackageScopes): URLSearchParams {
  const q = new URLSearchParams();
  for (const key of EVIDENCE_PACKAGE_SCOPE_KEYS) {
    q.set(EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS[key], scopes[key] ? "1" : "0");
  }
  return q;
}

export function hasAnyEvidencePackageScope(scopes: EvidencePackageScopes): boolean {
  return EVIDENCE_PACKAGE_SCOPE_KEYS.some((k) => scopes[k]);
}

/** Drops selections that cannot apply given current scoped summary flags. */
export function clampEvidencePackageScopesToAvailability(
  scopes: EvidencePackageScopes,
  summary: FullProjectEvidencePackageSummary,
): EvidencePackageScopes {
  return {
    artifacts: scopes.artifacts && summary.includesArtifacts,
    evidence: scopes.evidence && summary.includesEvidenceFiles,
    gateDecisions: scopes.gateDecisions && summary.includesGateDecisions,
    traceability: scopes.traceability && summary.includesTraceabilityLinks,
    approvals: scopes.approvals && summary.includesApprovalRecords,
    auditManifest: scopes.auditManifest && summary.includesAuditManifest,
  };
}

export function buildEvidencePackageConfigureHref(
  projectId: string,
  filters: ReportsFilters,
  scopes: EvidencePackageScopes,
): string {
  const path = `/projects/${projectId}/reports/evidence-package/configure`;
  const q = reportsFiltersToSearchParams(filters);
  evidencePackageScopesToSearchParams(scopes).forEach((v, k) => q.set(k, v));
  const qs = q.toString();
  return qs ? `${path}?${qs}` : path;
}

export function buildEvidencePackageExportHref(
  projectId: string,
  filters: ReportsFilters,
  scopes: EvidencePackageScopes,
  format: "json" | "zip" = "json",
): string {
  const q = reportsFiltersToSearchParams(filters);
  evidencePackageScopesToSearchParams(scopes).forEach((v, k) => q.set(k, v));
  const qs = q.toString();
  const base = `/api/projects/${projectId}/reports/export?key=fullProjectEvidencePackage&format=${format}`;
  return qs ? `${base}&${qs}` : base;
}

function estimatedFilesForScopes(
  summary: FullProjectEvidencePackageSummary,
  scopes: EvidencePackageScopes,
): number {
  const c = summary.sectionCounts;
  let n = 0;
  if (scopes.artifacts) n += c.artifacts;
  if (scopes.evidence) n += c.evidenceFiles;
  if (scopes.gateDecisions) n += c.gateDecisions;
  if (scopes.traceability) n += c.traceabilityLinks;
  if (scopes.approvals) n += c.approvalRecords;
  if (scopes.auditManifest && c.auditEntries > 0) n += 1;
  return n;
}

/**
 * Shapes the downloadable snapshot: toggled-off sections read as excluded with zero counts.
 */
export function applyEvidencePackageScopesToReport(
  report: FullProjectEvidencePackageSummary,
  scopes: EvidencePackageScopes,
): FullProjectEvidencePackageSummary {
  const z = (n: number, on: boolean) => (on ? n : 0);
  const c = report.sectionCounts;
  const nextFileCount = estimatedFilesForScopes(report, scopes);
  return {
    ...report,
    includesArtifacts: scopes.artifacts && report.includesArtifacts,
    includesEvidenceFiles: scopes.evidence && report.includesEvidenceFiles,
    includesGateDecisions: scopes.gateDecisions && report.includesGateDecisions,
    includesTraceabilityLinks: scopes.traceability && report.includesTraceabilityLinks,
    includesApprovalRecords: scopes.approvals && report.includesApprovalRecords,
    includesAuditManifest: scopes.auditManifest && report.includesAuditManifest,
    sectionCounts: {
      artifacts: z(c.artifacts, scopes.artifacts),
      evidenceFiles: z(c.evidenceFiles, scopes.evidence),
      gateDecisions: z(c.gateDecisions, scopes.gateDecisions),
      traceabilityLinks: z(c.traceabilityLinks, scopes.traceability),
      approvalRecords: z(c.approvalRecords, scopes.approvals),
      auditEntries: z(c.auditEntries, scopes.auditManifest),
    },
    estimatedFileCount: nextFileCount,
    estimatedSizeLabel: nextFileCount === 0 ? "—" : report.estimatedSizeLabel,
  };
}
