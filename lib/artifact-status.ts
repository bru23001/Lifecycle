import type { ArtifactWorkflowStatus, LinkedGate } from "@/types/artifact-library.types";

export const artifactStatusBadgeMap: Record<
  ArtifactWorkflowStatus,
  { label: string; tone: "gray" | "blue" | "green" | "amber" | "purple" }
> = {
  not_started: { label: "Not Started", tone: "gray" },
  draft: { label: "Draft", tone: "gray" },
  in_progress: { label: "In Progress", tone: "blue" },
  in_review: { label: "In Review", tone: "purple" },
  approved: { label: "Approved", tone: "green" },
  changes_requested: { label: "Changes Requested", tone: "amber" },
  archived: { label: "Archived", tone: "gray" },
};

export const linkedGateStatusBadgeMap: Record<
  LinkedGate["status"],
  { label: string; tone: "gray" | "green" | "amber" | "red" }
> = {
  not_started: { label: "Not Started", tone: "gray" },
  pending_decision: { label: "Pending Decision", tone: "amber" },
  approved: { label: "Approved", tone: "green" },
  changes_requested: { label: "Changes Requested", tone: "amber" },
  rejected: { label: "Rejected", tone: "red" },
};
