import { CurrentPhaseWorkspace } from "@/components/lifecycle-workspace/current-phase-workspace";
import type { CurrentPhaseWorkspaceData } from "@/components/lifecycle-workspace/current-phase-workspace-types";
import { EvidenceAttachments } from "@/components/lifecycle-workspace/evidence-attachments";
import type { EvidenceAttachment } from "@/components/lifecycle-workspace/evidence-attachments-types";
import type { PhaseHeaderData } from "@/components/lifecycle-workspace/phase-header-types";
import { RequiredTemplates } from "@/components/lifecycle-workspace/required-templates";
import type { RequiredTemplate } from "@/components/lifecycle-workspace/required-templates-types";

export type TemplateRow = {
  id: string;
  title: string;
  description: string;
  status: "Completed" | "In Progress" | "Not Started";
  progressPct: number;
  lastUpdated: string;
};

/** @deprecated Use EvidenceAttachment via mapEvidenceRowsToAttachments */
export type EvidenceRow = {
  id: string;
  name: string;
  type: string;
  linkedTemplateId: string;
  addedBy: string;
  addedOn: string;
  kind: "pdf" | "excel" | "word" | "other";
};

export function CurrentPhaseMainPanel({
  phaseHeader,
  workspace,
  requiredTemplates,
  evidenceAttachments,
}: {
  phaseHeader: PhaseHeaderData;
  workspace: CurrentPhaseWorkspaceData;
  requiredTemplates: RequiredTemplate[];
  evidenceAttachments: EvidenceAttachment[];
}) {
  return (
    <div data-pane="workspace" className="current-phase-panel">
      <CurrentPhaseWorkspace phaseHeader={phaseHeader} data={workspace} />
      <RequiredTemplates templates={requiredTemplates} />
      <EvidenceAttachments attachments={evidenceAttachments} />
    </div>
  );
}
