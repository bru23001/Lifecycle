"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CircleAlert,
  CircleDot,
  ClipboardCheck,
  Clock,
  FileBarChart2,
  FileText,
  Info,
  MessageSquareWarning,
  Package,
  RefreshCw,
  Route,
  ShieldCheck,
  ShieldQuestion,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
  XCircle,
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
import type {
  ReportExportFormat,
  ReportsFilters,
  ReportsPageData,
} from "@/types/reports.types";

type Tone = "green" | "amber" | "blue" | "red" | "gray" | "purple" | "cyan";

const badgeToneClass: Record<Tone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
  purple: "border-violet-200 bg-violet-50 text-violet-800",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

const iconToneClass: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-rose-50 text-rose-700",
  gray: "bg-slate-100 text-slate-600",
  purple: "bg-violet-50 text-violet-700",
  cyan: "bg-cyan-50 text-cyan-700",
};

const dotToneClass: Record<Tone, string> = {
  green: "text-emerald-600",
  amber: "text-amber-600",
  blue: "text-blue-600",
  red: "text-rose-600",
  gray: "text-slate-500",
  purple: "text-violet-600",
  cyan: "text-cyan-600",
};

const ringColorClass: Record<Tone, string> = {
  green: "#16a34a",
  amber: "#f59e0b",
  blue: "#2563eb",
  red: "#dc2626",
  gray: "#94a3b8",
  purple: "#7c3aed",
  cyan: "#0891b2",
};

const EXPORT_FORMATS: ReadonlyArray<ReportExportFormat> = [
  "pdf",
  "csv",
  "json",
  "zip",
];

const exportFormatLabel: Record<ReportExportFormat, string> = {
  pdf: "PDF",
  csv: "CSV",
  json: "JSON",
  zip: "ZIP",
};

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        badgeToneClass[tone],
      )}
    >
      {label}
    </span>
  );
}

