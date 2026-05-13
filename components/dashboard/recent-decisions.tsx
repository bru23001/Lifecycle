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
    <article className="h-full rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Recent Decisions</h2>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <Link href="/approvals" className="text-base font-semibold text-blue-600 hover:text-blue-700">
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

      <div className="space-y-7">
        {recentDecisions.map((decision) => (
          <Link
            key={decision.id}
            href={decision.targetHref}
            className="grid grid-cols-[44px_1fr_auto] items-center gap-5 rounded-lg px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              <FileText className="h-5 w-5 stroke-[2.3]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">
                {decision.gate} {decision.label}
              </p>
              <p className="mt-1 truncate text-base text-slate-500 dark:text-slate-300">
                {decision.projectName}
              </p>
            </div>
            <span
              className={`rounded-full px-5 py-2 text-sm font-semibold ${decisionTone(decision.label)}`}
            >
              {decision.label}
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}
