import Link from "next/link";

import type { GateOverviewData } from "@/types/gate-review.types";

export function PhaseProgressCard({ data }: { data: GateOverviewData }) {
  const pct = Math.min(100, Math.max(0, data.phaseProgressPercent));
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Phase Progress</h3>
      </header>
      <div className="px-5 py-5">
        <p className="text-sm font-medium text-[#111827] dark:text-foreground">{data.currentPhaseLabel}</p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[#64748b] dark:text-muted-foreground">
            <span>Completion</span>
            <span className="font-semibold text-[#111827] dark:text-foreground">{pct}%</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={`Phase progress ${pct} percent`}
          >
            <div
              className="h-full rounded-full bg-[#16a34a] transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <Link
          href={data.phaseWorkspaceHref}
          className="mt-4 inline-flex text-sm font-medium text-[#2563eb] hover:underline"
        >
          View phase workspace
        </Link>
      </div>
    </section>
  );
}
