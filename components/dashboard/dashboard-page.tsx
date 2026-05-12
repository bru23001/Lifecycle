import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { DashboardData } from "@/types/dashboard.types";

export function DashboardPage({ data }: { data: DashboardData }) {
  return (
    <AuthenticatedAppShell
      projectId={data.continueWorking.projectId}
      projectName={data.continueWorking.projectName}
      phaseSummary={data.continueWorking.phaseSummary}
      phaseProgressPct={data.continueWorking.progressPercent}
      projectCurrentPhase={data.continueWorking.currentPhase}
      gatesHref={data.continueWorking.gatesHref ?? undefined}
      navActive="dashboard"
    >
      <TopHeader
        title="Dashboard"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        notificationCount={3}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)] text-[11px] text-foreground">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4 min-[901px]:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
        </div>
        <DashboardContent data={data} />
      </main>
    </AuthenticatedAppShell>
  );
}
