import type { PhaseGuidePayload } from "@/lib/workspacePhaseGuide";

export type EditablePhaseDetailValues = {
  ownerName: string;
  targetCompletionIso: string;
  phaseNotes: string;
  priority: string;
  riskLevel: string;
  internalStatus: string;
  contributorNames: string;
};

export type PhaseActivityRow = {
  id: string;
  actor: string;
  timestampLabel: string;
  changedObject: string;
  beforeLabel: string;
  afterLabel: string;
  comment: string;
  auditRef: string;
};

export type { PhaseGuidePayload };

export type WorkspacePhaseActionsPayload = {
  projectRecordId: string;
  phaseNumber: number;
  packageHref: string;
  initialEditable: EditablePhaseDetailValues;
  guide: PhaseGuidePayload;
  activity: PhaseActivityRow[];
};
