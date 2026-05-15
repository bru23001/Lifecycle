import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type { ReportsPageData } from "@/types/reports.types";

export function ReportChrome({
  data,
  title,
  description,
  navActive = "reports",
  phaseProgressPct,
  children,
}: {
  data: ReportsPageData;
  title: string;
  description: string;
  /** Reports hub and detail pages always live under the Reports nav section. */
  navActive?: "reports";
  phaseProgressPct?: number;
  children: React.ReactNode;
}) {
  const pct = phaseProgressPct ?? data.reports.lifecycleStatus.overallProgressPercent;
  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Report • ${title}`}
      phaseProgressPct={pct}
      navActive={navActive}
    >
      <TopHeader
        title={title}
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--app-bg)] px-5 pb-10 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1100px]">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              {
                label: `${data.project.name} (${data.project.code})`,
                href: `/projects/${data.project.id}/workspace`,
              },
              { label: "Reports", href: `/projects/${data.project.id}/reports` },
              { label: title },
            ]}
          />
          <header className="mt-6 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">{description}</p>
          </header>
          <div className="mt-8 space-y-6">{children}</div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
