import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function EvidenceCompletenessReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.evidenceCompleteness;

  return (
    <ReportChrome
      data={data}
      title="Evidence Completeness Report"
      description="Evidence coverage, severity-weighted gaps, and gates blocked by incomplete evidence."
      phaseProgressPct={r.overallPercent}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Evidence rollup</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Overall coverage</dt>
            <dd className="text-2xl font-bold text-slate-900">{r.overallPercent}%</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Blocking gates</dt>
            <dd className="font-semibold text-slate-900">{r.blockingGates}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Complete / partial</dt>
            <dd className="font-semibold text-slate-900">
              {r.completeItems} / {r.partialItems}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Missing items</dt>
            <dd className="font-semibold text-slate-900">{r.missingItems}</dd>
          </div>
        </dl>
        <h3 className="mt-6 text-sm font-semibold text-slate-800">By severity</h3>
        <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <li className="rounded-lg border border-slate-100 px-3 py-2">Critical: {r.critical}</li>
          <li className="rounded-lg border border-slate-100 px-3 py-2">High: {r.high}</li>
          <li className="rounded-lg border border-slate-100 px-3 py-2">Medium: {r.medium}</li>
          <li className="rounded-lg border border-slate-100 px-3 py-2">Low: {r.low}</li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel}</p>
      </section>
    </ReportChrome>
  );
}