function MetricRing({
  percent,
  label,
  tone = "blue",
}: {
  percent: number;
  label: string;
  tone?: Tone;
}) {
  const value = Math.max(0, Math.min(100, percent));
  const color = ringColorClass[tone];
  return (
    <div className="flex flex-col items-center">
      <div
        className="grid size-28 place-items-center rounded-full"
        style={{ backgroundImage: `conic-gradient(${color} ${value}%, #e2e8f0 ${value}% 100%)` }}
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="grid size-[5.5rem] place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-2xl font-bold leading-none text-slate-900">{value}%</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type BreakdownRow = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: Tone;
};

function BreakdownList({ rows }: { rows: BreakdownRow[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <li key={row.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-700">
              <Icon className={cn("size-4 shrink-0", dotToneClass[row.tone])} aria-hidden />
              <span>{row.label}</span>
            </span>
            <span className="font-semibold text-slate-900">{row.value}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ReportActions({
  viewHref,
  primaryLabel,
  onPrimary,
  exportFormat,
  onExportFormatChange,
  primaryVariant = "outline",
  primaryLeadingIcon,
}: {
  viewHref: string;
  primaryLabel: string;
  onPrimary: () => void;
  exportFormat: ReportExportFormat;
  onExportFormatChange: (format: ReportExportFormat) => void;
  primaryVariant?: "outline" | "primary";
  primaryLeadingIcon?: ComponentType<{ className?: string }>;
}) {
  const PrimaryIcon = primaryLeadingIcon;
  return (
    <div className="mt-4 space-y-2">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-slate-500">Export format</span>
        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          value={exportFormat}
          onChange={(event) => onExportFormatChange(event.target.value as ReportExportFormat)}
          aria-label={`Export format for ${primaryLabel}`}
        >
          {EXPORT_FORMATS.map((format) => (
            <option key={format} value={format}>
              {exportFormatLabel[format]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-2">
      <Link
        href={viewHref}
        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        <FileText className="size-3.5" aria-hidden />
        View Report
      </Link>
      <button
        type="button"
        onClick={onPrimary}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-600",
          primaryVariant === "primary"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        )}
        aria-label={primaryLabel}
      >
        {PrimaryIcon ? <PrimaryIcon className="size-3.5" aria-hidden /> : null}
        <span>
          {primaryLabel} ({exportFormatLabel[exportFormat]})
        </span>
      </button>
      </div>
    </div>
  );
}

function ReportCardShell({
  icon,
  iconTone,
  title,
  description,
  status,
  children,
  lastGeneratedLabel,
  actions,
}: {
  icon: ComponentType<{ className?: string }>;
  iconTone: Tone;
  title: string;
  description: string;
  status: "ready" | "stale" | "generating" | "missing" | "error";
  children: React.ReactNode;
  lastGeneratedLabel?: string;
  actions: React.ReactNode;
}) {
  const Icon = icon;
  const badge = reportStatusBadgeMap[status];
  return (
    <article className="report-card flex min-w-0 flex-col rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
              iconToneClass[iconTone],
            )}
          >
            <Icon className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-snug text-slate-600">{description}</p>
          </div>
        </div>
        <StatusBadge {...badge} />
      </header>

      <div className="mt-5 flex-1">{children}</div>

      <p className="mt-4 text-xs text-slate-500">
        Last Generated: <span className="font-medium text-slate-700">{lastGeneratedLabel ?? "—"}</span>
      </p>

      {actions}
    </article>
  );
}

export function ReportsPage({ initial }: { initial: ReportsPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [singleExportFormats, setSingleExportFormats] = useState<
    Record<
      | "lifecycleStatus"
      | "gateDecision"
      | "traceability"
      | "missingEvidence"
      | "approvalHistory"
      | "fullProjectEvidencePackage",
      ReportExportFormat
    >
  >({
    lifecycleStatus: "pdf",
    gateDecision: "pdf",
    traceability: "pdf",
    missingEvidence: "csv",
    approvalHistory: "pdf",
    fullProjectEvidencePackage: "zip",
  });
  const [allExportFormat, setAllExportFormat] = useState<ReportExportFormat>("zip");

  const filters = initial.filters;
  const data = initial;

  const navigateFilters = (patch: Partial<ReportsFilters>) => {
    setError(null);
    const next = mergeReportsFilters(initial.project.id, { ...filters, ...patch });
    const q = reportsFiltersToSearchParams(next).toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  const runExport = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  };

  const changeSingleExportFormat = (
    key:
      | "lifecycleStatus"
      | "gateDecision"
      | "traceability"
      | "missingEvidence"
      | "approvalHistory"
      | "fullProjectEvidencePackage",
    format: ReportExportFormat,
  ) => {
    setSingleExportFormats((prev) => ({ ...prev, [key]: format }));
  };

  const refreshAll = () => {
    setLoading(true);
    setError(null);
    window.setTimeout(() => setLoading(false), 240);
  };

  const reportFilter = filters.reportStatus ?? "all";

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Report hub • ${data.reports.lifecycleStatus.overallProgressPercent}% progress`}
      phaseProgressPct={data.reports.lifecycleStatus.overallProgressPercent}
      navActive="reports"
    >
      <TopHeader
        title="Reports"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        actionButtonLabel={`Export All Reports (${exportFormatLabel[allExportFormat]})`}
        actionButtonAriaLabel="Export all report outputs"
        onActionButtonClick={() => runExport(() => exportAllReports(data, allExportFormat))}
      />

      <main className="reports-page flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-5 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              {
                label: `${data.project.name} (${data.project.code})`,
                href: `/projects/${data.project.id}/workspace`,
              },
              { label: "Reports" },
            ]}
          />

          <section
            className="reports-filter-bar mt-3 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 min-[901px]:px-5"
            aria-label="Report filters"
          >
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">Report Filters</h2>
            </header>

            <div className="mt-3 grid grid-cols-1 gap-3 min-[901px]:grid-cols-2 min-[1281px]:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_auto] min-[1281px]:items-end">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Project</span>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 disabled:cursor-default disabled:opacity-100"
                  value={filters.projectId}
                  disabled
                  aria-label="Current project"
                >
                  <option value={data.project.id}>
                    {data.project.name} ({data.project.code})
                  </option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Date Range</span>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  value={filters.dateRange}
                  onChange={(event) =>
                    navigateFilters({ dateRange: event.target.value as ReportsFilters["dateRange"] })
                  }
                  aria-label="Date range"
                >
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="this_quarter">This Quarter (Apr 1 - Jun 30, 2024)</option>
                  <option value="this_year">This Year</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Phase</span>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  value={String(filters.phaseNumber ?? "all")}
                  onChange={(event) =>
                    navigateFilters({
                      phaseNumber:
                        event.target.value === "all" ? "all" : Number.parseInt(event.target.value, 10),
                    })
                  }
                  aria-label="Phase"
                >
                  <option value="all">All Phases</option>
                  <option value="1">Phase 1</option>
                  <option value="2">Phase 2</option>
                  <option value="3">Phase 3</option>
                  <option value="4">Phase 4</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Gate</span>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  value={filters.gateCode ?? "all"}
                  onChange={(event) => navigateFilters({ gateCode: event.target.value })}
                  aria-label="Gate"
                >
                  <option value="all">All Gates</option>
                  <option value="G1">G1</option>
                  <option value="G2">G2</option>
                  <option value="G3">G3</option>
                  <option value="G4">G4</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Report Status</span>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  value={filters.reportStatus ?? "all"}
                  onChange={(event) =>
                    navigateFilters({
                      reportStatus: event.target.value as ReportsFilters["reportStatus"],
                    })
                  }
                  aria-label="Report status"
                >
                  <option value="all">All statuses</option>
                  <option value="ready">Ready</option>
                  <option value="stale">Stale</option>
                  <option value="missing">Missing</option>
                </select>
              </label>

              <p className="whitespace-nowrap text-xs text-slate-500 min-[1281px]:pb-2">
                Last Updated:{" "}
                <span className="font-medium text-slate-700">{data.filters.lastUpdatedLabel}</span>
              </p>
            </div>
          </section>

          {error ? (
            <section className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              <p>{error}</p>
              <Button type="button" size="sm" variant="outline" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </section>
          ) : null}
        </div>

        <div className="mx-auto flex w-full max-w-[1920px] flex-1 min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-8 min-[901px]:px-8">
          <section className="reports-grid mt-5 min-h-0 flex-1" aria-label="Reports">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
              ))
            ) : (
              <>
                {shouldShowReportCard(data, "lifecycleStatus", reportFilter) ? (
                  <ReportCardShell
                    icon={FileBarChart2}
                    iconTone="blue"
                    title="Lifecycle Status Report"
                    description="Overall lifecycle progress, phase completion, key milestones, and upcoming actions."
                    status={getReportCardHealth(data.reports, "lifecycleStatus")}
                    lastGeneratedLabel={data.reports.lifecycleStatus.lastGeneratedLabel}
                    actions={
                      <ReportActions
                        viewHref={data.reports.lifecycleStatus.viewHref}
                        primaryLabel="Export"
                        primaryLeadingIcon={FileText}
                        exportFormat={singleExportFormats.lifecycleStatus}
                        onExportFormatChange={(format) =>
                          changeSingleExportFormat("lifecycleStatus", format)
                        }
                        onPrimary={() =>
                          runExport(() =>
                            exportSingleReport(
                              data,
                              "lifecycleStatus",
                              singleExportFormats.lifecycleStatus,
                            ),
                          )
                        }
                      />
                    }
                  >
                    <div className="flex items-center gap-4">
                      <MetricRing
                        percent={data.reports.lifecycleStatus.overallProgressPercent}
                        label="In Progress"
                        tone="blue"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Phases
                        </p>
                        <div className="mt-2">
                          <BreakdownList
                            rows={[
                              {
                                icon: ThumbsUp,
                                label: "Completed",
                                value: `${data.reports.lifecycleStatus.phasesCompleted} / ${data.reports.lifecycleStatus.totalPhases}`,
                                tone: "green",
                              },
                              {
                                icon: Clock,
                                label: "In Progress",
                                value: `${data.reports.lifecycleStatus.phasesInProgress} / ${data.reports.lifecycleStatus.totalPhases}`,
                                tone: "blue",
                              },
                              {
                                icon: CircleDot,
                                label: "Not Started",
                                value: `${data.reports.lifecycleStatus.phasesNotStarted} / ${data.reports.lifecycleStatus.totalPhases}`,
                                tone: "gray",
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </ReportCardShell>
                ) : null}

                {shouldShowReportCard(data, "gateDecision", reportFilter) ? (
                  <ReportCardShell
                    icon={ShieldCheck}
                    iconTone="green"
                    title="Gate Decision Report"
                    description="Summary of gate decisions, outcomes, dates, approvers, and conditions."
                    status={getReportCardHealth(data.reports, "gateDecision")}
                    lastGeneratedLabel={data.reports.gateDecision.lastGeneratedLabel}
                    actions={
                      <ReportActions
                        viewHref={data.reports.gateDecision.viewHref}
                        primaryLabel="Export"
                        primaryLeadingIcon={FileText}
                        exportFormat={singleExportFormats.gateDecision}
                        onExportFormatChange={(format) =>
                          changeSingleExportFormat("gateDecision", format)
                        }
                        onPrimary={() =>
                          runExport(() =>
                            exportSingleReport(data, "gateDecision", singleExportFormats.gateDecision),
                          )
                        }
                      />
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Total Gates
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">
                          {data.reports.gateDecision.totalGates}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <BreakdownList
                          rows={[
                            {
                              icon: ThumbsUp,
                              label: "Approved",
                              value: formatCountWithPercent(
                                data.reports.gateDecision.approved,
                                data.reports.gateDecision.totalGates,
                              ),
                              tone: "green",
                            },
                            {
                              icon: Clock,
                              label: "Pending",
                              value: formatCountWithPercent(
                                data.reports.gateDecision.pending,
                                data.reports.gateDecision.totalGates,
                              ),
                              tone: "blue",
                            },
                            {
                              icon: ThumbsDown,
                              label: "Rejected",
                              value: formatCountWithPercent(
                                data.reports.gateDecision.rejected,
                                data.reports.gateDecision.totalGates,
                              ),
                              tone: "red",
                            },
                            {
                              icon: ShieldQuestion,
                              label: "Not Reached",
                              value: formatCountWithPercent(
                                data.reports.gateDecision.notReached,
                                data.reports.gateDecision.totalGates,
                              ),
                              tone: "gray",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </ReportCardShell>
                ) : null}

                {shouldShowReportCard(data, "traceability", reportFilter) ? (
                  <ReportCardShell
                    icon={Route}
                    iconTone="cyan"
                    title="Traceability Report"
                    description="End-to-end traceability coverage across requirements, design, test, gates, and evidence."
                    status={getReportCardHealth(data.reports, "traceability")}
                    lastGeneratedLabel={data.reports.traceability.lastGeneratedLabel}
                    actions={
                      <ReportActions
                        viewHref={data.reports.traceability.viewHref}
                        primaryLabel="Export"
                        primaryLeadingIcon={FileText}
                        exportFormat={singleExportFormats.traceability}
                        onExportFormatChange={(format) =>
                          changeSingleExportFormat("traceability", format)
                        }
                        onPrimary={() =>
                          runExport(() =>
                            exportSingleReport(data, "traceability", singleExportFormats.traceability),
                          )
                        }
                      />
                    }
                  >
                    <div className="flex items-center gap-4">
                      <MetricRing
                        percent={data.reports.traceability.coveragePercent}
                        label="Coverage"
                        tone="green"
                      />
                      <div className="min-w-0 flex-1">
                        <BreakdownList
                          rows={[
                            {
                              icon: ThumbsUp,
                              label: "Complete",
                              value: formatPercentWithCount(
                                data.reports.traceability.coveragePercent,
                                data.reports.traceability.completeLinks,
                              ),
                              tone: "green",
                            },
                            {
                              icon: CircleDot,
                              label: "Partial",
                              value: formatPercentWithCount(
                                computePartialPercent(data.reports.traceability),
                                data.reports.traceability.partialLinks,
                              ),
                              tone: "amber",
                            },
                            {
                              icon: XCircle,
                              label: "Missing",
                              value: formatPercentWithCount(
                                computeMissingPercent(data.reports.traceability),
                                data.reports.traceability.missingLinks,
                              ),
                              tone: "red",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </ReportCardShell>
                ) : null}

                {shouldShowReportCard(data, "missingEvidence", reportFilter) ? (
                  <ReportCardShell
                    icon={AlertTriangle}
                    iconTone="amber"
                    title="Missing Evidence Report"
                    description="Missing, incomplete, and orphaned evidence items preventing full lifecycle coverage."
                    status={getReportCardHealth(data.reports, "missingEvidence")}
                    lastGeneratedLabel={data.reports.missingEvidence.lastGeneratedLabel}
                    actions={
                      <ReportActions
                        viewHref={data.reports.missingEvidence.viewHref}
                        primaryLabel="Export"
                        primaryLeadingIcon={FileText}
                        exportFormat={singleExportFormats.missingEvidence}
                        onExportFormatChange={(format) =>
                          changeSingleExportFormat("missingEvidence", format)
                        }
                        onPrimary={() =>
                          runExport(() =>
                            exportSingleReport(
                              data,
                              "missingEvidence",
                              singleExportFormats.missingEvidence,
                            ),
                          )
                        }
                      />
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="rounded-xl bg-rose-50 px-4 py-3 text-rose-800">
                          <p className="text-[11px] font-semibold uppercase tracking-wide">
                            Missing Items
                          </p>
                          <p className="mt-1 text-3xl font-bold">
                            {data.reports.missingEvidence.missingItems}
                          </p>
                        </div>
                        <div className="rounded-xl bg-amber-50 px-4 py-2 text-amber-900">
                          <p className="text-[11px] font-semibold uppercase tracking-wide">
                            Orphaned Items
                          </p>
                          <p className="mt-1 text-xl font-bold">
                            {data.reports.missingEvidence.orphanedItems}
                          </p>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <BreakdownList
                          rows={[
                            {
                              icon: CircleAlert,
                              label: "Critical",
                              value: String(data.reports.missingEvidence.critical),
                              tone: "red",
                            },
                            {
                              icon: AlertTriangle,
                              label: "High",
                              value: String(data.reports.missingEvidence.high),
                              tone: "amber",
                            },
                            {
                              icon: Info,
                              label: "Medium",
                              value: String(data.reports.missingEvidence.medium),
                              tone: "blue",
                            },
                            {
                              icon: CircleDot,
                              label: "Low",
                              value: String(data.reports.missingEvidence.low),
                              tone: "gray",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </ReportCardShell>
                ) : null}

                {shouldShowReportCard(data, "approvalHistory", reportFilter) ? (
                  <ReportCardShell
                    icon={ClipboardCheck}
                    iconTone="purple"
                    title="Approval History Report"
                    description="Complete history of approvals, decisions, comments, and changes over time."
                    status={getReportCardHealth(data.reports, "approvalHistory")}
                    lastGeneratedLabel={data.reports.approvalHistory.lastGeneratedLabel}
                    actions={
                      <ReportActions
                        viewHref={data.reports.approvalHistory.viewHref}
                        primaryLabel="Export"
                        primaryLeadingIcon={FileText}
                        exportFormat={singleExportFormats.approvalHistory}
                        onExportFormatChange={(format) =>
                          changeSingleExportFormat("approvalHistory", format)
                        }
                        onPrimary={() =>
                          runExport(() =>
                            exportSingleReport(
                              data,
                              "approvalHistory",
                              singleExportFormats.approvalHistory,
                            ),
                          )
                        }
                      />
                    }
                  >
                    {data.reports.approvalHistory.totalDecisions === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        No approval history has been recorded.
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Total Decisions
                          </p>
                          <p className="mt-1 text-3xl font-bold text-slate-900">
                            {data.reports.approvalHistory.totalDecisions}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <BreakdownList
                            rows={[
                              {
                                icon: ThumbsUp,
                                label: "Approved",
                                value: formatCountWithPercent(
                                  data.reports.approvalHistory.approved,
                                  data.reports.approvalHistory.totalDecisions,
                                ),
                                tone: "green",
                              },
                              {
                                icon: MessageSquareWarning,
                                label: "Changes Requested",
                                value: formatCountWithPercent(
                                  data.reports.approvalHistory.changesRequested,
                                  data.reports.approvalHistory.totalDecisions,
                                ),
                                tone: "amber",
                              },
                              {
                                icon: ThumbsDown,
                                label: "Rejected",
                                value: formatCountWithPercent(
                                  data.reports.approvalHistory.rejected,
                                  data.reports.approvalHistory.totalDecisions,
                                ),
                                tone: "red",
                              },
                              {
                                icon: Clock,
                                label: "Pending",
                                value: formatCountWithPercent(
                                  data.reports.approvalHistory.pending,
                                  data.reports.approvalHistory.totalDecisions,
                                ),
                                tone: "blue",
                              },
                            ]}
                          />
                        </div>
                      </div>
                    )}
                  </ReportCardShell>
                ) : null}

                {shouldShowReportCard(data, "fullProjectEvidencePackage", reportFilter) ? (
                  <ReportCardShell
                    icon={Package}
                    iconTone="blue"
                    title="Full Project Evidence Package"
                    description="Export complete project evidence with metadata, traceability links, and audit manifest."
                    status={getReportCardHealth(data.reports, "fullProjectEvidencePackage")}
                    lastGeneratedLabel={data.reports.fullProjectEvidencePackage.lastGeneratedLabel}
                    actions={
                      <div className="mt-4 space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-slate-500">Export format</span>
                          <select
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                            value={singleExportFormats.fullProjectEvidencePackage}
                            onChange={(event) =>
                              changeSingleExportFormat(
                                "fullProjectEvidencePackage",
                                event.target.value as ReportExportFormat,
                              )
                            }
                            aria-label="Export format for full project evidence package"
                          >
                            {EXPORT_FORMATS.map((format) => (
                              <option key={format} value={format}>
                                {exportFormatLabel[format]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex items-center gap-2">
                          <Link
                            href={data.reports.fullProjectEvidencePackage.viewHref}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="size-3.5" aria-hidden />
                            View Report
                          </Link>
                          <Link
                            href={data.reports.fullProjectEvidencePackage.configureHref}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <SlidersHorizontal className="size-3.5" aria-hidden />
                            Configure
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              runExport(() =>
                                exportSingleReport(
                                  data,
                                  "fullProjectEvidencePackage",
                                  singleExportFormats.fullProjectEvidencePackage,
                                ),
                              )
                            }
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            <Package className="size-3.5" aria-hidden />
                            <span>
                              Export ({exportFormatLabel[singleExportFormats.fullProjectEvidencePackage]})
                            </span>
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="grid size-20 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700"
                        aria-hidden
                      >
                        <Package className="size-10" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug text-slate-600">
                          Includes all evidence files, links, metadata, traceability mappings, and audit manifest.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">
                              Size (Est.)
                            </p>
                            <p className="text-base font-bold text-slate-900">
                              {data.reports.fullProjectEvidencePackage.estimatedSizeLabel}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">
                              Files (Est.)
                            </p>
                            <p className="text-base font-bold text-slate-900">
                              {data.reports.fullProjectEvidencePackage.estimatedFileCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ReportCardShell>
                ) : null}
              </>
            )}
          </section>

          <section
            className="reports-action-bar mt-5 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 min-[901px]:flex-row min-[901px]:items-center min-[901px]:px-5"
            aria-label="Reports actions"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700"
              >
                <Info className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{data.actionState.title}</p>
                <p className="text-sm text-slate-600">{data.actionState.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Export all as</span>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm normal-case tracking-normal text-slate-900"
                  value={allExportFormat}
                  onChange={(event) => setAllExportFormat(event.target.value as ReportExportFormat)}
                  aria-label="Export all reports format"
                >
                  {EXPORT_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {exportFormatLabel[format]}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="bg-white"
                onClick={() => runExport(() => exportAllReports(data, allExportFormat))}
              >
                <FileText className="size-4" aria-hidden />
                Export All Reports
              </Button>
              <Link href={data.actionState.scheduleHref}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="bg-white"
                  disabled={!data.actionState.canScheduleReports}
                >
                  <Calendar className="size-4" aria-hidden />
                  Schedule Reports
                </Button>
              </Link>
              <Button
                type="button"
                size="lg"
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                disabled={!data.actionState.canRefreshReports}
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

function formatCountWithPercent(count: number, total: number): string {
  if (total <= 0) return `${count}`;
  const pct = Math.round((count / total) * 100);
  return `${count} (${pct}%)`;
}

function formatPercentWithCount(percent: number, count: number): string {
  return `${percent}% (${count})`;
}

function computePartialPercent(t: ReportsPageData["reports"]["traceability"]): number {
  const total = t.completeLinks + t.partialLinks + t.missingLinks;
  if (total <= 0) return 0;
  return Math.round((t.partialLinks / total) * 100);
}

function computeMissingPercent(t: ReportsPageData["reports"]["traceability"]): number {
  const total = t.completeLinks + t.partialLinks + t.missingLinks;
  if (total <= 0) return 0;
  return Math.round((t.missingLinks / total) * 100);
}
