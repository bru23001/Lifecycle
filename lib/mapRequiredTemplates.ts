import type { RequiredTemplate } from "@/components/lifecycle-workspace/required-templates-types";
import type { TemplateRow } from "@/components/lifecycle-workspace/current-phase-main-panel";

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

export function mapTemplateRowsToRequiredTemplates(
  rows: TemplateRow[],
  projectId: string,
): RequiredTemplate[] {
  return rows.map((row) => ({
    id: row.id.replace(/\./g, "-").toLowerCase(),
    templateCode: row.id,
    name: row.title,
    description: row.description,
    status: mapTemplateStatus(row.status),
    progressPercent: row.progressPct,
    lastUpdatedLabel: row.lastUpdated === "—" ? undefined : row.lastUpdated,
    href: `/projects/${projectId}/form/${encodeURIComponent(row.id)}`,
  }));
}
