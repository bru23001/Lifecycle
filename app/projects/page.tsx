import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function phaseProgress(phase: number): number {
  return Math.max(5, Math.min(100, Math.round((phase / 14) * 100)));
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { artifacts: true, gateDecisions: true, traceLinks: true } },
    },
  });

  const activeProject = projects[0];
  const shellProjectId = activeProject?.id ?? "new";
  const shellProjectName = activeProject?.name ?? "No active project";
  const shellProgress = activeProject ? phaseProgress(activeProject.currentPhase) : 0;
  const shellSummary = activeProject
    ? `Phase ${activeProject.currentPhase} of 14`
    : "Create your first lifecycle project";

  return (
    <AuthenticatedAppShell
      projectId={shellProjectId}
      projectName={shellProjectName}
      phaseSummary={shellSummary}
      phaseProgressPct={shellProgress}
      navActive="lifecycle"
    >
      <TopHeader title="Projects" userInitials="AD" notificationCount={3} />
      <main className="flex min-h-0 flex-1 flex-col bg-[#f8fafc] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Projects" }]} />

          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Project Dashboard</h1>
              <p className="text-sm text-slate-600">Unified workspace navigation across all lifecycle screens.</p>
            </div>
            <Link
              href="/projects/new"
              className="inline-flex h-9 items-center rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              New Project
            </Link>
          </section>

          {projects.length === 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-700">
                No projects yet. Create your first project to start the lifecycle workflow.
              </p>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">Phase</th>
                    <th className="px-4 py-3 font-semibold">Artifacts</th>
                    <th className="px-4 py-3 font-semibold">Gate Decisions</th>
                    <th className="px-4 py-3 font-semibold">Trace Links</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{project.name}</div>
                        <div className="text-xs text-slate-500">{project.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{project.currentPhase}/14</td>
                      <td className="px-4 py-3 text-slate-700">{project._count.artifacts}</td>
                      <td className="px-4 py-3 text-slate-700">{project._count.gateDecisions}</td>
                      <td className="px-4 py-3 text-slate-700">{project._count.traceLinks}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/projects/${project.id}`} className="text-[#2563eb] hover:underline">
                            Overview
                          </Link>
                          <Link href={`/projects/${project.id}/workspace`} className="text-[#2563eb] hover:underline">
                            Workspace
                          </Link>
                          <Link href={`/projects/${project.id}/reports`} className="text-[#2563eb] hover:underline">
                            Reports
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
