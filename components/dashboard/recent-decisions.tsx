import Link from "next/link";
import { FileText } from "lucide-react";

import type { DashboardRecentDecision } from "@/types/dashboard.types";

function decisionTone(label: DashboardRecentDecision["label"]): string {
  switch (label) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700";
    case "Changes Requested":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-blue-50 text-blue-700";
  }
}

export function RecentDecisions({
  recentDecisions,
  projectApprovalHistoryHref,
  leadProjectAuditTrailHref,
}: {
  recentDecisions: DashboardRecentDecision[];
  /** Spec alternative: `/projects/{projectId}/reports/approval-history` for the lead project. */
  projectApprovalHistoryHref: string | null;
  /** Lead project audit trail on the projects shell (immutable event list). */
  leadProjectAuditTrailHref: string | null;
}) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Recent Decisions</h2>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <Link href="/approvals" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            View all decisions
          </Link>
          {leadProjectAuditTrailHref ? (
            <Link
              href={leadProjectAuditTrailHref}
              className="text-sm font-semibold text-slate-600 underline-offset-2 hover:text-blue-700 hover:underline dark:text-slate-300"
              aria-label="Open audit trail for the lead project on the dashboard"
            >
              View audit trail
            </Link>
          ) : null}
          {projectApprovalHistoryHref ? (
            <Link
              href={projectApprovalHistoryHref}
              className="text-sm font-semibold text-slate-600 underline-offset-2 hover:text-blue-700 hover:underline dark:text-slate-300"
              aria-label="Open approval history report for the lead project on the dashboard"
            >
              Project approval history
            </Link>
          ) : null}
        </div>
      </header>

      <div className="lifecycle-scroll-on-demand min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {recentDecisions.map((decision) => (
          <Link
            key={decision.id}
            href={decision.targetHref}
            className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-lg px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              <FileText className="h-4 w-4 stroke-[2.3]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                {decision.gate} {decision.label}
              </p>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-300">
                {decision.projectName}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${decisionTone(decision.label)}`}
            >
              {decision.label}
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}
