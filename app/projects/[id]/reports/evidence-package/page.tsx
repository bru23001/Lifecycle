import Link from "next/link";

import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function EvidencePackageReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);
  const r = data.reports.fullProjectEvidencePackage;

  return (
    <ReportChrome
      data={data}
      title="Full Project Evidence Package"
      description="Packaged exports for auditors: artifacts, evidence, gate decisions, traceability, approvals, and manifest."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Package estimate</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Size (est.)</dt>
            <dd className="font-semibold text-slate-900">{r.estimatedSizeLabel}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Files (est.)</dt>
            <dd className="font-semibold text-slate-900">{r.estimatedFileCount}</dd>
          </div>
        </dl>
        <h3 className="mt-6 text-sm font-semibold text-slate-800">Includes</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li>Markdown artifacts: {r.includesArtifacts ? "Yes" : "No"}</li>
          <li>JSON evidence: {r.includesEvidenceFiles ? "Yes" : "No"}</li>
          <li>Gate decisions: {r.includesGateDecisions ? "Yes" : "No"}</li>
          <li>Traceability: {r.includesTraceabilityLinks ? "Yes" : "No"}</li>
          <li>Approval records: {r.includesApprovalRecords ? "Yes" : "No"}</li>
          <li>Audit manifest: {r.includesAuditManifest ? "Yes" : "No"}</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={r.configureHref}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Configure package
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel ?? "—"}</p>
      </section>
    </ReportChrome>
  );
}
