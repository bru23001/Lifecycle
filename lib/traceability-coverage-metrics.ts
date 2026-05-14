import type { TraceabilityMatrixData } from "@/types/traceability.types";

/** Query param + drawer target for coverage report drill-down. */
export type CoverageReportMetricId =
  | "overall"
  | "complete"
  | "partial"
  | "missing"
  | "phase_artifacts"
  | "requirement_design"
  | "requirement_test"
  | "gate_evidence"
  | "gaps";

const METRIC_NAMES: Record<CoverageReportMetricId, string> = {
  overall: "Overall traceability coverage",
  complete: "Complete coverage buckets",
  partial: "Partial coverage buckets",
  missing: "Missing coverage buckets",
  phase_artifacts: "Phase → artifact linkage",
  requirement_design: "Requirement → design linkage",
  requirement_test: "Requirement → test linkage",
  gate_evidence: "Gate → evidence linkage",
  gaps: "Gaps and orphans",
};

const METRIC_DEFINITIONS: Record<CoverageReportMetricId, string> = {
  overall:
    "Weighted average of lifecycle section coverage rows (phase artifacts, requirement design/test, gate evidence). Each section contributes equally to this headline score.",
  complete:
    "Lifecycle coverage buckets currently meeting their configured targets (100% linked where required).",
  partial:
    "Buckets with some linkage but not yet meeting full targets—common during active development.",
  missing:
    "Buckets with no or insufficient linkage against configured requirements for that slice.",
  phase_artifacts:
    "Each phase row compares artifacts linked into the lifecycle against required artifact templates for that phase.",
  requirement_design:
    "Per requirement family: features (design) implementing or deriving from requirements of that type.",
  requirement_test:
    "Per requirement family: test artifacts validating requirements of that type.",
  gate_evidence:
    "Per gate: evidence items and approvals satisfying configured gate evidence rules.",
  gaps:
    "Derived orphan and gap records (missing links, broken references, untagged evidence) from the live graph.",
};

export type CoverageMetricListItem = { label: string; href: string };

export type CoverageMetricDetail = {
  id: CoverageReportMetricId;
  name: string;
  definition: string;
  covered: CoverageMetricListItem[];
  partial: CoverageMetricListItem[];
  missing: CoverageMetricListItem[];
  orphaned: CoverageMetricListItem[];
  /** Shown when we do not have time-series data (solo workspace baseline). */
  trendNote: string | null;
};

function phaseRowLabel(row: TraceabilityMatrixData["phaseArtifactLinks"][0]): string {
  return `Phase ${row.phaseNumber}: ${row.phaseName}`;
}

function gateRowLabel(row: TraceabilityMatrixData["gateEvidenceLinks"][0]): string {
  return `${row.gateCode} — ${row.gateName}`;
}

export function parseCoverageReportMetricId(raw: string | null | undefined): CoverageReportMetricId | null {
  if (!raw || typeof raw !== "string") return null;
  const allowed: CoverageReportMetricId[] = [
    "overall",
    "complete",
    "partial",
    "missing",
    "phase_artifacts",
    "requirement_design",
    "requirement_test",
    "gate_evidence",
    "gaps",
  ];
  return allowed.includes(raw as CoverageReportMetricId) ? (raw as CoverageReportMetricId) : null;
}

/**
 * Builds drawer payload from live matrix data. Lists are capped for UI performance.
 */
