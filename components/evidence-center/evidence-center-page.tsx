"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Info,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Star,
} from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { exportEvidenceBundle } from "@/lib/evidence-export";
import { evidenceClassificationBadgeMap, evidenceCoverageBadgeMap, evidenceStatusBadgeMap } from "@/lib/evidence-status";
import { cn } from "@/lib/utils";
import type {
  EvidenceByArtifact,
  EvidenceByGate,
  EvidenceByPhase,
  EvidenceCenterData,
  EvidenceItem,
} from "@/types/evidence-center.types";

type EvidenceFilters = {
  search: string;
  type: "all" | EvidenceItem["evidenceType"];
  phase: "all" | string;
  gate: "all" | string;
  sort: "updated" | "uploaded" | "completeness" | "status" | "name";
};

type EvidenceTab = "overview" | "linked_artifacts" | "linked_gates" | "history" | "comments";

const toneClass: Record<"green" | "amber" | "red" | "blue" | "gray", string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
};

const pagination = { page: 1, totalPages: 12 };

function Badge({ label, tone }: { label: string; tone: keyof typeof toneClass }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
      {label}
    </span>
  );
}

function byStatusRank(status: EvidenceItem["status"]) {
  if (status === "linked") return 3;
  if (status === "partially_linked") return 2;
  if (status === "unlinked") return 1;
  return 0;
}

function sortedItems(items: EvidenceItem[], sort: EvidenceFilters["sort"]) {
  const cloned = [...items];
  switch (sort) {
    case "name":
      return cloned.sort((a, b) => a.name.localeCompare(b.name));
    case "status":
      return cloned.sort((a, b) => byStatusRank(b.status) - byStatusRank(a.status));
    case "completeness":
      return cloned.sort((a, b) => b.completenessPercent - a.completenessPercent);
    case "uploaded":
      return cloned.sort((a, b) => b.uploadedOnLabel.localeCompare(a.uploadedOnLabel));
    case "updated":
      return cloned.sort((a, b) => b.uploadedOnLabel.localeCompare(a.uploadedOnLabel));
    default: {
      const neverSort: never = sort;
      throw new Error(`Unsupported sort: ${String(neverSort)}`);
    }
  }
}

function applyFilters(items: EvidenceItem[], filters: EvidenceFilters) {
  const filtered = items.filter((row) => {
    const haystack =
      `${row.evidenceCode} ${row.name} ${row.evidenceType} ${row.phaseName ?? ""} ${row.gateCode ?? ""} ${row.uploadedBy} ${row.status}`.toLowerCase();
    const matchesSearch = filters.search.trim().length === 0 || haystack.includes(filters.search.toLowerCase().trim());
    const matchesType = filters.type === "all" || row.evidenceType === filters.type;
    const matchesPhase = filters.phase === "all" || String(row.phaseNumber ?? "") === filters.phase;
    const matchesGate = filters.gate === "all" || row.gateCode === filters.gate;
    return matchesSearch && matchesType && matchesPhase && matchesGate;
  });
  return sortedItems(filtered, filters.sort);
}

function CompletionRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid size-20 place-items-center rounded-full border-8 border-white bg-white"
        style={{
          backgroundImage: `conic-gradient(#16a34a ${clamped}%, #e2e8f0 ${clamped}% 100%)`,
        }}
        role="progressbar"
        aria-label="Evidence completeness"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="grid size-14 place-items-center rounded-full bg-white">
          <span className="text-lg font-semibold text-slate-900">{clamped}%</span>
        </div>
      </div>
      <p className="text-sm text-slate-700">Complete</p>
    </div>
  );
}

function CoverageRow({
  label,
  linked,
  required,
  coveragePercent,
  status,
  href,
}: {
  label: string;
  linked: number;
  required: number;
  coveragePercent: number;
  status: EvidenceByGate["status"] | EvidenceByPhase["status"] | EvidenceByArtifact["status"];
  href: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-2">
        <Link href={href} className="font-medium text-slate-800 hover:text-blue-700 hover:underline">
          {label}
        </Link>
      </td>
      <td className="py-2 text-slate-700">{linked}</td>
      <td className="py-2 text-slate-700">{required}</td>
      <td className="py-2 text-slate-700">{coveragePercent}%</td>
      <td className="py-2">
        <Badge {...evidenceCoverageBadgeMap[status]} />
      </td>
    </tr>
  );
}

