import { serializeProjectsListFilters, type ParsedProjectsListQuery } from "@/lib/projects-list-query";
import type { ProjectDetailTab } from "@/types/projects.types";

/**
 * Opens the project audit trail on the projects shell (immutable event list).
 *
 * Optional `openAuditEventId` triggers the Audit Event Detail Drawer to open
 * on load — used as the deep-link target for `/projects/[id]/audit/[eventId]`.
 */
export function projectAuditTrailListHref(
  projectId: string,
  options?: { openAuditEventId?: string },
): string {
  const q = new URLSearchParams();
  q.set("selected", projectId);
  q.set("tab", "audit-trail");
  if (options?.openAuditEventId) q.set("openAuditEvent", options.openAuditEventId);
  return `/projects?${q.toString()}`;
}

export function projectGateAuditTrailHref(projectId: string, gateCode: string): string {
  const g = gateCode.trim().toUpperCase();
  return `/projects/${projectId}/audit?gate=${encodeURIComponent(g)}`;
}

/** Project overview (detail shell) — breadcrumb “project” target per workspace spec. */
export function projectOverviewHref(projectId: string): string {
  return `/projects/${projectId}`;
}

/** Canonical template wizard path (registry template id, e.g. `A-3.2`). */
export function projectTemplateWizardHref(projectId: string, templateRegistryId: string): string {
  return `/projects/${projectId}/templates/${encodeURIComponent(templateRegistryId)}`;
}

/** Project reports hub; optional workspace phase (1–14) scopes filters in linked reports. */
export function projectReportsHubHref(projectId: string, workspacePhase?: number): string {
  const q = new URLSearchParams();
  if (workspacePhase !== undefined && Number.isFinite(workspacePhase)) {
    q.set("phase", String(workspacePhase));
  }
  const tail = q.toString();
  return tail ? `/projects/${projectId}/reports?${tail}` : `/projects/${projectId}/reports`;
}

/** Preview of the bundle reviewers receive before submission is finalized. */
export function projectGatePackagePreviewHref(projectId: string, gateIdParam: string): string {
  const g = gateIdParam.trim().toLowerCase();
  return `/projects/${projectId}/gates/${g}/package-preview`;
}

/** Full validation report for a workspace milestone (1–14). */
export function projectPhaseValidationHref(projectId: string, workspacePhaseIndex: number): string {
  return `/projects/${projectId}/workspace/phases/${workspacePhaseIndex}/validation`;
}

/** Builds `/projects?…` for list + detail, preserving catalog filters/sort/search. */
export function projectsListHref(args: {
  selectedProjectId?: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
  listFilters?: ParsedProjectsListQuery;
}): string {
  const q = new URLSearchParams();
  if (args.selectedProjectId) q.set("selected", args.selectedProjectId);
  q.set("tab", args.selectedTab);
  if (args.currentPage > 1) q.set("page", String(args.currentPage));
  if (args.listFilters) {
    const tail = serializeProjectsListFilters(args.listFilters);
    if (tail) {
      const extra = new URLSearchParams(tail);
      extra.forEach((value, key) => {
        q.set(key, value);
      });
    }
  }
  return `/projects?${q.toString()}`;
}

