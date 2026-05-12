import type {
  GateEvidenceCoverage,
  PhaseArtifactCoverage,
  RequirementDesignCoverage,
  RequirementTestCoverage,
  TraceabilityGap,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

import type { GapTabId } from "./traceability-filtering";
import { cardVisible } from "./traceability-filtering";
import { CoverageSummaryCard } from "./coverage-summary-card";
import { GapsOrphansCard } from "./gaps-orphans-card";
import { GateEvidenceLinksCard } from "./gate-evidence-links-card";
import { PhaseArtifactLinksCard } from "./phase-artifact-links-card";
import { RequirementDesignLinksCard } from "./requirement-design-links-card";
import { RequirementTestLinksCard } from "./requirement-test-links-card";

export function TraceabilityGrid({
  data,
  filters,
  isLoading,
  activeGapTab,
  onActiveGapTabChange,
  phaseRows,
  requirementDesignRows,
  requirementTestRows,
  gateRows,
  gapRows,
}: {
  data: TraceabilityMatrixData;
  filters: TraceabilityMatrixData["filters"];
  isLoading: boolean;
  activeGapTab: GapTabId;
  onActiveGapTabChange: (tab: GapTabId) => void;
  phaseRows: PhaseArtifactCoverage[];
  requirementDesignRows: RequirementDesignCoverage[];
  requirementTestRows: RequirementTestCoverage[];
  gateRows: GateEvidenceCoverage[];
  gapRows: TraceabilityGap[];
}) {
  return (
    <>
      {cardVisible(filters.viewMode, "phase") ? (
        <div className="traceability-grid-span-4">
          <PhaseArtifactLinksCard rows={phaseRows} isLoading={isLoading} projectId={data.project.id} />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "req-design") ? (
        <div className="traceability-grid-span-4">
          <RequirementDesignLinksCard rows={requirementDesignRows} isLoading={isLoading} projectId={data.project.id} />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "req-test") ? (
        <div className="traceability-grid-span-4">
          <RequirementTestLinksCard rows={requirementTestRows} isLoading={isLoading} projectId={data.project.id} />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "gate") ? (
        <div className="traceability-grid-span-4">
          <GateEvidenceLinksCard rows={gateRows} isLoading={isLoading} projectId={data.project.id} />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "gaps") ? (
        <div className="traceability-grid-span-4">
          <GapsOrphansCard
            rows={gapRows}
            isLoading={isLoading}
            reportHref={data.coverageSummary.reportHref}
            activeGapTab={activeGapTab}
            onActiveGapTabChange={onActiveGapTabChange}
          />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "coverage") ? (
        <div className="traceability-grid-span-4">
          <CoverageSummaryCard coverageSummary={data.coverageSummary} isLoading={isLoading} />
        </div>
      ) : null}
    </>
  );
}
