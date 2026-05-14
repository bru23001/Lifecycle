import type { CoverageStatus, RequirementKind } from "@/types/traceability.types";

export type RequirementTestLinkedTrace = {
  traceLinkId: string;
  relation: string;
  endpointSummary: string;
  href: string;
};

export type RequirementTestTraceRow = {
  id: string;
  localId: string;
  title: string;
  requirementType: RequirementKind;
  requirementTypeLabel: string;
  verificationMethod: string | null;
  linkedTestTraces: RequirementTestLinkedTrace[];
  rowStatus: CoverageStatus;
  rationaleLines: string[];
  linkOwnerLabel: string | null;
  executionStatusLabel: string;
  defectsLabel: string;
  detailHref: string;
};

export type RequirementTestTypeSummary = {
  requirementType: RequirementKind;
  label: string;
  requirementsTotal: number;
  testCoverageTotal: number;
  coveragePercent: number;
  status: CoverageStatus;
  href: string;
};

export type RequirementTestTraceabilityData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  requirementsRegisterHref: string;
  selectedType: RequirementKind | null;
  typeSummaries: RequirementTestTypeSummary[];
  requirements: RequirementTestTraceRow[];
};
