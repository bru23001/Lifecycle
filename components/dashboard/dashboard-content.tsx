import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { GateStatusSummary } from "@/components/dashboard/gate-status-summary";
import { LifecycleProgressOverview } from "@/components/dashboard/lifecycle-progress-overview";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { MyNextActions } from "@/components/dashboard/my-next-actions";
import { ProjectsSnapshot } from "@/components/dashboard/projects-snapshot";
import { RecentDecisions } from "@/components/dashboard/recent-decisions";
import { TipBar } from "@/components/dashboard/tip-bar";
import type { DashboardData } from "@/types/dashboard.types";

export function DashboardContent({ data }: { data: DashboardData }) {
  const hasProjects = data.projectSnapshots.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1920px] flex-1 px-5 pb-6 pt-2 min-[901px]:px-8">
      <div className="flex flex-col gap-5">
        <section className="command-grid card-grid-12">
          <DashboardPageHeader userName={data.user.name} />
        </section>

        {!hasProjects ? (
          <section className="command-grid card-grid-12">
            <div className="col-span-12">
              <div className="cc-card-standard flex flex-col items-center gap-4 p-10 text-center sm:flex-row sm:text-left">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FolderKanban className="size-7 stroke-[2]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                    Your workspace is empty
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Add a project to see lifecycle progress, gate status, recent decisions, and tailored next actions on
                    this dashboard.
                  </p>
                </div>
                <Link
                  href="/projects?new=1"
                  className="inline-flex h-10 shrink-0 items-center gap-2 self-center rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white sm:self-auto"
                >
                  <Plus className="size-4" />
                  Create project
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="command-grid items-stretch">
          <div className="col-span-2 h-full max-[1200px]:col-span-12">
            <MetricsGrid metrics={data.metrics} stacked />
          </div>

          <div className="col-span-10 grid h-full gap-[var(--grid-gap)] max-[1200px]:col-span-12">
            <div className="grid grid-cols-2 gap-[var(--grid-gap)] max-[900px]:grid-cols-1">
              <div className="h-full">
                <LifecycleProgressOverview lifecycleProgress={data.lifecycleProgress} />
              </div>
              <div className="h-full">
                <GateStatusSummary gateStatuses={data.gateStatuses} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[var(--grid-gap)] max-[900px]:grid-cols-1">
              <div className="h-full">
                <MyNextActions nextActions={data.nextActions} />
              </div>
              <div className="h-full">
                <RecentDecisions recentDecisions={data.recentDecisions} />
              </div>
              <div className="h-full">
                <ProjectsSnapshot projectSnapshots={data.projectSnapshots} />
              </div>
            </div>
          </div>
        </section>

        <section className="command-grid card-grid-12">
          <TipBar tip={data.tip} />
        </section>
      </div>
    </div>
  );
}
