/** Allowed lifecycle model values (stored in `applicabilityJson.projectMetadata.lifecycleModel`). */
export const NEW_PROJECT_LIFECYCLE_MODELS = [
  "CYBERCUBE 14-phase workspace",
  "Accelerated delivery (compressed gates)",
  "Maintenance / sustainment",
] as const;

export type NewProjectLifecycleModel = (typeof NEW_PROJECT_LIFECYCLE_MODELS)[number];

/** Workflow status at creation (stored in `applicabilityJson.projectMetadata.workflowStatus`). */
export const NEW_PROJECT_WORKFLOW_STATUSES = [
  "Not Started",
  "Pending",
  "In Progress",
  "Blocked",
] as const;

export type NewProjectWorkflowStatus = (typeof NEW_PROJECT_WORKFLOW_STATUSES)[number];
