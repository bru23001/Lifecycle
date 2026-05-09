import type { GateId } from "@/lib/gateRules";
import type { GateDecisionRow } from "@/lib/gateStatus";
import { clampWorkspacePhase } from "@/lib/workspacePhases";

/** Canonical gate review outcomes (audit / gate record). */
export type GateReviewDecision =
  | "Accepted"
  | "Conditional"
  | "Returned"
  | "Deferred"
  | "Rejected";

export function isAdvanceDecision(d: GateReviewDecision): boolean {
  return d === "Accepted" || d === "Conditional";
}

function recordedAdvance(decision: string): boolean {
  return decision === "Accepted" || decision === "Conditional";
}

function gateEvidencePassed(
  latestByGate: Map<string, GateDecisionRow> | undefined,
  gateId: string,
): boolean {
  const row = latestByGate?.get(gateId);
  return Boolean(
    row &&
      recordedAdvance(row.decision) &&
      row.evidencePassSnapshot,
  );
}

/** Whether the gate review UI is open for this gate (linear path). */
export function canOpenGateReview(
  currentPhase: number,
  gate: GateId,
  latestByGate?: Map<string, GateDecisionRow>,
): { ok: true } | { ok: false; reason: string } {
  currentPhase = clampWorkspacePhase(currentPhase);
  switch (gate) {
    case "G1":
      if (currentPhase === 1) return { ok: true };
      return {
        ok: false,
        reason:
          "G1 applies while the project is in Phase 1 (current phase has already moved past this gate).",
      };
    case "G2":
      if (currentPhase === 2) return { ok: true };
      return {
        ok: false,
        reason:
          currentPhase < 2
            ? "Complete G1 first (project must be in Phase 2)."
            : "G2 already satisfied for this linear path (phase is past Phase 2).",
      };
    case "G3":
      if (currentPhase >= 3 && currentPhase <= 5) return { ok: true };
      if (currentPhase < 3) {
        return {
          ok: false,
          reason: "Complete G2 first (project must be in Phase 3+).",
        };
      }
      return {
        ok: false,
        reason: "G3 is already cleared (project is past the G3 milestone).",
      };
    case "G4":
      if (currentPhase === 6) return { ok: true };
      if (currentPhase < 6) {
        return {
          ok: false,
          reason:
            "Complete G3 first — project must reach Phase 6 (requirements baseline).",
        };
      }
      return {
        ok: false,
        reason: "G4 applies only while in Phase 6.",
      };
    case "G5":
      if (currentPhase === 8) return { ok: true };
      if (currentPhase < 8) {
        return {
          ok: false,
          reason:
            "Reach Phase 8 (architecture & design) before architecture gate.",
        };
      }
      return {
        ok: false,
        reason: "G5 applies only while in Phase 8.",
      };
    case "G6":
      if (currentPhase === 9) return { ok: true };
      if (currentPhase < 9) {
        return {
          ok: false,
          reason:
            "Reach Phase 9 (development preparation) before readiness gate.",
        };
      }
      return {
        ok: false,
        reason: "G6 applies only while in Phase 9.",
      };
    case "G7":
      if (currentPhase === 12) return { ok: true };
      if (currentPhase < 12) {
        return {
          ok: false,
          reason:
            "Reach Phase 12 (build & integrate) before testing gate G7.",
        };
      }
      return {
        ok: false,
        reason: "G7 applies only while in Phase 12.",
      };
    case "G8":
      if (currentPhase === 13) return { ok: true };
      if (currentPhase < 13) {
        return {
          ok: false,
          reason:
            "Reach Phase 13 (verification & release) before release gate G8.",
        };
      }
      return {
        ok: false,
        reason: "G8 applies only while in Phase 13.",
      };
    case "G9":
      if (currentPhase !== 14) {
        return {
          ok: false,
          reason: "Gate G9 applies in Phase 14 (deploy & operate).",
        };
      }
      if (!gateEvidencePassed(latestByGate, "G8")) {
        return {
          ok: false,
          reason:
            "Complete Gate G8 (release approved) before deployment gate G9.",
        };
      }
      return { ok: true };
    case "G10":
      if (currentPhase !== 14) {
        return {
          ok: false,
          reason: "Gate G10 applies in Phase 14 (deploy & operate).",
        };
      }
      if (!gateEvidencePassed(latestByGate, "G9")) {
        return {
          ok: false,
          reason:
            "Record Gate G9 (deployment completed) before maintenance review G10.",
        };
      }
      return { ok: true };
    default: {
      const _e: never = gate;
      return _e;
    }
  }
}

/**
 * Next `Project.currentPhase` after a recorded gate decision.
 * Phases are workspace milestones 1–14 (`WORKSPACE_PHASES`).
 */
export function nextPhaseAfterGateDecision(
  gate: GateId,
  decision: GateReviewDecision,
  evidencePass: boolean,
  currentPhase: number,
): number {
  currentPhase = clampWorkspacePhase(currentPhase);
  if (isAdvanceDecision(decision)) {
    if (!evidencePass) return currentPhase;
    switch (gate) {
      case "G1":
        return 2;
      case "G2":
        return 3;
      case "G3":
        return 6;
      case "G4":
        return 7;
      case "G5":
        return 9;
      case "G6":
        return 10;
      case "G7":
        return 13;
      case "G8":
        return 14;
      case "G9":
        return 14;
      case "G10":
        return 14;
      default: {
        const _e: never = gate;
        return _e;
      }
    }
  }

  if (decision === "Returned") {
    if (gate === "G2") return 1;
    if (gate === "G3") return 3;
    if (gate === "G4") return 6;
    if (gate === "G5") return 8;
    if (gate === "G6") return 9;
    if (gate === "G7") return 10;
    if (gate === "G8") return 13;
    if (gate === "G9" || gate === "G10") return 14;
    return currentPhase;
  }

  return currentPhase;
}
