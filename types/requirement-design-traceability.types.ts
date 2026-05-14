import type { CoverageStatus, RequirementKind } from "@/types/traceability.types";

export type RequirementDesignLinkedFeature = {
  id: string;
  localId: string;
  title: string;
  traceLinkId: string;
  relation: string;
  href: string;
};

export type RequirementDesignTraceRow = {
  id: string;
  localId: string;
  title: string;
  requirementType: RequirementKind;
  requirementTypeLabel: string;
  hasDesignLink: boolean;
  rowStatus: CoverageStatus;
  linkedFeatures: RequirementDesignLinkedFeature[];
  rationaleLines: string[];
  linkOwnerLabel: string | null;
  detailHref: string;
};

export type RequirementDesignTypeSummary = {
  requirementType: RequirementKind;
  label: string;
  requirementsTotal: number;
  designLinksTotal: number;
  coveragePercent: number;
  status: CoverageStatus;
  href: string;
};

export type RequirementDesignTraceabilityData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  requirementsRegisterHref: string;
  selectedType: RequirementKind | null;
  typeSummaries: RequirementDesignTypeSummary[];
  requirements: RequirementDesignTraceRow[];
};
