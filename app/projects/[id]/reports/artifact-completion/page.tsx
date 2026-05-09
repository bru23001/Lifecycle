import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function ArtifactCompletionReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.artifactCompletion;

  return (
    <ReportChrome
      data={data}
      title="Artifact Completion Report"
      description="Completion of required artifacts and templates vs drafts, reviews, and blocked work."
      phaseProgressPct={r.completionPercent}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Artifact pipeline</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Completion</dt>
            <dd className="text-2xl font-bold text-slate-900">{r.completionPercent}%</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Required total</dt>
            <dd className="font-semibold text-slate-900">{r.totalRequired}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Completed</dt>
            <dd className="font-semibold text-slate-900">{r.completed}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">In review</dt>
            <dd className="font-semibold text-slate-900">{r.inReview}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Draft</dt>
            <dd className="font-semibold text-slate-900">{r.draft}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Blocked</dt>
            <dd className="font-semibold text-slate-900">{r.blocked}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel}</p>
      </section>
    </ReportChrome>
  );
}
