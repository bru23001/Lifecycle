import type { CoverageStatus } from "@/types/traceability.types";

export type PhaseEvidenceLinkedItem = {
  id: string;
  evidenceCode: string;
  name: string;
  evidenceType: string;
  completenessPercent: number;
  phaseNumber: number | null;
  detailHref: string;
};

export type PhaseEvidenceMissingRow = {
  id: string;
  label: string;
};

export type PhaseEvidenceTraceListRow = {
  phaseNumber: number;
  phaseName: string;
  phaseIdParam: string;
  evidenceLinked: number;
  requiredEvidence: number;
  missingCount: number;
  coveragePercent: number;
  linkStatus: CoverageStatus;
  completionImpact: string;
  detailHref: string;
  workspaceHref: string;
  addEvidenceHref: string;
};

export type PhaseEvidenceTraceabilityListData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  phases: PhaseEvidenceTraceListRow[];
};

export type PhaseEvidencePhaseDetailData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  listHref: string;
  completenessHref: string;
  phase: {
    phaseNumber: number;
    phaseName: string;
    requiredEvidence: number;
    evidenceLinked: number;
    missingCount: number;
    coveragePercent: number;
    linkStatus: CoverageStatus;
    completionImpact: string;
    checklistImpact: string;
  };
  linkedEvidence: PhaseEvidenceLinkedItem[];
  missingEvidence: PhaseEvidenceMissingRow[];
  workspaceHref: string;
  addEvidenceHref: string;
};
