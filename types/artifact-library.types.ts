export type ArtifactWorkflowStatus =
  | "not_started"
  | "draft"
  | "in_progress"
  | "in_review"
  | "approved"
  | "changes_requested"
  | "archived";

export type ArtifactListItem = {
  id: string;
  artifactCode: string;
  name: string;
  phaseNumber: number;
  phaseName: string;
  templateId: string;
  templateName: string;
  status: ArtifactWorkflowStatus;
  version: string;
  lastUpdatedLabel: string;
  href: string;
};

export type ArtifactDetail = {
  id: string;
  artifactCode: string;
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  phaseNumber: number;
  phaseName: string;
  templateId: string;
  templateName: string;
  ownerName: string;
  status: ArtifactWorkflowStatus;
  version: string;
  artifactVersionLabel: string;
  lastUpdatedLabel: string;
  createdOnLabel: string;
  isStarred?: boolean;
};

export type ArtifactTabKey =
  | "markdown"
  | "json_evidence"
  | "version_history"
  | "activity_log"
  | "comments";

export type ArtifactTab = {
  key: ArtifactTabKey;
  label: string;
  count?: number;
};

export type MarkdownArtifactView = {
  artifactId: string;
  title: string;
  markdown: string;
  generatedAtLabel: string;
  hasMissingPlaceholders: boolean;
};

export type ArtifactJsonEvidence = {
  artifactId: string;
  projectId: string;
  phaseId: string;
  phaseNumber: number;
  templateId: string;
  templateCode: string;
  templateVersion: string;
  artifactVersion: string;
  status: string;
  generatedAt: string;
  generatedBy: string;
  sections: {
    sectionId: string;
    title: string;
    status: string;
    values: Record<string, unknown>;
  }[];
  validation: {
    completionPercent: number;
    exportReady: boolean;
    issues: {
      id: string;
      severity: "info" | "warning" | "error";
      message: string;
    }[];
  };
  evidenceLinks: {
    evidenceId: string;
    linkedToSectionId?: string;
    linkedToFieldName?: string;
  }[];
};

export type ArtifactVersion = {
  id: string;
  version: string;
  status: "draft" | "complete" | "approved" | "archived";
  createdBy: string;
  createdOnLabel: string;
  changeSummary: string;
  markdownSnapshotHref?: string;
  jsonSnapshotHref?: string;
  canRestore: boolean;
};

export type LinkedPhase = {
  phaseId: string;
  phaseNumber: number;
  totalPhases: number;
  phaseName: string;
  status: "not_started" | "in_progress" | "complete" | "approved";
  workspaceHref: string;
};

export type LinkedGate = {
  gateId: string;
  gateCode: string;
  gateName: string;
  status:
    | "not_started"
    | "pending_decision"
    | "approved"
    | "changes_requested"
    | "rejected";
  reviewHref: string;
};

export type ArtifactQuickInfoData = {
  artifactType: string;
  templateVersion: string;
  artifactVersion: string;
  status: string;
  overallProgressPercent: number;
  requiredSections: number;
  completedSections: number;
  evidenceItems: number;
  wordCount: number;
  lastUpdatedBy: string;
};

export type ArtifactExportPackage = {
  artifactId: string;
  canExportMarkdown: boolean;
  canExportJsonEvidence: boolean;
  canExportFullPackage: boolean;
  markdownFilename: string;
  jsonFilename: string;
  packageFilename: string;
  blockers: string[];
};

export type ArtifactActivityItem = {
  id: string;
  actor: string;
  action: string;
  timestampLabel: string;
};

export type ArtifactComment = {
  id: string;
  author: string;
  body: string;
  createdOnLabel: string;
};

export type ArtifactLibraryData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
    /** Workspace milestone (1–14) for shell progress copy. */
    currentPhase: number;
  };
  artifactListItems: ArtifactListItem[];
  selectedArtifact: {
    detail: ArtifactDetail;
    markdownView: MarkdownArtifactView;
    jsonEvidence: ArtifactJsonEvidence;
    versionHistory: ArtifactVersion[];
    linkedPhase: LinkedPhase;
    linkedGate: LinkedGate;
    quickInfo: ArtifactQuickInfoData;
    exportPackage: ArtifactExportPackage;
    activityLog: ArtifactActivityItem[];
    comments: ArtifactComment[];
  };
};
