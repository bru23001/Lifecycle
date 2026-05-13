import { serializeProjectsListFilters, type ParsedProjectsListQuery } from "@/lib/projects-list-query";
import type { ProjectDetailTab } from "@/types/projects.types";

/** Opens the project audit trail on the projects shell (immutable event list). */
export function projectAuditTrailListHref(projectId: string): string {
  const q = new URLSearchParams();
  q.set("selected", projectId);
  q.set("tab", "audit-trail");
  return `/projects?${q.toString()}`;
}

/** Canonical template wizard path (registry template id, e.g. `A-3.2`). */
export function projectTemplateWizardHref(projectId: string, templateRegistryId: string): string {
  return `/projects/${projectId}/templates/${encodeURIComponent(templateRegistryId)}`;
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

