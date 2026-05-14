"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Download, Trash2 } from "lucide-react";

import { deleteTraceabilityReportSchedule } from "@/app/actions/traceabilityReportSchedule";
import { Button } from "@/components/ui/button";
import { coverageStatusBadgeMap, gateTraceStatusBadgeMap, impactBadgeMap } from "@/lib/coverage-status";
import {
  buildCoverageMetricDetail,
  buildRemediationRecommendations,
  type CoverageReportMetricId,
} from "@/lib/traceability-coverage-metrics";
import { slicesFromFull, type TraceabilityExportViewModel } from "@/lib/traceability-export";
import { cn } from "@/lib/utils";
import type { TraceabilityMatrixData } from "@/types/traceability.types";

import { CoverageMetricDetailDrawer } from "./coverage-metric-detail-drawer";
import { ExportTraceabilityMatrixModal } from "./export-traceability-matrix-modal";
import { ScheduleTraceabilityReportModal } from "./schedule-traceability-report-modal";
import { CoverageRing, CoverageProgressBar, StatusBadge, tableRowClass } from "./traceability-shared";

const METRIC_CARDS: { id: CoverageReportMetricId; label: string; hint: string }[] = [
  { id: "overall", label: "Overall", hint: "Headline blended coverage" },
  { id: "phase_artifacts", label: "Phase artifacts", hint: "Lifecycle phase linkage" },
  { id: "requirement_design", label: "Req → design", hint: "Feature / design coverage" },
  { id: "requirement_test", label: "Req → test", hint: "Test linkage by family" },
  { id: "gate_evidence", label: "Gate evidence", hint: "Gate readiness" },
  { id: "gaps", label: "Gaps & orphans", hint: "Graph exceptions" },
];

