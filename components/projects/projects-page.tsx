import Link from "next/link";
import { Plus } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { ProjectsContent } from "@/components/projects/projects-content";
import type { ParsedProjectsListQuery } from "@/lib/projects-list-query";
import type { ProjectDetailTab, ProjectsScreenData } from "@/types/projects.types";

export function ProjectsPage({
  data,
  selectedProjectId,
  selectedTab,
  currentPage,
  totalPages,
  repositoryHasProjects,
  hasVisibleProjects,
  listFilters,
  initialOpenAuditEventId,
}: {
  data: ProjectsScreenData;
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
  totalPages: number;
  repositoryHasProjects: boolean;
  hasVisibleProjects: boolean;
  listFilters: ParsedProjectsListQuery;
  initialOpenAuditEventId?: string | null;
}) {
  const activeProject = hasVisibleProjects
    ? (data.projects.find((p) => p.id === selectedProjectId) ?? data.projects[0])
    : null;

  return (
    <AuthenticatedAppShell
      projectId={hasVisibleProjects ? activeProject?.id ?? null : null}
      projectName={hasVisibleProjects ? data.selectedProject.header.name : undefined}
      phaseSummary={
        hasVisibleProjects
          ? `Phase ${data.selectedProject.header.currentPhase} of ${data.selectedProject.header.totalPhases}`
          : undefined
      }
      phaseProgressPct={
        hasVisibleProjects ? Math.max(8, activeProject?.progressPercent ?? 0) : undefined
      }
      projectCurrentPhase={hasVisibleProjects ? data.selectedProject.header.currentPhase : null}
      gatesHref={hasVisibleProjects ? data.selectedProject.gatesNavHref ?? undefined : undefined}
      navActive="projects"
    >
      <TopHeader
        title="Projects"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        toolbarExtras={
          <Link
            href="/projects/new"
            className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md bg-[#2563eb] px-3 text-[12px] font-semibold text-white outline-none ring-offset-background transition hover:bg-[#1d4ed8] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-9 sm:px-4"
            data-testid="projects-header-new-project"
          >
            <Plus className="size-4" aria-hidden />
            New Project
          </Link>
        }
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] text-[11px] text-foreground">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4 min-[901px]:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Projects" }]} />
        </div>
        <ProjectsContent
          data={data}
          selectedProjectId={selectedProjectId}
          selectedTab={selectedTab}
          currentPage={currentPage}
          totalPages={totalPages}
          repositoryHasProjects={repositoryHasProjects}
          hasVisibleProjects={hasVisibleProjects}
          listFilters={listFilters}
          initialOpenAuditEventId={initialOpenAuditEventId}
        />
      </main>
    </AuthenticatedAppShell>
  );
}
