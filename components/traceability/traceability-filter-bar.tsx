"use client";

import { Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { WORKSPACE_PHASES } from "@/lib/workspacePhases";
import type { TraceabilityMatrixData } from "@/types/traceability.types";

type FilterState = TraceabilityMatrixData["filters"];

export function TraceabilityFilterBar({
  projectPicker,
  filters,
  advancedFiltersOpen,
  onFilterChange,
  onOpenAdvancedFilters,
}: {
  projectPicker: TraceabilityMatrixData["projectPicker"];
  filters: FilterState;
  advancedFiltersOpen: boolean;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onOpenAdvancedFilters: () => void;
}) {
  const router = useRouter();

  return (
    <section
      aria-label="Traceability matrix filters"
      className="traceability-filter-bar traceability-grid-span-12 grid grid-cols-1 gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 min-[901px]:grid-cols-2 min-[1281px]:grid-cols-[minmax(11rem,14rem)_1.25fr_1fr_1fr_1fr_auto]"
    >
      <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project</span>
        <select
          className="h-10 max-w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          value={filters.projectId}
          onChange={(event) => {
            const nextId = event.target.value;
            if (nextId && nextId !== filters.projectId) {
              router.push(`/projects/${nextId}/traceability`);
            }
          }}
          aria-label="Switch project"
        >
          {projectPicker.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={filters.searchTerm ?? ""}
            onChange={(event) => onFilterChange("searchTerm", event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            placeholder="Search requirement, phase, gate, or gap"
            aria-label="Search traceability records"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">View mode</span>
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          value={filters.viewMode}
          onChange={(event) => onFilterChange("viewMode", event.target.value as FilterState["viewMode"])}
        >
          <option value="all_links">All Links</option>
          <option value="phases">Phase Links</option>
          <option value="requirements">Requirement Links</option>
          <option value="gates">Gate Links</option>
          <option value="evidence">Evidence Links</option>
          <option value="gaps">Gaps / Orphans</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phase</span>
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          value={String(filters.phaseNumber ?? "all")}
          onChange={(event) =>
            onFilterChange("phaseNumber", event.target.value === "all" ? "all" : Number.parseInt(event.target.value, 10))
          }
        >
          <option value="all">All phases</option>
          {WORKSPACE_PHASES.map((p) => (
            <option key={p.index} value={String(p.index)}>
              Phase {p.index}: {p.title}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          value={filters.status ?? "all"}
          onChange={(event) => onFilterChange("status", event.target.value as FilterState["status"])}
        >
          <option value="all">All statuses</option>
          <option value="complete">Complete</option>
          <option value="partial">Partial</option>
          <option value="missing">Missing</option>
          <option value="orphaned">Orphaned</option>
        </select>
      </label>

      <div className="flex flex-col items-stretch justify-end gap-2 min-[1281px]:items-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          aria-expanded={advancedFiltersOpen}
          aria-haspopup="dialog"
          aria-label="Open advanced traceability filters"
          onClick={onOpenAdvancedFilters}
        >
          <Filter className="size-4" aria-hidden />
          More Filters
        </Button>
        <p className="text-right text-xs text-slate-500">Last updated: {filters.lastUpdatedLabel}</p>
      </div>
    </section>
  );
}
