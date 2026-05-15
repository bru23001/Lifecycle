import type { CoverageStatus, GateTraceStatus } from "@/types/traceability.types";

export type EvidenceItem = {
  id: string;
  evidenceCode: string;
  name: string;
  description?: string;
  evidenceType: "pdf" | "spreadsheet" | "document" | "image" | "link" | "json" | "markdown" | "report";
  projectId: string;
  projectName: string;
  phaseNumber?: number;
  phaseName?: string;
  gateCode?: string;
  gateName?: string;
  uploadedBy: string;
  /** Display label — keep `updatedAt` sort aligned via `uploadedAtIso` + server rules. */
  uploadedOnLabel: string;
  /** ISO timestamp for range filters / sort by upload date (from DB `createdAt`). */
  uploadedAtIso: string;
  /** ISO timestamp for "Last updated" sort (from DB `updatedAt`). */
  updatedAtIso: string;
  classification: EvidenceDetail["classification"];
  /** Artifact IDs linked to this evidence item (for artifact filter). */
  linkedArtifactIds: string[];
  status: "linked" | "partially_linked" | "unlinked" | "archived";
  completenessPercent: number;
  href: string;
};

export type EvidenceDetail = {
  id: string;
  evidenceCode: string;
  name: string;
  description: string;
  evidenceType: "pdf" | "spreadsheet" | "document" | "image" | "link" | "json" | "markdown" | "report";
  projectId: string;
  projectName: string;
  phaseNumber?: number;
  phaseName?: string;
  gateCode?: string;
  gateName?: string;
  uploadedBy: string;
  uploadedOnLabel: string;
  fileTypeLabel: string;
  fileSizeLabel?: string;
  source?: string;
  classification: "public" | "internal" | "confidential" | "restricted";
  retentionPolicyLabel?: string;
  checksum?: string;
  tags: string[];
  notes?: string;
  status: "linked" | "partially_linked" | "unlinked" | "archived";
  previewHref?: string;
  downloadHref?: string;
};

export type EvidenceCompleteness = {
  overallPercent: number;
  complete: { count: number; percent: number };
  partial: { count: number; percent: number };
  missing: { count: number; percent: number };
  unlinked?: { count: number; percent: number };
  detailsHref: string;
};

export type EvidenceByGate = {
  gateId: string;
  gateCode: string;
  gateName: string;
  evidenceLinked: number;
  requiredEvidence: number;
  missingCount: number;
  coveragePercent: number;
  /** Strict template-vs-evidence coverage for gate gap drawer / matrix. */
  linkStatus: CoverageStatus;
  /** Gate decision readiness derived from latest gate decision + lifecycle phase. */
  gateStatus: GateTraceStatus;
  /** Human-readable latest gate decision summary. */
  decisionSummary: string;
  status: "complete" | "partial" | "missing" | "not_started";
  /** Gate evidence drill-down (traceability). */
  detailHref: string;
  /** Evidence Center quick-link to add/filter evidence for this gate. */
  addEvidenceHref: string;
  /** Gate review route. */
  href: string;
};

export type EvidenceByPhase = {
  phaseId: string;
  phaseNumber: number;
  phaseName: string;
  evidenceItems: number;
  requiredEvidence: number;
  coveragePercent: number;
  status: "complete" | "partial" | "missing" | "not_started";
  /** Phase evidence drill-down (traceability). */
  detailHref: string;
  /** Lifecycle workspace for this phase. */
  workspaceHref: string;
  /** Strict template-vs-evidence coverage for gap drawer / matrix. */
  linkStatus: CoverageStatus;
  missingCount: number;
  completionImpact: string;
  addEvidenceHref: string;
};

/** Evidence items rolled up by originating artifact (UI-UX Evidence Center). */
export type EvidenceByArtifact = {
  artifactId: string;
  artifactLocalId: string;
  artifactTitle: string;
  evidenceLinked: number;
  requiredEvidence: number;
  coveragePercent: number;
  status: "complete" | "partial" | "missing" | "not_started";
  href: string;
};

export type EvidenceExportBundle = {
  projectId: string;
  selectedEvidenceIds: string[];
  canExportSelected: boolean;
  canExportByGate: boolean;
  canExportFullBundle: boolean;
  selectedFilename: string;
  gateBundleFilename: string;
  fullBundleFilename: string;
  blockers: string[];
};

export type EvidenceActionState = {
  title: string;
  description: string;
  secondaryLabel: string;
  primaryLabel: string;
  /** Optional sub-label rendered under the primary action (e.g. "Finalize approval decision"). */
  primarySubLabel?: string;
  secondaryHref?: string;
  primaryHref?: string;
  canSubmit: boolean;
  blockers: string[];
};

/** One row in the History tab; full detail opens in the event drawer. */
export type EvidenceHistoryEvent = {
  id: string;
  summaryLabel: string;
  timestampLabel: string;
  timestampIso: string;
  eventType: string;
  actor: string;
  previousValue: string;
  newValue: string;
  relatedObject: string;
  /** Audit row id when sourced from `AuditEntry`; empty for synthetic rows. */
  auditReference: string;
};

export type EvidenceCommentVisibility = "project" | "internal" | "reviewers";

export type EvidenceCommentRow = {
  id: string;
  author: string;
  authorId: string | null;
  body: string;
  visibility: EvidenceCommentVisibility;
  mentions: string[];
  attachmentRef?: string;
  resolved: boolean;
  createdAtLabel: string;
  updatedAtLabel: string;
  isViewerAuthor: boolean;
};

export type EvidenceCenterSelectedEvidence = {
  detail: EvidenceDetail;
  completeness: EvidenceCompleteness;
  linkedArtifacts: { id: string; label: string; href: string }[];
  linkedGates: { id: string; label: string; href: string }[];
  linkedPhases: { id: string; label: string; href: string }[];
  history: EvidenceHistoryEvent[];
  comments: EvidenceCommentRow[];
};

/** Phase picker metadata for Link Evidence → Phase modal. */
export type EvidencePhaseLinkOption = {
  phaseNumber: number;
  phaseName: string;
  /** Count of lifecycle templates mapped to this phase (proxy for required evidence slots). */
  requiredEvidence: number;
};

export type EvidenceGateLinkOption = {
  gateCode: string;
  gateName: string;
  phaseNumber: number;
  requiredEvidence: number;
  /** Gate rule row status (`active` / …). */
  ruleStatus: string;
};

/** Artifacts available for evidence↔artifact linking (filters, multi-select). */
export type EvidenceLinkableArtifact = {
  id: string;
  label: string;
  templateId: string;
  localId: string;
  version: number;
  status: string;
  /** Lifecycle phase from template registry, if known. */
  phaseNumber: number | null;
};

export type EvidenceCenterData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
    /** DB lifecycle navigator phase (1–14). */
    currentPhase: number;
  };
  evidenceItems: EvidenceItem[];
  selectedEvidence: EvidenceCenterSelectedEvidence;
  evidenceByGate: EvidenceByGate[];
  evidenceByPhase: EvidenceByPhase[];
  evidenceByArtifact: EvidenceByArtifact[];
  linkableArtifacts: EvidenceLinkableArtifact[];
  gateLinkOptions: EvidenceGateLinkOption[];
  phaseLinkOptions: EvidencePhaseLinkOption[];
  exportBundle: EvidenceExportBundle;
  actionState: EvidenceActionState;
  evidencePackages: Record<string, EvidenceCenterSelectedEvidence>;
};
