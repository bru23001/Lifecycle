import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function GateDecisionsReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.gateDecision;

  return (
    <ReportChrome
      data={data}
      title="Gate Decision Report"
      description="Consolidated gate decisions, rates, and outstanding items for audit and release governance."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Gate summary</h2>
        <p className="mt-1 text-3xl font-bold text-slate-900">{r.totalGates}</p>
        <p className="text-sm text-slate-500">Gates in lifecycle model</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>Approved: {r.approved}</li>
          <li>Pending: {r.pending}</li>
          <li>Rejected: {r.rejected}</li>
          <li>Not reached: {r.notReached}</li>
          <li>Approval rate: {r.approvalRatePercent}%</li>
          {r.averageDecisionDays != null ? <li>Avg. decision time: {r.averageDecisionDays} days</li> : null}
          {r.lastDecisionLabel ? <li>Last: {r.lastDecisionLabel}</li> : null}
        </ul>
        <p className="mt-4 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel}</p>
      </section>
    </ReportChrome>
  );
}
