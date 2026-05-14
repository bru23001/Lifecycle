/** Minimal shape for “is this evidence linked to lifecycle phase N?” checks. */
export type EvidencePhaseLinkSource = {
  phaseNumber: number | null;
  phaseLinks?: { phaseNumber: number }[];
};

export function evidenceLinkedToPhase(e: EvidencePhaseLinkSource, phaseNumber: number): boolean {
  if (e.phaseNumber === phaseNumber) return true;
  return (e.phaseLinks ?? []).some((l) => l.phaseNumber === phaseNumber);
}
