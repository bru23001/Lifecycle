import { parseApplicability, type Applicability } from "@/lib/applicability";

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
    namingConformanceNote: project.namingConformanceNote ?? "",
    initialTestSetupNote: project.initialTestSetupNote ?? "",
  };
}
