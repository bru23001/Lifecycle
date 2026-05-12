import type { GateId } from "@/lib/gateRules";
import { clampWorkspacePhase, workspacePhaseMeta } from "@/lib/workspacePhases";

/** Visual gate status for dashboards (phase + recorded decisions). */
export type GateVisualState = "done" | "ready" | "upcoming";

export function getGateVisualState(
  currentPhase: number,
  gate: GateId,
  latestByGate?: Map<string, GateDecisionRow>,
): GateVisualState {
  currentPhase = clampWorkspacePhase(currentPhase);
  const passed = (g: string) => {
    const d = latestByGate?.get(g);
    return Boolean(
      d &&
        (d.decision === "Accepted" || d.decision === "Conditional") &&
        d.evidencePassSnapshot,
    );
  };

  switch (gate) {
    case "G1":
      if (currentPhase >= 2) return "done";
      return "ready";
    case "G2":
      if (currentPhase >= 3) return "done";
      if (currentPhase === 2) return "ready";
      return "upcoming";
    case "G3":
      if (currentPhase >= 6) return "done";
      if (currentPhase >= 3 && currentPhase <= 5) return "ready";
      return "upcoming";
    case "G4":
      if (currentPhase >= 7) return "done";
      if (currentPhase === 6) return "ready";
      return "upcoming";
    case "G5":
      if (currentPhase >= 9) return "done";
      if (currentPhase === 8) return "ready";
      return "upcoming";
    case "G6":
      if (currentPhase >= 10) return "done";
      if (currentPhase === 9) return "ready";
      return "upcoming";
    case "G7":
      if (passed("G7")) return "done";
      if (currentPhase === 12) return "ready";
      return "upcoming";
    case "G8":
      if (passed("G8")) return "done";
      if (currentPhase === 13) return "ready";
      return "upcoming";
    case "G9":
      if (passed("G9")) return "done";
      if (currentPhase === 14 && passed("G8")) return "ready";
      return "upcoming";
    case "G10":
      if (passed("G10")) return "done";
      if (currentPhase === 14 && passed("G9")) return "ready";
      return "upcoming";
    default: {
      const _e: never = gate;
      return _e;
    }
  }
}

export type GateDecisionRow = {
  gateId: string;
  decision: string;
  evidencePassSnapshot: boolean;
  createdAt: Date;
};

/** Latest row per gate (input sorted `createdAt` desc). */
export function indexLatestGateDecisions(
  decisions: GateDecisionRow[],
): Map<string, GateDecisionRow> {
  const m = new Map<string, GateDecisionRow>();
  for (const d of decisions) {
    if (!m.has(d.gateId)) m.set(d.gateId, d);
  }
  return m;
}

/** Linear gate order for default review navigation. */
const GATE_NAV_ORDER: GateId[] = [
  "G1",
  "G2",
  "G3",
  "G4",
  "G5",
  "G6",
  "G7",
  "G8",
  "G9",
  "G10",
];

/**
 * Default gate review target: first gate in G1…G10 order that is `ready` for `getGateVisualState`.
 * Pass `latestByGate` when project gate decisions are loaded so G7–G10 match recorded outcomes.
 * Falls back to the workspace milestone gate when none are ready.
 */
export function nextOpenGateForPhase(
  phase: number,
  latestByGate?: Map<string, GateDecisionRow>,
): GateId {
  const p = clampWorkspacePhase(phase);
  for (const gate of GATE_NAV_ORDER) {
    if (getGateVisualState(p, gate, latestByGate) === "ready") return gate;
  }
  return workspacePhaseMeta(p).gate ?? "G1";
}

export function gateAuditTooltip(
  gate: GateId,
  latest: GateDecisionRow | undefined,
): string | undefined {
  if (!latest) return undefined;
  const ev = latest.evidencePassSnapshot ? "evidence passed" : "evidence incomplete";
  return `Last record: ${latest.decision} (${ev}) · ${latest.createdAt.toISOString().slice(0, 10)}`;
}
