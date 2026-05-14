import type { CoverageStatus } from "@/types/traceability.types";

export type PhaseArtifactLinkHealth = "healthy" | "attention" | "blocked";

export type PhaseArtifactLinkedArtifactRow = {
  id: string;
  templateId: string;
  localId: string;
  version: number;
  title: string;
  status: string;
  linkHealth: PhaseArtifactLinkHealth;
  linkHealthLabel: string;
  ownerLabel: string | null;
  href: string;
};

export type PhaseArtifactMissingTemplateRow = {
  templateId: string;
  templateName: string;
};

export type PhaseArtifactTraceabilityPhaseSummary = {
  phaseNumber: number;
  phaseName: string;
  requiredCount: number;
  linkedCount: number;
  missingCount: number;
  coveragePercent: number;
  status: CoverageStatus;
  linkHealth: PhaseArtifactLinkHealth;
  linkHealthLabel: string;
  workspaceHref: string;
  detailHref: string;
};

export type PhaseArtifactTraceabilityListData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  phases: PhaseArtifactTraceabilityPhaseSummary[];
};

export type PhaseArtifactTraceabilityPhaseDetailData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  phase: PhaseArtifactTraceabilityPhaseSummary & {
    linkedArtifacts: PhaseArtifactLinkedArtifactRow[];
    missingTemplates: PhaseArtifactMissingTemplateRow[];
  };
};
