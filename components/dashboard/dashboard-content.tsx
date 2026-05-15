import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { cn } from "@/lib/utils";
import { DashboardSettingsAlerts } from "@/components/dashboard/dashboard-settings-alerts";
import { GateStatusSummary } from "@/components/dashboard/gate-status-summary";
import { LifecycleProgressOverview } from "@/components/dashboard/lifecycle-progress-overview";
import { MyNextActions } from "@/components/dashboard/my-next-actions";
import { ProjectsSnapshot } from "@/components/dashboard/projects-snapshot";
import { RecentDecisions } from "@/components/dashboard/recent-decisions";
import { ReportsHubWidget } from "@/components/dashboard/reports-hub-widget";
import { TipBar } from "@/components/dashboard/tip-bar";
import { NextRequiredActionBar } from "@/components/lifecycle-workspace/next-required-action-bar";
import type { DashboardData } from "@/types/dashboard.types";

export function DashboardContent({
  data,
  omitDashboardIntro = false,
}: {
  data: DashboardData;
  /** When true, intro (lede + shortcut links) is rendered by the dashboard route. */
  omitDashboardIntro?: boolean;
}) {
  const hasProjects = data.projectSnapshots.length > 0;
  const reportsHubHref =
    data.gateSummaryProjectId != null ? `/projects/${data.gateSummaryProjectId}/reports` : null;
  const leadProjectName =
    data.projectSnapshots.find((p) => p.projectId === data.gateSummaryProjectId)?.name ?? undefined;

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1920px] flex-1 pl-[var(--dashboard-main-padding-from-sidebar)] pr-5 pb-6 min-[901px]:pr-8",
        omitDashboardIntro ? "pt-5" : "pt-2",
      )}
    >
      <div className="flex flex-col gap-5">
        {!omitDashboardIntro ? (
          <section className="command-grid card-grid-12">
            <DashboardPageHeader reportsHubHref={reportsHubHref} />
          </section>
        ) : null}

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
                  href="/projects/new"
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
          <div className="col-span-12 grid h-full gap-[var(--grid-gap)]">
            <div className="grid grid-cols-2 gap-[var(--grid-gap)] max-[900px]:grid-cols-1">
              <div className="h-[var(--dashboard-top-row-card-height)] max-[900px]:h-full">
                <LifecycleProgressOverview lifecycleProgress={data.lifecycleProgress} />
              </div>
              <div className="h-[var(--dashboard-top-row-card-height)] max-[900px]:h-full">
                <GateStatusSummary
                  gateStatuses={data.gateStatuses}
                  projectId={data.gateSummaryProjectId}
                  defaultReviewHref={data.gateSummaryDefaultReviewHref}
                  allGatesHref={data.gateSummaryAllGatesHref}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[var(--grid-gap)] max-[900px]:grid-cols-1">
              <div className="h-[var(--dashboard-mid-row-card-height)] max-[900px]:h-full">
                <MyNextActions nextActions={data.nextActions} />
              </div>
              <div className="h-[var(--dashboard-mid-row-card-height)] max-[900px]:h-full">
                <RecentDecisions
                  recentDecisions={data.recentDecisions}
                  projectApprovalHistoryHref={data.recentDecisionsProjectApprovalHistoryHref}
                  leadProjectAuditTrailHref={data.leadProjectAuditTrailHref}
                />
              </div>
              <div className="h-[var(--dashboard-mid-row-card-height)] max-[900px]:h-full">
                <ProjectsSnapshot projectSnapshots={data.projectSnapshots} />
              </div>
            </div>
          </div>
        </section>

        <section className="command-grid card-grid-12">
          {hasProjects && data.gateSummaryProjectId ? (
            <div className="col-span-6 max-[900px]:col-span-12">
              <ReportsHubWidget projectId={data.gateSummaryProjectId} projectName={leadProjectName} />
            </div>
          ) : null}
          <div className={hasProjects && data.gateSummaryProjectId ? "col-span-6 max-[900px]:col-span-12" : "col-span-12"}>
            <TipBar tip={data.tip} />
          </div>
        </section>

        {data.settingsAlerts.length > 0 ? (
          <section className="command-grid card-grid-12">
            <DashboardSettingsAlerts alerts={data.settingsAlerts} />
          </section>
        ) : null}

        {hasProjects && data.continueWorking.continueNextHref ? (
          <NextRequiredActionBar
            label="Continue next required action"
            description={`${data.continueWorking.projectName} — ${data.continueWorking.phaseSummary}.`}
            ctaLabel="Continue"
            href={data.continueWorking.continueNextHref}
            secondaryHref={
              data.continueWorking.projectId != null && data.continueWorking.currentPhase != null
                ? `/projects/${data.continueWorking.projectId}/workspace?phase=${data.continueWorking.currentPhase}`
                : undefined
            }
            secondaryLabel="Open current phase"
          />
        ) : null}
      </div>
    </div>
  );
}
