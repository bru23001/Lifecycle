export type PhaseNavItemStatus =
  | "completed"
  | "current"
  | "not_started"
  | "blocked"
  | "ready_for_review";

export type PhaseNavItem = {
  phaseNumber: number;
  name: string;
  status: PhaseNavItemStatus;
  href: string;
  gateCode?: string;
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
    status: "not_started",
    href: "/projects/sip-001/workspace?phase=4",
    gateCode: "G3",
  },
];
