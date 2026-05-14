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
  uploadedOnLabel: string;
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
  coveragePercent: number;
  status: "complete" | "partial" | "missing" | "not_started";
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
  href: string;
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

export type EvidenceCenterSelectedEvidence = {
  detail: EvidenceDetail;
  completeness: EvidenceCompleteness;
  linkedArtifacts: { id: string; label: string; href: string }[];
  linkedGates: { id: string; label: string; href: string }[];
  history: { id: string; label: string; timestampLabel: string }[];
  comments: { id: string; author: string; body: string }[];
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
  exportBundle: EvidenceExportBundle;
  actionState: EvidenceActionState;
  evidencePackages: Record<string, EvidenceCenterSelectedEvidence>;
};
