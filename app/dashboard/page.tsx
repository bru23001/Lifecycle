import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function phaseProgress(phase: number): number {
  return Math.max(5, Math.min(100, Math.round((phase / 14) * 100)));
}

export default async function DashboardPage() {
  const [totalProjects, recentProjects] = await Promise.all([
    prisma.project.count(),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        _count: { select: { artifacts: true, gateDecisions: true } },
      },
    }),
  ]);

  const activeProject = recentProjects[0];
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
      navActive="dashboard"
    >
      <TopHeader title="Dashboard" userInitials="AD" notificationCount={3} />
      <main className="flex min-h-0 flex-1 flex-col bg-[#f8fafc] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <Breadcrumbs items={[{ label: "Dashboard" }]} />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">Lifecycle overview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Org-wide entry point — jump into projects, approvals, or configuration.
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/projects"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2563eb]/40 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projects</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{totalProjects}</p>
              <p className="mt-1 text-sm text-slate-600">Browse and open workspaces</p>
            </Link>
            <Link
              href="/projects/new"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2563eb]/40 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">New project</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Start a lifecycle</p>
              <p className="mt-1 text-sm text-slate-600">Create charter &amp; baseline</p>
            </Link>
            <Link
              href="/approvals"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2563eb]/40 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approvals</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Approval center</p>
              <p className="mt-1 text-sm text-slate-600">Queues &amp; history</p>
            </Link>
            <Link
              href="/settings"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2563eb]/40 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Settings</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Workspace prefs</p>
              <p className="mt-1 text-sm text-slate-600">Templates, gates, exports</p>
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-700">
                No projects yet.{" "}
                <Link href="/projects/new" className="font-semibold text-[#2563eb] hover:underline">
                  Create your first project
                </Link>{" "}
                to begin.
              </p>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-800">Recently updated</h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">Phase</th>
                    <th className="px-4 py-3 font-semibold">Artifacts</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{project.name}</div>
                        <div className="text-xs text-slate-500">{project.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{project.currentPhase}/14</td>
                      <td className="px-4 py-3 text-slate-700">{project._count.artifacts}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/projects/${project.id}/workspace`}
                          className="font-medium text-[#2563eb] hover:underline"
                        >
                          Open workspace
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-slate-100 px-4 py-3 text-right">
                <Link href="/projects" className="text-sm font-semibold text-[#2563eb] hover:underline">
                  View all projects
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
