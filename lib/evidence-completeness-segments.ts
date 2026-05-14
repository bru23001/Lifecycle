import type { EvidenceByGate, EvidenceItem } from "@/types/evidence-center.types";

export type EvidenceCompletenessSegment = "complete" | "partial" | "missing" | "unlinked";

export function parseCompletenessStatus(raw: string | undefined): EvidenceCompletenessSegment | null {
  if (raw === "complete" || raw === "partial" || raw === "missing" || raw === "unlinked") {
    return raw;
  }
  return null;
}

export function evidenceItemsForSegment(
  items: EvidenceItem[],
  segment: Exclude<EvidenceCompletenessSegment, "missing">,
): EvidenceItem[] {
  if (segment === "complete") return items.filter((i) => i.status === "linked");
  if (segment === "partial") return items.filter((i) => i.status === "partially_linked");
  return items.filter((i) => i.status === "unlinked");
}

/** Gates/phases that still need evidence coverage (treat as “missing” segment). */
export function gateBlockingGaps(gates: EvidenceByGate[]): EvidenceByGate[] {
  return gates.filter((g) => g.status === "missing" || g.status === "partial" || g.status === "not_started");
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
