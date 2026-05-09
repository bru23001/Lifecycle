"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  ClipboardList,
  FileBarChart2,
  FileSearch,
  FlaskConical,
  Info,
  Package,
  RefreshCw,
  Route,
  ShieldCheck,
} from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { mergeReportsFilters, reportsFiltersToSearchParams } from "@/lib/reports-url";
import { exportAllReports, exportSingleReport } from "@/lib/report-export";
import {
  getReportCardHealth,
  shouldShowReportCard,
} from "@/lib/reports-scoped-data";
import { reportStatusBadgeMap } from "@/lib/report-status";
import { cn } from "@/lib/utils";
import type { ReportsFilters, ReportsPageData } from "@/types/reports.types";

const toneClass: Record<"green" | "amber" | "blue" | "red", string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  red: "border-red-200 bg-red-50 text-red-800",
};

function Badge({ label, tone }: { label: string; tone: keyof typeof toneClass }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
      {label}
    </span>
  );
}

function Ring({ percent, label }: { percent: number; label: string }) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid size-20 place-items-center rounded-full border-8 border-white bg-white"
        style={{ backgroundImage: `conic-gradient(#2563eb ${value}%, #e2e8f0 ${value}% 100%)` }}
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="grid size-14 place-items-center rounded-full bg-white text-center">
          <p className="text-lg font-semibold text-slate-900">{value}%</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ReportCard({
  icon,
  title,
  description,
  status,
  children,
  lastGeneratedLabel,
  viewHref,
  onPrimaryExport,
  primaryExportLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "ready" | "stale" | "generating" | "missing" | "error";
  children: React.ReactNode;
  lastGeneratedLabel?: string;
  viewHref: string;
  onPrimaryExport: () => void;
  primaryExportLabel: string;
}) {
  return (
    <article className="report-card min-w-0 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-blue-700">{icon}</div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-600">{description}</p>
          </div>
        </div>
        <Badge {...reportStatusBadgeMap[status]} />
      </header>

      <div className="mt-4">{children}</div>

      <p className="mt-4 text-xs text-slate-500">Last Generated: {lastGeneratedLabel ?? "—"}</p>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={viewHref}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          View Report
        </Link>
        <Button type="button" variant="outline" size="sm" onClick={onPrimaryExport}>
          {primaryExportLabel}
        </Button>
      </div>
    </article>
  );
}

