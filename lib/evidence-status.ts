import type { EvidenceByGate, EvidenceByPhase, EvidenceDetail, EvidenceItem } from "@/types/evidence-center.types";

export const evidenceStatusBadgeMap: Record<
  EvidenceItem["status"] | EvidenceDetail["status"],
  { label: string; tone: "green" | "amber" | "gray" }
> = {
  linked: { label: "Linked", tone: "green" },
  partially_linked: { label: "Partially Linked", tone: "amber" },
  unlinked: { label: "Unlinked", tone: "gray" },
  archived: { label: "Archived", tone: "gray" },
};

export const evidenceCoverageBadgeMap: Record<
  EvidenceByGate["status"] | EvidenceByPhase["status"],
  { label: string; tone: "green" | "amber" | "red" | "gray" }
> = {
  complete: { label: "Complete", tone: "green" },
  partial: { label: "Partial", tone: "amber" },
  missing: { label: "Missing", tone: "red" },
  not_started: { label: "Not Started", tone: "gray" },
};

export const evidenceClassificationBadgeMap: Record<
  EvidenceDetail["classification"],
  { label: string; tone: "green" | "blue" | "amber" | "red" }
> = {
  public: { label: "Public", tone: "green" },
  internal: { label: "Internal", tone: "blue" },
  confidential: { label: "Confidential", tone: "amber" },
  restricted: { label: "Restricted", tone: "red" },
};
