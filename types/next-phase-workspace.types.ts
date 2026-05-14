/** Data for `/projects/[id]/workspace?phase=` “next phase workspace” view (spec §8). */
export type NextPhaseWorkspaceViewData = {
  projectId: string;
  projectName: string;
  projectCode: string;
  phaseNumber: number;
  phaseTitle: string;
  phasePurpose: string;
  /** Template / artifact template ids to emphasize for this milestone. */
  requiredTemplates: string[];
  evidenceExpectations: string[];
  initialChecklist: { id: string; label: string }[];
  carriedForwardArtifacts: { id: string; label: string; href: string }[];
  gateDependencyLabel: string;
  /** Gate most associated with this milestone (for copy). */
  phaseGateCode?: string;
};
