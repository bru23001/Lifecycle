import type {
  ArtifactGateCoverage,
  CoverageStatus,
  EvidenceApprovalCoverage,
  GateEvidenceCoverage,
  PhaseArtifactCoverage,
  RequirementDesignCoverage,
  RequirementTestCoverage,
  TraceabilityGap,
  TraceabilityGapObjectKind,
  TraceabilityLinkTypeKey,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

type FilterState = TraceabilityMatrixData["filters"];

export const gapTabConfig = [
  { id: "requirement_gap", label: "Requirement Gaps" },
  { id: "design_orphan", label: "Design Orphans" },
  { id: "test_orphan", label: "Test Orphans" },
  { id: "evidence_orphan", label: "Evidence Orphans" },
  { id: "broken_link", label: "Broken Links" },
] as const;

export type GapTabId = (typeof gapTabConfig)[number]["id"];

function includesSearch(terms: Array<string | number | undefined>, searchTerm?: string) {
  const query = searchTerm?.trim().toLowerCase();
  if (!query) return true;
  return terms.some((term) => String(term ?? "").toLowerCase().includes(query));
}

export function applyStatusFilter<T extends { status: CoverageStatus }>(rows: T[], status: FilterState["status"]) {
  if (!status || status === "all" || status === "orphaned") return rows;
  return rows.filter((row) => row.status === status);
}

export function applyPhaseFilter(rows: PhaseArtifactCoverage[], phaseNumber: FilterState["phaseNumber"]) {
  if (!phaseNumber || phaseNumber === "all") return rows;
  return rows.filter((row) => row.phaseNumber === phaseNumber);
}

function resolveObjectKinds(filters: FilterState): TraceabilityGapObjectKind[] | null {
  if (filters.objectTypes && filters.objectTypes.length > 0) return filters.objectTypes;
  const o = filters.objectType;
  if (!o || o === "all") return null;
  return [o];
}

function gapMatchesObjectKinds(row: TraceabilityGap, kinds: TraceabilityGapObjectKind[]): boolean {
  const map: Record<TraceabilityGap["type"], TraceabilityGapObjectKind[]> = {
    requirement_gap: ["requirement"],
    design_orphan: ["design"],
    test_orphan: ["test"],
    evidence_orphan: ["evidence"],
    broken_link: ["artifact", "requirement", "design", "test", "gate", "evidence"],
  };
  const rowKinds = map[row.type];
  return kinds.some((k) => rowKinds.includes(k));
}

export function applyObjectFilter(
  rows: TraceabilityGap[],
  filters: FilterState,
  activeTab: GapTabId,
  status: FilterState["status"],
) {
  let filtered = rows;
  if (status === "orphaned") {
    filtered = filtered.filter(
      (row) => row.type === "design_orphan" || row.type === "test_orphan" || row.type === "evidence_orphan",
    );
  }
  if (activeTab === "requirement_gap") {
    filtered = filtered.filter((row) => row.type === "requirement_gap");
  } else if (activeTab === "broken_link") {
    filtered = filtered.filter((row) => row.type === "broken_link");
  } else {
    filtered = filtered.filter((row) => row.type === activeTab);
  }
  const kinds = resolveObjectKinds(filters);
  if (!kinds) return filtered;
  return filtered.filter((row) => gapMatchesObjectKinds(row, kinds));
}

function linkSectionActive(linkTypes: FilterState["linkTypes"]): boolean {
  return Boolean(linkTypes && linkTypes.length > 0);
}

export function linkSectionAllowed(linkTypes: FilterState["linkTypes"], key: TraceabilityLinkTypeKey): boolean {
  if (!linkSectionActive(linkTypes)) return true;
  return linkTypes!.includes(key);
}

export type TraceabilityGridCard =
  | "phase"
  | "req-design"
  | "req-test"
  | "gate"
  | "artifact-gate"
  | "evidence-approval"
  | "gaps"
  | "coverage";

export function cardVisible(viewMode: FilterState["viewMode"], card: TraceabilityGridCard) {
  if (viewMode === "all_links") return true;
  if (viewMode === "requirements") {
    return card === "req-design" || card === "req-test" || card === "gaps" || card === "coverage";
  }
  if (viewMode === "phases") {
    return card === "phase" || card === "gaps" || card === "coverage";
  }
  if (viewMode === "gates") {
    return card === "gate" || card === "gaps" || card === "coverage";
  }
  if (viewMode === "evidence") {
    return (
      card === "gate" ||
      card === "artifact-gate" ||
      card === "evidence-approval" ||
      card === "gaps" ||
      card === "coverage"
    );
  }
  if (viewMode === "gaps") {
    return card === "gaps" || card === "coverage";
  }
  return true;
}

function parseYmdStartUtc(s?: string): number | null {
  const v = s?.trim();
  if (!v) return null;
  const t = Date.parse(`${v}T00:00:00.000Z`);
  return Number.isNaN(t) ? null : t;
}

function parseYmdEndUtcInclusive(s?: string): number | null {
  const v = s?.trim();
  if (!v) return null;
  const t = Date.parse(`${v}T23:59:59.999Z`);
  return Number.isNaN(t) ? null : t;
}

function rowPassesDateRange(rowIso: string, from?: string, to?: string): boolean {
  const row = Date.parse(rowIso);
  if (Number.isNaN(row)) return true;
  const a = parseYmdStartUtc(from);
  const b = parseYmdEndUtcInclusive(to);
  if (a !== null && row < a) return false;
  if (b !== null && row > b) return false;
  return true;
}

function gatePassesStatuses(row: GateEvidenceCoverage, statuses: FilterState["gateStatuses"]): boolean {
  if (!statuses || statuses.length === 0) return true;
  return statuses.includes(row.gateStatus);
}

function evidenceRowPassesStatuses(row: EvidenceApprovalCoverage, statuses: FilterState["evidenceStatuses"]): boolean {
  if (!statuses || statuses.length === 0) return true;
  return statuses.includes(row.approvalStatus);
}

export function filterPhaseRows(rows: PhaseArtifactCoverage[], filters: FilterState) {
  if (!linkSectionAllowed(filters.linkTypes, "phase_artifact")) return [];
  return applyStatusFilter(applyPhaseFilter(rows, filters.phaseNumber), filters.status).filter((row) =>
    includesSearch([row.phaseNumber, row.phaseName], filters.searchTerm),
  );
}

export function filterRequirementDesignRows(rows: RequirementDesignCoverage[], filters: FilterState) {
  if (!linkSectionAllowed(filters.linkTypes, "requirement_design")) return [];
  return applyStatusFilter(rows, filters.status).filter((row) =>
    includesSearch([row.label, row.requirementType], filters.searchTerm),
  );
}

export function filterRequirementTestRows(rows: RequirementTestCoverage[], filters: FilterState) {
  if (!linkSectionAllowed(filters.linkTypes, "requirement_test")) return [];
  return applyStatusFilter(rows, filters.status).filter((row) =>
    includesSearch([row.label, row.requirementType], filters.searchTerm),
  );
}

export function filterGateRows(rows: GateEvidenceCoverage[], filters: FilterState) {
  if (!linkSectionAllowed(filters.linkTypes, "gate_evidence")) return [];
  return applyStatusFilter(
    rows.filter((row) => gatePassesStatuses(row, filters.gateStatuses)),
    filters.status,
  ).filter((row) => includesSearch([row.gateCode, row.gateName], filters.searchTerm));
}

export function filterArtifactGateRows(rows: ArtifactGateCoverage[], filters: FilterState) {
  if (!linkSectionAllowed(filters.linkTypes, "artifact_evidence")) return [];
  return applyStatusFilter(rows, filters.status)
    .filter((row) => rowPassesDateRange(row.rowUpdatedAt, filters.updatedFrom, filters.updatedTo))
    .filter((row) =>
      includesSearch([row.artifactLocalId, row.artifactTitle, row.gateCode, row.gateName], filters.searchTerm),
    );
}

export function filterEvidenceApprovalRows(rows: EvidenceApprovalCoverage[], filters: FilterState) {
  if (!linkSectionAllowed(filters.linkTypes, "gate_decision_record")) return [];
  return applyStatusFilter(
    rows
      .filter((row) => evidenceRowPassesStatuses(row, filters.evidenceStatuses))
      .filter((row) => rowPassesDateRange(row.rowUpdatedAt, filters.updatedFrom, filters.updatedTo)),
    filters.status,
  ).filter((row) => includesSearch([row.evidenceLabel, row.approvalTitle], filters.searchTerm));
}

export function filterGapRows(rows: TraceabilityGap[], filters: FilterState, activeGapTab: GapTabId) {
  let filtered = applyObjectFilter(rows, filters, activeGapTab, filters.status).filter((row) =>
    includesSearch([row.objectId, row.objectName, row.issue], filters.searchTerm),
  );
  if (filters.impactLevels && filters.impactLevels.length > 0) {
    filtered = filtered.filter((row) => filters.impactLevels!.includes(row.impact));
  }
  const ownerQ = filters.ownerAssigneeContains?.trim().toLowerCase();
  if (ownerQ) {
    filtered = filtered.filter(
      (row) =>
        row.objectId.toLowerCase().includes(ownerQ) ||
        row.objectName.toLowerCase().includes(ownerQ) ||
        row.issue.toLowerCase().includes(ownerQ),
    );
  }
  return filtered;
}
