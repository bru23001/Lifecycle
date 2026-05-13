import { formatProjectCode } from "@/lib/format-project-code";
import {
  parseProjectApplicabilityMetadata,
  resolveProjectListStatus,
} from "@/lib/project-applicability-metadata";
import type { SelectedProjectProfile } from "@/types/projects.types";

export function buildSelectedProjectProfileFromRow(row: {
  id: string;
  name: string;
  slug: string;
  vaultFolder: string;
  applicabilityJson: Parameters<typeof parseProjectApplicabilityMetadata>[0];
  currentPhase: number;
  ownerId: string | null;
  owner: { name: string | null } | null;
  _count: { artifacts: number };
}): SelectedProjectProfile {
  const pm = parseProjectApplicabilityMetadata(row.applicabilityJson);
  const status = resolveProjectListStatus(row.currentPhase, row._count.artifacts, row.applicabilityJson);
  return {
    projectId: row.id,
    name: row.name,
    slug: row.slug,
    displayedCode: formatProjectCode(row.slug, row.vaultFolder),
    description: pm.description ?? "",
    sponsor: pm.sponsor ?? "",
    ownerUserId: row.ownerId,
    ownerName: row.owner?.name?.trim() || pm.ownerLabel || pm.owner || "—",
    businessArea: pm.businessArea ?? "",
    priority: pm.priority ?? "",
    status,
    targetStartDate: pm.targetStartDate ?? "",
    targetEndDate: pm.targetEndDate ?? "",
  };
}
