import Link from "next/link";
import { ArrowRight, FileBarChart2 } from "lucide-react";

/**
 * Dashboard entry to the project-scoped reports hub (`/projects/{id}/reports`).
 * Spec: reports shortcut / dashboard report widget → lifecycle, gate, traceability,
 * missing evidence, approval history, and evidence package reports.
 */
export function ReportsHubWidget({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName?: string;
}) {
  const href = `/projects/${projectId}/reports`;
  const context = projectName?.trim() ? ` for ${projectName.trim()}` : "";

  return (
    <article
      data-testid="dashboard-reports-hub"
      className="cc-card-standard flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <FileBarChart2 className="size-6 stroke-[2]" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">Reports</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Open the report hub{context} to generate lifecycle status, gate decisions, traceability coverage, missing
            evidence, approval history, and the full evidence package.
          </p>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-stretch rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8] sm:self-auto"
      >
        Open report hub
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
