"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CircleHelp, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TraceabilityMatrixData } from "@/types/traceability.types";

import type { GapTabId } from "./traceability-filtering";
import {
  filterGapRows,
  filterGateRows,
  filterPhaseRows,
  filterRequirementDesignRows,
  filterRequirementTestRows,
} from "./traceability-filtering";
import { TraceabilityActionBar } from "./traceability-action-bar";
import { TraceabilityFilterBar } from "./traceability-filter-bar";
import { TraceabilityGrid } from "./traceability-grid";

type FilterState = TraceabilityMatrixData["filters"];

export function TraceabilityContent({ data }: { data: TraceabilityMatrixData }) {
  const [filters, setFilters] = useState<FilterState>(data.filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeGapTab, setActiveGapTab] = useState<GapTabId>("requirement_gap");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const filteredPhaseRows = useMemo(() => filterPhaseRows(data.phaseArtifactLinks, filters), [data.phaseArtifactLinks, filters]);
  const filteredReqDesignRows = useMemo(
    () => filterRequirementDesignRows(data.requirementDesignLinks, filters),
    [data.requirementDesignLinks, filters],
  );
  const filteredReqTestRows = useMemo(
    () => filterRequirementTestRows(data.requirementTestLinks, filters),
    [data.requirementTestLinks, filters],
  );
  const filteredGateRows = useMemo(() => filterGateRows(data.gateEvidenceLinks, filters), [data.gateEvidenceLinks, filters]);
  const filteredGapRows = useMemo(
    () => filterGapRows(data.traceabilityGaps, filters, activeGapTab),
    [activeGapTab, data.traceabilityGaps, filters],
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
    <div className="traceability-report-card-grid mt-4">
      <TraceabilityFilterBar
        data={data}
        filters={filters}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() => setShowAdvancedFilters((prev) => !prev)}
        onFilterChange={onFilterChange}
      />

      {hasError ? (
        <section className="traceability-grid-span-12 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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

      <TraceabilityGrid
        data={data}
        filters={filters}
        isLoading={isLoading}
        activeGapTab={activeGapTab}
        onActiveGapTabChange={setActiveGapTab}
        phaseRows={filteredPhaseRows}
        requirementDesignRows={filteredReqDesignRows}
        requirementTestRows={filteredReqTestRows}
        gateRows={filteredGateRows}
        gapRows={filteredGapRows}
      />

      <TraceabilityActionBar actionState={data.actionState} />

      <p className="traceability-grid-span-12 flex items-center gap-2 text-xs text-slate-500">
        <CircleHelp className="size-3.5" aria-hidden />
        Export includes matrix status in CSV/JSON/PDF package format.
      </p>
    </div>
  );
}
