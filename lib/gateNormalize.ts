import type { GateId } from "@/lib/gateRules";

export function normalizeGateParam(param: string): GateId | null {
  const u = param.trim().toUpperCase();
  if (
    u === "G1" ||
    u === "G2" ||
    u === "G3" ||
    u === "G4" ||
    u === "G5" ||
    u === "G6" ||
    u === "G7" ||
    u === "G8" ||
    u === "G9" ||
    u === "G10"
  )
    return u;
  return null;
}
