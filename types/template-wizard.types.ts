export type WizardArtifactStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "in_review"
  | "approved"
  | "changes_requested";

export type WizardHeaderData = {
  projectId: string;
  projectName: string;
  templateId: string;
  templateCode: string;
  templateName: string;
  phaseNumber: number;
  phaseName: string;
  status: WizardArtifactStatus;
  purpose: string;
  ownerName: string;
  templateVersion: string;
  artifactVersion: string;
  lastSavedLabel?: string;
  completionPercent: number;
};

export type TemplateSelectionItem = {
  id: string;
  templateCode: string;
  name: string;
  required: boolean;
  status: "not_started" | "in_progress" | "complete" | "approved";
  completionPercent: number;
  href: string;
  phaseNumber: number;
  phaseName: string;
  gateCode?: string;
  version: string;
  schemaVersion: string;
  releaseDateLabel: string;
  changeSummary: string;
  addedFields: string[];
  deprecatedFields: string[];
  compatibilityNotes: string;
  migrationImpact: string;
  /** Template depth: `scaffold` shows a UI badge (late gates). */
  maturity?: "full" | "scaffold";
};

export type TemplateSectionStatus = "not_started" | "in_progress" | "complete" | "invalid";

export type DynamicFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "date"
  | "evidence_link"
  | "table"
  | "score_matrix";

export type FieldHelpContent = {
  /** What this field is for. */
  purpose?: string;
  /** Description of valid input shape/content. */
  expectedInput?: string;
  /** A concrete example value. */
  exampleValue?: string;
  /** A concrete bad example with brief reason why it's not enough. */
  avoidExample?: string;
  /** Validation rule (human-readable). */
  validationRule?: string;
  /** Related evidence expectations / artifacts the user should attach. */
  evidenceExpectation?: string;
};

export type DynamicField = {
  id: string;
  name: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
  /** When true, wizard validation skips this field (edit in full workspace). */
  delegateToWorkspace?: boolean;
  placeholder?: string;
  helpText?: string;
  /** Rich field-help content surfaced through the Field Help Popover. */
  helpPopover?: FieldHelpContent;
  /** When true, an "Expand" affordance opens the Expanded Field Editor Modal. */
  expandable?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
};

export type TemplateSection = {
  id: string;
  order: number;
  title: string;
  description?: string;
  required: boolean;
  /** Optional sections can be added/removed by the user (default false). */
  optional?: boolean;
  status: TemplateSectionStatus;
  fields: DynamicField[];
};

export type OptionalSectionDefinition = {
  id: string;
  title: string;
  description?: string;
  /** True if the section is required by the phase. */
  requiredByPhase?: boolean;
  /** Gate code that requires this section, if any. */
  requiredByGate?: string;
  /** Lightweight preview of fields included in the section. */
  previewFields: { name: string; label: string; typeLabel: string; required: boolean }[];
  /** The section blueprint inserted into the form when added. */
  section: TemplateSection;
};

export type ValidationIssue = {
  id: string;
  severity: "info" | "warning" | "error";
  sectionId?: string;
  fieldName?: string;
  message: string;
  /** Stable human-readable validation rule identifier for detail views and audit exports. */
  ruleId?: string;
  /** Concrete remediation guidance for the issue. */
  requiredFix?: string;
  /** Suggested value, example, or input pattern users can copy from. */
  suggestedValue?: string;
  href?: string;
};

export type ValidationSummary = {
  completionPercent: number;
  requiredFieldsTotal: number;
  requiredFieldsComplete: number;
  sectionsTotal: number;
  sectionsComplete: number;
  evidenceLinksRequired: number;
  evidenceLinksComplete: number;
  exportReady: boolean;
  issues: ValidationIssue[];
  warningCount: number;
  errorCount: number;
};

export type MarkdownPreviewData = {
  artifactTitle: string;
  markdown: string;
  generatedAtLabel: string;
  hasMissingPlaceholders: boolean;
};

