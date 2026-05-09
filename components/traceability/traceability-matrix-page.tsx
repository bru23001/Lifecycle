"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CircleHelp, Filter, Info, RefreshCw } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { coverageStatusBadgeMap, gateTraceStatusBadgeMap, impactBadgeMap } from "@/lib/coverage-status";
import { exportTraceabilityMatrix } from "@/lib/traceability-export";
import { cn } from "@/lib/utils";
import type {
  ArtifactGateCoverage,
  CoverageStatus,
  EvidenceApprovalCoverage,
  GateEvidenceCoverage,
  PhaseArtifactCoverage,
  RequirementDesignCoverage,
  RequirementTestCoverage,
  TraceabilityGap,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

const toneClass: Record<"gray" | "green" | "amber" | "red", string> = {
  gray: "border-slate-200 bg-slate-50 text-slate-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-800",
};

const gapTabConfig = [
  { id: "requirement_gap", label: "Requirement Gaps" },
  { id: "design_orphan", label: "Design Orphans" },
  { id: "test_orphan", label: "Test Orphans" },
  { id: "evidence_orphan", label: "Evidence Orphans" },
] as const;

type GapTabId = (typeof gapTabConfig)[number]["id"];

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof toneClass;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
      {label}
    </span>
  );
}

function CoverageProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClassName = clamped >= 80 ? "bg-emerald-500" : clamped >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full transition-[width]", toneClassName)} style={{ width: `${clamped}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-slate-600">{Math.round(clamped)}%</span>
    </div>
  );
}

function CoverageRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="grid size-28 place-items-center rounded-full border-8 border-white bg-white shadow-sm"
      style={{
        backgroundImage: `conic-gradient(#16a34a ${clamped}%, #e2e8f0 ${clamped}% 100%)`,
      }}
      role="img"
      aria-label={`Overall coverage ${clamped}%`}
    >
      <div className="grid size-20 place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900">{clamped}%</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Overall</p>
        </div>
      </div>
    </div>
  );
}

