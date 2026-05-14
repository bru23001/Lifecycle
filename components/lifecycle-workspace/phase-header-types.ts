/**
 * Phase header card — identity, metadata, gate dependency, completion progress.
 */

export type PhaseHeaderStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "ready_for_review"
  | "approved";

export type PhaseHeaderData = {
  projectId: string;
  projectName: string;
  phaseNumber: number;
  totalPhases: number;
  phaseName: string;
  status: PhaseHeaderStatus;
  purpose: string;
  ownerName: string;
  startedOnLabel: string;
  targetCompletionLabel: string;
  /** Gate code shown in metadata (e.g. G2). */
  gateCode: string;
  /** Human-readable gate name (e.g. Feasibility Approval). */
  gateName: string;
  completionPercent: number;
  /** DB project id for mutations and package route. */
  projectRecordId: string;
};

/** Sample payload matching UI examples / documentation. */
export const EXAMPLE_PHASE_HEADER_DATA: PhaseHeaderData = {
  projectId: "sip-001",
  projectName: "Secure Identity Platform",
  phaseNumber: 3,
  totalPhases: 14,
  phaseName: "Evaluation & Selection",
  status: "in_progress",
  purpose:
    "Evaluate alternative solutions and select the best option that meets requirements, delivers value, and aligns with strategic objectives.",
  ownerName: "Example Owner",
  startedOnLabel: "May 10, 2024",
  targetCompletionLabel: "May 24, 2024",
  gateCode: "G2",
  gateName: "Feasibility Approval",
  completionPercent: 65,
  projectRecordId: "prj_example",
};

export function derivePhaseHeaderStatus(args: {
  templateCount: number;
  completedTemplates: number;
  notStartedTemplates: number;
  warningCount: number;
}): PhaseHeaderStatus {
  const { templateCount, completedTemplates, notStartedTemplates, warningCount } = args;
  if (templateCount === 0) return "not_started";
  if (warningCount >= 3) return "blocked";
  if (completedTemplates === templateCount) return "ready_for_review";
  if (completedTemplates === 0 && notStartedTemplates === templateCount) return "not_started";
  return "in_progress";
}
