"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { evidenceStatusBadgeMap } from "@/lib/evidence-status";
import type {
  EvidenceCenterSelectedEvidence,
  EvidenceGateLinkOption,
  EvidenceItem,
  EvidenceLinkableArtifact,
  EvidencePhaseLinkOption,
} from "@/types/evidence-center.types";

import {
  AddEvidenceModal,
  type AddEvidenceLinkedArtifactOption,
} from "./add-evidence-modal";
import { ArchiveEvidenceModal } from "./archive-evidence-modal";
import { DeleteEvidenceModal } from "./delete-evidence-modal";
import { EditEvidenceMetadataDrawer } from "./edit-evidence-metadata-drawer";
import type { EvidenceFilters, EvidenceTab } from "./evidence-center-shared";
import { EvidenceFiltersDrawer } from "./evidence-filters-drawer";
import { EvidencePreviewModal } from "./evidence-preview-modal";
import {
  LinkEvidenceArtifactModal,
  type ArtifactPick,
} from "./link-evidence-artifact-modal";
import { LinkEvidenceGateModal } from "./link-evidence-gate-modal";
import { LinkEvidencePhaseModal } from "./link-evidence-phase-modal";

const pagination = { page: 1, totalPages: 12 };

const SORT_LABELS: Record<EvidenceFilters["sort"], string> = {
  updated: "Last updated",
  uploaded: "Upload date",
  completeness: "Completeness",
  status: "Evidence status",
  name: "Evidence name",
  evidenceType: "Evidence type",
  classification: "Classification",
  gate: "Gate",
  phase: "Phase",
};

const PHASE_QUICK_OPTIONS = [
  { value: "all", label: "All Phase" },
  ...Array.from({ length: 14 }, (_, i) => {
    const n = i + 1;
    return { value: String(n), label: `Phase ${n}` };
  }),
];

const GATE_QUICK_OPTIONS = [
  { value: "all", label: "All Gates" },
  ...["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"].map((g) => ({
    value: g,
    label: g,
  })),
];

type RowModalKind =
  | "preview"
  | "edit"
  | "linkArt"
  | "linkGate"
  | "linkPhase"
  | "archive"
  | "delete";
type RowModalState = { kind: RowModalKind; evidenceId: string } | null;

function CountBadge({
  filteredCount,
  totalCount,
}: {
  filteredCount: number;
  totalCount: number;
}) {
  const display =
    filteredCount === totalCount
      ? String(totalCount)
      : `${filteredCount} / ${totalCount}`;
  return (
    <span
      className="inline-flex h-8 min-w-12 items-center justify-center rounded-full bg-blue-50 px-3 text-sm font-semibold text-blue-700"
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
          "h-12 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-base font-semibold text-slate-700 shadow-sm outline-none",
          "hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-50",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700"
        aria-hidden
      />
    </div>
  );
}

