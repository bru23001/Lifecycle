import { normalizeGateParam } from "@/lib/gateNormalize";
import type { GateId } from "@/lib/gateRules";

/** Minimal shape for “is this evidence linked to gate G?” checks. */
export type EvidenceGateLinkSource = {
  gateCode: string | null;
  gateLinks?: { gateCode: string }[];
};

function norm(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  return normalizeGateParam(code);
}

/** True if the evidence row or any `EvidenceGateLink` row references `gate`. */
export function evidenceLinkedToGate(e: EvidenceGateLinkSource, gate: GateId): boolean {
  const g = normalizeGateParam(gate);
  if (norm(e.gateCode) === g) return true;
  return (e.gateLinks ?? []).some((l) => norm(l.gateCode) === g);
}
