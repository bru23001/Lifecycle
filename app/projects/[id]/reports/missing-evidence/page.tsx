import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function MissingEvidenceReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.missingEvidence;

  return (
    <ReportChrome
      data={data}
      title="Missing Evidence Report"
      description="Missing, orphaned, and incomplete evidence items, ranked by severity, that may block lifecycle phases or gates."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Evidence gaps</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Missing items</dt>
            <dd className="text-2xl font-bold text-slate-900">{r.missingItems}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Orphaned items</dt>
            <dd className="text-2xl font-bold text-slate-900">{r.orphanedItems}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Incomplete items</dt>
            <dd className="text-2xl font-bold text-slate-900">{r.incompleteItems}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Blocking gates</dt>
            <dd className="font-semibold text-slate-900">{r.blockingGates}</dd>
          </div>
        </dl>

        <h3 className="mt-6 text-sm font-semibold text-slate-800">By severity</h3>
        <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-4">
          <li className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-rose-900">
            Critical: <span className="font-semibold">{r.critical}</span>
          </li>
          <li className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-amber-900">
            High: <span className="font-semibold">{r.high}</span>
          </li>
          <li className="rounded-lg border border-yellow-100 bg-yellow-50 px-3 py-2 text-yellow-900">
            Medium: <span className="font-semibold">{r.medium}</span>
          </li>
          <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
            Low: <span className="font-semibold">{r.low}</span>
          </li>
        </ul>

        <p className="mt-6 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel}</p>
      </section>
    </ReportChrome>
  );
}
