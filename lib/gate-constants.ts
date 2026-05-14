import type { GateId } from "@/lib/gateRules";

/** Canonical G1–G10 ordering (shared client/server; no `lib/server` coupling). */
export const ALL_GATES: readonly GateId[] = [
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
