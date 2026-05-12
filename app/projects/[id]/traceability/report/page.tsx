import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { loadTraceabilityMatrix } from "@/lib/server/traceability";

export default async function TraceabilityReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadTraceabilityMatrix(id);

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Traceability report insights"
      phaseProgressPct={data.coverageSummary.overallCoveragePercent}
      navActive="traceability"
    >
      <TopHeader title="Traceability Report" userInitials={data.user.initials} notificationCount={6} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-10 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${data.project.name} (${data.project.code})`, href: `/projects/${data.project.id}` },
              { label: "Traceability Matrix", href: `/projects/${data.project.id}/traceability` },
              { label: "Report" },
            ]}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Traceability Report</h1>
            <p className="mt-2 text-sm text-slate-600">
              End-to-end traceability health across lifecycle phases, requirements, tests, gates, and evidence. Figures
              are derived from the live project graph (not a static demo).
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm min-[901px]:grid-cols-4">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Overall Coverage</p>
                <p className="text-xl font-semibold text-slate-900">{data.coverageSummary.overallCoveragePercent}%</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Complete</p>
                <p className="text-xl font-semibold text-slate-900">{data.coverageSummary.complete.count}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Partial</p>
                <p className="text-xl font-semibold text-slate-900">{data.coverageSummary.partial.count}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Missing + Orphaned</p>
                <p className="text-xl font-semibold text-slate-900">
                  {data.coverageSummary.missing.count + data.coverageSummary.orphaned.count}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Last updated (matrix): {data.filters.lastUpdatedLabel}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Top gaps</h2>
            {data.traceabilityGaps.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No gaps detected with the current rules. Add requirements or
                evidence to grow the graph.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {data.traceabilityGaps.slice(0, 8).map((gap) => (
                  <li key={gap.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <Link href={gap.href} className="font-medium text-[#2563eb] hover:underline">
                      {gap.objectId}
                    </Link>{" "}
                    · {gap.objectName} · {gap.issue}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
