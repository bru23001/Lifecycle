import Link from "next/link";

import { projectAuditTrailListHref } from "@/lib/projects-url";
import { WORKSPACE_PHASE_MAX } from "@/lib/workspacePhases";
import type { DashboardProjectSnapshot } from "@/types/dashboard.types";

function ProjectStatusBadge({ status }: { status: DashboardProjectSnapshot["status"] }) {
  const statusClasses = {
    "In Progress": "bg-blue-50 text-blue-700",
    Blocked: "bg-red-50 text-red-600",
    Pending: "bg-amber-50 text-amber-700",
  };

  return (
    <span className={["inline-flex rounded-full px-5 py-2 text-sm font-semibold", statusClasses[status]].join(" ")}>
      {status}
    </span>
  );
}

export function ProjectsSnapshot({
  projectSnapshots,
}: {
  projectSnapshots: DashboardProjectSnapshot[];
}) {
  return (
    <article className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-9 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Projects Snapshot</h2>
        <Link href="/projects" className="text-base font-semibold text-blue-600 hover:text-blue-700">
          View all projects
        </Link>
      </header>

      <div className="overflow-x-auto pb-1">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="text-base font-semibold text-slate-500 dark:text-slate-300">
              <th className="pb-5">Project</th>
              <th className="pb-5">Phase</th>
              <th className="pb-5">Gate</th>
              <th className="pb-5">Audit</th>
              <th className="pb-5">Status</th>
            </tr>
          </thead>

          <tbody>
            {projectSnapshots.map((project) => (
              <tr key={project.projectId ?? project.name} className="border-t border-slate-100 text-base">
                <td className="py-6 font-semibold text-slate-950 dark:text-slate-100">
                  {project.projectId ? (
                    <Link href={`/projects/${project.projectId}`}>{project.name}</Link>
                  ) : (
                    project.name
                  )}
                </td>
                <td className="py-6 text-slate-700 dark:text-slate-300">
                  {project.projectId ? (
                    <Link
                      href={`/projects/${project.projectId}/workspace?phase=${project.phase}`}
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {project.phase}/{WORKSPACE_PHASE_MAX}
                    </Link>
                  ) : (
                    `${project.phase}/${WORKSPACE_PHASE_MAX}`
                  )}
                </td>
                <td className="py-6 text-slate-700 dark:text-slate-300">{project.gate}</td>
                <td className="py-6 text-slate-700 dark:text-slate-300">
                  {project.projectId ? (
                    <Link
                      href={projectAuditTrailListHref(project.projectId)}
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      aria-label={`Open audit trail for ${project.name}`}
                    >
                      {project.auditEventCount} events
                    </Link>
                  ) : (
                    `${project.auditEventCount} events`
                  )}
                </td>
                <td className="py-6">
                  <ProjectStatusBadge status={project.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