function fileToneForType(
  type: EvidenceItem["evidenceType"],
): "red" | "green" | "blue" {
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

  const className = ["h-6 w-6 stroke-[2]", toneClasses[tone]].join(" ");

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
        "inline-flex min-w-0 justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight",
        statusClasses[status],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function EvidenceRowActionsMenu({
  itemName,
  disabled,
  onOpen,
  onPreview,
  onEditMetadata,
  onLinkArtifact,
  onLinkGate,
  onLinkPhase,
  onDownload,
  onReplaceFile,
  onViewHistory,
  onArchive,
  onDelete,
}: {
  itemName: string;
  disabled?: boolean;
  onOpen: () => void;
  onPreview: () => void;
  onEditMetadata: () => void;
  onLinkArtifact: () => void;
  onLinkGate: () => void;
  onLinkPhase: () => void;
  onDownload: () => void;
  onReplaceFile: () => void;
  onViewHistory: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const itemClass =
    "block w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        aria-label={`Evidence actions for ${itemName}`}
        className="h-7 w-7 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onOpen();
            }}
          >
            Open
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onPreview();
            }}
          >
            Preview
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onEditMetadata();
            }}
          >
            Edit metadata
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onLinkArtifact();
            }}
          >
            Link to artifact
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onLinkGate();
            }}
          >
            Link to gate
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onLinkPhase();
            }}
          >
            Link to phase
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onDownload();
            }}
          >
            Download
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            disabled
            title="File replace pipeline is not available yet."
            onClick={() => {
              setOpen(false);
              onReplaceFile();
            }}
          >
            Replace file
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onViewHistory();
            }}
          >
            View history
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onArchive();
            }}
          >
            Archive
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-red-700 hover:bg-red-50`}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EvidenceRow({
  item,
  selected,
  exportSelected,
  onSelect,
  onToggleExport,
  rowMenuDisabled,
  onRowOpen,
  onRowPreview,
  onRowEditMetadata,
  onRowLinkArtifact,
  onRowLinkGate,
  onRowLinkPhase,
  onRowDownload,
  onRowViewHistory,
  onRowArchive,
  onRowDelete,
}: {
  item: EvidenceItem;
  selected: boolean;
  exportSelected: boolean;
  onSelect: () => void;
  onToggleExport: () => void;
  rowMenuDisabled?: boolean;
  onRowOpen: () => void;
  onRowPreview: () => void;
  onRowEditMetadata: () => void;
  onRowLinkArtifact: () => void;
  onRowLinkGate: () => void;
  onRowLinkPhase: () => void;
  onRowDownload: () => void;
  onRowViewHistory: () => void;
  onRowArchive: () => void;
  onRowDelete: () => void;
}) {
  const phaseLabel =
    item.phaseNumber != null && item.phaseName
      ? `Phase ${item.phaseNumber}: ${item.phaseName}`
      : (item.phaseName ?? "Phase —");
  const gateLabel =
    item.gateCode && item.gateName
      ? `Gate ${item.gateCode} - ${item.gateName}`
      : (item.gateCode ?? item.gateName ?? "Gate —");
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
        "relative grid min-h-[70px] cursor-pointer grid-cols-[28px_1fr_auto] gap-2 px-3 py-2 outline-none transition",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        selected
          ? "rounded-lg border border-blue-500 bg-blue-50/60"
          : "border-b border-slate-100 bg-white last:border-b-0 hover:bg-slate-50",
      )}
    >
      <div className="flex items-start pt-0.5">
        <EvidenceFileIcon type={item.evidenceType} tone={tone} />
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-slate-950">
          {item.name}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-[11px] font-medium leading-snug text-slate-600">
          {phaseLabel}
        </p>

        <p className="mt-0.5 line-clamp-1 text-[11px] font-medium leading-snug text-slate-600">
          {gateLabel}
        </p>

        <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-500">
          Uploaded by {item.uploadedBy}
        </p>

        <p className="mt-0 line-clamp-1 text-[11px] font-semibold text-slate-600">
          {item.uploadedOnLabel}
        </p>
      </div>

      <div className="flex flex-col items-end justify-between gap-1">
        <div className="flex items-start gap-0.5">
          <button
            type="button"
            aria-pressed={exportSelected}
            aria-label={`${exportSelected ? "Remove" : "Add"} ${item.name} from export selection`}
            className={cn(
              "rounded p-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              exportSelected
                ? "text-amber-400"
                : "text-slate-400 hover:text-amber-400",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExport();
            }}
          >
            <Star
              className={cn(
                "h-4 w-4 stroke-[1.75]",
                exportSelected
                  ? "fill-yellow-400 text-yellow-500"
                  : "fill-none text-slate-400",
              )}
              aria-hidden
            />
          </button>
          <EvidenceRowActionsMenu
            itemName={item.name}
            disabled={rowMenuDisabled}
            onOpen={onRowOpen}
            onPreview={onRowPreview}
            onEditMetadata={onRowEditMetadata}
            onLinkArtifact={onRowLinkArtifact}
            onLinkGate={onRowLinkGate}
            onLinkPhase={onRowLinkPhase}
            onDownload={onRowDownload}
            onReplaceFile={() => {}}
            onViewHistory={onRowViewHistory}
            onArchive={onRowArchive}
            onDelete={onRowDelete}
          />
        </div>

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
        "flex h-10 min-w-10 items-center justify-center rounded-lg border text-sm font-semibold",
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
  evidencePackages,
  filteredItems,
  filters,
  selectedId,
  selectedForExport,
  isLoading,
  addEvidenceOpen,
  onOpenAddEvidence,
  onCloseAddEvidence,
  onSelectEvidence,
  onToggleExportSelection,
  onFiltersChange,
  projectId,
  artifactOptions,
  linkableArtifacts,
  gateLinkOptions,
  phaseLinkOptions,
  artifacts,
}: {
  evidenceItems: EvidenceItem[];
  evidencePackages: Record<string, EvidenceCenterSelectedEvidence>;
  filteredItems: EvidenceItem[];
  filters: EvidenceFilters;
  selectedId: string;
  selectedForExport: string[];
  isLoading: boolean;
  addEvidenceOpen: boolean;
  onOpenAddEvidence: () => void;
  onCloseAddEvidence: () => void;
  onSelectEvidence: (
    evidenceId: string,
    opts?: { detailTab?: EvidenceTab },
  ) => void;
  onToggleExportSelection: (evidenceId: string) => void;
  onFiltersChange: (filters: EvidenceFilters) => void;
  projectId: string;
  artifactOptions?: AddEvidenceLinkedArtifactOption[];
  linkableArtifacts: EvidenceLinkableArtifact[];
  gateLinkOptions: EvidenceGateLinkOption[];
  phaseLinkOptions: EvidencePhaseLinkOption[];
  artifacts: ArtifactPick[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rowModal, setRowModal] = useState<RowModalState>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const rowPack = rowModal ? evidencePackages[rowModal.evidenceId] : undefined;

  const artifactFilterOptions = artifacts.map((a) => ({
    id: a.id,
    label: a.label,
  }));

  return (
    <section className="flex h-full min-h-0 w-full max-w-[372px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="shrink-0 px-6 py-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-950">
              Evidence Items
            </h2>

            <CountBadge
              filteredCount={filteredItems.length}
              totalCount={evidenceItems.length}
            />
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-md bg-blue-600 px-6 text-base font-bold text-white shadow-sm hover:bg-blue-700"
              onClick={onOpenAddEvidence}
              aria-expanded={addEvidenceOpen}
              aria-haspopup="dialog"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" aria-hidden />
              Add Evidence
            </button>
            <Link
              href={`/projects/${projectId}/evidence/new`}
              className="inline-flex h-10 items-center justify-center text-sm font-semibold text-blue-600 underline-offset-2 hover:underline sm:h-12 sm:px-2"
              data-testid="evidence-add-full-page"
            >
              Full-page form
            </Link>
          </div>
        </div>
      </header>

      <AddEvidenceModal
        open={addEvidenceOpen}
        projectId={projectId}
        artifactOptions={artifactOptions}
        onClose={onCloseAddEvidence}
      />

      <EvidenceFiltersDrawer
        open={filtersOpen}
        appliedFilters={filters}
        artifactOptions={artifactFilterOptions}
        onClose={() => setFiltersOpen(false)}
        onApply={onFiltersChange}
      />

      <div className="shrink-0 space-y-6 px-6 pb-6">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ ...filters, search: event.target.value })
            }
            placeholder="Search evidence..."
            aria-label="Search evidence"
            className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-700 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <FilterSelect
            aria-label="Filter evidence type"
            value={filters.type}
            onChange={(type) =>
              onFiltersChange({
                ...filters,
                type: type as EvidenceFilters["type"],
              })
            }
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
            options={PHASE_QUICK_OPTIONS}
          />
          <FilterSelect
            aria-label="Filter evidence by gate"
            value={filters.gate}
            onChange={(gate) =>
              onFiltersChange({
                ...filters,
                gate: gate === "all" ? "all" : gate.toUpperCase(),
              })
            }
            options={GATE_QUICK_OPTIONS}
          />

          <button
            type="button"
            className="flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-blue-600 shadow-sm hover:bg-slate-50"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-5 w-5" aria-hidden />
            More Filters
          </button>
        </div>

        <div className="relative inline-flex min-h-10 min-w-[11rem] items-center">
          <div className="pointer-events-none flex items-center gap-1.5 text-base">
            <span className="font-medium text-slate-600">Sort:</span>
            <span className="font-semibold text-slate-700">
              {SORT_LABELS[filters.sort]}
            </span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-slate-600"
              aria-hidden
            />
          </div>
          <select
            aria-label="Sort evidence list"
            value={filters.sort}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                sort: event.target.value as EvidenceFilters["sort"],
              })
            }
            className="absolute inset-0 h-full w-full min-w-[11rem] cursor-pointer opacity-0"
          >
            {(Object.keys(SORT_LABELS) as EvidenceFilters["sort"][]).map(
              (key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {mutationError ? (
        <div className="mx-6 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          <div className="flex items-center justify-between gap-2">
            <p>{mutationError}</p>
            <button
              type="button"
              className="shrink-0 font-medium underline"
              onClick={() => setMutationError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto border-y border-slate-100">
        {isLoading ? (
          <div className="space-y-0 px-3 py-2">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-1 h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-1 h-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mx-6 my-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-base text-slate-600">
            <p>No evidence has been added for this project.</p>
            <button
              type="button"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              onClick={onOpenAddEvidence}
            >
              Add First Evidence Item
            </button>
          </div>
        ) : (
          <div role="listbox" aria-label="Evidence items">
            {filteredItems.map((row) => {
              const pack = evidencePackages[row.id];
              const rowDisabled = !pack;
              return (
                <EvidenceRow
                  key={row.id}
                  item={row}
                  selected={row.id === selectedId}
                  exportSelected={selectedForExport.includes(row.id)}
                  onSelect={() => onSelectEvidence(row.id)}
                  onToggleExport={() => onToggleExportSelection(row.id)}
                  rowMenuDisabled={rowDisabled}
                  onRowOpen={() => onSelectEvidence(row.id)}
                  onRowPreview={() => {
                    onSelectEvidence(row.id);
                    setRowModal({ kind: "preview", evidenceId: row.id });
                  }}
                  onRowEditMetadata={() => {
                    onSelectEvidence(row.id);
                    setRowModal({ kind: "edit", evidenceId: row.id });
                  }}
                  onRowLinkArtifact={() => {
                    onSelectEvidence(row.id);
                    setRowModal({ kind: "linkArt", evidenceId: row.id });
                  }}
                  onRowLinkGate={() => {
                    onSelectEvidence(row.id);
                    setRowModal({ kind: "linkGate", evidenceId: row.id });
                  }}
                  onRowLinkPhase={() => {
                    onSelectEvidence(row.id);
                    setRowModal({ kind: "linkPhase", evidenceId: row.id });
                  }}
                  onRowDownload={() => {
                    onSelectEvidence(row.id);
                    const href = pack?.detail.downloadHref;
                    if (href)
                      window.open(href, "_blank", "noopener,noreferrer");
                  }}
                  onRowViewHistory={() => {
                    onSelectEvidence(row.id, { detailTab: "history" });
                  }}
                  onRowArchive={() => {
                    onSelectEvidence(row.id);
                    setRowModal({ kind: "archive", evidenceId: row.id });
                  }}
                  onRowDelete={() => {
                    onSelectEvidence(row.id);
                    setRowModal({ kind: "delete", evidenceId: row.id });
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 px-4 py-5">
        <PaginationButton
          disabled={pagination.page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </PaginationButton>

        <PaginationButton active>{pagination.page}</PaginationButton>
        <PaginationButton>2</PaginationButton>
        <PaginationButton>3</PaginationButton>

        <span className="px-1 text-sm font-semibold text-slate-500">...</span>

        <PaginationButton>{pagination.totalPages}</PaginationButton>

        <PaginationButton
          disabled={pagination.page >= pagination.totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </PaginationButton>
      </footer>

      {rowModal && rowPack ? (
        <>
          <EvidencePreviewModal
            open={rowModal.kind === "preview"}
            selectedEvidence={rowPack}
            onClose={() => setRowModal(null)}
          />
          <EditEvidenceMetadataDrawer
            open={rowModal.kind === "edit"}
            projectId={projectId}
            selectedEvidence={rowPack}
            onClose={() => setRowModal(null)}
          />
          <LinkEvidenceArtifactModal
            open={rowModal.kind === "linkArt"}
            evidenceId={rowModal.evidenceId}
            selectedEvidence={rowPack}
            linkableArtifacts={linkableArtifacts}
            linkedArtifactIds={rowPack.linkedArtifacts.map((x) => x.id)}
            onClose={() => setRowModal(null)}
          />
          <LinkEvidenceGateModal
            open={rowModal.kind === "linkGate"}
            projectId={projectId}
            evidenceId={rowModal.evidenceId}
            selectedEvidence={rowPack}
            gateLinkOptions={gateLinkOptions}
            linkedGateIds={rowPack.linkedGates.map((x) => x.id)}
            onClose={() => setRowModal(null)}
          />
          <LinkEvidencePhaseModal
            open={rowModal.kind === "linkPhase"}
            projectId={projectId}
            evidenceId={rowModal.evidenceId}
            evidenceSummary={`${rowPack.detail.evidenceCode} · ${rowPack.detail.name}`}
            phaseLinkOptions={phaseLinkOptions}
            linkedPhaseIds={rowPack.linkedPhases.map((p) => p.id)}
            artifacts={artifacts}
            onClose={() => setRowModal(null)}
          />
          <ArchiveEvidenceModal
            open={rowModal.kind === "archive"}
            projectId={projectId}
            selectedEvidence={rowPack}
            onClose={() => setRowModal(null)}
            onError={(msg) => setMutationError(msg)}
          />
          <DeleteEvidenceModal
            open={rowModal.kind === "delete"}
            projectId={projectId}
            selectedEvidence={rowPack}
            onClose={() => setRowModal(null)}
            onError={(msg) => setMutationError(msg)}
          />
        </>
      ) : null}
    </section>
  );
}