export function buildCoverageMetricDetail(
  data: TraceabilityMatrixData,
  id: CoverageReportMetricId,
  listCap = 40,
): CoverageMetricDetail {
  const projectId = data.project.id;

  const trendNote =
    "Historical trend is not recorded in this workspace build. Re-export this report after major changes to compare snapshots offline.";

  const gapItems = (kind: "orphan" | "broken" | "gap"): CoverageMetricListItem[] => {
    const gaps = data.traceabilityGaps.filter((g) => {
      if (kind === "orphan") return g.type !== "requirement_gap" && g.type !== "broken_link";
      if (kind === "broken") return g.type === "broken_link";
      return g.type === "requirement_gap";
    });
    return gaps.slice(0, listCap).map((g) => ({
      label: `${g.objectId} — ${g.issue}`,
      href: g.href,
    }));
  };

  if (id === "gaps") {
    return {
      id,
      name: METRIC_NAMES.gaps,
      definition: METRIC_DEFINITIONS.gaps,
      covered: [],
      partial: [],
      missing: gapItems("gap"),
      orphaned: gapItems("orphan"),
      trendNote,
    };
  }

  if (id === "overall") {
    const sections = [
      ...data.phaseArtifactLinks.map((r) => ({
        label: `${phaseRowLabel(r)} (${r.coveragePercent}%)`,
        href: `/projects/${projectId}/traceability/phase-artifacts`,
        status: r.status,
      })),
      ...data.requirementDesignLinks.map((r) => ({
        label: `${r.label} (${r.coveragePercent}%)`,
        href: `/projects/${projectId}/traceability/requirements-design`,
        status: r.status,
      })),
      ...data.requirementTestLinks.map((r) => ({
        label: `${r.label} (${r.coveragePercent}%)`,
        href: `/projects/${projectId}/traceability/requirements-tests`,
        status: r.status,
      })),
      ...data.gateEvidenceLinks.map((r) => ({
        label: `${gateRowLabel(r)} (${r.coveragePercent}%)`,
        href: `/projects/${projectId}/traceability/gate-evidence`,
        status: r.status,
      })),
    ];
    return {
      id,
      name: METRIC_NAMES.overall,
      definition: METRIC_DEFINITIONS.overall,
      covered: sections.filter((s) => s.status === "complete").slice(0, listCap).map(({ label, href }) => ({ label, href })),
      partial: sections.filter((s) => s.status === "partial").slice(0, listCap).map(({ label, href }) => ({ label, href })),
      missing: sections.filter((s) => s.status === "missing").slice(0, listCap).map(({ label, href }) => ({ label, href })),
      orphaned: gapItems("orphan").slice(0, Math.min(15, listCap)),
      trendNote,
    };
  }

  if (id === "complete" || id === "partial" || id === "missing") {
    const status = id;
    const items: CoverageMetricListItem[] = [
      ...data.phaseArtifactLinks
        .filter((r) => r.status === status)
        .map((r) => ({
          label: `${phaseRowLabel(r)} (${r.coveragePercent}%)`,
          href: `/projects/${projectId}/traceability/phase-artifacts`,
        })),
      ...data.requirementDesignLinks
        .filter((r) => r.status === status)
        .map((r) => ({
          label: `${r.label} (${r.coveragePercent}%)`,
          href: `/projects/${projectId}/traceability/requirements-design`,
        })),
      ...data.requirementTestLinks
        .filter((r) => r.status === status)
        .map((r) => ({
          label: `${r.label} (${r.coveragePercent}%)`,
          href: `/projects/${projectId}/traceability/requirements-tests`,
        })),
      ...data.gateEvidenceLinks
        .filter((r) => r.status === status)
        .map((r) => ({
          label: `${gateRowLabel(r)} (${r.coveragePercent}%)`,
          href: `/projects/${projectId}/traceability/gate-evidence`,
        })),
    ].slice(0, listCap);

    return {
      id,
      name: METRIC_NAMES[id],
      definition: METRIC_DEFINITIONS[id],
      covered: status === "complete" ? items : [],
      partial: status === "partial" ? items : [],
      missing: status === "missing" ? items : [],
      orphaned: [],
      trendNote,
    };
  }

  const slice = <T extends { status: string }>(
    rows: T[],
    labelFn: (r: T) => string,
    href: string,
  ): { covered: CoverageMetricListItem[]; partial: CoverageMetricListItem[]; missing: CoverageMetricListItem[] } => ({
    covered: rows
      .filter((r) => r.status === "complete")
      .slice(0, listCap)
      .map((r) => ({ label: labelFn(r), href })),
    partial: rows
      .filter((r) => r.status === "partial")
      .slice(0, listCap)
      .map((r) => ({ label: labelFn(r), href })),
    missing: rows
      .filter((r) => r.status === "missing")
      .slice(0, listCap)
      .map((r) => ({ label: labelFn(r), href })),
  });

  if (id === "phase_artifacts") {
    const s = slice(data.phaseArtifactLinks, phaseRowLabel, `/projects/${projectId}/traceability/phase-artifacts`);
    return {
      id,
      name: METRIC_NAMES.phase_artifacts,
      definition: METRIC_DEFINITIONS.phase_artifacts,
      ...s,
      orphaned: [],
      trendNote,
    };
  }

  if (id === "requirement_design") {
    const s = slice(
      data.requirementDesignLinks,
      (r) => `${r.label} (${r.coveragePercent}%)`,
      `/projects/${projectId}/traceability/requirements-design`,
    );
    return {
      id,
      name: METRIC_NAMES.requirement_design,
      definition: METRIC_DEFINITIONS.requirement_design,
      ...s,
      orphaned: data.traceabilityGaps
        .filter((g) => g.type === "design_orphan")
        .slice(0, 10)
        .map((g) => ({ label: `${g.objectId} — ${g.issue}`, href: g.href })),
      trendNote,
    };
  }

  if (id === "requirement_test") {
    const s = slice(
      data.requirementTestLinks,
      (r) => `${r.label} (${r.coveragePercent}%)`,
      `/projects/${projectId}/traceability/requirements-tests`,
    );
    return {
      id,
      name: METRIC_NAMES.requirement_test,
      definition: METRIC_DEFINITIONS.requirement_test,
      ...s,
      orphaned: data.traceabilityGaps
        .filter((g) => g.type === "test_orphan")
        .slice(0, 10)
        .map((g) => ({ label: `${g.objectId} — ${g.issue}`, href: g.href })),
      trendNote,
    };
  }

  if (id === "gate_evidence") {
    const s = slice(data.gateEvidenceLinks, gateRowLabel, `/projects/${projectId}/traceability/gate-evidence`);
    return {
      id,
      name: METRIC_NAMES.gate_evidence,
      definition: METRIC_DEFINITIONS.gate_evidence,
      ...s,
      orphaned: data.traceabilityGaps
        .filter((g) => g.type === "evidence_orphan")
        .slice(0, 10)
        .map((g) => ({ label: `${g.objectId} — ${g.issue}`, href: g.href })),
      trendNote,
    };
  }

  const fallback: CoverageMetricDetail = {
    id: "overall",
    name: METRIC_NAMES.overall,
    definition: METRIC_DEFINITIONS.overall,
    covered: [],
    partial: [],
    missing: [],
    orphaned: [],
    trendNote,
  };
  return fallback;
}

