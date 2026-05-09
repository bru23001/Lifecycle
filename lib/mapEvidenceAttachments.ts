import type { EvidenceAttachment } from "@/components/lifecycle-workspace/evidence-attachments-types";
import type { EvidenceRow } from "@/components/lifecycle-workspace/current-phase-main-panel";

function kindToAttachmentType(
  kind: EvidenceRow["kind"],
): EvidenceAttachment["type"] {
  switch (kind) {
    case "pdf":
      return "pdf";
    case "excel":
      return "spreadsheet";
    case "word":
      return "document";
    default:
      return "document";
  }
}

export function mapEvidenceRowsToAttachments(
  rows: EvidenceRow[],
  projectId: string,
): EvidenceAttachment[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: kindToAttachmentType(row.kind),
    linkedTo: [row.linkedTemplateId],
    addedBy: row.addedBy,
    addedOnLabel: row.addedOn,
    href: `/projects/${projectId}/evidence/${encodeURIComponent(row.id)}`,
  }));
}
