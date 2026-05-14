import type {
  ArtifactGateCoverage,
  EvidenceApprovalCoverage,
  GateEvidenceCoverage,
  PhaseArtifactCoverage,
  RequirementDesignCoverage,
  RequirementTestCoverage,
  TraceabilityGap,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

import type { GapTabId } from "./traceability-filtering";
import { cardVisible } from "./traceability-filtering";
import { ArtifactGateLinksCard } from "./artifact-gate-links-card";
import { CoverageSummaryCard } from "./coverage-summary-card";
import { EvidenceApprovalLinksCard } from "./evidence-approval-links-card";
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
  artifactGateRows,
  evidenceApprovalRows,
  gapRows,
  gapsViewAllHref,
  gapsShowViewAll = true,
  onSelectGap,
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
  artifactGateRows: ArtifactGateCoverage[];
  evidenceApprovalRows: EvidenceApprovalCoverage[];
  gapRows: TraceabilityGap[];
  gapsViewAllHref: string;
  /** When false, the gaps card header hides “View All” (dedicated gaps route). */
  gapsShowViewAll?: boolean;
  onSelectGap?: (gap: TraceabilityGap) => void;
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

      {cardVisible(filters.viewMode, "artifact-gate") ? (
        <div className="traceability-grid-span-4">
          <ArtifactGateLinksCard rows={artifactGateRows} isLoading={isLoading} projectId={data.project.id} />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "evidence-approval") ? (
        <div className="traceability-grid-span-4">
          <EvidenceApprovalLinksCard rows={evidenceApprovalRows} isLoading={isLoading} projectId={data.project.id} />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "gaps") ? (
        <div className="traceability-grid-span-4">
          <GapsOrphansCard
            rows={gapRows}
            isLoading={isLoading}
            reportHref={data.coverageSummary.reportHref}
            viewAllHref={gapsViewAllHref}
            showViewAll={gapsShowViewAll}
            activeGapTab={activeGapTab}
            onActiveGapTabChange={onActiveGapTabChange}
            onSelectGap={onSelectGap}
          />
        </div>
      ) : null}

      {cardVisible(filters.viewMode, "coverage") ? (
        <div className="traceability-grid-span-4">
          <CoverageSummaryCard
            coverageSummary={data.coverageSummary}
            isLoading={isLoading}
            projectId={data.project.id}
          />
        </div>
      ) : null}
    </>
  );
}