export type JsonEvidence = {
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
    issues: ValidationIssue[];
  };
  evidenceLinks: {
    evidenceId: string;
    linkedToSectionId?: string;
    linkedToFieldName?: string;
  }[];
};

export type ArtifactSaveState = {
  artifactId?: string;
  templateId: string;
  projectId: string;
  phaseId: string;
  status: "draft" | "in_progress" | "complete" | "exported";
  canSave: boolean;
  canExportMarkdown: boolean;
  canExportJson: boolean;
  canMarkComplete: boolean;
  blockers: string[];
};

export type WizardCollaborationCommentDto = {
  id: string;
  body: string;
  resolved: boolean;
  visibility: "internal" | "reviewers";
  sectionId?: string;
  fieldName?: string;
  artifactId?: string;
  createdAt: string;
  authorName: string;
  authorInitials: string;
};

export type WizardReviewRequestSummaryDto = {
  id: string;
  assigneeName: string;
  assigneeRole: string;
  reviewScope: string;
  dueAt: string | null;
  createdAt: string;
};

/** Saved artifact row for version history (same template, newest first on server). */
export type WizardArtifactVersionSummary = {
  id: string;
  version: number;
  localId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type TemplateWizardData = {
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
  /** When set, JSON evidence uses this id instead of a synthetic draft id. */
  persistedArtifactId?: string;
  /** Seed evidence links from the database (client preview merges with live form state). */
  persistedEvidenceLinks?: JsonEvidence["evidenceLinks"];
  /** Initial evidence catalog (id-keyed) available for linking in the wizard. */
  evidenceCatalog?: WizardEvidenceItem[];
  /** Prior saves of this template for this project (each save creates a new artifact row). */
  artifactVersionHistory: WizardArtifactVersionSummary[];
  wizardHeader: WizardHeaderData;
  templateSelections: TemplateSelectionItem[];
  selectedTemplate: {
    id: string;
    code: string;
    name: string;
    version: string;
    sections: TemplateSection[];
    /** Optional sections the user can add to the artifact draft. */
    optionalSections: OptionalSectionDefinition[];
  };
  activeSectionId: string;
  formValues: Record<string, unknown>;
  validationSummary: ValidationSummary;
  markdownPreview: MarkdownPreviewData;
  jsonEvidence: JsonEvidence;
  artifactSaveState: ArtifactSaveState;
  collaborationComments: WizardCollaborationCommentDto[];
  collaborationReviewRequests: WizardReviewRequestSummaryDto[];
};

export type WizardEvidenceTarget =
  | { kind: "field"; fieldName: string }
  | { kind: "section"; sectionId: string }
  | { kind: "artifact" };

/**
 * Viewport-relative bounding rect captured from a trigger button so popovers
 * can anchor near the element that opened them. Mirrors the subset of
 * `DOMRect` we need (avoids passing the live DOM object across renders).
 */
export type WizardPopoverAnchorRect = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

export type WizardEvidenceItem = {
  id: string;
  evidenceCode: string;
  name: string;
  description?: string;
  evidenceType:
    | "pdf"
    | "spreadsheet"
    | "document"
    | "image"
    | "link"
    | "json"
    | "markdown"
    | "report";
  classification: "public" | "internal" | "confidential" | "restricted";
  source?: string;
  retentionPolicyLabel?: string;
  tags: string[];
  phaseNumber?: number;
  phaseName?: string;
  gateCode?: string;
  uploadedBy?: string;
  uploadedOnLabel?: string;
  href: string;
  downloadHref?: string;
  /** When true the item has not yet been written to the DB (wizard-local). */
  staged?: boolean;
};

export type WizardEvidenceLink = {
  evidenceId: string;
  target: WizardEvidenceTarget;
};

export type WizardScoreMatrix = {
  criteria: Array<{ id: string; name: string; description: string; weight: number }>;
  optionKeys: string[];
  optionLabels: Record<string, string>;
  scores: Record<string, Record<string, number | undefined>>;
  rowComments: Record<string, string>;
  /** Optional per-row evidence ids attached in the row detail drawer. */
  rowEvidence?: Record<string, string[]>;
};
