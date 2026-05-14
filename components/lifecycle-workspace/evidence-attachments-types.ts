export type EvidenceAttachmentType =
  | "pdf"
  | "spreadsheet"
  | "document"
  | "image"
  | "link"
  | "json"
  | "markdown";

export type EvidenceAttachmentRowKind = "evidence_item" | "artifact_export";

export type EvidenceAttachment = {
  id: string;
  name: string;
  type: EvidenceAttachmentType;
  linkedTo: string[];
  addedBy: string;
  addedOnLabel: string;
  href: string;
  /** DB evidence vs derived artifact export row. */
  rowKind?: EvidenceAttachmentRowKind;
  description?: string;
  classification?: string;
  phaseNumber?: number | null;
  gateCode?: string | null;
  completenessPercent?: number;
  checksum?: string | null;
  /** Human-readable version line for artifact exports. */
  versionLabel?: string;
  externalUrl?: string | null;
  /** When false, hide unlink/remove for read-only artifact rows. */
  canUnlink?: boolean;
};

export type EvidenceWorkspacePickerItem = {
  id: string;
  name: string;
  evidenceCode: string;
};

export type EvidenceWorkspaceArtifactOption = {
  id: string;
  label: string;
};

export type EvidenceWorkspaceContextPayload = {
  workspacePhaseNumber: number;
  gateCode: string;
  artifactOptions: EvidenceWorkspaceArtifactOption[];
  linkableEvidence: EvidenceWorkspacePickerItem[];
};
