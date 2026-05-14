export type ValidationWarning = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  relatedObjectType:
    | "template"
    | "artifact"
    | "evidence"
    | "gate"
    | "traceability";
  relatedObjectId?: string;
  href?: string;
  /** Workspace milestone (1–14) this warning was evaluated under. */
  affectedPhaseNumber?: number;
  affectedPhaseLabel?: string;
  affectedTemplateId?: string;
  affectedTemplateTitle?: string;
  affectedArtifactLabel?: string;
  affectedEvidenceLabel?: string;
  ruleId?: string;
  recommendedFix?: string;
  /** When false, dismissal controls stay hidden (e.g. blocking errors). */
  dismissible?: boolean;
};
