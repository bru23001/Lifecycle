import { parseApplicability, type Applicability } from "@/lib/applicability";
import { applySeedDataTypoFixes } from "@/lib/seed-data-typo-fixes";

export type ProjectMetaInitial = {
  applicability: Applicability;
  complexityLevel: string;
  namingConformanceNote: string;
  initialTestSetupNote: string;
};

export function buildProjectMetaInitial(project: {
  applicabilityJson: unknown;
  complexityLevel: string | null;
  namingConformanceNote: string | null;
  initialTestSetupNote: string | null;
}): ProjectMetaInitial {
  return {
    applicability: parseApplicability(project.applicabilityJson),
    complexityLevel: project.complexityLevel ?? "",
    namingConformanceNote: applySeedDataTypoFixes(project.namingConformanceNote ?? ""),
    initialTestSetupNote: applySeedDataTypoFixes(project.initialTestSetupNote ?? ""),
  };
}