function CardShell({
  title,
  count,
  viewAllHref,
  children,
}: {
  title: string;
  count: number;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="traceability-card min-w-0 rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{count}</span>
        </div>
        <Link href={viewAllHref} className="text-xs font-semibold text-[#2563eb] hover:underline">
          View All
        </Link>
      </header>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function EmptyState({
  message,
  ctaLabel,
  ctaHref,
  tone = "default",
}: {
  message: string;
  ctaLabel: string;
  ctaHref: string;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-5 text-sm",
        tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      <p>{message}</p>
      <Link href={ctaHref} className="mt-2 inline-flex items-center gap-1 font-semibold text-[#2563eb] hover:underline">
        {ctaLabel}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

function tableRowClass() {
  return "border-b border-slate-100 last:border-b-0";
}

type FilterState = TraceabilityMatrixData["filters"];

function applyStatusFilter<T extends { status: CoverageStatus }>(rows: T[], status: FilterState["status"]) {
  if (!status || status === "all" || status === "orphaned") return rows;
  return rows.filter((row) => row.status === status);
}

function applyPhaseFilter(rows: PhaseArtifactCoverage[], phaseNumber: FilterState["phaseNumber"]) {
  if (!phaseNumber || phaseNumber === "all") return rows;
  return rows.filter((row) => row.phaseNumber === phaseNumber);
}

function applyObjectFilter(
  rows: TraceabilityGap[],
  objectType: FilterState["objectType"],
  activeTab: GapTabId,
  status: FilterState["status"],
) {
  let filtered = rows;
  if (status === "orphaned") {
    filtered = filtered.filter(
      (row) => row.type === "design_orphan" || row.type === "test_orphan" || row.type === "evidence_orphan",
    );
  }
  filtered = filtered.filter((row) => row.type === activeTab || (activeTab === "requirement_gap" && row.type === "broken_link"));
  if (!objectType || objectType === "all") return filtered;
  switch (objectType) {
    case "design":
      return filtered.filter((row) => row.type === "design_orphan");
    case "test":
      return filtered.filter((row) => row.type === "test_orphan");
    case "evidence":
      return filtered.filter((row) => row.type === "evidence_orphan");
    case "requirement":
      return filtered.filter((row) => row.type === "requirement_gap");
    default:
      return filtered;
  }
}

function cardVisible(
  viewMode: FilterState["viewMode"],
  card:
    | "phase"
    | "req-design"
    | "req-test"
    | "gate"
    | "artifact-gate"
    | "evidence-approval"
    | "gaps"
    | "coverage",
) {
  if (viewMode === "all_links") return true;
  if (viewMode === "requirements") return card === "req-design" || card === "req-test" || card === "gaps" || card === "coverage";
  if (viewMode === "phases")
    return card === "phase" || card === "artifact-gate" || card === "gate" || card === "coverage";
  if (viewMode === "gates")
    return card === "gate" || card === "artifact-gate" || card === "evidence-approval" || card === "gaps" || card === "coverage";
  if (viewMode === "gaps") return card === "gaps" || card === "coverage";
  return true;
}

export function TraceabilityMatrixPage({ initial }: { initial: TraceabilityMatrixData }) {
  const [filters, setFilters] = useState<FilterState>(initial.filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeGapTab, setActiveGapTab] = useState<GapTabId>("requirement_gap");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const filteredPhaseRows = useMemo(
    () => applyStatusFilter(applyPhaseFilter(initial.phaseArtifactLinks, filters.phaseNumber), filters.status),
    [filters.phaseNumber, filters.status, initial.phaseArtifactLinks],
  );

  const filteredReqDesignRows = useMemo(
    () => applyStatusFilter(initial.requirementDesignLinks, filters.status),
    [initial.requirementDesignLinks, filters.status],
  );

  const filteredReqTestRows = useMemo(
    () => applyStatusFilter(initial.requirementTestLinks, filters.status),
    [initial.requirementTestLinks, filters.status],
  );

  const filteredGateRows = useMemo(
    () => applyStatusFilter(initial.gateEvidenceLinks, filters.status),
    [initial.gateEvidenceLinks, filters.status],
  );

  const filteredArtifactGateRows = useMemo(
    () => applyStatusFilter(initial.artifactGateLinks, filters.status),
    [filters.status, initial.artifactGateLinks],
  );

  const filteredEvidenceApprovalRows = useMemo(
    () => applyStatusFilter(initial.evidenceApprovalLinks, filters.status),
    [filters.status, initial.evidenceApprovalLinks],
  );

  const filteredGapRows = useMemo(
    () => applyObjectFilter(initial.traceabilityGaps, filters.objectType, activeGapTab, filters.status),
    [activeGapTab, filters.objectType, filters.status, initial.traceabilityGaps],
  );

  const onFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setIsLoading(true);
    setHasError(false);
    window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setIsLoading(false);
    }, 200);
  };

  const retryLoad = () => {
    setHasError(false);
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 220);
  };

  return (
    <AuthenticatedAppShell
      projectId={initial.project.id}
      projectName={initial.project.name}
      phaseSummary="Traceability matrix coverage"
      phaseProgressPct={initial.coverageSummary.overallCoveragePercent}
      navActive="traceability"
    >
      <TopHeader
        title="Traceability Matrix"
        userInitials={initial.user.initials}
        notificationCount={6}
        actionButtonLabel="Export Matrix"
        actionButtonAriaLabel="Export traceability matrix"
        onActionButtonClick={() => exportTraceabilityMatrix(initial, "csv")}
      />

      <main className="traceability-matrix flex min-h-0 flex-1 flex-col bg-[#f8fafc] dark:bg-background">
        <div className="mx-auto flex w-full max-w-[1920px] flex-1 flex-col overflow-y-auto px-5 pb-8 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${initial.project.name} (${initial.project.code})`, href: `/projects/${initial.project.id}` },
              { label: "Traceability Matrix" },
            ]}
          />

          <section className="traceability-filter-bar mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 min-[901px]:grid-cols-2 min-[1281px]:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
            <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                value={filters.projectId}
                onChange={(event) => onFilterChange("projectId", event.target.value)}
              >
                <option value={initial.project.id}>
                  {initial.project.name} ({initial.project.code})
                </option>
                <option value="ccm-002">Cloud Cost Manager (CCM-002)</option>
                <option value="crm-003">Compliance Risk Monitor (CRM-003)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">View Mode</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                value={filters.viewMode}
                onChange={(event) => onFilterChange("viewMode", event.target.value as FilterState["viewMode"])}
              >
                <option value="all_links">All Links</option>
                <option value="requirements">Requirements</option>
                <option value="phases">Phases</option>
                <option value="gates">Gates</option>
                <option value="gaps">Gaps</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phase</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                value={String(filters.phaseNumber ?? "all")}
                onChange={(event) =>
                  onFilterChange(
                    "phaseNumber",
                    event.target.value === "all" ? "all" : Number.parseInt(event.target.value, 10),
                  )
                }
              >
                <option value="all">All Phases</option>
                <option value="1">Phase 1</option>
                <option value="2">Phase 2</option>
                <option value="3">Phase 3</option>
                <option value="4">Phase 4</option>
                <option value="5">Phase 5</option>
                <option value="6">Phase 6</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                value={filters.status ?? "all"}
                onChange={(event) => onFilterChange("status", event.target.value as FilterState["status"])}
              >
                <option value="all">All Statuses</option>
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
                <option value="missing">Missing</option>
                <option value="orphaned">Orphaned</option>
              </select>
            </label>

            <div className="flex items-end justify-between gap-3 min-[1281px]:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="gap-2"
                aria-label="Open advanced traceability filters"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
              >
                <Filter className="size-4" aria-hidden />
                More Filters
              </Button>
              <p className="text-xs text-slate-500">Last Updated: {filters.lastUpdatedLabel}</p>
            </div>

            {showAdvancedFilters ? (
              <div className="col-span-full grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 min-[901px]:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Object Type</span>
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                    value={filters.objectType ?? "all"}
                    onChange={(event) => onFilterChange("objectType", event.target.value as FilterState["objectType"])}
                  >
                    <option value="all">All Objects</option>
                    <option value="phase">Phase</option>
                    <option value="artifact">Artifact</option>
                    <option value="requirement">Requirement</option>
                    <option value="design">Design</option>
                    <option value="test">Test</option>
                    <option value="gate">Gate</option>
                    <option value="evidence">Evidence</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Export Format</span>
                  <div className="flex h-10 items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => exportTraceabilityMatrix(initial, "csv")}>
                      CSV
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => exportTraceabilityMatrix(initial, "json")}>
                      JSON
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => exportTraceabilityMatrix(initial, "pdf")}>
                      PDF
                    </Button>
                  </div>
                </label>
              </div>
            ) : null}
          </section>

          {hasError ? (
            <section className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4" aria-hidden />
                <p>Unable to load traceability data right now. Your filters were preserved.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="bg-white" onClick={retryLoad}>
                <RefreshCw className="size-3.5" aria-hidden />
                Retry
              </Button>
            </section>
          ) : null}

          <section className="traceability-grid mt-5 grid grid-cols-1 gap-5 min-[901px]:grid-cols-2 min-[1281px]:grid-cols-3">
            {cardVisible(filters.viewMode, "phase") ? (
              <CardShell
                title="Phase → Artifact Links"
                count={filteredPhaseRows.length}
                viewAllHref={`/projects/${initial.project.id}/traceability/phase-artifacts`}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : filteredPhaseRows.length === 0 ? (
                  <EmptyState
                    message="No phase-to-artifact links found."
                    ctaLabel="Open Artifact Library"
                    ctaHref={`/projects/${initial.project.id}/workspace`}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-2">Phase</th>
                          <th className="pb-2">Linked</th>
                          <th className="pb-2">Total</th>
                          <th className="pb-2">Coverage</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPhaseRows.map((row) => (
                          <tr key={row.phaseId} className={tableRowClass()}>
                            <td className="py-2">
                              <Link href={row.href} className="rounded font-medium text-slate-800 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
                                {row.phaseNumber} {row.phaseName}
                              </Link>
                            </td>
                            <td className="py-2 text-slate-700">{row.artifactsLinked}</td>
                            <td className="py-2 text-slate-700">{row.totalArtifactsRequired}</td>
                            <td className="py-2">
                              <CoverageProgressBar value={row.coveragePercent} label={`${row.phaseName} artifact coverage`} />
                            </td>
                            <td className="py-2">
                              <StatusBadge {...coverageStatusBadgeMap[row.status]} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardShell>
            ) : null}

            {cardVisible(filters.viewMode, "req-design") ? (
              <CardShell
                title="Requirement → Design Links"
                count={filteredReqDesignRows.length}
                viewAllHref={`/projects/${initial.project.id}/traceability/requirements-design`}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : filteredReqDesignRows.length === 0 ? (
                  <EmptyState
                    message="No requirement-to-design links found."
                    ctaLabel="Open Requirements"
                    ctaHref={`/projects/${initial.project.id}/requirements`}
                  />
                ) : (
                  <RequirementCoverageTable kind="design" rows={filteredReqDesignRows} />
                )}
              </CardShell>
            ) : null}

            {cardVisible(filters.viewMode, "req-test") ? (
              <CardShell
                title="Requirement → Test Links"
                count={filteredReqTestRows.length}
                viewAllHref={`/projects/${initial.project.id}/traceability/requirements-tests`}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : filteredReqTestRows.length === 0 ? (
                  <EmptyState
                    message="No requirement-to-test links found."
                    ctaLabel="Open Test Coverage"
                    ctaHref={`/projects/${initial.project.id}/traceability/requirements-tests`}
                  />
                ) : (
                  <RequirementCoverageTable kind="test" rows={filteredReqTestRows} />
                )}
              </CardShell>
            ) : null}

            {cardVisible(filters.viewMode, "gate") ? (
              <CardShell
                title="Gate → Evidence Links"
                count={filteredGateRows.length}
                viewAllHref={`/projects/${initial.project.id}/traceability/gate-evidence`}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : filteredGateRows.length === 0 ? (
                  <EmptyState
                    message="No gate-to-evidence links found."
                    ctaLabel="Open Gate Review"
                    ctaHref={`/projects/${initial.project.id}/gates/g1/review`}
                  />
                ) : (
                  <GateEvidenceTable rows={filteredGateRows} />
                )}
              </CardShell>
            ) : null}

            {cardVisible(filters.viewMode, "artifact-gate") ? (
              <CardShell
                title="Artifact → Gate Links"
                count={filteredArtifactGateRows.length}
                viewAllHref={`/projects/${initial.project.id}/artifacts`}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : filteredArtifactGateRows.length === 0 ? (
                  <EmptyState
                    message="No artifact-to-gate links found."
                    ctaLabel="Open Artifacts"
                    ctaHref={`/projects/${initial.project.id}/artifacts`}
                  />
                ) : (
                  <ArtifactGateTable rows={filteredArtifactGateRows} />
                )}
              </CardShell>
            ) : null}

            {cardVisible(filters.viewMode, "evidence-approval") ? (
              <CardShell
                title="Evidence → Approval Links"
                count={filteredEvidenceApprovalRows.length}
                viewAllHref={`/projects/${initial.project.id}/evidence`}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : filteredEvidenceApprovalRows.length === 0 ? (
                  <EmptyState
                    message="No evidence-to-approval links found."
                    ctaLabel="Open Evidence Center"
                    ctaHref={`/projects/${initial.project.id}/evidence`}
                  />
                ) : (
                  <EvidenceApprovalTable rows={filteredEvidenceApprovalRows} />
                )}
              </CardShell>
            ) : null}

            {cardVisible(filters.viewMode, "gaps") ? (
              <CardShell title="Gaps / Orphans" count={filteredGapRows.length} viewAllHref={initial.coverageSummary.reportHref}>
                <div role="tablist" aria-label="Gap categories" className="mb-3 flex flex-wrap gap-2">
                  {gapTabConfig.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeGapTab === tab.id}
                      aria-controls={`gap-tab-${tab.id}`}
                      id={`gap-tab-button-${tab.id}`}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                        activeGapTab === tab.id
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                      onClick={() => setActiveGapTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div role="tabpanel" id={`gap-tab-${activeGapTab}`} aria-labelledby={`gap-tab-button-${activeGapTab}`}>
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 animate-pulse rounded bg-slate-100" />
                      <div className="h-8 animate-pulse rounded bg-slate-100" />
                      <div className="h-8 animate-pulse rounded bg-slate-100" />
                    </div>
                  ) : filteredGapRows.length === 0 ? (
                    <EmptyState
                      message="No gaps or orphan records found."
                      ctaLabel="Open Coverage Report"
                      ctaHref={initial.coverageSummary.reportHref}
                      tone="success"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[540px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="pb-2">Type</th>
                            <th className="pb-2">ID / Name</th>
                            <th className="pb-2">Issue</th>
                            <th className="pb-2">Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredGapRows.map((row) => (
                            <tr key={row.id} className={tableRowClass()}>
                              <td className="py-2 capitalize text-slate-700">{row.type.replaceAll("_", " ")}</td>
                              <td className="py-2">
                                <Link href={row.href} className="rounded font-medium text-slate-800 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
                                  {row.objectId}
                                </Link>
                                <p className="text-xs text-slate-500">{row.objectName}</p>
                              </td>
                              <td className="py-2 text-slate-700">{row.issue}</td>
                              <td className="py-2">
                                <StatusBadge {...impactBadgeMap[row.impact]} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardShell>
            ) : null}

            {cardVisible(filters.viewMode, "coverage") ? (
              <section className="traceability-card min-w-0 rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <header className="border-b border-[#eef2f7] px-4 py-3">
                  <h2 className="text-[15px] font-semibold text-slate-900">Coverage Summary</h2>
                </header>
                <div className="space-y-4 px-4 py-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-28 animate-pulse rounded bg-slate-100" />
                      <div className="h-24 animate-pulse rounded bg-slate-100" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <CoverageRing percent={initial.coverageSummary.overallCoveragePercent} />
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <StatusBadge {...coverageStatusBadgeMap.complete} />
                            <span>{initial.coverageSummary.complete.percent}% ({initial.coverageSummary.complete.count})</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <StatusBadge {...coverageStatusBadgeMap.partial} />
                            <span>{initial.coverageSummary.partial.percent}% ({initial.coverageSummary.partial.count})</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <StatusBadge {...coverageStatusBadgeMap.missing} />
                            <span>{initial.coverageSummary.missing.percent}% ({initial.coverageSummary.missing.count})</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <StatusBadge {...coverageStatusBadgeMap.orphaned} />
                            <span>({initial.coverageSummary.orphaned.count})</span>
                          </li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm min-[901px]:grid-cols-3">
                        <MetricTile label="Total Requirements" value={initial.coverageSummary.totals.requirements} />
                        <MetricTile label="Total Designs" value={initial.coverageSummary.totals.designs} />
                        <MetricTile label="Total Tests" value={initial.coverageSummary.totals.tests} />
                        <MetricTile label="Total Evidence Items" value={initial.coverageSummary.totals.evidenceItems} />
                        <MetricTile label="Total Gates" value={initial.coverageSummary.totals.gates} />
                        <MetricTile label="Total Artifacts" value={initial.coverageSummary.totals.artifacts} />
                      </div>

                      <Link href={initial.coverageSummary.reportHref} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline">
                        View Coverage Report
                        <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    </>
                  )}
                </div>
              </section>
            ) : null}
          </section>

          <section className="traceability-action-bar mt-5 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 min-[901px]:flex-row min-[901px]:items-center">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid size-7 place-items-center rounded-full bg-white text-blue-700">
                <Info className="size-4" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{initial.actionState.title}</p>
                <p className="text-sm text-slate-600">{initial.actionState.description}</p>
              </div>
            </div>
            <Link href={initial.actionState.href}>
              <Button size="lg" className="gap-2" aria-label="Open detailed traceability report">
                {initial.actionState.ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Link>
          </section>

          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <CircleHelp className="size-3.5" aria-hidden />
            Export includes matrix status in CSV/JSON/PDF package format.
          </p>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}

function ArtifactGateTable({ rows }: { rows: ArtifactGateCoverage[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-2">Artifact</th>
            <th className="pb-2">Gate</th>
            <th className="pb-2">Trace status</th>
            <th className="pb-2">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={tableRowClass()}>
              <td className="py-2">
                <Link href={row.href} className="font-medium text-slate-800 hover:text-blue-700">
                  {row.artifactLocalId}
                </Link>
                <p className="text-xs text-slate-500">{row.artifactTitle}</p>
              </td>
              <td className="py-2 text-slate-700">
                {row.gateCode} · {row.gateName}
              </td>
              <td className="py-2">
                <StatusBadge {...coverageStatusBadgeMap[row.status]} />
              </td>
              <td className="py-2">
                <Link href={row.detailHref} className="text-sm font-semibold text-[#2563eb] hover:underline">
                  View link
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const approvalDecisionLabel: Record<EvidenceApprovalCoverage["approvalStatus"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested",
};

function EvidenceApprovalTable({ rows }: { rows: EvidenceApprovalCoverage[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-2">Evidence</th>
            <th className="pb-2">Approval</th>
            <th className="pb-2">Decision</th>
            <th className="pb-2">Coverage</th>
            <th className="pb-2">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={tableRowClass()}>
              <td className="py-2">
                <Link href={row.href} className="font-medium text-slate-800 hover:text-blue-700">
                  {row.evidenceLabel}
                </Link>
              </td>
              <td className="py-2 text-slate-700">{row.approvalTitle}</td>
              <td className="py-2">
                <span className="text-xs font-semibold text-slate-700">{approvalDecisionLabel[row.approvalStatus]}</span>
              </td>
              <td className="py-2">
                <StatusBadge {...coverageStatusBadgeMap[row.status]} />
              </td>
              <td className="py-2">
                <Link href={row.detailHref} className="text-sm font-semibold text-[#2563eb] hover:underline">
                  View link
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequirementCoverageTable({
  kind,
  rows,
}: {
  kind: "design" | "test";
  rows: RequirementDesignCoverage[] | RequirementTestCoverage[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-2">Requirement Type</th>
            <th className="pb-2">Requirements</th>
            <th className="pb-2">{kind === "design" ? "Design Links" : "Test Links"}</th>
            <th className="pb-2">Coverage</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.requirementType} className={tableRowClass()}>
              <td className="py-2">
                <Link href={row.href} className="rounded font-medium text-slate-800 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
                  {row.label}
                </Link>
              </td>
              <td className="py-2 text-slate-700">{row.requirementsTotal}</td>
              <td className="py-2 text-slate-700">
                {"designLinksTotal" in row ? row.designLinksTotal : row.testLinksTotal}
              </td>
              <td className="py-2">
                <CoverageProgressBar value={row.coveragePercent} label={`${row.label} ${kind} coverage`} />
              </td>
              <td className="py-2">
                <StatusBadge {...coverageStatusBadgeMap[row.status]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GateEvidenceTable({ rows }: { rows: GateEvidenceCoverage[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-2">Gate</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Evidence</th>
            <th className="pb-2">Required</th>
            <th className="pb-2">Coverage</th>
            <th className="pb-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.gateId} className={tableRowClass()}>
              <td className="py-2 text-slate-800">
                <p className="font-medium">
                  {row.gateCode} - {row.gateName}
                </p>
              </td>
              <td className="py-2">
                <StatusBadge {...gateTraceStatusBadgeMap[row.gateStatus]} />
              </td>
              <td className="py-2 text-slate-700">{row.evidenceLinked}</td>
              <td className="py-2 text-slate-700">{row.requiredEvidence}</td>
              <td className="py-2">
                <CoverageProgressBar value={row.coveragePercent} label={`${row.gateCode} evidence coverage`} />
              </td>
              <td className="py-2">
                <Link href={row.href} className="rounded text-sm font-semibold text-[#2563eb] hover:underline focus-visible:outline-2 focus-visible:outline-blue-600">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
