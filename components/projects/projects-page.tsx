import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { ProjectsContent } from "@/components/projects/projects-content";
import type { ProjectDetailTab, ProjectsScreenData } from "@/types/projects.types";

export function ProjectsPage({
  data,
  selectedProjectId,
  selectedTab,
  currentPage,
  totalPages,
  hasProjects,
}: {
  data: ProjectsScreenData;
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
  totalPages: number;
  hasProjects: boolean;
}) {
  const activeProject = hasProjects ? data.projects.find((p) => p.id === selectedProjectId) ?? data.projects[0] : null;

  return (
    <AuthenticatedAppShell
      projectId={hasProjects ? activeProject?.id ?? null : null}
      projectName={hasProjects ? data.selectedProject.header.name : undefined}
      phaseSummary={
        hasProjects
          ? `Phase ${data.selectedProject.header.currentPhase} of ${data.selectedProject.header.totalPhases}`
          : undefined
      }
      phaseProgressPct={
        hasProjects ? Math.max(8, activeProject?.progressPercent ?? 0) : undefined
      }
      projectCurrentPhase={hasProjects ? data.selectedProject.header.currentPhase : null}
      gatesHref={hasProjects ? data.selectedProject.gatesNavHref ?? undefined : undefined}
      navActive="projects"
    >
      <TopHeader
        title="Projects"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        notificationCount={3}
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
          hasProjects={hasProjects}
        />
      </main>
    </AuthenticatedAppShell>
  );
}
