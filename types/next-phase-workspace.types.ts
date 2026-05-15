import type { CompletionChecklistItem, CompletionRulesPayload } from "@/components/lifecycle-workspace/completion-checklist-types";
import type { PhaseNavItem, PhaseNavigatorMeta } from "@/components/lifecycle-workspace/phase-navigator-types";
import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";

/** State of a required template for the current project. */
export type RequiredTemplateStatus =
  | "not_started"
  | "in_progress"
  | "in_review"
  | "approved";

/** A template registered for the current phase, rendered as an actionable row. */
export type RequiredTemplateSummary = {
  templateId: string;
  title: string;
  /** Gate this template belongs to, e.g. "G1". */
  gate?: string;
  /** Deep link to the template wizard for this project. */
  href: string;
  status: RequiredTemplateStatus;
  /** When status !== not_started, a short hint (e.g. "v2 · last saved 2026-05-15"). */
  statusHint?: string;
};

/** Data for `/projects/[id]/workspace?phase=` “next phase workspace” view (spec §8). */
export type NextPhaseWorkspaceViewData = {
  projectId: string;
  projectName: string;
  projectCode: string;
  /** Selected workspace milestone from `?phase=` (defaults to DB-backed phase). */
  phaseNumber: number;
  /** DB-backed milestone (1–14) for navigator status and shell progress. */
  projectCurrentPhase: number;
  phaseTitle: string;
  phasePurpose: string;
  /** Template / artifact templates registered for this phase, with current project status. */
  requiredTemplates: RequiredTemplateSummary[];
  /** Optional human note when no templates are registered for the current phase. */
  requiredTemplatesEmptyMessage?: string;
  evidenceExpectations: string[];
  initialChecklist: { id: string; label: string }[];
  carriedForwardArtifacts: { id: string; label: string; href: string }[];
  gateDependencyLabel: string;
  /** Gate most associated with this milestone (for copy). */
  phaseGateCode?: string;

  phaseNavigatorItems: PhaseNavItem[];
  phaseNavigatorMeta: PhaseNavigatorMeta;
  checklistItems: CompletionChecklistItem[];
  completionRules: CompletionRulesPayload;
  validationWarnings: ValidationWarning[];
  gateSubmissionState: GateSubmissionState;
};
