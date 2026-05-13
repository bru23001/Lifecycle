import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { ProjectAuditTrailTab, ProjectLifecycleTimelineTab } from "@/components/projects/project-audit-tabs";
import type { ProjectOverviewScreenData } from "@/lib/server/project-overview-screen";
import { cn } from "@/lib/utils";

function statusBadgeClass(
  status: ProjectOverviewScreenData["selectedProject"]["header"]["status"],
): string {
  if (status === "Blocked") return "bg-rose-50 text-rose-700";
  if (status === "Pending") return "bg-amber-50 text-amber-700";
  if (status === "Not Started") return "bg-slate-100 text-slate-600";
  return "bg-emerald-50 text-emerald-700";
}

export function ProjectOverviewScreen({ data }: { data: ProjectOverviewScreenData }) {
  const p = data.selectedProject;
  const workspaceHref = `/projects/${p.header.id}/workspace`;

  return (
    <AuthenticatedAppShell
      projectId={p.header.id}
      projectName={p.header.name}
      phaseSummary={`Phase ${p.header.currentPhase} of ${p.header.totalPhases}`}
      phaseProgressPct={data.progressPercent}
      projectCurrentPhase={p.header.currentPhase}
      gatesHref={p.gatesNavHref ?? undefined}
      navActive="lifecycle"
    >
      <TopHeader
        title={p.header.name}
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)] text-[11px] text-foreground">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: p.header.name },
            ]}
          />
          <p className="mt-2 text-sm font-medium text-muted-foreground">Project overview</p>
        </div>

        <div className="mx-auto w-full max-w-[1920px] flex-1 space-y-6 px-5 py-6 min-[901px]:px-8">
          <section className="cc-card-standard flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">{p.header.code}</h2>
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold",
                    statusBadgeClass(p.header.status),
                  )}
                >
                  {p.header.status}
                </span>
              </div>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                Profile, lifecycle signals, artifacts, gates, traceability, and audit trail for this project. Use the
                workspace for day-to-day execution.
              </p>
              <p className="text-xs text-muted-foreground">Updated {p.header.updatedLabel}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Link
                href={workspaceHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Open lifecycle workspace
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={`/projects?selected=${p.header.id}&tab=profile`}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted/60"
              >
                <LayoutDashboard className="size-4" aria-hidden />
                Project list & settings
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.metrics.map((m) => {
              const inner = (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{m.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                </>
              );
              if (m.id === "artifacts" || m.id === "evidence" || m.id === "trace") {
                return (
                  <Link
                    key={m.id}
                    href={m.id === "trace" ? `/projects/${p.header.id}/traceability` : `/projects/${p.header.id}/${m.id}`}
                    className="cc-card-standard block p-4 transition hover:border-[#2563eb]/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {inner}
                  </Link>
                );
              }
              return (
                <div key={m.id} className="cc-card-standard p-4">
                  {inner}
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="min-h-[280px]">
              <ProjectLifecycleTimelineTab selectedProject={p} />
            </div>
            <div className="min-h-[280px]">
              <ProjectAuditTrailTab selectedProject={p} />
            </div>
          </section>

          <section className="cc-card-standard p-6">
            <h3 className="text-sm font-semibold text-foreground">Quick links</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {p.quickActions.map((action) => (
                <li key={action.id}>
                  <Link href={action.href} className="text-sm font-medium text-[#2563eb] hover:underline">
                    {action.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
