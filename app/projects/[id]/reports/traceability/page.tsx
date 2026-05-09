import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function TraceabilityReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.traceability;

  return (
    <ReportChrome
      data={data}
      title="Traceability Coverage Report"
      description="Link completeness across requirements, design, tests, gates, and evidence."
      phaseProgressPct={r.coveragePercent}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Coverage</h2>
        <p className="mt-2 text-4xl font-bold text-slate-900">{r.coveragePercent}%</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>Complete links: {r.completeLinks}</li>
          <li>Partial links: {r.partialLinks}</li>
          <li>Missing links: {r.missingLinks}</li>
          <li>Orphaned items: {r.orphanedItems}</li>
          <li>Critical gaps: {r.criticalGaps}</li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel}</p>
      </section>
    </ReportChrome>
  );
}