export function EvidenceCenterPage({
  initial,
  selectedEvidenceId,
}: {
  initial: EvidenceCenterData;
  selectedEvidenceId?: string;
}) {
  const router = useRouter();
  const initialSelectedId =
    selectedEvidenceId && initial.evidencePackages[selectedEvidenceId]
      ? selectedEvidenceId
      : initial.selectedEvidence.detail.id;
  const [filters, setFilters] = useState<EvidenceFilters>({
    search: "",
    type: "all",
    phase: "all",
    gate: "all",
    sort: "updated",
  });
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [selectedTab, setSelectedTab] = useState<EvidenceTab>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedForExport, setSelectedForExport] = useState<string[]>([initialSelectedId]);

  const selectedEvidence = initial.evidencePackages[selectedId];

  const filteredItems = useMemo(() => applyFilters(initial.evidenceItems, filters), [initial.evidenceItems, filters]);

  const onSelectEvidence = (evidenceId: string) => {
    if (!initial.evidencePackages[evidenceId]) {
      setError("Unable to load evidence detail. Please retry.");
      return;
    }
    setError(null);
    setIsLoading(true);
    window.setTimeout(() => {
      setSelectedId(evidenceId);
      setSelectedForExport((prev) => (prev.includes(evidenceId) ? prev : [evidenceId, ...prev]));
      setSelectedTab("overview");
      setIsLoading(false);
      router.push(`/projects/${initial.project.id}/evidence/${evidenceId}`);
    }, 120);
  };

  const onRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const runExport = async (
    scope: "selected" | "gate" | "full",
    ids: string[],
  ) => {
    setError(null);
    try {
      await exportEvidenceBundle(initial, scope, ids);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  };

  const onToggleExportSelection = (evidenceId: string) => {
    setSelectedForExport((prev) => (prev.includes(evidenceId) ? prev.filter((id) => id !== evidenceId) : [...prev, evidenceId]));
  };

  return (
    <AuthenticatedAppShell
      projectId={initial.project.id}
      projectName={initial.project.name}
      phaseSummary={`Evidence readiness: ${selectedEvidence.completeness.overallPercent}%`}
      phaseProgressPct={selectedEvidence.completeness.overallPercent}
      navActive="evidence"
    >
      <TopHeader
        title="Evidence Center"
        userInitials={initial.user.initials}
        notificationCount={6}
        actionButtonLabel="Export Bundle"
        actionButtonAriaLabel="Export evidence bundle"
        onActionButtonClick={() => void runExport("full", selectedForExport)}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc] dark:bg-background">
        <div className="mx-auto w-full max-w-[1920px] px-5 pb-3 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/dashboard" },
              { label: "Evidence Center", href: `/projects/${initial.project.id}/evidence` },
              { label: `${initial.project.name} (${initial.project.code})` },
            ]}
          />
        </div>

        {error ? (
          <div className="mx-auto mb-3 w-full max-w-[1920px] px-5 min-[901px]:px-8">
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              <p>{error}</p>
              <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            </div>
          </div>
        ) : null}

        <div className="evidence-center mx-auto w-full max-w-[1920px] flex-1 overflow-y-auto px-5 pb-6 min-[901px]:px-8">
          <section className="evidence-items-panel min-w-0 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#111827]">Evidence Items</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {filteredItems.length}
                </span>
              </div>
              <Button type="button" size="sm" className="gap-1.5">
                <Plus className="size-3.5" aria-hidden />
                Add Evidence
              </Button>
            </header>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Search evidence..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search evidence"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.type}
                onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value as EvidenceFilters["type"] }))}
                aria-label="Filter evidence type"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="spreadsheet">Spreadsheet</option>
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="link">Link</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
                <option value="report">Report</option>
              </select>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.phase}
                onChange={(event) => setFilters((prev) => ({ ...prev, phase: event.target.value }))}
                aria-label="Filter evidence by phase"
              >
                <option value="all">All Phases</option>
                <option value="1">Phase 1</option>
                <option value="2">Phase 2</option>
                <option value="3">Phase 3</option>
                <option value="4">Phase 4</option>
              </select>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.gate}
                onChange={(event) => setFilters((prev) => ({ ...prev, gate: event.target.value }))}
                aria-label="Filter evidence by gate"
              >
                <option value="all">All Gates</option>
                <option value="G1">G1</option>
                <option value="G2">G2</option>
                <option value="G3">G3</option>
                <option value="G4">G4</option>
              </select>
              <Button type="button" variant="outline" size="sm" className="h-8 justify-start gap-1.5">
                <Filter className="size-3.5" aria-hidden />
                More Filters
              </Button>
            </div>

            <div className="mt-2">
              <select
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.sort}
                onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value as EvidenceFilters["sort"] }))}
                aria-label="Sort evidence list"
              >
                <option value="updated">Sort: Last Updated</option>
                <option value="uploaded">Sort: Uploaded Date</option>
                <option value="completeness">Sort: Completeness</option>
                <option value="status">Sort: Status</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>

            {isLoading ? (
              <div className="mt-3 space-y-2">
                <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>No evidence has been added for this project.</p>
                <Button type="button" size="sm" className="mt-2">
                  Add First Evidence Item
                </Button>
              </div>
            ) : (
              <ul className="mt-3 space-y-2" role="listbox" aria-label="Evidence items">
                {filteredItems.map((row) => {
                  const selected = row.id === selectedId;
                  const checked = selectedForExport.includes(row.id);
                  return (
                    <li key={row.id}>
                      <div
                        role="option"
                        tabIndex={0}
                        aria-selected={selected}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400",
                          selected
                            ? "border-blue-300 bg-blue-50 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        )}
                        onClick={() => onSelectEvidence(row.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectEvidence(row.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{row.name}</p>
                            <p className="text-xs text-slate-500">
                              Phase {row.phaseNumber ?? "—"} • {row.gateCode ?? "—"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleExportSelection(row.id);
                            }}
                            aria-label={`${checked ? "Deselect" : "Select"} ${row.name} for export`}
                          >
                            {checked ? "Selected" : "Select"}
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-500">Uploaded {row.uploadedOnLabel}</p>
                          <Badge {...evidenceStatusBadgeMap[row.status]} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
              <button type="button" className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-slate-100">
                <ChevronLeft className="size-3.5" aria-hidden />
                Prev
              </button>
              <span>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button type="button" className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-slate-100">
                Next
                <ChevronRight className="size-3.5" aria-hidden />
              </button>
            </div>
          </section>

          <section className="evidence-detail-panel min-w-0">
            {!selectedEvidence ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                <p>Select an evidence item to view details.</p>
              </div>
            ) : (
              <>
                <article className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="grid size-11 place-items-center rounded-xl bg-red-100 text-red-700">
                        <FileText className="size-5" aria-hidden />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-[#111827]">{selectedEvidence.detail.name}</h2>
                          <Badge {...evidenceStatusBadgeMap[selectedEvidence.detail.status]} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{selectedEvidence.detail.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="icon-sm" aria-label="Star evidence">
                        <Star className="size-4" aria-hidden />
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="gap-1.5" aria-label="Share evidence">
                        <Share2 className="size-3.5" aria-hidden />
                        Share
                      </Button>
                      <Button type="button" variant="outline" size="icon-sm" aria-label="More evidence actions">
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </header>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm min-[1024px]:grid-cols-5">
                    <MetaItem label="Project" value={selectedEvidence.detail.projectName} />
                    <MetaItem
                      label="Phase"
                      value={
                        selectedEvidence.detail.phaseNumber && selectedEvidence.detail.phaseName
                          ? `${selectedEvidence.detail.phaseNumber}. ${selectedEvidence.detail.phaseName}`
                          : "—"
                      }
                    />
                    <MetaItem
                      label="Gate"
                      value={
                        selectedEvidence.detail.gateCode && selectedEvidence.detail.gateName
                          ? `${selectedEvidence.detail.gateCode} ${selectedEvidence.detail.gateName}`
                          : "—"
                      }
                    />
                    <MetaItem label="Uploaded By" value={selectedEvidence.detail.uploadedBy} />
                    <MetaItem label="Uploaded On" value={selectedEvidence.detail.uploadedOnLabel} />
                    <MetaItem label="File Type" value={selectedEvidence.detail.fileTypeLabel} />
                    <MetaItem label="File Size" value={selectedEvidence.detail.fileSizeLabel ?? "—"} />
                    <MetaItem label="Evidence ID" value={selectedEvidence.detail.evidenceCode} />
                    <MetaItem label="Status" value={evidenceStatusBadgeMap[selectedEvidence.detail.status].label} />
                  </dl>
                </article>

                <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
                  <div role="tablist" aria-label="Evidence detail tabs" className="mb-3 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                    {(
                      [
                        ["overview", "Overview"],
                        ["linked_artifacts", `Linked Artifacts (${selectedEvidence.linkedArtifacts.length})`],
                        ["linked_gates", `Linked Gates (${selectedEvidence.linkedGates.length})`],
                        ["history", "History"],
                        ["comments", `Comments (${selectedEvidence.comments.length})`],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        id={`evidence-tab-${id}`}
                        aria-controls={`evidence-tabpanel-${id}`}
                        aria-selected={selectedTab === id}
                        onClick={() => setSelectedTab(id)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                          selectedTab === id
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div
                    role="tabpanel"
                    id={`evidence-tabpanel-${selectedTab}`}
                    aria-labelledby={`evidence-tab-${selectedTab}`}
                  >
                    {selectedTab === "overview" && (
                      <div className="space-y-3">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <h3 className="text-sm font-semibold text-slate-800">File Preview</h3>
                          {selectedEvidence.detail.evidenceType === "pdf" ? (
                            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
                              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                                <span>Preview 1 / 18</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    className="rounded border border-slate-200 bg-white px-2 py-0.5"
                                    aria-label="Zoom out preview"
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded border border-slate-200 bg-white px-2 py-0.5"
                                    aria-label="Zoom in preview"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded border border-slate-200 bg-white px-2 py-0.5"
                                    aria-label="Download evidence file"
                                  >
                                    <Download className="size-3.5" aria-hidden />
                                  </button>
                                </div>
                              </div>
                              <div className="h-56 rounded-md border border-slate-100 bg-white p-4">
                                <p className="text-lg font-semibold text-slate-800">Market Research Report</p>
                                <p className="mt-2 text-sm text-slate-600">
                                  Preview excerpt. Open download for full source document.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                              <p>Preview is not available for this evidence type.</p>
                              {selectedEvidence.detail.downloadHref ? (
                                <Button type="button" variant="outline" size="sm" className="mt-2">
                                  Download File
                                </Button>
                              ) : null}
                            </div>
                          )}
                        </section>

                        <section className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                          <MetaItem label="Evidence Type" value={selectedEvidence.detail.name} />
                          <MetaItem label="Source" value={selectedEvidence.detail.source ?? "—"} />
                          <MetaItem label="Classification" value={evidenceClassificationBadgeMap[selectedEvidence.detail.classification].label} />
                          <MetaItem label="Retention Policy" value={selectedEvidence.detail.retentionPolicyLabel ?? "—"} />
                          <MetaItem label="Checksum" value={selectedEvidence.detail.checksum ?? "—"} />
                          <MetaItem label="Notes" value={selectedEvidence.detail.notes ?? "—"} />
                        </section>

                        <section className="grid grid-cols-3 gap-2">
                          <SummaryTile label="Linked Artifacts" value={String(selectedEvidence.linkedArtifacts.length)} />
                          <SummaryTile label="Linked Gates" value={String(selectedEvidence.linkedGates.length)} />
                          <SummaryTile label="Evidence Completeness" value={`${selectedEvidence.completeness.overallPercent}%`} />
                        </section>
                      </div>
                    )}

                    {selectedTab === "linked_artifacts" && (
                      <ul className="space-y-2">
                        {selectedEvidence.linkedArtifacts.length === 0 ? (
                          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                            No linked artifacts.
                          </li>
                        ) : (
                          selectedEvidence.linkedArtifacts.map((item) => (
                            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                              <Link href={item.href} className="font-medium text-[#2563eb] hover:underline">
                                {item.label}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    )}

                    {selectedTab === "linked_gates" && (
                      <ul className="space-y-2">
                        {selectedEvidence.linkedGates.length === 0 ? (
                          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                            No linked gates.
                          </li>
                        ) : (
                          selectedEvidence.linkedGates.map((item) => (
                            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                              <Link href={item.href} className="font-medium text-[#2563eb] hover:underline">
                                {item.label}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    )}

                    {selectedTab === "history" && (
                      <ul className="space-y-2">
                        {selectedEvidence.history.length === 0 ? (
                          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                            No evidence history recorded yet.
                          </li>
                        ) : (
                          selectedEvidence.history.map((item) => (
                            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.timestampLabel}</p>
                            </li>
                          ))
                        )}
                      </ul>
                    )}

                    {selectedTab === "comments" && (
                      <ul className="space-y-2">
                        {selectedEvidence.comments.length === 0 ? (
                          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                            No comments yet.
                          </li>
                        ) : (
                          selectedEvidence.comments.map((item) => (
                            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                              <p className="font-medium">{item.author}</p>
                              <p className="mt-1">{item.body}</p>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </article>
              </>
            )}
          </section>

          <aside className="evidence-coverage-panel min-w-0 space-y-4">
            <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#111827]">Evidence Completeness</h3>
              <div className="mt-3 flex items-center justify-between">
                <CompletionRing percent={selectedEvidence.completeness.overallPercent} />
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Badge label="Complete" tone="green" />
                    <span>{selectedEvidence.completeness.complete.percent}% ({selectedEvidence.completeness.complete.count})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge label="Partial" tone="amber" />
                    <span>{selectedEvidence.completeness.partial.percent}% ({selectedEvidence.completeness.partial.count})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge label="Missing" tone="red" />
                    <span>{selectedEvidence.completeness.missing.percent}% ({selectedEvidence.completeness.missing.count})</span>
                  </li>
                </ul>
              </div>
              <Link href={selectedEvidence.completeness.detailsHref} className="mt-3 inline-block text-sm font-semibold text-[#2563eb] hover:underline">
                View Completeness Details
              </Link>
            </article>

            <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <header className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#111827]">Evidence by Gate</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {initial.evidenceByGate.length}
                  </span>
                </div>
                <Link href={`/projects/${initial.project.id}/traceability/gate-evidence`} className="text-xs font-semibold text-[#2563eb] hover:underline">
                  View Gate Evidence Matrix
                </Link>
              </header>
              {initial.evidenceByGate.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <p>No gate evidence links exist yet.</p>
                  <Link href={`/projects/${initial.project.id}/gates/g1/review`} className="mt-2 inline-block font-semibold text-[#2563eb] hover:underline">
                    Open Gate Review
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[460px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="pb-2">Gate</th>
                        <th className="pb-2">Linked</th>
                        <th className="pb-2">Required</th>
                        <th className="pb-2">Coverage</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initial.evidenceByGate.map((row) => (
                        <CoverageRow
                          key={row.gateId}
                          label={`${row.gateCode} ${row.gateName}`}
                          linked={row.evidenceLinked}
                          required={row.requiredEvidence}
                          coveragePercent={row.coveragePercent}
                          status={row.status}
                          href={row.href}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <header className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#111827]">Evidence by Phase</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {initial.evidenceByPhase.length}
                  </span>
                </div>
                <Link href={`/projects/${initial.project.id}/traceability/phase-evidence`} className="text-xs font-semibold text-[#2563eb] hover:underline">
                  View Phase Evidence Matrix
                </Link>
              </header>
              {initial.evidenceByPhase.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <p>No phase evidence links exist yet.</p>
                  <Link href={`/projects/${initial.project.id}/workspace`} className="mt-2 inline-block font-semibold text-[#2563eb] hover:underline">
                    Open Lifecycle Workspace
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="pb-2">Phase</th>
                        <th className="pb-2">Items</th>
                        <th className="pb-2">Required</th>
                        <th className="pb-2">Coverage</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initial.evidenceByPhase.map((row) => (
                        <CoverageRow
                          key={row.phaseId}
                          label={`${row.phaseNumber}. ${row.phaseName}`}
                          linked={row.evidenceItems}
                          required={row.requiredEvidence}
                          coveragePercent={row.coveragePercent}
                          status={row.status}
                          href={row.href}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <header className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#111827]">Evidence by Artifact</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {initial.evidenceByArtifact.length}
                  </span>
                </div>
                <Link href={`/projects/${initial.project.id}/artifacts`} className="text-xs font-semibold text-[#2563eb] hover:underline">
                  Artifact library
                </Link>
              </header>
              {initial.evidenceByArtifact.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <p>No artifact-level evidence rollup yet.</p>
                  <Link href={`/projects/${initial.project.id}/artifacts`} className="mt-2 inline-block font-semibold text-[#2563eb] hover:underline">
                    Open artifacts
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="pb-2">Artifact</th>
                        <th className="pb-2">Linked</th>
                        <th className="pb-2">Required</th>
                        <th className="pb-2">Coverage</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initial.evidenceByArtifact.map((row) => (
                        <CoverageRow
                          key={row.artifactId}
                          label={`${row.artifactLocalId} · ${row.artifactTitle}`}
                          linked={row.evidenceLinked}
                          required={row.requiredEvidence}
                          coveragePercent={row.coveragePercent}
                          status={row.status}
                          href={row.href}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#111827]">Evidence Export Bundle</h3>
              <p className="mt-1 text-sm text-slate-600">
                Export selected evidence with metadata and traceability references.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!initial.exportBundle.canExportSelected || selectedForExport.length === 0}
                  onClick={() => void runExport("selected", selectedForExport)}
                  aria-label="Export selected evidence as ZIP bundle"
                >
                  Export Selected
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!initial.exportBundle.canExportByGate}
                  onClick={() => void runExport("gate", selectedForExport)}
                  aria-label="Export evidence by gate as ZIP bundle"
                >
                  Export by Gate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!initial.exportBundle.canExportFullBundle}
                  onClick={() => void runExport("full", selectedForExport)}
                  aria-label="Export full evidence bundle as ZIP"
                >
                  Export Full Bundle
                </Button>
              </div>
            </article>
          </aside>
        </div>

        <footer className="evidence-action-bar sticky bottom-0 z-20 border-t border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] min-[901px]:px-8">
          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
            <Info className="mt-0.5 size-5 shrink-0 text-[#2563eb]" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827]">{initial.actionState.title}</p>
              <p className="text-sm text-slate-600">{initial.actionState.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {!initial.actionState.canSubmit && initial.actionState.blockers.length > 0 ? (
              <p className="hidden max-w-md text-right text-xs text-slate-500 min-[901px]:block">
                {initial.actionState.blockers.join(" · ")}
              </p>
            ) : null}
            <Button type="button" variant="outline" size="lg">
              {initial.actionState.secondaryLabel}
            </Button>
            <Button
              type="button"
              size="lg"
              className="gap-2 bg-[#2563eb] text-white hover:bg-blue-700"
              onClick={() => void runExport("full", selectedForExport)}
              disabled={!initial.actionState.canSubmit}
            >
              {initial.actionState.primaryLabel}
              <Download className="size-4" aria-hidden />
            </Button>
          </div>
        </footer>
      </main>
    </AuthenticatedAppShell>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
