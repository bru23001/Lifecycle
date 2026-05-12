import type { GateId } from "@/lib/gateRules";

/** Inclusive bounds for `Project.currentPhase` (workspace milestones). */
export const WORKSPACE_PHASE_MIN = 1;
export const WORKSPACE_PHASE_MAX = 14;

/**
 * Coerces stored or computed phase values into the workspace range.
 * Prevents gate/UI drift when data is corrupt or migrations were skipped.
 */
export function clampWorkspacePhase(phase: number): number {
  const n = Math.trunc(Number(phase));
  if (!Number.isFinite(n)) return WORKSPACE_PHASE_MIN;
  return Math.min(
    WORKSPACE_PHASE_MAX,
    Math.max(WORKSPACE_PHASE_MIN, n),
  );
}

/** Progress percent for dashboard / shell (10–100 by phase). */
export function workspacePhaseProgressPercent(phase: number): number {
  const p = clampWorkspacePhase(phase);
  return Math.min(100, Math.max(10, Math.round((p / WORKSPACE_PHASE_MAX) * 100)));
}

/** Fourteen milestones shown in the Lifecycle Workspace navigator (UI layer). */
export type WorkspacePhaseMeta = {
  index: number;
  title: string;
  /** Gate most commonly associated with exiting this milestone (for labels). */
  gate?: GateId;
};

/** One-line purpose copy for the phase header (aligned with workspace milestones). */
export const WORKSPACE_PHASE_PURPOSES: string[] = [
  "Capture the initiative idea, success criteria, and sponsor intent so the lifecycle can proceed with a clear charter.",
  "Define the problem space, constraints, and measurable outcomes that downstream phases must satisfy.",
  "Evaluate alternative solutions and select the best option that meets requirements, delivers value, and aligns with strategic objectives.",
  "Deepen feasibility evidence with technical, operational, and delivery assumptions tested against constraints.",
  "Consolidate stakeholder alignment, benefits, costs, and risks into an actionable business case package.",
  "Establish a requirements baseline that is traceable, testable, and scoped for controlled change.",
  "Lock planning boundaries, dependencies, and controls so execution stays aligned with approved scope.",
  "Describe architecture decisions, interfaces, and quality attributes that implement the requirements baseline.",
  "Prepare development readiness: environments, standards, traceability, and entry criteria for build.",
  "Plan build sequencing, contracts for interfaces, and integration checkpoints before heavy implementation.",
  "Confirm implementation readiness: staffing, tooling, risks, and gate evidence packaged for approval.",
  "Execute build and integration work against the approved baseline with continuous traceability.",
  "Verify quality, release readiness, and operational handover criteria before production promotion.",
  "Operate, monitor, and improve the live capability with defined ownership and feedback loops.",
];

export function workspacePhasePurpose(navIndex: number): string {
  const i = Math.min(Math.max(navIndex, 1), WORKSPACE_PHASE_PURPOSES.length) - 1;
  return WORKSPACE_PHASE_PURPOSES[i] ?? WORKSPACE_PHASE_PURPOSES[0]!;
}

/** Bullet objectives for the Current Phase Workspace card (one list per milestone). */
export const WORKSPACE_PHASE_OBJECTIVES: string[][] = [
  [
    "Document the idea, sponsor intent, and measurable success criteria.",
    "Confirm governance alignment and named roles for the charter.",
    "Capture initial risks, assumptions, and out-of-scope boundaries.",
  ],
  [
    "Define the problem statement with evidence and affected stakeholders.",
    "State constraints, policies, and quality bars the solution must respect.",
    "Agree how success will be verified once delivered.",
  ],
  [
    "Compare viable solution alternatives.",
    "Score options using defined evaluation criteria.",
    "Select and justify the recommended solution.",
    "Prepare evidence for feasibility approval.",
  ],
  [
    "Stress-test feasibility assumptions with delivery and operations reality.",
    "Record dependencies, estimates, and critical risks with mitigations.",
    "Align technical approach with the selected option.",
  ],
  [
    "Consolidate benefits, costs, and stakeholders into a coherent business case.",
    "Ensure approvals and funding path are explicit.",
    "Trace decisions back to requirements and selection rationale.",
  ],
  [
    "Baselined requirements are unique, testable, and prioritized.",
    "Cross-reference regulatory and contractual obligations.",
    "Establish traceability from business need to specification.",
  ],
  [
    "Lock scope boundaries and change-control rules.",
    "Define milestones, dependencies, and reporting cadence.",
    "Confirm verification and acceptance criteria per deliverable.",
  ],
  [
    "Document architecture decisions, interfaces, and NFR satisfaction.",
    "Show how design choices implement the requirements baseline.",
    "Identify failure modes and resilience expectations.",
  ],
  [
    "Prepare environments, branching strategy, and coding standards.",
    "Confirm test strategy and traceability hooks before build.",
    "Package readiness evidence for the development gate.",
  ],
  [
    "Sequence build increments and interface contracts between teams.",
    "Define integration checkpoints and rollback posture.",
    "Align procurement or vendor milestones with delivery dates.",
  ],
  [
    "Verify staffing, tooling access, and risk treatments are in place.",
    "Confirm gate evidence package completeness.",
    "Obtain readiness sign-off from engineering and delivery leads.",
  ],
  [
    "Implement against the approved baseline with traceable commits.",
    "Run integration tests aligned to acceptance criteria.",
    "Escalate scope or requirement drift through control boards.",
  ],
  [
    "Complete verification evidence for release and operational readiness.",
    "Validate rollback, monitoring, and support runbooks.",
    "Obtain release approval against the deployment checklist.",
  ],
  [
    "Operate with defined ownership, SLIs/SLOs, and incident response.",
    "Capture feedback for backlog and continual improvement.",
    "Maintain evidence for audits and customer commitments.",
  ],
];

