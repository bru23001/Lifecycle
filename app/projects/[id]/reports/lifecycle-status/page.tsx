import { ReportChrome } from "@/components/reports/report-chrome";
import { ReportDetailExportActions } from "@/components/reports/report-detail-export-actions";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function LifecycleStatusReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.lifecycleStatus;

  return (
    <ReportChrome
      data={data}
      title="Lifecycle Status Report"
      description="Overall lifecycle progress, current phase, upcoming gate, and blocker counts for governance review."
      phaseProgressPct={r.overallProgressPercent}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Overall progress</dt>
            <dd className="font-semibold text-slate-900">{r.overallProgressPercent}%</dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Current phase</dt>
            <dd className="font-semibold text-slate-900">
              {r.currentPhaseNumber ?? "—"} · {r.currentPhaseName ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Phases completed</dt>
            <dd className="font-semibold text-slate-900">
              {r.phasesCompleted} / {r.totalPhases}
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">In progress / not started</dt>
            <dd className="font-semibold text-slate-900">
              {r.phasesInProgress} / {r.phasesNotStarted}
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Upcoming gate</dt>
            <dd className="font-semibold text-slate-900">{r.upcomingGateCode ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Blockers</dt>
            <dd className="font-semibold text-slate-900">{r.blockersCount}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel}</p>
      </section>

      <ReportDetailExportActions exportHref={r.exportHref} exportLabel="Download lifecycle export" />
    </ReportChrome>
  );
}
