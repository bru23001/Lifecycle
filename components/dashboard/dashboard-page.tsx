import Link from "next/link";
import { Plus } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { NOTIFICATIONS_HUB_HREF } from "@/lib/notifications-hub";
import type { DashboardData } from "@/types/dashboard.types";

export function DashboardPage({ data }: { data: DashboardData }) {
  const openCurrentPhaseHref =
    data.continueWorking.projectId != null && data.continueWorking.currentPhase != null
      ? `/projects/${data.continueWorking.projectId}/workspace?phase=${data.continueWorking.currentPhase}`
      : undefined;
  const reportsHubHref =
    data.gateSummaryProjectId != null ? `/projects/${data.gateSummaryProjectId}/reports` : null;
  const welcomeName = data.user.name.trim() || "there";

  return (
    <AuthenticatedAppShell
      projectId={data.continueWorking.projectId}
      projectName={data.continueWorking.projectName}
      phaseSummary={data.continueWorking.phaseSummary}
      phaseProgressPct={data.continueWorking.progressPercent}
      projectCurrentPhase={data.continueWorking.currentPhase}
      gatesHref={data.continueWorking.gatesHref ?? undefined}
      continueWorkingHref={data.continueWorking.continueNextHref ?? undefined}
      workspaceHref={openCurrentPhaseHref}
      navActive="dashboard"
      className="dashboard-scale-1536 mx-auto w-[1536px] max-w-none"
    >
      <TopHeader
        title="Dashboard"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        notificationCount={data.openApprovalsCount > 0 ? Math.min(data.openApprovalsCount, 9) : 0}
        notificationHref={NOTIFICATIONS_HUB_HREF}
        settingsHref="/settings/lifecycle"
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)] text-[11px] text-foreground">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 pl-[var(--dashboard-main-padding-from-sidebar)] pr-5 pt-4 min-[901px]:pr-8">
          <div className="flex max-[900px]:flex-col max-[900px]:gap-0 min-[901px]:grid min-[901px]:grid-cols-[minmax(0,1fr)_auto] min-[901px]:gap-x-8 min-[901px]:gap-y-0">
            <div className="min-w-0 max-[900px]:order-1 min-[901px]:col-start-1 min-[901px]:row-start-1 min-[901px]:mb-2">
              <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
            </div>
            <div className="flex max-[900px]:order-2 max-[900px]:mt-3 min-[901px]:mt-0 flex-col gap-2 min-[901px]:col-start-2 min-[901px]:row-start-1 min-[901px]:mb-2 min-[901px]:items-end">
              <p className="m-0 max-w-[min(100vw-2rem,22rem)] text-[24px] font-bold tracking-[-0.02em] text-foreground min-[901px]:text-right">
                Welcome back, {welcomeName}
              </p>
            </div>
            <div className="min-w-0 max-[900px]:order-3 max-[900px]:mt-3 min-[901px]:mt-0 min-[901px]:col-start-1 min-[901px]:row-start-2">
              <DashboardPageHeader reportsHubHref={reportsHubHref} />
            </div>
            <div className="max-[900px]:order-5 max-[900px]:mt-3 min-[901px]:mt-0 min-[901px]:col-start-2 min-[901px]:row-start-2 min-[901px]:flex min-[901px]:items-end min-[901px]:justify-end">
              <Link
                href="/projects/new"
                className="inline-flex h-[39px] shrink-0 items-center gap-2 rounded-[6px] bg-[#2563eb] px-[18px] text-[12px] font-semibold text-white shadow-sm hover:bg-[#1d4ed8]"
                data-testid="dashboard-new-project"
              >
                <Plus className="size-[15px]" aria-hidden />
                New Project
              </Link>
            </div>
            <div className="min-w-0 max-[900px]:order-4 max-[900px]:mt-[var(--dashboard-kpi-margin-from-shortcuts)] min-[901px]:col-span-2 min-[901px]:col-start-1 min-[901px]:row-start-3 min-[901px]:mt-[var(--dashboard-kpi-margin-from-shortcuts)]">
              <MetricsGrid metrics={data.metrics} stacked={false} />
            </div>
          </div>
        </div>
        <DashboardContent data={data} omitDashboardIntro />
      </main>
    </AuthenticatedAppShell>
  );
}
