import type { Prisma } from "@prisma/client";

import type { ProjectStatus } from "@/types/projects.types";

const WORKFLOW_STATUSES: readonly ProjectStatus[] = [
  "In Progress",
  "Blocked",
  "Pending",
  "Not Started",
];

export type ProjectApplicabilityMetadata = {
  owner?: string;
  ownerLabel?: string;
  lifecycleModel?: string;
  scope?: string;
  workflowStatus?: ProjectStatus;
  description?: string;
  projectType?: string;
  businessArea?: string;
  storageLocationLabel?: string;
};

function isProjectStatus(value: string): value is ProjectStatus {
  return (WORKFLOW_STATUSES as readonly string[]).includes(value);
}

/** Reads `applicabilityJson.projectMetadata` when present. */
export function parseProjectApplicabilityMetadata(
  json: Prisma.JsonValue | null | undefined,
): ProjectApplicabilityMetadata {
  if (json == null || typeof json !== "object" || Array.isArray(json)) {
    return {};
  }
  const root = json as Record<string, unknown>;
  const raw = root.projectMetadata;
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const pm = raw as Record<string, unknown>;
  const workflowRaw = typeof pm.workflowStatus === "string" ? pm.workflowStatus.trim() : "";
  const workflowStatus =
    workflowRaw && isProjectStatus(workflowRaw) ? workflowRaw : undefined;

  return {
    owner: typeof pm.owner === "string" ? pm.owner.trim() || undefined : undefined,
    ownerLabel: typeof pm.ownerLabel === "string" ? pm.ownerLabel.trim() || undefined : undefined,
    lifecycleModel:
      typeof pm.lifecycleModel === "string" ? pm.lifecycleModel.trim() || undefined : undefined,
    scope: typeof pm.scope === "string" ? pm.scope.trim() || undefined : undefined,
    workflowStatus,
    description:
      typeof pm.description === "string" ? pm.description.trim() || undefined : undefined,
    projectType:
      typeof pm.projectType === "string" ? pm.projectType.trim() || undefined : undefined,
    businessArea:
      typeof pm.businessArea === "string" ? pm.businessArea.trim() || undefined : undefined,
    storageLocationLabel:
      typeof pm.storageLocationLabel === "string"
        ? pm.storageLocationLabel.trim() || undefined
        : undefined,
  };
}

export function ownerDisplayFromProjectRow(
  applicabilityJson: Prisma.JsonValue | null | undefined,
  ownerRelationName: string | null | undefined,
  fallbackName: string,
): string {
  const meta = parseProjectApplicabilityMetadata(applicabilityJson);
  const fromMeta = meta.ownerLabel ?? meta.owner;
  const fromDb = ownerRelationName?.trim();
  return fromDb || fromMeta || fallbackName;
}

export function resolveProjectListStatus(
  phase: number,
  artifactCount: number,
  applicabilityJson: Prisma.JsonValue | null | undefined,
): ProjectStatus {
  const meta = parseProjectApplicabilityMetadata(applicabilityJson);
  if (meta.workflowStatus) return meta.workflowStatus;
  if (phase <= 1 && artifactCount === 0) return "Pending";
  return "In Progress";
}
