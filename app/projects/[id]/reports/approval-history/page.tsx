import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function ApprovalHistoryReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.approvalHistory;

  return (
    <ReportChrome data={data} title="Approval History Report" description="Decision timeline and throughput across approvals for this project.">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Decisions</h2>
        <p className="mt-2 text-3xl font-bold text-slate-900">{r.totalDecisions}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>Approved: {r.approved}</li>
          <li>Changes requested: {r.changesRequested}</li>
          <li>Rejected: {r.rejected}</li>
          <li>Pending: {r.pending}</li>
          {r.averageReviewTimeHours != null ? <li>Avg. review time: {r.averageReviewTimeHours}h</li> : null}
          {r.lastApprovalLabel ? <li>Last: {r.lastApprovalLabel}</li> : null}
        </ul>
        <p className="mt-4 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel}</p>
      </section>
    </ReportChrome>
  );
}
