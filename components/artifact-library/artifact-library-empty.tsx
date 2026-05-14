"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { workspacePhaseProgressPercent } from "@/lib/workspacePhases";
import { projectOverviewHref } from "@/lib/projects-url";

export default function ArtifactLibraryEmpty({
  user,
  project,
  openedFromWorkspacePhase,
}: {
  user: { name: string; role: string; initials: string };
  project: { id: string; name: string; code: string; currentPhase: number };
  openedFromWorkspacePhase?: number;
}) {
  const navPhase =
    openedFromWorkspacePhase !== undefined && openedFromWorkspacePhase >= 1 && openedFromWorkspacePhase <= 14
      ? openedFromWorkspacePhase
      : project.currentPhase;
  const workspacePhaseHref = `/projects/${project.id}/workspace?phase=${navPhase}`;
  return (
    <AuthenticatedAppShell
      projectId={project.id}
      projectName={project.name}
      phaseSummary={`Phase ${project.currentPhase} of 14`}
      phaseProgressPct={workspacePhaseProgressPercent(project.currentPhase)}
      navActive="artifacts"
      projectCurrentPhase={project.currentPhase}
      navPhaseScope={navPhase}
      workspaceHref={workspacePhaseHref}
    >
      <TopHeader
        title="Artifact Library"
        userInitials={user.initials}
        userName={user.name}
        userRole={user.role}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)] px-5 py-6 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[720px] space-y-6">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: project.name, href: projectOverviewHref(project.id) },
              { label: "Artifacts" },
            ]}
          />
          <section className="cc-card-standard p-8 text-center">
            <h1 className="text-lg font-semibold text-foreground">No artifacts yet</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This project does not have saved lifecycle artifacts. Complete templates in the workspace to populate the
              library, then return here to browse Markdown output, JSON evidence, versions, and exports.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={workspacePhaseHref}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Open lifecycle workspace
              </Link>
              <Link
                href="/projects"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted/60"
              >
                Back to projects
              </Link>
            </div>
          </section>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
