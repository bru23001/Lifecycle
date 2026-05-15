import Link from "next/link";
import { ArrowRight, ChevronDown, FileBarChart2 } from "lucide-react";

import { DetailsExpandedAfterMount } from "@/components/dashboard/details-expanded-after-mount";

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
    <DetailsExpandedAfterMount
      data-testid="dashboard-reports-hub"
      className="cc-card-standard overflow-hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700">
            <FileBarChart2 className="size-4 stroke-[2]" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold tracking-tight text-slate-950 dark:text-slate-100">Reports</span>
            <span className="block text-xs text-slate-500 dark:text-slate-300">Expand to open report hub actions</span>
          </span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-slate-500" aria-hidden />
      </summary>
      <div className="flex flex-col gap-2 px-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs leading-snug text-slate-600 dark:text-slate-300">
            Open the report hub{context} to generate lifecycle status, gate decisions, traceability coverage, missing
            evidence, approval history, and the full evidence package.
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-stretch rounded-md bg-[#2563eb] px-3 text-xs font-semibold text-white hover:bg-[#1d4ed8] sm:self-auto"
        >
          Open report hub
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </DetailsExpandedAfterMount>
  );
}
