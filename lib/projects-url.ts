import type { ProjectDetailTab } from "@/types/projects.types";

/** Builds `/projects?…` for list + detail, optionally opening the new-project modal or attaching `intent`. */
export function projectsListHref(args: {
  selectedProjectId?: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
  newProject?: boolean;
  intent?: string | null;
}): string {
  const q = new URLSearchParams();
  if (args.selectedProjectId) q.set("selected", args.selectedProjectId);
  q.set("tab", args.selectedTab);
  if (args.currentPage > 1) q.set("page", String(args.currentPage));
  if (args.newProject) q.set("new", "1");
  if (args.intent?.trim()) q.set("intent", args.intent.trim());
  return `/projects?${q.toString()}`;
}

/** Drops `new` and `intent` while preserving list selection (or bare `/projects` when empty). */
export function projectsCloseNewModalHref(args: {
  hasProjects: boolean;
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
}): string {
  if (!args.hasProjects) return "/projects";
  return projectsListHref({
    selectedProjectId: args.selectedProjectId,
    selectedTab: args.selectedTab,
    currentPage: args.currentPage,
    newProject: false,
    intent: null,
  });
}