export type TraceabilityReportScheduleDTO = {
  id: string;
  reportName: string;
  frequency: string;
  recipients: string[];
  format: string;
  includeGapsOnly: boolean;
  includeFullMatrix: boolean;
  createdAt: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function TraceabilityCoverageReportView({
  data,
  initialMetricId,
  projectId,
  initialSchedules,
}: {
  data: TraceabilityMatrixData;
  initialMetricId: CoverageReportMetricId | null;
  projectId: string;
  initialSchedules: TraceabilityReportScheduleDTO[];
}) {
  const router = useRouter();
  const [metricOpen, setMetricOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<CoverageReportMetricId | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const exportViewModel = useMemo<TraceabilityExportViewModel>(() => {
    const full = slicesFromFull(data);
    return {
      full: data,
      filtered: full,
      filterSnapshot: data.filters,
    };
  }, [data]);
  const openMetric = useCallback((id: CoverageReportMetricId) => {
    setActiveMetric(id);
    setMetricOpen(true);
  }, []);

  useEffect(() => {
    if (initialMetricId) {
      setActiveMetric(initialMetricId);
      setMetricOpen(true);
    }
  }, [initialMetricId]);

  const detail = activeMetric ? buildCoverageMetricDetail(data, activeMetric) : null;
  const cs = data.coverageSummary;
  const remediation = buildRemediationRecommendations(data);
  const criticalGaps = data.traceabilityGaps.filter((g) => g.impact === "high" || g.impact === "critical");

  async function handleDeleteSchedule(scheduleId: string) {
    setDeletingId(scheduleId);
    try {
      const res = await deleteTraceabilityReportSchedule({ projectId, scheduleId });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div id="coverage-report-top" className="space-y-6 scroll-mt-24">
      <Section
        title="Executive summary"
        description="Headline posture for gate readiness conversations; drill into metrics below for evidence."
      >
        <p className="text-sm text-slate-700">
          Overall blended coverage is{" "}
          <span className="font-semibold text-slate-900">{cs.overallCoveragePercent}%</span> across lifecycle buckets.
          {data.traceabilityGaps.length > 0 ? (
            <>
              {" "}
              The matrix currently lists{" "}
              <span className="font-semibold text-slate-900">{data.traceabilityGaps.length}</span> gap / orphan records
              requiring triage, design linkage, or evidence follow-up.
            </>
          ) : (
            <> No automated gap rows were detected against the active traceability rules.</>
          )}{" "}
          Export or schedule a digest from this screen to share with stakeholders outside the workspace.
        </p>
      </Section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-start min-[720px]:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Traceability coverage report</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Consolidated view of phase artifacts, requirement design and test coverage, gate evidence, gap/orphan
              counts, and rule-based remediation guidance. Figures mirror the live traceability matrix.
            </p>
            <p className="mt-3 text-xs text-slate-500">Last updated: {data.filters.lastUpdatedLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setExportOpen(true)}>
              <Download className="size-4" aria-hidden />
              Export report…
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setScheduleOpen(true)}>
              <CalendarClock className="size-4" aria-hidden />
              Schedule report
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-6">
          {METRIC_CARDS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => openMetric(m.id)}
              className={cn(
                "rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60",
                "focus-visible:outline-2 focus-visible:outline-blue-600",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{m.hint}</p>
              <p className="mt-2 text-[11px] text-[#2563eb]">View detail →</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm min-[901px]:grid-cols-4">
          <button
            type="button"
            onClick={() => openMetric("complete")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50"
          >
            <p className="text-slate-500">Complete buckets</p>
            <p className="text-xl font-semibold text-slate-900">{cs.complete.count}</p>
            <p className="text-xs text-slate-500">{cs.complete.percent}% of sections</p>
          </button>
          <button
            type="button"
            onClick={() => openMetric("partial")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50"
          >
            <p className="text-slate-500">Partial buckets</p>
            <p className="text-xl font-semibold text-slate-900">{cs.partial.count}</p>
            <p className="text-xs text-slate-500">{cs.partial.percent}% of sections</p>
          </button>
          <button
            type="button"
            onClick={() => openMetric("missing")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50"
          >
            <p className="text-slate-500">Missing buckets</p>
            <p className="text-xl font-semibold text-slate-900">{cs.missing.count}</p>
            <p className="text-xs text-slate-500">{cs.missing.percent}% of sections</p>
          </button>
          <button
            type="button"
            onClick={() => openMetric("gaps")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50"
          >
            <p className="text-slate-500">Orphan records</p>
            <p className="text-xl font-semibold text-slate-900">{cs.orphaned.count}</p>
            <p className="text-xs text-[#2563eb]">Open gap detail →</p>
          </button>
        </div>
      </section>

      <Section title="Overall coverage summary" description="Blended score with status distribution across lifecycle coverage buckets.">
        <div className="flex flex-wrap items-center gap-6">
          <CoverageRing percent={cs.overallCoveragePercent} />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <StatusBadge {...coverageStatusBadgeMap.complete} />
              <span>
                {cs.complete.percent}% ({cs.complete.count} buckets)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <StatusBadge {...coverageStatusBadgeMap.partial} />
              <span>
                {cs.partial.percent}% ({cs.partial.count})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <StatusBadge {...coverageStatusBadgeMap.missing} />
              <span>
                {cs.missing.percent}% ({cs.missing.count})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <StatusBadge {...coverageStatusBadgeMap.orphaned} />
              <span>{cs.orphaned.count} orphan / gap records</span>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Phase artifact coverage" description="Artifacts linked per lifecycle phase versus configured requirements.">
        <CoverageTable
          headers={["Phase", "Linked", "Required", "Coverage", "Status"]}
          rows={data.phaseArtifactLinks.map((row) => ({
            key: row.phaseId,
            cells: [
              <Link key="p" href={row.href} className="font-medium text-[#2563eb] hover:underline">
                {row.phaseNumber} {row.phaseName}
              </Link>,
              row.artifactsLinked,
              row.totalArtifactsRequired,
              <CoverageProgressBar key="c" value={row.coveragePercent} label={row.phaseName} />,
              <StatusBadge key="s" {...coverageStatusBadgeMap[row.status]} />,
            ],
          }))}
        />
      </Section>

      <Section title="Requirement design coverage" description="Design (feature) linkage by requirement family.">
        <CoverageTable
          headers={["Family", "Design links", "Requirements", "Coverage", "Status"]}
          rows={data.requirementDesignLinks.map((row) => ({
            key: row.label,
            cells: [
              <Link key="l" href={row.href} className="font-medium text-[#2563eb] hover:underline">
                {row.label}
              </Link>,
              row.designLinksTotal,
              row.requirementsTotal,
              <CoverageProgressBar key="c" value={row.coveragePercent} label={row.label} />,
              <StatusBadge key="s" {...coverageStatusBadgeMap[row.status]} />,
            ],
          }))}
        />
      </Section>

      <Section title="Requirement test coverage" description="Test artifact linkage by requirement family.">
        <CoverageTable
          headers={["Family", "Test links", "Requirements", "Coverage", "Status"]}
          rows={data.requirementTestLinks.map((row) => ({
            key: row.label,
            cells: [
              <Link key="l" href={row.href} className="font-medium text-[#2563eb] hover:underline">
                {row.label}
              </Link>,
              row.testLinksTotal,
              row.requirementsTotal,
              <CoverageProgressBar key="c" value={row.coveragePercent} label={row.label} />,
              <StatusBadge key="s" {...coverageStatusBadgeMap[row.status]} />,
            ],
          }))}
        />
      </Section>

      <Section title="Gate evidence coverage" description="Evidence and approvals mapped to each gate.">
        <CoverageTable
          headers={["Gate", "Evidence linked", "Required", "Coverage", "Gate status", "Link status"]}
          rows={data.gateEvidenceLinks.map((row) => ({
            key: row.gateId,
            cells: [
              <span key="g" className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link href={row.href} className="font-medium text-[#2563eb] hover:underline">
                  {row.gateCode} {row.gateName}
                </Link>
                <Link href={row.reviewHref} className="text-xs font-semibold text-slate-600 hover:underline">
                  Review
                </Link>
              </span>,
              row.evidenceLinked,
              row.requiredEvidence,
              <CoverageProgressBar key="c" value={row.coveragePercent} label={row.gateName} />,
              <StatusBadge key="gs" {...gateTraceStatusBadgeMap[row.gateStatus]} />,
              <StatusBadge key="s" {...coverageStatusBadgeMap[row.status]} />,
            ],
          }))}
        />
      </Section>

      <Section
        title="Gap and orphan summary"
        description="Open the dedicated gaps workspace to remediate, accept risk, or assign owners."
      >
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <p className="text-slate-700">
            <span className="font-semibold text-slate-900">{data.traceabilityGaps.length}</span> open gap / orphan
            records · <span className="font-semibold text-slate-900">{cs.orphaned.count}</span> counted as orphaned in
            coverage rollup
          </p>
          <Link href={`/projects/${projectId}/traceability/gaps`} className="font-semibold text-[#2563eb] hover:underline">
            Open gaps & orphans screen →
          </Link>
        </div>
        {data.traceabilityGaps.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {data.traceabilityGaps.slice(0, 12).map((gap) => (
              <li key={gap.id} className={cn(tableRowClass(), "py-2")}>
                <Link href={gap.href} className="font-medium text-[#2563eb] hover:underline">
                  {gap.objectId}
                </Link>{" "}
                · {gap.objectName} · {gap.issue}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No gaps detected with current rules.</p>
        )}
      </Section>

      <Section title="Critical traceability risks" description="Gaps scored high or critical impact until remediated or accepted.">
        {criticalGaps.length === 0 ? (
          <p className="text-sm text-slate-600">No high/critical gaps at this time.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {criticalGaps.map((gap) => (
              <li key={gap.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2">
                <StatusBadge {...impactBadgeMap[gap.impact]} />
                <Link href={gap.href} className="font-medium text-[#2563eb] hover:underline">
                  {gap.objectId}
                </Link>
                <span className="text-slate-700">· {gap.issue}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Remediation recommendations" description="Automated guidance from coverage posture and gap inventory.">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {remediation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Section>

      <Section
        title="Scheduled reports"
        description="Saved delivery preferences for this project. Email dispatch hooks into your notification provider separately."
      >
        {initialSchedules.length === 0 ? (
          <p className="text-sm text-slate-600">No active schedules yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Frequency</th>
                  <th className="pb-2">Format</th>
                  <th className="pb-2">Recipients</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {initialSchedules.map((s) => (
                  <tr key={s.id} className={tableRowClass()}>
                    <td className="py-2 font-medium text-slate-900">{s.reportName}</td>
                    <td className="py-2 capitalize">{s.frequency.replace(/_/g, " ")}</td>
                    <td className="py-2">{s.format}</td>
                    <td className="max-w-[220px] truncate py-2 text-xs text-slate-600" title={s.recipients.join(", ")}>
                      {s.recipients.join(", ")}
                    </td>
                    <td className="py-2 text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Remove schedule"
                        disabled={deletingId === s.id}
                        onClick={() => void handleDeleteSchedule(s.id)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <ExportTraceabilityMatrixModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        viewModel={exportViewModel}
        defaultScope="full_matrix"
      />
      <ScheduleTraceabilityReportModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} projectId={projectId} />

      <CoverageMetricDetailDrawer
        open={metricOpen}
        detail={detail}
        onClose={() => {
          setMetricOpen(false);
          setActiveMetric(null);
        }}
      />
    </div>
  );
}

function CoverageTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: { key: string; cells: ReactNode[] }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="pb-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={tableRowClass()}>
              {row.cells.map((cell, i) => (
                <td key={i} className="py-2 align-middle text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
