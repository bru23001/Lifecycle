import type { GateId } from "@/lib/gateRules";
import { nextPhaseAfterGateDecision } from "@/lib/phaseTransitions";

/** Dedicated E2E project slug (isolated from demo). */
export const E2E_PROJECT_SLUG = "e2e-lifecycle";

export const WORKSPACE_PHASES = Array.from({ length: 14 }, (_, i) => i + 1);

export const GATE_IDS: GateId[] = [
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

/** Expected phase after Accepted decision with passing evidence (from phaseTransitions). */
export const EXPECTED_PHASE_AFTER_ACCEPT: Record<GateId, number> = GATE_IDS.reduce(
  (acc, gateId) => {
    acc[gateId] = nextPhaseAfterGateDecision(gateId, "Accepted", true, 1);
    return acc;
  },
  {} as Record<GateId, number>,
);

export const E2E_BASE_PORT = Number(process.env.E2E_PORT ?? "3011");

export function e2eBaseUrl(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${E2E_BASE_PORT}`;
}
