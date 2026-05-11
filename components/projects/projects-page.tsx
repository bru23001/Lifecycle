import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { ProjectsContent } from "@/components/projects/projects-content";
import type { ProjectDetailTab, ProjectsScreenData } from "@/types/projects.types";

export function ProjectsPage({
  data,
  selectedProjectId,
  selectedTab,
}: {
  data: ProjectsScreenData;
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
}) {
  return (
    <AuthenticatedAppShell
      projectId={data.selectedProject.header.id}
      projectName={data.selectedProject.header.name}
      phaseSummary={`Phase ${data.selectedProject.header.currentPhase} of ${data.selectedProject.header.totalPhases}`}
      phaseProgressPct={Math.max(8, data.projects.find((p) => p.id === selectedProjectId)?.progressPercent ?? 0)}
      navActive="projects"
    >
      <TopHeader title="Projects" userInitials={data.user.initials} notificationCount={3} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] text-[11px] text-foreground">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4 min-[901px]:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Projects" }]} />
        </div>
        <ProjectsContent data={data} selectedProjectId={selectedProjectId} selectedTab={selectedTab} />
      </main>
    </AuthenticatedAppShell>
  );
}
