"use client";

import Link from "next/link";

import {
  WorkspaceCard,
  WorkspaceCardBody,
  WorkspaceCardHeader,
} from "@/components/lifecycle-workspace/workspace-card";
import { Button } from "@/components/ui/button";
import type { EvidenceByGate, EvidenceByPhase, EvidenceCenterData, EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

import { CompletionRing, CoverageRow, EvidenceBadge } from "./evidence-center-shared";

export function EvidenceCoveragePanel({
  data,
  selectedEvidence,
  selectedForExport,
  onExport,
}: {
  data: EvidenceCenterData;
  selectedEvidence: EvidenceCenterSelectedEvidence;
  selectedForExport: string[];
  onExport: (scope: "selected" | "gate" | "full", evidenceIds: string[]) => Promise<void>;
}) {
  return (
    <>
      <EvidenceCompletenessCard selectedEvidence={selectedEvidence} />
      <EvidenceByGateCard projectId={data.project.id} rows={data.evidenceByGate} />
      <EvidenceByPhaseCard projectId={data.project.id} rows={data.evidenceByPhase} />
      <EvidenceExportBundleCard
        exportBundle={data.exportBundle}
        selectedForExport={selectedForExport}
        onExport={onExport}
      />
    </>
  );
}

export function EvidenceCompletenessCard({
  selectedEvidence,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
}) {
  return (
    <WorkspaceCard fixed>
      <WorkspaceCardHeader className="space-y-3 pb-2">
        <h3 className="text-base font-semibold text-[#111827]">Evidence Completeness</h3>
        <div className="flex items-center justify-between gap-3">
          <CompletionRing percent={selectedEvidence.completeness.overallPercent} />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <EvidenceBadge label="Complete" tone="green" />
              <span>
                {selectedEvidence.completeness.complete.percent}% ({selectedEvidence.completeness.complete.count})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <EvidenceBadge label="Partial" tone="amber" />
              <span>
                {selectedEvidence.completeness.partial.percent}% ({selectedEvidence.completeness.partial.count})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <EvidenceBadge label="Missing" tone="red" />
              <span>
                {selectedEvidence.completeness.missing.percent}% ({selectedEvidence.completeness.missing.count})
              </span>
            </li>
          </ul>
        </div>
        <Link href={selectedEvidence.completeness.detailsHref} className="inline-block text-sm font-semibold text-[#2563eb] hover:underline">
          View Completeness Details
        </Link>
      </WorkspaceCardHeader>
    </WorkspaceCard>
  );
}

export function EvidenceByGateCard({
  projectId,
  rows,
}: {
  projectId: string;
  rows: EvidenceByGate[];
}) {
  return (
    <WorkspaceCard>
      <WorkspaceCardHeader className="mb-0 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#111827]">Evidence by Gate</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{rows.length}</span>
          </div>
          <Link href={`/projects/${projectId}/traceability/gate-evidence`} className="text-xs font-semibold text-[#2563eb] hover:underline">
            View Gate Evidence Matrix
          </Link>
        </div>
      </WorkspaceCardHeader>
      <WorkspaceCardBody className="pt-0">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p>No gate evidence links exist yet.</p>
            <Link href={`/projects/${projectId}/gates/g1/review`} className="mt-2 inline-block font-semibold text-[#2563eb] hover:underline">
              Open Gate Review
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2">Gate</th>
                  <th className="pb-2">Evidence Linked</th>
                  <th className="pb-2">Required</th>
                  <th className="pb-2">Coverage</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
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
      </WorkspaceCardBody>
    </WorkspaceCard>
  );
}

export function EvidenceByPhaseCard({
  projectId,
  rows,
}: {
  projectId: string;
  rows: EvidenceByPhase[];
}) {
  return (
    <WorkspaceCard>
      <WorkspaceCardHeader className="mb-0 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#111827]">Evidence by Phase</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{rows.length}</span>
          </div>
          <Link href={`/projects/${projectId}/traceability/phase-evidence`} className="text-xs font-semibold text-[#2563eb] hover:underline">
            View Phase Evidence Matrix
          </Link>
        </div>
      </WorkspaceCardHeader>
      <WorkspaceCardBody className="pt-0">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p>No phase evidence links exist yet.</p>
            <Link href={`/projects/${projectId}/workspace`} className="mt-2 inline-block font-semibold text-[#2563eb] hover:underline">
              Open Lifecycle Workspace
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2">Phase</th>
                  <th className="pb-2">Evidence Items</th>
                  <th className="pb-2">Required</th>
                  <th className="pb-2">Coverage</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
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
      </WorkspaceCardBody>
    </WorkspaceCard>
  );
}

export function EvidenceExportBundleCard({
  exportBundle,
  selectedForExport,
  onExport,
}: {
  exportBundle: EvidenceCenterData["exportBundle"];
  selectedForExport: string[];
  onExport: (scope: "selected" | "gate" | "full", evidenceIds: string[]) => Promise<void>;
}) {
  return (
    <WorkspaceCard fixed>
      <WorkspaceCardHeader className="space-y-2 pb-3">
        <h3 className="text-base font-semibold text-[#111827]">Evidence Export Bundle</h3>
        <p className="text-sm text-slate-600">Export selected evidence with metadata and traceability references.</p>
      </WorkspaceCardHeader>
      <WorkspaceCardBody className="pt-0">
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!exportBundle.canExportSelected || selectedForExport.length === 0}
            onClick={() => void onExport("selected", selectedForExport)}
            aria-label="Export selected evidence as ZIP bundle"
          >
            Export Selected
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!exportBundle.canExportByGate}
            onClick={() => void onExport("gate", selectedForExport)}
            aria-label="Export evidence by gate as ZIP bundle"
          >
            Export by Gate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!exportBundle.canExportFullBundle}
            onClick={() => void onExport("full", selectedForExport)}
            aria-label="Export full evidence bundle as ZIP"
          >
            Export Full Bundle
          </Button>
        </div>
      </WorkspaceCardBody>
    </WorkspaceCard>
  );
}
