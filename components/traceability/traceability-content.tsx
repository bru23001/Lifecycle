"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle, CircleHelp, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  mapGapToCreateLinkPrefill,
  type CreateLinkPrefill,
} from "@/lib/traceability-gap-details";
import { type TraceabilityExportViewModel } from "@/lib/traceability-export";
import type { TraceabilityGap, TraceabilityMatrixData } from "@/types/traceability.types";

import { ExportTraceabilityMatrixModal } from "./export-traceability-matrix-modal";
import { TraceabilityAdvancedFiltersDrawer } from "./traceability-advanced-filters-drawer";
import type { GapTabId } from "./traceability-filtering";
import {
  filterArtifactGateRows,
  filterEvidenceApprovalRows,
  filterGapRows,
  filterGateRows,
  filterPhaseRows,
  filterRequirementDesignRows,
  filterRequirementTestRows,
} from "./traceability-filtering";
import { AcceptTraceabilityRiskModal } from "./accept-traceability-risk-modal";
import { AssignTraceabilityRemediationModal } from "./assign-traceability-remediation-modal";
import { CreateTraceLinkModal } from "./create-trace-link-modal";
import { TraceabilityActionBar } from "./traceability-action-bar";
import { TraceabilityFilterBar } from "./traceability-filter-bar";
import { TraceabilityGapDrawer } from "./traceability-gap-drawer";
import { TraceabilityGrid } from "./traceability-grid";

type FilterState = TraceabilityMatrixData["filters"];

