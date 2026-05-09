/**
 * Human-readable lifecycle phase (`Project.currentPhase`).
 * See `lib/phaseTransitions.ts`.
 */
export function phaseLabel(phase: number): string {
  switch (phase) {
    case 1:
      return "Phase 1 — Idea capture & charter";
    case 2:
      return "Phase 2 — Problem definition";
    case 3:
      return "Phase 3 — Evaluation & selection";
    case 4:
      return "Phase 4 — Feasibility detail";
    case 5:
      return "Phase 5 — Business case & stakeholders";
    case 6:
      return "Phase 6 — Requirements baseline";
    case 7:
      return "Phase 7 — Scope & planning control";
    case 8:
      return "Phase 8 — Architecture & design";
    case 9:
      return "Phase 9 — Development preparation";
    case 10:
      return "Phase 10 — Build planning & contracts";
    case 11:
      return "Phase 11 — Implementation readiness";
    case 12:
      return "Phase 12 — Build & integrate";
    case 13:
      return "Phase 13 — Verification & release";
    case 14:
      return "Phase 14 — Deploy & operate";
    default:
      return `Phase ${phase}`;
  }
}

export function phaseShortLabel(phase: number): string {
  switch (phase) {
    case 1:
      return "P1 Idea";
    case 2:
      return "P2 Problem";
    case 3:
      return "P3 Select";
    case 4:
      return "P4 Feasibility";
    case 5:
      return "P5 Case";
    case 6:
      return "P6 Req";
    case 7:
      return "P7 Scope";
    case 8:
      return "P8 Arch";
    case 9:
      return "P9 Prep";
    case 10:
      return "P10 Plan";
    case 11:
      return "P11 Ready";
    case 12:
      return "P12 Build";
    case 13:
      return "P13 Verify";
    case 14:
      return "P14 Ops";
    default:
      return `P${phase}`;
  }
}
