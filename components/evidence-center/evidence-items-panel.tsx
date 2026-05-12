"use client";

import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { evidenceStatusBadgeMap } from "@/lib/evidence-status";
import type { EvidenceItem } from "@/types/evidence-center.types";

import type { EvidenceFilters } from "./evidence-center-shared";

const pagination = { page: 1, totalPages: 12 };

const SORT_LABELS: Record<EvidenceFilters["sort"], string> = {
  updated: "Last Updated",
  uploaded: "Uploaded Date",
  completeness: "Completeness",
  status: "Status",
  name: "Name",
};

function CountBadge({ filteredCount, totalCount }: { filteredCount: number; totalCount: number }) {
  const display = filteredCount === totalCount ? String(totalCount) : `${filteredCount} / ${totalCount}`;
  return (
    <span
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2.5 text-sm font-semibold text-slate-700"
      aria-label={
        filteredCount === totalCount
          ? `${totalCount} total evidence items`
          : `${filteredCount} matching filters of ${totalCount} total`
      }
    >
      {display}
    </span>
  );
}

function FilterSelect({
  "aria-label": ariaLabel,
  value,
  onChange,
  options,
}: {
  "aria-label": string;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative min-w-0">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-12 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-base font-semibold text-slate-700 outline-none",
          "hover:bg-slate-50 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700" aria-hidden />
    </div>
  );
}

function fileToneForType(type: EvidenceItem["evidenceType"]): "red" | "green" | "blue" {
  if (type === "spreadsheet") return "green";
  if (type === "pdf" || type === "report") return "red";
  return "blue";
}

function EvidenceFileIcon({
  type,
  tone,
}: {
  type: EvidenceItem["evidenceType"];
  tone: "red" | "green" | "blue";
}) {
  const toneClasses = {
    red: "text-red-500",
    green: "text-emerald-600",
    blue: "text-blue-600",
  };

  const className = ["h-9 w-9 stroke-[2.1]", toneClasses[tone]].join(" ");

  if (type === "spreadsheet") {
    return <FileSpreadsheet className={className} aria-hidden />;
  }

  return <FileText className={className} aria-hidden />;
}

