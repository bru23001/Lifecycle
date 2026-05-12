"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Plus,
  Search,
  Star,
} from "lucide-react";

import { artifactStatusBadgeMap } from "@/lib/artifact-status";
import { cn } from "@/lib/utils";
import type { ArtifactListItem, ArtifactWorkflowStatus } from "@/types/artifact-library.types";

const listStatusPillClasses: Record<ArtifactWorkflowStatus, string> = {
  in_progress: "bg-blue-50 text-blue-700",
  approved: "bg-emerald-50 text-emerald-700",
  draft: "bg-slate-100 text-slate-600",
  not_started: "bg-slate-100 text-slate-600",
  in_review: "bg-violet-50 text-violet-700",
  changes_requested: "bg-amber-50 text-amber-800",
  archived: "bg-slate-100 text-slate-500",
};

function ListStatusBadge({ status }: { status: ArtifactWorkflowStatus }) {
  const { label } = artifactStatusBadgeMap[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-tight",
        listStatusPillClasses[status],
      )}
    >
      {label}
    </span>
  );
}

function FileIcon({ tone }: { tone: "blue" | "green" }) {
  const toneClasses = {
    blue: "text-blue-600",
    green: "text-emerald-600",
  };

  return (
    <FileText
      className={cn("h-6 w-6 shrink-0 stroke-[2]", toneClasses[tone])}
      aria-hidden
    />
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="relative min-w-0">
      <label className="block min-w-0">
        <span className="sr-only">{ariaLabel}</span>
        <span className="flex h-11 min-w-0 cursor-pointer items-center justify-between gap-1 rounded-lg border border-slate-200 bg-white px-2 text-left hover:bg-slate-50/80 dark:border-border dark:bg-card dark:hover:bg-muted/50">
          <span className="min-w-0 flex-1 overflow-hidden">
            <span className="block truncate text-[11px] font-medium leading-tight text-slate-500 dark:text-muted-foreground">
              {label}
            </span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-slate-900 dark:text-foreground">
              {options.find((o) => o.value === value)?.label ?? value}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-foreground" aria-hidden />
        </span>
        <select
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ArtifactRow({
  item,
  selected,
}: {
  item: ArtifactListItem;
  selected: boolean;
}) {
  const fileTone: "blue" | "green" = item.status === "approved" ? "green" : "blue";
  const phaseLine = `Phase ${item.phaseNumber}: ${item.phaseName}`;
  const title = `${item.artifactCode} ${item.name}`;
  const updated =
    item.lastUpdatedLabel.replace(/^Updated\s*-\s*$/, "Updated —") ||
    item.lastUpdatedLabel;

  return (
    <article
      className={cn(
        "relative grid min-h-[120px] grid-cols-[34px_1fr_auto] gap-4 border-b border-slate-200 border-l-4 border-l-transparent bg-white py-5 pl-5 pr-6 dark:border-border dark:bg-card",
        selected &&
          "border-l-blue-600 bg-blue-50/90 dark:border-b-border dark:bg-blue-950/25 dark:border-l-blue-500",
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <FileIcon tone={fileTone} />

        <button
          type="button"
          aria-label={`Favorite ${title}`}
          className="text-slate-300 hover:text-amber-400 dark:text-muted-foreground"
        >
          <Star className="h-5 w-5 stroke-[1.85]" fill="none" />
        </button>
      </div>

      <Link href={item.href} className="contents min-w-0 text-left">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug text-slate-950 dark:text-foreground">
            {title}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-muted-foreground">
            {phaseLine}
          </p>

          <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-muted-foreground">
            {updated}
          </p>
        </div>

        <div className="flex min-h-[88px] flex-col items-end justify-between gap-3">
          <ListStatusBadge status={item.status} />

          <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
            {item.version}
          </p>
        </div>
      </Link>
    </article>
  );
}

function PaginationButton({
  children,
  active = false,
  disabled = false,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
        active
          ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-600"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

const PHASE_OPTIONS = [
  { value: "all", label: "All Phases" },
  { value: "1", label: "Phase 1" },
  { value: "2", label: "Phase 2" },
  { value: "3", label: "Phase 3" },
  { value: "4", label: "Phase 4" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "in_progress", label: "In Progress" },
  { value: "approved", label: "Approved" },
  { value: "draft", label: "Draft" },
  { value: "not_started", label: "Not Started" },
  { value: "in_review", label: "In Review" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "archived", label: "Archived" },
];

export function ArtifactListPanel({
  projectId,
  selectedArtifactId,
  search,
  onSearchChange,
  phaseFilter,
  onPhaseFilterChange,
  statusFilter,
  onStatusFilterChange,
  items,
  totalArtifactCount,
}: {
  projectId: string;
  selectedArtifactId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  phaseFilter: string;
  onPhaseFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  items: ArtifactListItem[];
  /** Total artifacts before search/filters (for “Showing … of N”). Defaults to `items.length`. */
  totalArtifactCount?: number;
}) {
  const total = totalArtifactCount ?? items.length;
  const showingEnd = items.length === 0 ? 0 : Math.min(items.length, total);

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 max-w-[650px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="flex shrink-0 items-center justify-between gap-3 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-foreground">
          Artifact List
        </h2>

        <Link
          href={`/projects/${projectId}/templates/a-3-2`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden />
          New Artifact
        </Link>
      </header>

      <div className="min-w-0 shrink-0 space-y-5 px-6 pb-5">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 dark:text-muted-foreground"
            aria-hidden
          />

          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search artifacts..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            aria-label="Search artifacts"
          />
        </label>

        <div className="grid min-w-0 grid-cols-3 gap-1.5">
          <SelectControl
            label="Phase"
            value={phaseFilter}
            options={PHASE_OPTIONS}
            onChange={onPhaseFilterChange}
            ariaLabel="Phase filter"
          />
          <SelectControl
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={onStatusFilterChange}
            ariaLabel="Status filter"
          />

          <button
            type="button"
            className="flex h-11 min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-1.5 text-xs font-semibold text-blue-600 hover:bg-slate-50/80 dark:border-border dark:bg-card dark:text-blue-400 dark:hover:bg-muted/50"
          >
            <Filter className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">More Filters</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
            {items.length === 0
              ? `Showing 0 of ${total} artifacts`
              : `Showing 1-${showingEnd} of ${total} artifacts`}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-muted-foreground dark:hover:text-foreground"
          >
            Sort:
            <span className="font-semibold text-slate-700 dark:text-foreground">Last Updated</span>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-200 dark:border-border">
        {items.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm font-medium text-slate-500 dark:text-muted-foreground">
            No artifacts match your filters.
          </div>
        ) : (
          items.map((item) => (
            <ArtifactRow
              key={item.id}
              item={item}
              selected={item.id === selectedArtifactId}
            />
          ))
        )}
      </div>

      <footer className="flex shrink-0 flex-nowrap items-center justify-center gap-1.5 overflow-x-auto border-t border-slate-200 px-4 py-4 dark:border-border">
        <PaginationButton disabled>
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </PaginationButton>

        <PaginationButton active>1</PaginationButton>
        <PaginationButton>2</PaginationButton>
        <PaginationButton>3</PaginationButton>
        <PaginationButton>4</PaginationButton>
        <PaginationButton>5</PaginationButton>

        <span className="px-1.5 text-sm font-semibold text-slate-500 dark:text-muted-foreground">
          ...
        </span>

        <PaginationButton>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </PaginationButton>
      </footer>
    </section>
  );
}
