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
  phaseNumber: number;
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
};
