export type ValidationIssueSeverity = "fail" | "warn" | "info";

export type ValidationIssueCategory =
  | "metadata"
  | "links"
  | "required_fields"
  | "classification"
  | "gate_readiness"
  | "phase_completion";

export type ValidationIssue = {
  id: string;
  severity: ValidationIssueSeverity;
  category: ValidationIssueCategory;
  title: string;
  detail: string;
  /** Affected evidence item when applicable. */
  evidenceId?: string;
  evidenceCode?: string;
  evidenceHref?: string;
  /** Primary navigation for remediation. */
  fixHref?: string;
  fixLabel: string;
  remediationHint: string;
};

export type EvidenceValidationResult = {
  generatedAtIso: string;
  summary: {
    fail: number;
    warn: number;
    info: number;
    evidenceRowsScanned: number;
  };
  issues: ValidationIssue[];
  gateReadinessImpact: string;
  phaseCompletionImpact: string;
};
