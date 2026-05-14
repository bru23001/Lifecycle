import type {
  RequiredTemplate,
  RequiredTemplatePreviewSection,
} from "@/components/lifecycle-workspace/required-templates-types";
import type { TemplateRow } from "@/components/lifecycle-workspace/current-phase-main-panel";
import { projectTemplateWizardHref } from "@/lib/projects-url";

function mapTemplateStatus(
  row: TemplateRow["status"],
): RequiredTemplate["status"] {
  switch (row) {
    case "Completed":
      return "completed";
    case "In Progress":
      return "in_progress";
    default:
      return "not_started";
  }
}

export type RequiredTemplateEnrichment = {
  workspacePhaseNumber?: number;
  gateCode?: string;
  artifactIdByTemplate?: Map<string, string>;
  validationIssuesByTemplate?: Map<string, string[]>;
  previewSectionsByTemplate?: Map<string, RequiredTemplatePreviewSection[]>;
};

export function mapTemplateRowsToRequiredTemplates(
  rows: TemplateRow[],
  projectId: string,
  enrichment?: RequiredTemplateEnrichment,
): RequiredTemplate[] {
  return rows.map((row) => {
    const artifactId = enrichment?.artifactIdByTemplate?.get(row.id);
    const artifactDetailHref = artifactId
      ? `/projects/${projectId}/artifacts/${encodeURIComponent(artifactId)}`
      : undefined;
    return {
      id: row.id.replace(/\./g, "-").toLowerCase(),
      templateCode: row.id,
      name: row.title,
      description: row.description,
      status: mapTemplateStatus(row.status),
      progressPercent: row.progressPct,
      lastUpdatedLabel: row.lastUpdated === "—" ? undefined : row.lastUpdated,
      href: projectTemplateWizardHref(projectId, row.id),
      artifactDetailHref,
      workspacePhaseNumber: enrichment?.workspacePhaseNumber,
      gateCode: enrichment?.gateCode,
      validationIssues: enrichment?.validationIssuesByTemplate?.get(row.id),
      previewSections: enrichment?.previewSectionsByTemplate?.get(row.id),
    };
  });
}
