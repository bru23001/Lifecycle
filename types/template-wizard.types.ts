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
  status: TemplateSectionStatus;
  fields: DynamicField[];
};

export type ValidationIssue = {
  id: string;
  severity: "info" | "warning" | "error";
  sectionId?: string;
  fieldName?: string;
  message: string;
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
  wizardHeader: WizardHeaderData;
  templateSelections: TemplateSelectionItem[];
  selectedTemplate: {
    id: string;
    code: string;
    name: string;
    version: string;
    sections: TemplateSection[];
  };
  activeSectionId: string;
  formValues: Record<string, unknown>;
  validationSummary: ValidationSummary;
  markdownPreview: MarkdownPreviewData;
  jsonEvidence: JsonEvidence;
  artifactSaveState: ArtifactSaveState;
};

export type WizardScoreMatrix = {
  criteria: Array<{ id: string; name: string; description: string; weight: number }>;
  optionKeys: string[];
  optionLabels: Record<string, string>;
  scores: Record<string, Record<string, number | undefined>>;
  rowComments: Record<string, string>;
};
