export type ChecklistGovernance = "none" | "evidence" | "catalog";

export type CompletionChecklistItemDetail = {
  description: string;
  requiredArtifact: string;
  requiredArtifactHref?: string;
  requiredEvidence: string;
  validationRule: string;
  blockingSeverity: "none" | "medium" | "high";
  relatedTemplate: string;
  relatedTemplateHref?: string;
  resolveActionLabel: string;
  resolveHref?: string;
};

export type CompletionRulesPayload = {
  requiredArtifactsRule: string;
  requiredEvidenceRule: string;
  requiredApprovalsRule: string;
  validationRule: string;
  gateSubmissionRule: string;
  manualOverridePolicy: string;
  ruleSourceReference: string;
};

export type CompletionChecklistItem = {
  id: string;
  label: string;
  status: "complete" | "incomplete" | "blocked";
  required: boolean;
  href?: string;
  governance: ChecklistGovernance;
  /** System-derived completion before manual overrides. */
  computedDone: boolean;
  detail: CompletionChecklistItemDetail;
};