export function coverageReportMetricHref(projectId: string, metric: CoverageReportMetricId): string {
  return `/projects/${projectId}/traceability/report?metric=${encodeURIComponent(metric)}`;
}

/** Rule-based remediation bullets for the coverage report screen. */
export function buildRemediationRecommendations(data: TraceabilityMatrixData): string[] {
  const recs: string[] = [];
  const missingGates = data.gateEvidenceLinks.filter((r) => r.status === "missing").length;
  if (missingGates > 0) {
    recs.push(
      `${missingGates} gate evidence bucket(s) are missing required linkages — prioritize evidence and approvals before the next gate review.`,
    );
  }
  const partialBuckets =
    data.phaseArtifactLinks.filter((r) => r.status === "partial").length +
    data.requirementDesignLinks.filter((r) => r.status === "partial").length +
    data.requirementTestLinks.filter((r) => r.status === "partial").length +
    data.gateEvidenceLinks.filter((r) => r.status === "partial").length;
  if (partialBuckets > 0) {
    recs.push(
      `${partialBuckets} coverage bucket(s) are partial — finish remaining trace links or record accepted risk where policy allows.`,
    );
  }
  if (data.traceabilityGaps.some((g) => g.type === "broken_link")) {
    recs.push("Repair or delete broken trace links so deleted objects are not referenced in the graph.");
  }
  const hotGaps = data.traceabilityGaps.filter((g) => g.impact === "high" || g.impact === "critical").length;
  if (hotGaps > 0) {
    recs.push(`${hotGaps} high/critical gap(s) below should be owned, remediated, or formally accepted before release.`);
  }
  if (recs.length === 0) {
    recs.push("No automated remediation rules fired — export after major lifecycle changes to keep an offline audit trail.");
  }
  return recs;
}
