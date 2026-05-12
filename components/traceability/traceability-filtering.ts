import type {
  CoverageStatus,
  GateEvidenceCoverage,
  PhaseArtifactCoverage,
  RequirementDesignCoverage,
  RequirementTestCoverage,
  TraceabilityGap,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

type FilterState = TraceabilityMatrixData["filters"];

export const gapTabConfig = [
  { id: "requirement_gap", label: "Requirement Gaps" },
  { id: "design_orphan", label: "Design Orphans" },
  { id: "test_orphan", label: "Test Orphans" },
  { id: "evidence_orphan", label: "Evidence Orphans" },
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

export function applyObjectFilter(
  rows: TraceabilityGap[],
  objectType: FilterState["objectType"],
  activeTab: GapTabId,
  status: FilterState["status"],
) {
  let filtered = rows;
  if (status === "orphaned") {
    filtered = filtered.filter(
      (row) => row.type === "design_orphan" || row.type === "test_orphan" || row.type === "evidence_orphan",
    );
  }
  filtered = filtered.filter((row) => row.type === activeTab || (activeTab === "requirement_gap" && row.type === "broken_link"));
  if (!objectType || objectType === "all") return filtered;
  switch (objectType) {
    case "design":
      return filtered.filter((row) => row.type === "design_orphan");
    case "test":
      return filtered.filter((row) => row.type === "test_orphan");
    case "evidence":
      return filtered.filter((row) => row.type === "evidence_orphan");
    case "requirement":
      return filtered.filter((row) => row.type === "requirement_gap");
    default:
      return filtered;
  }
}

export function cardVisible(
  viewMode: FilterState["viewMode"],
  card:
    | "phase"
    | "req-design"
    | "req-test"
    | "gate"
    | "gaps"
    | "coverage",
) {
  if (viewMode === "all_links") return true;
  if (viewMode === "requirements") return card === "req-design" || card === "req-test" || card === "gaps" || card === "coverage";
  if (viewMode === "phases") return card === "phase" || card === "gate" || card === "gaps" || card === "coverage";
  if (viewMode === "gates") return card === "gate" || card === "gaps" || card === "coverage";
  if (viewMode === "gaps") return card === "gaps" || card === "coverage";
  return true;
}

export function filterPhaseRows(rows: PhaseArtifactCoverage[], filters: FilterState) {
  return applyStatusFilter(applyPhaseFilter(rows, filters.phaseNumber), filters.status).filter((row) =>
    includesSearch([row.phaseNumber, row.phaseName], filters.searchTerm),
  );
}

export function filterRequirementDesignRows(rows: RequirementDesignCoverage[], filters: FilterState) {
  return applyStatusFilter(rows, filters.status).filter((row) =>
    includesSearch([row.label, row.requirementType], filters.searchTerm),
  );
}

export function filterRequirementTestRows(rows: RequirementTestCoverage[], filters: FilterState) {
  return applyStatusFilter(rows, filters.status).filter((row) =>
    includesSearch([row.label, row.requirementType], filters.searchTerm),
  );
}

export function filterGateRows(rows: GateEvidenceCoverage[], filters: FilterState) {
  return applyStatusFilter(rows, filters.status).filter((row) =>
    includesSearch([row.gateCode, row.gateName], filters.searchTerm),
  );
}

export function filterGapRows(rows: TraceabilityGap[], filters: FilterState, activeGapTab: GapTabId) {
  return applyObjectFilter(rows, filters.objectType, activeGapTab, filters.status).filter((row) =>
    includesSearch([row.objectId, row.objectName, row.issue], filters.searchTerm),
  );
}
