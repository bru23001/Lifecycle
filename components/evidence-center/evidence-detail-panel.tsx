"use client";

import Link from "next/link";
import { Download, FileText, MoreHorizontal, Share2, Star } from "lucide-react";

import {
  WorkspaceCard,
  WorkspaceCardBody,
  WorkspaceCardHeader,
} from "@/components/lifecycle-workspace/workspace-card";
import { Button } from "@/components/ui/button";
import { evidenceClassificationBadgeMap, evidenceStatusBadgeMap } from "@/lib/evidence-status";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

import type { EvidenceTab } from "./evidence-center-shared";
import { EvidenceBadge, MetaItem, SummaryTile } from "./evidence-center-shared";

export function EvidenceDetailPanel({
  selectedEvidence,
  selectedTab,
  onTabChange,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence | null;
  selectedTab: EvidenceTab;
  onTabChange: (tab: EvidenceTab) => void;
}) {
  if (!selectedEvidence) {
    return (
      <WorkspaceCard fixed>
        <WorkspaceCardBody className="text-sm text-slate-600">
          <p>Select an evidence item to view details.</p>
        </WorkspaceCardBody>
      </WorkspaceCard>
    );
  }

  return (
    <>
      <WorkspaceCard fixed>
        <EvidenceDetailHeader selectedEvidence={selectedEvidence} />
        <WorkspaceCardBody className="pt-4">
          <EvidenceMetadata selectedEvidence={selectedEvidence} />
        </WorkspaceCardBody>
      </WorkspaceCard>

      <WorkspaceCard>
        <WorkspaceCardHeader className="pb-0">
          <div role="tablist" aria-label="Evidence detail tabs" className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {(
              [
                ["overview", "Overview"],
                ["linked_artifacts", `Linked Artifacts (${selectedEvidence.linkedArtifacts.length})`],
                ["linked_gates", `Linked Gates (${selectedEvidence.linkedGates.length})`],
                ["history", "History"],
                ["comments", `Comments (${selectedEvidence.comments.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`evidence-tab-${id}`}
                aria-controls={`evidence-tabpanel-${id}`}
                aria-selected={selectedTab === id}
                onClick={() => onTabChange(id)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                  selectedTab === id
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </WorkspaceCardHeader>

        <WorkspaceCardBody className="pt-3">
          <div role="tabpanel" id={`evidence-tabpanel-${selectedTab}`} aria-labelledby={`evidence-tab-${selectedTab}`}>
            {selectedTab === "overview" && (
              <div className="space-y-3">
                <EvidencePreview selectedEvidence={selectedEvidence} />
                <section className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <MetaItem label="Evidence Type" value={selectedEvidence.detail.evidenceType} />
                  <MetaItem label="Source" value={selectedEvidence.detail.source ?? "—"} />
                  <MetaItem label="Classification" value={evidenceClassificationBadgeMap[selectedEvidence.detail.classification].label} />
                  <MetaItem label="Retention Policy" value={selectedEvidence.detail.retentionPolicyLabel ?? "—"} />
                  <MetaItem label="Checksum" value={selectedEvidence.detail.checksum ?? "—"} />
                  <MetaItem label="Notes" value={selectedEvidence.detail.notes ?? "—"} />
                </section>
                <LinkedSummary selectedEvidence={selectedEvidence} />
              </div>
            )}
            {selectedTab === "linked_artifacts" && (
              <ul className="space-y-2">
                {selectedEvidence.linkedArtifacts.length === 0 ? (
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No linked artifacts.</li>
                ) : (
                  selectedEvidence.linkedArtifacts.map((item) => (
                    <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                      <Link href={item.href} className="font-medium text-[#2563eb] hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
            {selectedTab === "linked_gates" && (
              <ul className="space-y-2">
                {selectedEvidence.linkedGates.length === 0 ? (
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No linked gates.</li>
                ) : (
                  selectedEvidence.linkedGates.map((item) => (
                    <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                      <Link href={item.href} className="font-medium text-[#2563eb] hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
            {selectedTab === "history" && (
              <ul className="space-y-2">
                {selectedEvidence.history.length === 0 ? (
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No evidence history recorded yet.
                  </li>
                ) : (
                  selectedEvidence.history.map((item) => (
                    <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.timestampLabel}</p>
                    </li>
                  ))
                )}
              </ul>
            )}
            {selectedTab === "comments" && (
              <ul className="space-y-2">
                {selectedEvidence.comments.length === 0 ? (
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No comments yet.</li>
                ) : (
                  selectedEvidence.comments.map((item) => (
                    <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      <p className="font-medium">{item.author}</p>
                      <p className="mt-1">{item.body}</p>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </WorkspaceCardBody>
      </WorkspaceCard>
    </>
  );
}

export function EvidenceDetailHeader({
  selectedEvidence,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
}) {
  return (
    <WorkspaceCardHeader className="border-b border-slate-100 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-red-100 text-red-700">
            <FileText className="size-5" aria-hidden />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-[#111827]">{selectedEvidence.detail.name}</h2>
              <EvidenceBadge {...evidenceStatusBadgeMap[selectedEvidence.detail.status]} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{selectedEvidence.detail.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon-sm" aria-label="Star evidence">
            <Star className="size-4" aria-hidden />
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" aria-label="Share evidence">
            <Share2 className="size-3.5" aria-hidden />
            Share
          </Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="More evidence actions">
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </WorkspaceCardHeader>
  );
}

export function EvidencePreview({
  selectedEvidence,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-800">File Preview</h3>
      {selectedEvidence.detail.evidenceType === "pdf" ? (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Preview 1 / 18</span>
            <div className="flex items-center gap-1">
              <button type="button" className="rounded border border-slate-200 bg-white px-2 py-0.5" aria-label="Zoom out preview">
                -
              </button>
              <button type="button" className="rounded border border-slate-200 bg-white px-2 py-0.5" aria-label="Zoom in preview">
                +
              </button>
              <button type="button" className="rounded border border-slate-200 bg-white px-2 py-0.5" aria-label="Download evidence file">
                <Download className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
          <div className="h-56 rounded-md border border-slate-100 bg-white p-4">
            <p className="text-lg font-semibold text-slate-800">{selectedEvidence.detail.name}</p>
            <p className="mt-2 text-sm text-slate-600">Preview excerpt. Open download for full source document.</p>
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
          <p>Preview is not available for this evidence type.</p>
          {selectedEvidence.detail.downloadHref ? (
            <Button type="button" variant="outline" size="sm" className="mt-2">
              Download File
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

export function EvidenceMetadata({
  selectedEvidence,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm min-[1024px]:grid-cols-5">
      <MetaItem label="Project" value={selectedEvidence.detail.projectName} />
      <MetaItem
        label="Phase"
        value={
          selectedEvidence.detail.phaseNumber && selectedEvidence.detail.phaseName
            ? `${selectedEvidence.detail.phaseNumber}. ${selectedEvidence.detail.phaseName}`
            : "—"
        }
      />
      <MetaItem
        label="Gate"
        value={
          selectedEvidence.detail.gateCode && selectedEvidence.detail.gateName
            ? `${selectedEvidence.detail.gateCode} ${selectedEvidence.detail.gateName}`
            : "—"
        }
      />
      <MetaItem label="Uploaded By" value={selectedEvidence.detail.uploadedBy} />
      <MetaItem label="Uploaded On" value={selectedEvidence.detail.uploadedOnLabel} />
      <MetaItem label="File Type" value={selectedEvidence.detail.fileTypeLabel} />
      <MetaItem label="File Size" value={selectedEvidence.detail.fileSizeLabel ?? "—"} />
      <MetaItem label="Evidence ID" value={selectedEvidence.detail.evidenceCode} />
      <MetaItem label="Status" value={evidenceStatusBadgeMap[selectedEvidence.detail.status].label} />
    </dl>
  );
}

export function LinkedSummary({
  selectedEvidence,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
}) {
  return (
    <section className="grid grid-cols-2 gap-2 min-[640px]:grid-cols-4">
      <SummaryTile label="Linked Artifacts" value={String(selectedEvidence.linkedArtifacts.length)} />
      <SummaryTile label="Linked Gates" value={String(selectedEvidence.linkedGates.length)} />
      <SummaryTile label="Sections Covered" value={`${selectedEvidence.completeness.complete.percent}%`} />
      <SummaryTile label="Evidence Completeness" value={`${selectedEvidence.completeness.overallPercent}%`} />
    </section>
  );
}
