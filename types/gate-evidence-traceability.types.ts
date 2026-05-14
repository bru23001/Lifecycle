import type { GateId } from "@/lib/gateRules";
import type { CoverageStatus, GateTraceStatus } from "@/types/traceability.types";

export type GateEvidenceLinkedItem = {
  id: string;
  evidenceCode: string;
  name: string;
  evidenceType: string;
  completenessPercent: number;
  phaseNumber: number | null;
  detailHref: string;
};

export type GateEvidenceMissingRow = {
  id: string;
  label: string;
};

export type GateEvidenceTraceListRow = {
  gateCode: GateId;
  gateName: string;
  gateIdParam: string;
  gateStatus: GateTraceStatus;
  evidenceLinked: number;
  requiredEvidence: number;
  missingCount: number;
  coveragePercent: number;
  linkStatus: CoverageStatus;
  decisionSummary: string;
  detailHref: string;
  reviewHref: string;
};

export type GateEvidenceTraceabilityListData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  gates: GateEvidenceTraceListRow[];
};

export type GateEvidenceGateDetailData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  listHref: string;
  gate: {
    gateCode: GateId;
    gateName: string;
    gateStatus: GateTraceStatus;
    requiredEvidence: number;
    requiredInputLabels: string[];
    evidenceLinked: number;
    coveragePercent: number;
    linkStatus: CoverageStatus;
    decisionSummary: string;
    latestDecision: null | {
      decision: string;
      createdAtLabel: string;
      evidencePassSnapshot: boolean;
    };
  };
  linkedEvidence: GateEvidenceLinkedItem[];
  missingEvidence: GateEvidenceMissingRow[];
  reviewHref: string;
  addEvidenceHref: string;
};
