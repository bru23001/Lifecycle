/** Allowed lifecycle model values (stored in `applicabilityJson.projectMetadata.lifecycleModel`). */
export const NEW_PROJECT_LIFECYCLE_MODELS = [
  "CYBERCUBE 14-phase workspace",
  "Accelerated delivery (compressed gates)",
  "Maintenance / sustainment",
] as const;

export type NewProjectLifecycleModel = (typeof NEW_PROJECT_LIFECYCLE_MODELS)[number];

/** Business area (stored in `applicabilityJson.projectMetadata.businessArea`). */
export const NEW_PROJECT_BUSINESS_AREAS = [
  "Security",
  "Platform engineering",
  "Product",
  "Operations",
  "Compliance",
  "Other",
] as const;

export type NewProjectBusinessArea = (typeof NEW_PROJECT_BUSINESS_AREAS)[number];

/** Workflow status at creation (stored in `applicabilityJson.projectMetadata.workflowStatus`). */
export const NEW_PROJECT_WORKFLOW_STATUSES = [
  "Not Started",
  "Pending",
  "In Progress",
  "Blocked",
] as const;

export type NewProjectWorkflowStatus = (typeof NEW_PROJECT_WORKFLOW_STATUSES)[number];

/** Priority label stored in `applicabilityJson.projectMetadata.priority`. */
export const PROJECT_PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low", "—"] as const;

export type ProjectPriorityOption = (typeof PROJECT_PRIORITY_OPTIONS)[number];
