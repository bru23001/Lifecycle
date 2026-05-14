import type { EvidenceAttachment } from "@/components/lifecycle-workspace/evidence-attachments-types";
import type { EvidenceRow } from "@/components/lifecycle-workspace/current-phase-main-panel";
import { formatWorkspaceDate } from "@/lib/workspacePhaseWorkspaceSlice";

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
    href: `/projects/${projectId}/artifacts/${encodeURIComponent(row.id)}`,
    rowKind: "artifact_export" as const,
    versionLabel: row.name.includes("v") ? row.name.split("v").pop() : undefined,
    canUnlink: false,
  }));
}

type EvidenceItemRow = {
  id: string;
  evidenceCode: string;
  name: string;
  description: string;
  evidenceType: string;
  phaseNumber: number | null;
  gateCode: string | null;
  classification: string;
  completenessPercent: number;
  checksum: string | null;
  notes: string | null;
  source: string | null;
  uploadedByName: string;
  createdAt: Date;
  updatedAt: Date;
  artifactLinks: Array<{ artifact: { id: string; templateId: string; localId: string } }>;
};

function evidenceDbTypeToAttachmentType(raw: string): EvidenceAttachment["type"] {
  const allowed: EvidenceAttachment["type"][] = [
    "pdf",
    "spreadsheet",
    "document",
    "image",
    "link",
    "json",
    "markdown",
  ];
  return allowed.includes(raw as EvidenceAttachment["type"])
    ? (raw as EvidenceAttachment["type"])
    : "document";
}

export function buildWorkspaceEvidenceAttachments(input: {
  projectId: string;
  workspacePhaseNumber: number;
  gateCode: string | null;
  evidenceItems: EvidenceItemRow[];
  artifactEvidenceRows: EvidenceRow[];
}): EvidenceAttachment[] {
  const { projectId, workspacePhaseNumber, evidenceItems, artifactEvidenceRows } = input;

  const phaseEvidence = evidenceItems.filter(
    (e) => e.phaseNumber === workspacePhaseNumber || e.phaseNumber === null,
  );

  const dbAttachments: EvidenceAttachment[] = phaseEvidence.map((e) => {
    const linkedCodes = [
      e.evidenceCode,
      ...e.artifactLinks.map((l) => `${l.artifact.templateId}/${l.artifact.localId}`),
    ];
    const externalUrl =
      e.source && (e.source.startsWith("http://") || e.source.startsWith("https://")) ? e.source : null;
    return {
      id: e.id,
      name: e.name,
      type: evidenceDbTypeToAttachmentType(e.evidenceType),
      linkedTo: linkedCodes,
      addedBy: e.uploadedByName,
      addedOnLabel: formatWorkspaceDate(e.updatedAt),
      href: `/projects/${projectId}/evidence/${encodeURIComponent(e.id)}`,
      rowKind: "evidence_item",
      description: e.description || undefined,
      classification: e.classification,
      phaseNumber: e.phaseNumber,
      gateCode: e.gateCode,
      completenessPercent: e.completenessPercent,
      checksum: e.checksum,
      externalUrl,
      canUnlink: true,
    };
  });

  const artifactAttachments = mapEvidenceRowsToAttachments(artifactEvidenceRows, projectId);
  return [...dbAttachments, ...artifactAttachments];
}
