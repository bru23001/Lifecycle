import type { Applicability } from "@/lib/applicability";

export type PhaseNavItemStatus =
  | "completed"
  | "current"
  | "not_started"
  | "blocked"
  | "ready_for_review"
  | "locked";

export type PhaseNavItem = {
  phaseNumber: number;
  name: string;
  status: PhaseNavItemStatus;
  href: string;
  gateCode?: string;
  /** Selected workspace phase from `?phase=` (visual focus). */
  isSelected?: boolean;
};

export type PhaseCompletionDetailPayload = {
  phaseNumber: number;
  phaseName: string;
  completedOnLabel: string;
  gateCode: string;
  gateName: string;
  decisionLabel: string;
  artifactSummaries: string[];
};

export type StartPhaseModalPayload = {
  nextPhase: number;
  nextPhaseTitle: string;
  currentPhaseTitle: string;
  checklistPreview: string[];
  nextTemplateLabels: string[];
  evidenceExpectation: string;
  gateCode: string;
  gateName: string;
};

export type LockedPhaseContextPayload = {
  currentPhaseTitle: string;
  gateCode: string;
  gateName: string;
  missingBullets: string[];
};

export type PhaseNavigatorMeta = {
  gatesHref: string;
  projectCurrentPhase: number;
  completionByPhase: Record<number, PhaseCompletionDetailPayload>;
  startPhaseModal: StartPhaseModalPayload | null;
  lockedContext: LockedPhaseContextPayload;
  /** Project applicability (template applicability flags). */
  applicability: Applicability;
};

/** Documentation sample aligned with product examples (paths use slug-style id). */
export const EXAMPLE_PHASE_NAVIGATOR_ITEMS: PhaseNavItem[] = [
  {
    phaseNumber: 1,
    name: "Idea Capture",
    status: "completed",
    href: "/projects/sip-001/workspace?phase=1",
    gateCode: "G1",
  },
  {
    phaseNumber: 2,
    name: "Problem Definition",
    status: "completed",
    href: "/projects/sip-001/workspace?phase=2",
    gateCode: "G2",
  },
  {
    phaseNumber: 3,
    name: "Evaluation & Selection",
    status: "current",
    href: "/projects/sip-001/workspace?phase=3",
  },
  {
    phaseNumber: 4,
    name: "Feasibility & Business Case",
    status: "locked",
    href: "#",
    gateCode: "G3",
  },
];
