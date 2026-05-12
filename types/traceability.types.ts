export type CoverageStatus = "complete" | "partial" | "missing";

export type TraceabilityFilters = {
  projectId: string;
  searchTerm?: string;
  viewMode: "all_links" | "requirements" | "phases" | "gates" | "gaps";
  phaseNumber?: number | "all";
  status?: "all" | CoverageStatus | "orphaned";
  objectType?: "all" | "phase" | "artifact" | "requirement" | "design" | "test" | "gate" | "evidence";
  lastUpdatedLabel: string;
};

export type PhaseArtifactCoverage = {
  phaseId: string;
  phaseNumber: number;
  phaseName: string;
  artifactsLinked: number;
  totalArtifactsRequired: number;
  coveragePercent: number;
  status: CoverageStatus;
  href: string;
};

export type RequirementKind = "business" | "functional" | "non_functional" | "interface" | "data";

export type RequirementDesignCoverage = {
  requirementType: RequirementKind;
  label: string;
  requirementsTotal: number;
  designLinksTotal: number;
  coveragePercent: number;
  status: CoverageStatus;
  href: string;
};

export type RequirementTestCoverage = {
  requirementType: RequirementKind;
  label: string;
  requirementsTotal: number;
  testLinksTotal: number;
  coveragePercent: number;
  status: CoverageStatus;
  href: string;
};

export type GateTraceStatus =
  | "not_reached"
  | "not_submitted"
  | "pending_decision"
  | "approved"
  | "changes_requested"
  | "rejected";

export type GateEvidenceCoverage = {
  gateId: string;
  gateCode: string;
  gateName: string;
  gateStatus: GateTraceStatus;
  evidenceLinked: number;
  requiredEvidence: number;
  coveragePercent: number;
  status: CoverageStatus;
  href: string;
};

/** Artifact → Gate readiness (UI-UX Traceability Matrix). */
export type ArtifactGateCoverage = {
  id: string;
  artifactLocalId: string;
  artifactTitle: string;
  gateCode: string;
  gateName: string;
  status: CoverageStatus;
  href: string;
  detailHref: string;
};

/** Evidence → Approval record linkage. */
export type EvidenceApprovalCoverage = {
  id: string;
  evidenceLabel: string;
  approvalTitle: string;
  approvalStatus: "pending" | "approved" | "rejected" | "changes_requested";
  status: CoverageStatus;
  href: string;
  detailHref: string;
};

export type TraceabilityGapType =
  | "requirement_gap"
  | "design_orphan"
  | "test_orphan"
  | "evidence_orphan"
  | "broken_link";

export type TraceabilityGap = {
  id: string;
  type: TraceabilityGapType;
  objectId: string;
  objectName: string;
  issue: string;
  impact: "low" | "medium" | "high" | "critical";
  href: string;
};

export type CoverageSummary = {
  overallCoveragePercent: number;
  complete: { count: number; percent: number };
  partial: { count: number; percent: number };
  missing: { count: number; percent: number };
  orphaned: { count: number };
  totals: {
    requirements: number;
    designs: number;
    tests: number;
    evidenceItems: number;
    gates: number;
    artifacts: number;
  };
  reportHref: string;
};

export type TraceabilityActionState = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

export type TraceabilityMatrixData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  filters: TraceabilityFilters;
  phaseArtifactLinks: PhaseArtifactCoverage[];
  requirementDesignLinks: RequirementDesignCoverage[];
  requirementTestLinks: RequirementTestCoverage[];
  gateEvidenceLinks: GateEvidenceCoverage[];
  artifactGateLinks: ArtifactGateCoverage[];
  evidenceApprovalLinks: EvidenceApprovalCoverage[];
  traceabilityGaps: TraceabilityGap[];
  coverageSummary: CoverageSummary;
  actionState: TraceabilityActionState;
};

/** Single trace link inspection (UI-UX Traceability Detail). */
export type TraceabilityLinkDetail = {
  id: string;
  linkType: string;
  linkStrength: "strong" | "medium" | "weak";
  sourceKind: string;
  sourceLabel: string;
  sourceHref: string;
  targetKind: string;
  targetLabel: string;
  targetHref: string;
  createdBy: string;
  createdAtLabel: string;
  evidenceReference: string;
  validationStatus: "valid" | "warning" | "invalid";
};
