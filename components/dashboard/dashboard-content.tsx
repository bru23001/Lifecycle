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
  return (
    <div className="mx-auto w-full max-w-[1920px] flex-1 px-5 pb-6 pt-2 min-[901px]:px-8">
      <div className="flex flex-col gap-5">
        <section className="command-grid card-grid-12">
          <DashboardPageHeader />
        </section>

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
