export type CurrentPhaseWorkspaceData = {
  title: string;
  instructions: string;
  infoMessage: string;
  objectives: string[];
};

export const EXAMPLE_CURRENT_PHASE_WORKSPACE: CurrentPhaseWorkspaceData = {
  title: "Current Phase Workspace",
  instructions:
    "Complete all required templates and checklist items, attach supporting evidence, and resolve validation warnings before submitting for Gate review.",
  infoMessage: "All items in this phase must be completed to submit to Gate G2.",
  objectives: [
    "Compare viable solution alternatives.",
    "Score options using defined evaluation criteria.",
    "Select and justify the recommended solution.",
    "Prepare evidence for feasibility approval.",
  ],
};