export function TraceabilityContent({
  data,
  gapsShowViewAll = true,
  exportToolbar,
}: {
  data: TraceabilityMatrixData;
  /** When false, hides “View All” on the gaps card (used on `/traceability/gaps`). */
  gapsShowViewAll?: boolean;
  /** Matrix / gaps shell: opens advanced export modal from header + action bar. */
  exportToolbar?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
}) {
  const [filters, setFilters] = useState<FilterState>(data.filters);
  const [advancedDrawerOpen, setAdvancedDrawerOpen] = useState(false);
  const [activeGapTab, setActiveGapTab] = useState<GapTabId>("requirement_gap");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedGap, setSelectedGap] = useState<TraceabilityGap | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<CreateLinkPrefill | null>(null);
  const [acceptGap, setAcceptGap] = useState<TraceabilityGap | null>(null);
  const [assignGap, setAssignGap] = useState<TraceabilityGap | null>(null);

  const handleSelectGap = useCallback((gap: TraceabilityGap) => {
    setSelectedGap(gap);
  }, []);

  const handleCloseGapDrawer = useCallback(() => {
    setSelectedGap(null);
  }, []);

  const handleCreateLinkFromGap = useCallback((gap: TraceabilityGap) => {
    setCreatePrefill(mapGapToCreateLinkPrefill(gap));
    setSelectedGap(null);
    setCreateOpen(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setCreatePrefill(null);
    setCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleAcceptRisk = useCallback((gap: TraceabilityGap) => {
    setAcceptGap(gap);
    setSelectedGap(null);
  }, []);

  const handleAssignRemediation = useCallback((gap: TraceabilityGap) => {
    setAssignGap(gap);
    setSelectedGap(null);
  }, []);

  const handleCloseAccept = useCallback(() => {
    setAcceptGap(null);
  }, []);

  const handleCloseAssign = useCallback(() => {
    setAssignGap(null);
  }, []);

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
  const filteredArtifactGateRows = useMemo(
    () => filterArtifactGateRows(data.artifactGateLinks, filters),
    [data.artifactGateLinks, filters],
  );
  const filteredEvidenceApprovalRows = useMemo(
    () => filterEvidenceApprovalRows(data.evidenceApprovalLinks, filters),
    [data.evidenceApprovalLinks, filters],
  );
  const filteredGapRows = useMemo(
    () => filterGapRows(data.traceabilityGaps, filters, activeGapTab),
    [activeGapTab, data.traceabilityGaps, filters],
  );

  const exportViewModel = useMemo<TraceabilityExportViewModel>(
    () => ({
      full: data,
      filtered: {
        phaseArtifactLinks: filteredPhaseRows,
        requirementDesignLinks: filteredReqDesignRows,
        requirementTestLinks: filteredReqTestRows,
        gateEvidenceLinks: filteredGateRows,
        artifactGateLinks: filteredArtifactGateRows,
        evidenceApprovalLinks: filteredEvidenceApprovalRows,
        traceabilityGaps: filteredGapRows,
      },
      filterSnapshot: filters,
    }),
    [
      data,
      filters,
      filteredPhaseRows,
      filteredReqDesignRows,
      filteredReqTestRows,
      filteredGateRows,
      filteredArtifactGateRows,
      filteredEvidenceApprovalRows,
      filteredGapRows,
    ],
  );

  const onFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setIsLoading(true);
    setHasError(false);
    window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setIsLoading(false);
    }, 200);
  };

  const onApplyAdvanced = useCallback((patch: Partial<FilterState>) => {
    setIsLoading(true);
    setHasError(false);
    window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, ...patch }));
      setIsLoading(false);
    }, 200);
  }, []);

  const retryLoad = () => {
    setHasError(false);
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 220);
  };

  return (
    <div className="traceability-report-card-grid mt-4">
      <TraceabilityFilterBar
        projectPicker={data.projectPicker}
        filters={filters}
        advancedFiltersOpen={advancedDrawerOpen}
        onFilterChange={onFilterChange}
        onOpenAdvancedFilters={() => setAdvancedDrawerOpen(true)}
      />

      <TraceabilityAdvancedFiltersDrawer
        open={advancedDrawerOpen}
        filters={filters}
        onClose={() => setAdvancedDrawerOpen(false)}
        onApply={onApplyAdvanced}
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
        artifactGateRows={filteredArtifactGateRows}
        evidenceApprovalRows={filteredEvidenceApprovalRows}
        gapRows={filteredGapRows}
        gapsViewAllHref={`/projects/${data.project.id}/traceability/gaps`}
        gapsShowViewAll={gapsShowViewAll}
        onSelectGap={handleSelectGap}
      />

      <TraceabilityActionBar
        actionState={data.actionState}
        matrixData={data}
        onCreateTraceLink={handleOpenCreate}
        onOpenExportModal={exportToolbar ? () => exportToolbar.onOpenChange(true) : undefined}
      />

      <TraceabilityGapDrawer
        open={selectedGap !== null}
        gap={selectedGap}
        onClose={handleCloseGapDrawer}
        onCreateLink={handleCreateLinkFromGap}
        onAcceptRisk={handleAcceptRisk}
        onAssignRemediation={handleAssignRemediation}
      />

      <CreateTraceLinkModal
        open={createOpen}
        projectId={data.project.id}
        endpoints={data.assignableEndpoints}
        prefill={createPrefill}
        onClose={handleCloseCreate}
      />

      <AcceptTraceabilityRiskModal
        open={acceptGap !== null}
        gap={acceptGap}
        projectId={data.project.id}
        onClose={handleCloseAccept}
      />

      <AssignTraceabilityRemediationModal
        open={assignGap !== null}
        gap={assignGap}
        projectId={data.project.id}
        assignableUsers={data.assignableUsers}
        onClose={handleCloseAssign}
      />

      {exportToolbar ? (
        <ExportTraceabilityMatrixModal
          open={exportToolbar.open}
          onClose={() => exportToolbar.onOpenChange(false)}
          viewModel={exportViewModel}
          defaultScope="current_filters"
        />
      ) : null}

      <p className="traceability-grid-span-12 flex items-center gap-2 text-xs text-slate-500">
        <CircleHelp className="size-3.5" aria-hidden />
        Use Export matrix to choose scope (filters vs full project), format, and metadata. ZIP bundles CSV, JSON, and a
        printable HTML report.
      </p>
    </div>
  );
}