export function workspacePhaseObjectives(navIndex: number): string[] {
  const i = Math.min(Math.max(navIndex, 1), WORKSPACE_PHASE_OBJECTIVES.length) - 1;
  return WORKSPACE_PHASE_OBJECTIVES[i] ?? WORKSPACE_PHASE_OBJECTIVES[0]!;
}

export const WORKSPACE_PHASES: WorkspacePhaseMeta[] = [
  { index: 1, title: "Idea capture & charter", gate: "G1" },
  { index: 2, title: "Problem definition", gate: "G2" },
  { index: 3, title: "Evaluation & selection", gate: "G2" },
  { index: 4, title: "Feasibility detail", gate: "G3" },
  { index: 5, title: "Business case & stakeholders", gate: "G3" },
  { index: 6, title: "Requirements baseline", gate: "G4" },
  { index: 7, title: "Scope & planning control", gate: "G4" },
  { index: 8, title: "Architecture & design", gate: "G5" },
  { index: 9, title: "Development preparation", gate: "G6" },
  { index: 10, title: "Build planning & contracts", gate: "G6" },
  { index: 11, title: "Implementation readiness", gate: "G6" },
  { index: 12, title: "Build & integrate", gate: "G7" },
  { index: 13, title: "Verification & release", gate: "G8" },
  { index: 14, title: "Deploy & operate", gate: "G9" },
];

/**
 * `Project.currentPhase` matches workspace index (1–14). Used when loading phase-specific templates.
 */
export function domainPhaseForWorkspaceIndex(workspaceIndex: number): number {
  return clampWorkspacePhase(workspaceIndex);
}

/** Active workspace tab from DB phase (same scale 1–14). */
export function workspaceNavigatorIndex(dbPhase: number): number {
  return clampWorkspacePhase(dbPhase);
}

export function workspacePhaseMeta(navIndex: number): WorkspacePhaseMeta {
  const idx = Math.min(Math.max(navIndex, 1), WORKSPACE_PHASES.length);
  return WORKSPACE_PHASES[idx - 1]!;
}

/** Header subtitle next to gate id (matches gate catalog wording). */
export function gateReviewSubtitle(gate: GateId | undefined): string {
  if (!gate) return "Not gated";
  switch (gate) {
    case "G1":
      return "Idea acceptance";
    case "G2":
      return "Feasibility approval";
    case "G3":
      return "Selection & business alignment";
    case "G4":
      return "Requirements baseline";
    case "G5":
      return "Architecture approval";
    case "G6":
      return "Development readiness";
    case "G7":
      return "Testing passed";
    case "G8":
      return "Release approved";
    case "G9":
      return "Deployment completed";
    case "G10":
      return "Maintenance review";
  }
}

/** Title-case gate label for phase header metadata (e.g. G2 → "Feasibility Approval"). */
export function gateHeaderDisplayName(gate: GateId | undefined): string {
  if (!gate) return "Not assigned";
  switch (gate) {
    case "G1":
      return "Idea Acceptance";
    case "G2":
      return "Feasibility Approval";
    case "G3":
      return "Selection & Business Alignment";
    case "G4":
      return "Requirements Baseline";
    case "G5":
      return "Architecture Approval";
    case "G6":
      return "Development Readiness";
    case "G7":
      return "Testing Passed";
    case "G8":
      return "Release Approved";
    case "G9":
      return "Deployment Completed";
    case "G10":
      return "Maintenance Review Completed";
  }
}
