import { ReportChrome } from "@/components/reports/report-chrome";
import { ReportDetailExportActions } from "@/components/reports/report-detail-export-actions";
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
          <li>
            Markdown artifacts: {r.includesArtifacts ? "Yes" : "No"} ({r.sectionCounts.artifacts})
          </li>
          <li>
            JSON evidence: {r.includesEvidenceFiles ? "Yes" : "No"} ({r.sectionCounts.evidenceFiles})
          </li>
          <li>
            Gate decisions: {r.includesGateDecisions ? "Yes" : "No"} ({r.sectionCounts.gateDecisions})
          </li>
          <li>
            Traceability: {r.includesTraceabilityLinks ? "Yes" : "No"} ({r.sectionCounts.traceabilityLinks})
          </li>
          <li>
            Approval records: {r.includesApprovalRecords ? "Yes" : "No"} ({r.sectionCounts.approvalRecords})
          </li>
          <li>
            Audit manifest: {r.includesAuditManifest ? "Yes" : "No"} ({r.sectionCounts.auditEntries} events)
          </li>
        </ul>
        <p className="mt-6 text-xs text-slate-500">Last generated: {r.lastGeneratedLabel ?? "—"}</p>
      </section>

      <ReportDetailExportActions
        exportHref={r.exportHref}
        exportLabel="Download package export"
        configureHref={r.configureHref}
        configureLabel="Configure package"
      />
    </ReportChrome>
  );
}
