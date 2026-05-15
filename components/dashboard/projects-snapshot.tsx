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
    <span className={["inline-flex rounded-full px-3 py-1 text-xs font-semibold", statusClasses[status]].join(" ")}>
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
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Projects Snapshot</h2>
        <Link href="/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View all projects
        </Link>
      </header>

      <div className="lifecycle-scroll-on-demand min-h-0 flex-1 overflow-auto pb-1">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="text-sm font-semibold text-slate-500 dark:text-slate-300">
              <th className="pb-3">Project</th>
              <th className="pb-3">Phase</th>
              <th className="pb-3">Gate</th>
              <th className="pb-3">Audit</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {projectSnapshots.map((project, index) => (
              <tr
                key={project.projectId ?? project.name}
                className={["text-sm", index !== 0 ? "border-t border-slate-100" : ""].join(" ")}
              >
                <td className="py-3 font-semibold text-slate-950 dark:text-slate-100">
                  {project.projectId ? (
                    <Link href={`/projects/${project.projectId}`} className="line-clamp-1">
                      {project.name}
                    </Link>
                  ) : (
                    project.name
                  )}
                </td>
                <td className="py-3 text-slate-700 dark:text-slate-300">
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
                <td className="py-3 text-slate-700 dark:text-slate-300">{project.gate}</td>
                <td className="py-3 text-slate-700 dark:text-slate-300">
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
                <td className="py-3">
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
