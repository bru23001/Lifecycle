export type CoverageStatus = "complete" | "partial" | "missing";

export type GateTraceStatus =
  | "not_reached"
  | "not_submitted"
  | "pending_decision"
  | "approved"
  | "changes_requested"
  | "rejected";

export type EvidenceApprovalStatus = "pending" | "approved" | "rejected" | "changes_requested";

/** Advanced drawer: which matrix link families to include (empty = all). */
export type TraceabilityLinkTypeKey =
  | "phase_artifact"
  | "requirement_design"
  | "requirement_test"
  | "gate_evidence"
  | "artifact_evidence"
  | "gate_decision_record";

export type TraceabilityGapObjectKind =
  | "phase"
  | "artifact"
  | "requirement"
  | "design"
  | "test"
  | "gate"
  | "evidence";

export type TraceabilityFilters = {
  projectId: string;
  searchTerm?: string;
  viewMode: "all_links" | "requirements" | "phases" | "gates" | "evidence" | "gaps";
  phaseNumber?: number | "all";
  status?: "all" | CoverageStatus | "orphaned";
  /** @deprecated Prefer `objectTypes`; kept for URL/older payloads. */
  objectType?: "all" | TraceabilityGapObjectKind;
  /** Gap/orphan tab: empty = all object kinds. */
  objectTypes?: TraceabilityGapObjectKind[];
  linkTypes?: TraceabilityLinkTypeKey[];
  impactLevels?: Array<"low" | "medium" | "high" | "critical">;
  ownerAssigneeContains?: string;
  /** Inclusive YYYY-MM-DD (evidence / artifact row timestamps). */
  updatedFrom?: string;
  updatedTo?: string;
  gateStatuses?: GateTraceStatus[];
  evidenceStatuses?: EvidenceApprovalStatus[];
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

export type GateEvidenceCoverage = {
  gateId: string;
  gateCode: string;
  gateName: string;
  gateStatus: GateTraceStatus;
  evidenceLinked: number;
  requiredEvidence: number;
  coveragePercent: number;
  status: CoverageStatus;
  /** Gate ↔ evidence drill-down (`/traceability/gate-evidence/[gateId]`). */
  href: string;
  /** Gate review workspace. */
  reviewHref: string;
};

/** Artifact → Gate readiness (UI-UX Traceability Matrix). */
export type ArtifactGateCoverage = {
  /** Stable id for matrix rows: see `lib/server/traceability.ts` (`ag:{artifactId}:{gateId}`). */
  id: string;
  /** `Artifact.id` for deep links. */
  artifactId: string;
  artifactLocalId: string;
  artifactTitle: string;
  gateCode: string;
  gateName: string;
  status: CoverageStatus;
  /** Artifact detail screen. */
  href: string;
  /** Gate review workspace for this readiness row. */
  reviewHref: string;
  /** Route to link detail; must match `id` encoding in `lib/server/traceability.ts`. */
  detailHref: string;
  /** Artifact `updatedAt` for advanced “last updated” filtering. */
  rowUpdatedAt: string;
};

/** Evidence → Approval record linkage. */
export type EvidenceApprovalCoverage = {
  /** Stable id: `ea:{evidenceId}:{approvalId}` (see server traceability module). */
  id: string;
  evidenceLabel: string;
  approvalTitle: string;
  approvalStatus: EvidenceApprovalStatus;
  status: CoverageStatus;
  href: string;
  detailHref: string;
  /** Evidence item `updatedAt` for advanced “last updated” filtering. */
  rowUpdatedAt: string;
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

/** One endpoint a manual trace link can point at. */
export type TraceableEndpoint = {
  /** Internal database id (`Requirement.id` / `Feature.id` / `Artifact.id`). */
  id: string;
  /** Project-local code such as `CRS-001` / `FEAT-001`. Useful for prefill matching. */
  localId: string;
  /** Display label rendered in selects. */
  label: string;
};

export type TraceableEndpoints = {
  requirements: TraceableEndpoint[];
  features: TraceableEndpoint[];
  artifacts: TraceableEndpoint[];
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
    /** DB-backed lifecycle navigator phase (1–14); used for shell shortcuts. */
    currentPhase: number;
  };
  /** Recent projects for the matrix project switcher (same screen navigation). */
  projectPicker: { id: string; code: string; name: string }[];
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
  assignableEndpoints: TraceableEndpoints;
  /** Active users for gap remediation assignment (workspace directory). */
  assignableUsers: { id: string; name: string | null; email: string }[];
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
  /** True when this row maps to a persisted, non-deleted `TraceLink`. */
  editable: boolean;
  relation: string;
  rationale: string;
  confidence: "low" | "medium" | "high";
  verificationNote: string;
  lastVerifiedAtLabel: string | null;
  createdByUserId: string | null;
};
