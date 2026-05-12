import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportTraceabilityMatrix } from "@/lib/traceability-export";
import type { TraceabilityMatrixData } from "@/types/traceability.types";

type FilterState = TraceabilityMatrixData["filters"];

export function TraceabilityFilterBar({
  data,
  filters,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  onFilterChange,
}: {
  data: TraceabilityMatrixData;
  filters: FilterState;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}) {
  return (
    <section
      aria-label="Traceability matrix filters"
      className="traceability-filter-bar traceability-grid-span-12 grid grid-cols-1 gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 min-[901px]:grid-cols-2 min-[1281px]:grid-cols-[1.3fr_1fr_1fr_1fr_auto]"
    >
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
            onFilterChange("phaseNumber", event.target.value === "all" ? "all" : Number.parseInt(event.target.value, 10))
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
          aria-expanded={showAdvancedFilters}
          aria-label="Toggle advanced traceability filters"
          onClick={onToggleAdvancedFilters}
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
          <fieldset className="flex flex-col gap-1 text-sm text-slate-700">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Export Matrix</legend>
            <div className="flex h-10 items-center gap-2" role="group" aria-label="Export matrix as CSV JSON or PDF">
              <Button type="button" variant="outline" size="sm" onClick={() => exportTraceabilityMatrix(data, "csv")}>
                CSV
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => exportTraceabilityMatrix(data, "json")}>
                JSON
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => exportTraceabilityMatrix(data, "pdf")}>
                PDF
              </Button>
            </div>
          </fieldset>
        </div>
      ) : null}
    </section>
  );
}
