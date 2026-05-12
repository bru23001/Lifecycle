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
}: {
  recentDecisions: DashboardRecentDecision[];
}) {
  return (
    <article className="h-full rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-7 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Recent Decisions</h2>
        <Link href="/approvals" className="text-base font-semibold text-blue-600 hover:text-blue-700">
          View all decisions
        </Link>
      </header>

      <div className="space-y-7">
        {recentDecisions.map((decision) => (
          <div key={decision.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-5">
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
          </div>
        ))}
      </div>
    </article>
  );
}