export function ReportsPage({ initial }: { initial: ReportsPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = initial.filters;
  const scopedData = initial;

  const navigateFilters = (patch: Partial<ReportsFilters>) => {
    setError(null);
    const next = mergeReportsFilters(initial.project.id, { ...filters, ...patch });
    const q = reportsFiltersToSearchParams(next).toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  const runExport = async (
    fn: () => Promise<void>,
  ) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  };

  const refreshAll = () => {
    setLoading(true);
    setError(null);
    window.setTimeout(() => setLoading(false), 240);
  };

  return (
    <AuthenticatedAppShell
      projectId={scopedData.project.id}
      projectName={scopedData.project.name}
      phaseSummary={`Report hub • ${scopedData.reports.lifecycleStatus.overallProgressPercent}% progress`}
      phaseProgressPct={scopedData.reports.lifecycleStatus.overallProgressPercent}
      navActive="reports"
    >
      <TopHeader
        title="Reports"
        userInitials={initial.user.initials}
        notificationCount={6}
        actionButtonLabel="Export All Reports"
        actionButtonAriaLabel="Export all report outputs as JSON"
        onActionButtonClick={() =>
          runExport(() => exportAllReports(scopedData))
        }
      />

      <main className="reports-page flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1920px]">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/dashboard" },
              { label: "Projects", href: "/projects" },
              { label: `${scopedData.project.name} (${scopedData.project.code})`, href: `/projects/${scopedData.project.id}` },
              { label: "Reports" },
            ]}
          />

          <section className="reports-filter-bar mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 min-[901px]:grid-cols-2 min-[1281px]:grid-cols-3 min-[1600px]:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={filters.projectId}
                disabled
                aria-label="Current project (single-project workspace)"
              >
                <option value={scopedData.project.id}>{scopedData.project.name} ({scopedData.project.code})</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date Range</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={filters.dateRange}
                onChange={(event) =>
                  navigateFilters({ dateRange: event.target.value as ReportsFilters["dateRange"] })
                }
              >
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phase</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={String(filters.phaseNumber ?? "all")}
                onChange={(event) =>
                  navigateFilters({
                    phaseNumber:
                      event.target.value === "all" ? "all" : Number.parseInt(event.target.value, 10),
                  })
                }
              >
                <option value="all">All Phases</option>
                <option value="1">Phase 1</option>
                <option value="2">Phase 2</option>
                <option value="3">Phase 3</option>
                <option value="4">Phase 4</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gate</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={filters.gateCode ?? "all"}
                onChange={(event) => navigateFilters({ gateCode: event.target.value })}
              >
                <option value="all">All Gates</option>
                <option value="G1">G1</option>
                <option value="G2">G2</option>
                <option value="G3">G3</option>
                <option value="G4">G4</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Report health</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={filters.reportStatus ?? "all"}
                onChange={(event) =>
                  navigateFilters({
                    reportStatus: event.target.value as ReportsFilters["reportStatus"],
                  })
                }
              >
                <option value="all">All reports</option>
                <option value="ready">Healthy / ready</option>
                <option value="stale">Needs refresh</option>
                <option value="missing">Has gaps</option>
              </select>
            </label>
            <div className="col-span-full flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4 min-[1281px]:border-t-0 min-[1281px]:pt-0">
              <Button type="button" variant="outline" size="lg">
                <Calendar className="size-4" aria-hidden />
                More Filters
              </Button>
              <p className="text-xs text-slate-500">Last Update: {scopedData.filters.lastUpdatedLabel}</p>
            </div>
          </section>

          {error ? (
            <section className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p>{error}</p>
            </section>
          ) : null}

          <section className="reports-grid mt-5 grid grid-cols-1 gap-5 min-[901px]:grid-cols-2 min-[1281px]:grid-cols-3">
            {loading ? (
              <>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </>
            ) : (
              <>
                {shouldShowReportCard(scopedData, "lifecycleStatus", filters.reportStatus ?? "all") ? (
                  <ReportCard
                    icon={<FileBarChart2 className="size-5" aria-hidden />}
                    title="Lifecycle Status Report"
                    description="Overall lifecycle progress, phase completion, key transitions, and upcoming actions."
                    status={getReportCardHealth(scopedData.reports, "lifecycleStatus")}
                    lastGeneratedLabel={scopedData.reports.lifecycleStatus.lastGeneratedLabel}
                    viewHref={scopedData.reports.lifecycleStatus.viewHref}
                    onPrimaryExport={() =>
                      runExport(() => exportSingleReport(scopedData, "lifecycleStatus"))
                    }
                    primaryExportLabel="Export JSON"
                  >
                    <div className="flex items-center justify-between">
                      <Ring percent={scopedData.reports.lifecycleStatus.overallProgressPercent} label="Overall progress" />
                      <ul className="space-y-1 text-sm text-slate-700">
                        <li>
                          Completed: {scopedData.reports.lifecycleStatus.phasesCompleted} / {scopedData.reports.lifecycleStatus.totalPhases}
                        </li>
                        <li>
                          In Progress: {scopedData.reports.lifecycleStatus.phasesInProgress} / {scopedData.reports.lifecycleStatus.totalPhases}
                        </li>
                        <li>
                          Not Started: {scopedData.reports.lifecycleStatus.phasesNotStarted} / {scopedData.reports.lifecycleStatus.totalPhases}
                        </li>
                        <li>Blockers: {scopedData.reports.lifecycleStatus.blockersCount}</li>
                      </ul>
                    </div>
                  </ReportCard>
                ) : null}

                {shouldShowReportCard(scopedData, "gateDecision", filters.reportStatus ?? "all") ? (
                  <ReportCard
                    icon={<ShieldCheck className="size-5" aria-hidden />}
                    title="Gate Decision Report"
                    description="Summary of gate decisions, states, approvers, and conditions."
                    status={getReportCardHealth(scopedData.reports, "gateDecision")}
                    lastGeneratedLabel={scopedData.reports.gateDecision.lastGeneratedLabel}
                    viewHref={scopedData.reports.gateDecision.viewHref}
                    onPrimaryExport={() =>
                      runExport(() => exportSingleReport(scopedData, "gateDecision"))
                    }
                    primaryExportLabel="Export JSON"
                  >
                    <p className="text-3xl font-semibold text-slate-900">{scopedData.reports.gateDecision.totalGates}</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      <li>
                        Approved: {scopedData.reports.gateDecision.approved} ({scopedData.reports.gateDecision.approvalRatePercent}%)
                      </li>
                      <li>Pending: {scopedData.reports.gateDecision.pending}</li>
                      <li>Rejected: {scopedData.reports.gateDecision.rejected}</li>
                      <li>Not Reached: {scopedData.reports.gateDecision.notReached}</li>
                    </ul>
                  </ReportCard>
                ) : null}

                {shouldShowReportCard(scopedData, "artifactCompletion", filters.reportStatus ?? "all") ? (
                  <ReportCard
                    icon={<ClipboardList className="size-5" aria-hidden />}
                    title="Artifact Completion Report"
                    description="Required templates and artifacts: draft, in review, approved, and blocked counts by lifecycle phase."
                    status={getReportCardHealth(scopedData.reports, "artifactCompletion")}
                    lastGeneratedLabel={scopedData.reports.artifactCompletion.lastGeneratedLabel}
                    viewHref={scopedData.reports.artifactCompletion.viewHref}
                    onPrimaryExport={() =>
                      runExport(() => exportSingleReport(scopedData, "artifactCompletion"))
                    }
                    primaryExportLabel="Export JSON"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Ring percent={scopedData.reports.artifactCompletion.completionPercent} label="Artifacts complete" />
                      <ul className="space-y-1 text-sm text-slate-700">
                        <li>Required: {scopedData.reports.artifactCompletion.totalRequired}</li>
                        <li>Completed: {scopedData.reports.artifactCompletion.completed}</li>
                        <li>In review: {scopedData.reports.artifactCompletion.inReview}</li>
                        <li>Draft / blocked: {scopedData.reports.artifactCompletion.draft + scopedData.reports.artifactCompletion.blocked}</li>
                      </ul>
                    </div>
                  </ReportCard>
                ) : null}

                {shouldShowReportCard(scopedData, "evidenceCompleteness", filters.reportStatus ?? "all") ? (
                  <ReportCard
                    icon={<FileSearch className="size-5" aria-hidden />}
                    title="Evidence Completeness Report"
                    description="Evidence coverage, gaps by severity, and blocking gates — includes missing and incomplete items."
                    status={getReportCardHealth(scopedData.reports, "evidenceCompleteness")}
                    lastGeneratedLabel={scopedData.reports.evidenceCompleteness.lastGeneratedLabel}
                    viewHref={scopedData.reports.evidenceCompleteness.viewHref}
                    onPrimaryExport={() =>
                      runExport(() => exportSingleReport(scopedData, "evidenceCompleteness"))
                    }
                    primaryExportLabel="Export JSON"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Ring percent={scopedData.reports.evidenceCompleteness.overallPercent} label="Evidence coverage" />
                      <ul className="space-y-1 text-sm text-slate-700">
                        <li>Missing: {scopedData.reports.evidenceCompleteness.missingItems}</li>
                        <li>
                          Critical / High: {scopedData.reports.evidenceCompleteness.critical} / {scopedData.reports.evidenceCompleteness.high}
                        </li>
                        <li>Blocking gates: {scopedData.reports.evidenceCompleteness.blockingGates}</li>
                      </ul>
                    </div>
                  </ReportCard>
                ) : null}

                {shouldShowReportCard(scopedData, "traceability", filters.reportStatus ?? "all") ? (
                  <ReportCard
                    icon={<Route className="size-5" aria-hidden />}
                    title="Traceability Coverage Report"
                    description="End-to-end traceability coverage across requirements, design, test, gates, and evidence."
                    status={getReportCardHealth(scopedData.reports, "traceability")}
                    lastGeneratedLabel={scopedData.reports.traceability.lastGeneratedLabel}
                    viewHref={scopedData.reports.traceability.viewHref}
                    onPrimaryExport={() =>
                      runExport(() => exportSingleReport(scopedData, "traceability"))
                    }
                    primaryExportLabel="Export JSON"
                  >
                    <div className="flex items-center justify-between">
                      <Ring percent={scopedData.reports.traceability.coveragePercent} label="Coverage" />
                      <ul className="space-y-1 text-sm text-slate-700">
                        <li>Complete: {scopedData.reports.traceability.completeLinks}</li>
                        <li>Partial: {scopedData.reports.traceability.partialLinks}</li>
                        <li>Missing: {scopedData.reports.traceability.missingLinks}</li>
                        <li>Critical gaps: {scopedData.reports.traceability.criticalGaps}</li>
                      </ul>
                    </div>
                  </ReportCard>
                ) : null}

                {shouldShowReportCard(scopedData, "approvalHistory", filters.reportStatus ?? "all") ? (
                  <ReportCard
                    icon={<FlaskConical className="size-5" aria-hidden />}
                    title="Approval History Report"
                    description="Complete approval timeline including decisions, comments, and review actions."
                    status={getReportCardHealth(scopedData.reports, "approvalHistory")}
                    lastGeneratedLabel={scopedData.reports.approvalHistory.lastGeneratedLabel}
                    viewHref={scopedData.reports.approvalHistory.viewHref}
                    onPrimaryExport={() =>
                      runExport(() => exportSingleReport(scopedData, "approvalHistory"))
                    }
                    primaryExportLabel="Export JSON"
                  >
                    {scopedData.reports.approvalHistory.totalDecisions === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        No approval history has been recorded.
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-semibold text-slate-900">{scopedData.reports.approvalHistory.totalDecisions}</p>
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          <li>Approved: {scopedData.reports.approvalHistory.approved}</li>
                          <li>Changes Requested: {scopedData.reports.approvalHistory.changesRequested}</li>
                          <li>Rejected: {scopedData.reports.approvalHistory.rejected}</li>
                          <li>Pending: {scopedData.reports.approvalHistory.pending}</li>
                        </ul>
                      </>
                    )}
                  </ReportCard>
                ) : null}

                {shouldShowReportCard(scopedData, "fullProjectEvidencePackage", filters.reportStatus ?? "all") ? (
                  <ReportCard
                    icon={<Package className="size-5" aria-hidden />}
                    title="Full Project Lifecycle Package"
                    description="Export the complete lifecycle evidence package with metadata, trace links, and audit manifest."
                    status={getReportCardHealth(scopedData.reports, "fullProjectEvidencePackage")}
                    lastGeneratedLabel={scopedData.reports.fullProjectEvidencePackage.lastGeneratedLabel}
                    viewHref={scopedData.reports.fullProjectEvidencePackage.configureHref}
                    onPrimaryExport={() =>
                      runExport(() =>
                        exportSingleReport(scopedData, "fullProjectEvidencePackage"),
                      )
                    }
                    primaryExportLabel="Export JSON"
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Size (est.)</p>
                        <p className="text-base font-semibold text-slate-900">
                          {scopedData.reports.fullProjectEvidencePackage.estimatedSizeLabel}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Files (est.)</p>
                        <p className="text-base font-semibold text-slate-900">
                          {scopedData.reports.fullProjectEvidencePackage.estimatedFileCount}
                        </p>
                      </div>
                    </div>
                  </ReportCard>
                ) : null}
              </>
            )}
          </section>

          <section className="reports-action-bar mt-5 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 min-[901px]:flex-row min-[901px]:items-center">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-blue-700" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-slate-900">{scopedData.actionState.title}</p>
                <p className="text-sm text-slate-600">{scopedData.actionState.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link href={scopedData.actionState.scheduleHref}>
                <Button type="button" variant="outline" size="lg" disabled={!scopedData.actionState.canScheduleReports}>
                  Schedule Reports
                </Button>
              </Link>
              <Button
                type="button"
                size="lg"
                className="gap-2 bg-[#2563eb] text-white hover:bg-blue-700"
                disabled={!scopedData.actionState.canRefreshReports}
                onClick={refreshAll}
              >
                <RefreshCw className="size-4" aria-hidden />
                Refresh All Reports
              </Button>
            </div>
          </section>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