function EvidenceStatusBadge({ status }: { status: EvidenceItem["status"] }) {
  const { label } = evidenceStatusBadgeMap[status];
  const statusClasses: Record<string, string> = {
    linked: "bg-emerald-50 text-emerald-700",
    partially_linked: "bg-amber-50 text-amber-700",
    unlinked: "bg-slate-100 text-slate-600",
    archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={[
        "inline-flex min-w-[88px] justify-center rounded-full px-3 py-1.5 text-xs font-semibold",
        statusClasses[status],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function EvidenceRow({
  item,
  selected,
  exportSelected,
  onSelect,
  onToggleExport,
}: {
  item: EvidenceItem;
  selected: boolean;
  exportSelected: boolean;
  onSelect: () => void;
  onToggleExport: () => void;
}) {
  const phaseLabel =
    item.phaseNumber != null && item.phaseName
      ? `Phase ${item.phaseNumber}: ${item.phaseName}`
      : item.phaseName ?? "Phase —";
  const gateLabel =
    item.gateCode && item.gateName
      ? `Gate ${item.gateCode} - ${item.gateName}`
      : item.gateCode ?? item.gateName ?? "Gate —";
  const tone = fileToneForType(item.evidenceType);

  return (
    <article
      role="option"
      tabIndex={0}
      aria-selected={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative grid min-h-[176px] cursor-pointer grid-cols-[42px_1fr_auto] gap-5 px-6 py-6 outline-none transition",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        selected ? "border border-blue-500 bg-blue-50" : "border-b border-slate-100 bg-white last:border-b-0",
      )}
    >
      <EvidenceFileIcon type={item.evidenceType} tone={tone} />

      <div className="min-w-0">
        <h3 className="text-lg font-semibold leading-7 text-slate-950">{item.name}</h3>

        <p className="mt-3 text-sm font-medium text-slate-500">{phaseLabel}</p>

        <p className="mt-2 text-sm font-medium text-slate-500">{gateLabel}</p>

        <p className="mt-5 text-sm font-medium text-slate-500">Uploaded by {item.uploadedBy}</p>

        <p className="mt-2 text-sm font-medium text-slate-500">{item.uploadedOnLabel}</p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          type="button"
          aria-pressed={exportSelected}
          aria-label={`${exportSelected ? "Remove" : "Add"} ${item.name} from export selection`}
          className={cn(
            "rounded-md p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            exportSelected ? "text-yellow-500" : "text-slate-400 hover:text-slate-500",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onToggleExport();
          }}
        >
          <Star
            className={cn(
              "h-6 w-6 stroke-[1.75]",
              exportSelected ? "fill-yellow-400 text-yellow-500" : "fill-none text-slate-400",
            )}
            aria-hidden
          />
        </button>

        <EvidenceStatusBadge status={item.status} />
      </div>
    </article>
  );
}

function PaginationButton({
  children,
  active = false,
  disabled = false,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        "flex size-10 min-w-10 items-center justify-center rounded-md border text-sm font-semibold",
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        disabled && "cursor-not-allowed text-slate-300",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}

export function EvidenceItemsPanel({
  evidenceItems,
  filteredItems,
  filters,
  selectedId,
  selectedForExport,
  isLoading,
  addEvidenceOpen,
  onToggleAddEvidence,
  onSelectEvidence,
  onToggleExportSelection,
  onFiltersChange,
}: {
  evidenceItems: EvidenceItem[];
  filteredItems: EvidenceItem[];
  filters: EvidenceFilters;
  selectedId: string;
  selectedForExport: string[];
  isLoading: boolean;
  addEvidenceOpen: boolean;
  onToggleAddEvidence: () => void;
  onSelectEvidence: (evidenceId: string) => void;
  onToggleExportSelection: (evidenceId: string) => void;
  onFiltersChange: (filters: EvidenceFilters) => void;
}) {
  return (
    <section className="flex h-full min-h-0 w-full max-w-[620px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="shrink-0 px-6 py-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-950">Evidence Items</h2>

            <CountBadge filteredCount={filteredItems.length} totalCount={evidenceItems.length} />
          </div>

          <button
            type="button"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-md bg-blue-600 px-6 text-base font-bold text-white shadow-sm hover:bg-blue-700"
            onClick={onToggleAddEvidence}
            aria-expanded={addEvidenceOpen}
          >
            <Plus className="h-5 w-5 stroke-[2.5]" aria-hidden />
            Add Evidence
          </button>
        </div>
      </header>

      {addEvidenceOpen ? (
        <div className="shrink-0 border-y border-blue-100 bg-blue-50/70 px-6 py-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Add Evidence Flow (Mock Entry Point)</p>
          <p className="mt-1">
            Connect this action to upload, artifact linking, and source URL creation when backend endpoints are wired.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Upload File
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Link External URL
            </button>
          </div>
        </div>
      ) : null}

      <div className="shrink-0 space-y-6 px-6 pb-6">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
            placeholder="Search evidence..."
            aria-label="Search evidence"
            className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-700 outline-none placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
          />
        </label>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_1fr_1fr_1.05fr]">
          <FilterSelect
            aria-label="Filter evidence type"
            value={filters.type}
            onChange={(type) => onFiltersChange({ ...filters, type: type as EvidenceFilters["type"] })}
            options={[
              { value: "all", label: "All Types" },
              { value: "pdf", label: "PDF" },
              { value: "spreadsheet", label: "Spreadsheet" },
              { value: "document", label: "Document" },
              { value: "image", label: "Image" },
              { value: "link", label: "Link" },
              { value: "json", label: "JSON" },
              { value: "markdown", label: "Markdown" },
              { value: "report", label: "Report" },
            ]}
          />
          <FilterSelect
            aria-label="Filter evidence by phase"
            value={filters.phase}
            onChange={(phase) => onFiltersChange({ ...filters, phase })}
            options={[
              { value: "all", label: "All Phases" },
              { value: "1", label: "Phase 1" },
              { value: "2", label: "Phase 2" },
              { value: "3", label: "Phase 3" },
              { value: "4", label: "Phase 4" },
            ]}
          />
          <FilterSelect
            aria-label="Filter evidence by gate"
            value={filters.gate}
            onChange={(gate) => onFiltersChange({ ...filters, gate })}
            options={[
              { value: "all", label: "All Gates" },
              { value: "G1", label: "G1" },
              { value: "G2", label: "G2" },
              { value: "G3", label: "G3" },
              { value: "G4", label: "G4" },
            ]}
          />

          <button
            type="button"
            className="flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-blue-600 hover:bg-slate-50"
          >
            <Filter className="h-5 w-5" aria-hidden />
            More Filters
          </button>
        </div>

        <div className="relative inline-flex min-h-10 min-w-[12rem] items-center">
          <div className="pointer-events-none flex items-center gap-1.5 text-base">
            <span className="font-medium text-slate-600">Sort:</span>
            <span className="font-semibold text-slate-800">{SORT_LABELS[filters.sort]}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
          </div>
          <select
            aria-label="Sort evidence list"
            value={filters.sort}
            onChange={(event) =>
              onFiltersChange({ ...filters, sort: event.target.value as EvidenceFilters["sort"] })
            }
            className="absolute inset-0 h-full w-full min-w-[12rem] cursor-pointer opacity-0"
          >
            {(Object.keys(SORT_LABELS) as EvidenceFilters["sort"][]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-y border-slate-100">
        {isLoading ? (
          <div className="space-y-0 px-6 py-4">
            <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-2 h-40 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-2 h-40 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mx-6 my-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-base text-slate-600">
            <p>No evidence has been added for this project.</p>
            <button
              type="button"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              onClick={onToggleAddEvidence}
            >
              Add First Evidence Item
            </button>
          </div>
        ) : (
          <div role="listbox" aria-label="Evidence items">
            {filteredItems.map((row) => (
              <EvidenceRow
                key={row.id}
                item={row}
                selected={row.id === selectedId}
                exportSelected={selectedForExport.includes(row.id)}
                onSelect={() => onSelectEvidence(row.id)}
                onToggleExport={() => onToggleExportSelection(row.id)}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-6 py-7 sm:gap-3">
        <PaginationButton disabled={pagination.page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </PaginationButton>

        <PaginationButton active>{pagination.page}</PaginationButton>
        <PaginationButton>2</PaginationButton>
        <PaginationButton>3</PaginationButton>
        <PaginationButton>4</PaginationButton>
        <PaginationButton>5</PaginationButton>

        <span className="px-2 text-base font-semibold text-slate-500">...</span>

        <PaginationButton>{pagination.totalPages}</PaginationButton>

        <PaginationButton disabled={pagination.page >= pagination.totalPages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" aria-hidden />
        </PaginationButton>
      </footer>
    </section>
  );
}
