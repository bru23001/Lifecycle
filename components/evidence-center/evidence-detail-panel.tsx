"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Menu,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Printer,
  RotateCw,
  Share2,
  Star,
} from "lucide-react";

import {
  WorkspaceCard,
  WorkspaceCardBody,
  WorkspaceCardHeader,
} from "@/components/lifecycle-workspace/workspace-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { evidenceClassificationBadgeMap, evidenceStatusBadgeMap } from "@/lib/evidence-status";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

import type { EvidenceTab } from "./evidence-center-shared";
import { EvidenceBadge, MetaItem } from "./evidence-center-shared";

type MetadataItem = {
  id: string;
  label: string;
  value: ReactNode;
};

function truncateMiddle(value: string, max = 44) {
  if (value.length <= max) return value;
  const head = value.slice(0, 20);
  const tail = value.slice(-12);
  return `${head}…${tail}`;
}

function buildMetadataColumns(selectedEvidence: EvidenceCenterSelectedEvidence): MetadataItem[][] {
  const d = selectedEvidence.detail;
  const classificationLabel = evidenceClassificationBadgeMap[d.classification].label;
  const phaseGate =
    d.phaseNumber && d.phaseName && d.gateCode && d.gateName
      ? `Phase ${d.phaseNumber}, ${d.gateCode} ${d.gateName}`
      : d.phaseNumber && d.phaseName
        ? `Phase ${d.phaseNumber}: ${d.phaseName}`
        : "—";

  const tagsValue =
    d.tags.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {d.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {tag}
          </span>
        ))}
      </div>
    ) : (
      "—"
    );

  return [
    [
      { id: "evidence-type", label: "Evidence Type", value: d.fileTypeLabel },
      { id: "source", label: "Source", value: d.source ?? "—" },
      { id: "confidentiality", label: "Confidentiality", value: classificationLabel },
      { id: "retention-policy", label: "Retention Policy", value: d.retentionPolicyLabel ?? "—" },
    ],
    [
      { id: "classification", label: "Classification", value: classificationLabel },
      { id: "version", label: "Version", value: "—" },
      { id: "tags", label: "Tags", value: tagsValue },
    ],
    [
      { id: "linked-to", label: "Linked To", value: phaseGate },
      {
        id: "checksum",
        label: "Checksum (SHA-256)",
        value: d.checksum ? truncateMiddle(d.checksum) : "—",
      },
      { id: "notes", label: "Notes", value: d.notes ?? "—" },
    ],
  ];
}

function EvidenceTabs({
  selectedEvidence,
  selectedTab,
  onTabChange,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
  selectedTab: EvidenceTab;
  onTabChange: (tab: EvidenceTab) => void;
}) {
  const tabs: { id: EvidenceTab; label: string }[] = [
    ["overview", "Overview"],
    ["linked_artifacts", `Linked Artifacts (${selectedEvidence.linkedArtifacts.length})`],
    ["linked_gates", `Linked Gates (${selectedEvidence.linkedGates.length})`],
    ["history", "History"],
    ["comments", `Comments (${selectedEvidence.comments.length})`],
  ].map(([id, label]) => ({ id: id as EvidenceTab, label }));

  return (
    <nav
      role="tablist"
      aria-label="Evidence detail tabs"
      className="flex overflow-x-auto border-b border-slate-200 px-6"
    >
      {tabs.map((tab) => {
        const active = selectedTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`evidence-tab-${tab.id}`}
            aria-controls={`evidence-tabpanel-${tab.id}`}
            aria-selected={active}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative h-16 shrink-0 px-5 text-base font-semibold outline-none transition",
              active ? "text-blue-600" : "text-slate-700 hover:text-slate-950",
            )}
          >
            {tab.label}
            {active ? <span className="absolute inset-x-5 bottom-0 h-[3px] rounded-full bg-blue-600" /> : null}
          </button>
        );
      })}
    </nav>
  );
}

function PdfPreviewMockup({ title }: { title: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className="flex h-14 items-center justify-between bg-slate-800 px-4 text-white min-[480px]:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 min-[480px]:gap-8">
          <Menu className="h-6 w-6 shrink-0" aria-hidden />

          <span className="hidden text-sm font-semibold sm:inline">1 / 18</span>

          <div className="flex items-center gap-3 min-[480px]:gap-5">
            <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Zoom out">
              <Minus className="h-5 w-5" aria-hidden />
            </button>
            <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold min-[480px]:px-3 min-[480px]:text-sm">
              100%
            </span>
            <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Zoom in">
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Rotate preview">
              <RotateCw className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 min-[480px]:gap-5">
          <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Download">
            <Download className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" className="hidden rounded p-1 hover:bg-slate-700 sm:block" aria-label="Print">
            <Printer className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="More preview actions">
            <MoreVertical className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative h-[320px] overflow-hidden bg-slate-100 px-4 py-6 min-[640px]:h-[430px] min-[640px]:px-10 min-[640px]:py-8">
        <div className="mx-auto h-full max-w-[1000px] overflow-y-auto bg-white px-6 py-8 shadow-sm min-[640px]:px-20 min-[640px]:py-16">
          <h2 className="text-xl font-bold text-slate-950 min-[640px]:text-3xl">{title}</h2>

          <p className="mt-4 text-lg font-semibold text-slate-800 min-[640px]:mt-5 min-[640px]:text-2xl">
            Identity Management Solutions
          </p>

          <h3 className="mt-6 text-base font-bold text-slate-950 min-[640px]:mt-10 min-[640px]:text-lg">
            1. Executive Summary
          </h3>

          <p className="mt-3 text-sm text-slate-700 min-[640px]:mt-5 min-[640px]:text-base">
            This report provides an overview of the current market landscape for identity management solutions.
          </p>

          <table className="mt-6 w-full max-w-[760px] text-left text-xs min-[640px]:mt-8 min-[640px]:text-sm">
            <thead>
              <tr className="text-slate-700">
                <th className="py-2 min-[640px]:py-3">Solution</th>
                <th className="py-2 min-[640px]:py-3">Vendor</th>
                <th className="py-2 min-[640px]:py-3">Share</th>
                <th className="py-2 min-[640px]:py-3">Strengths</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr>
                <td className="py-2 min-[640px]:py-3">Okta</td>
                <td className="py-2 min-[640px]:py-3">Okta</td>
                <td className="py-2 min-[640px]:py-3">18%</td>
                <td className="py-2 min-[640px]:py-3">Security, scale</td>
              </tr>
              <tr>
                <td className="py-2 min-[640px]:py-3">Azure AD</td>
                <td className="py-2 min-[640px]:py-3">Microsoft</td>
                <td className="py-2 min-[640px]:py-3">15%</td>
                <td className="py-2 min-[640px]:py-3">Integration</td>
              </tr>
              <tr>
                <td className="py-2 min-[640px]:py-3">Ping Identity</td>
                <td className="py-2 min-[640px]:py-3">Ping</td>
                <td className="py-2 min-[640px]:py-3">9%</td>
                <td className="py-2 min-[640px]:py-3">Customization</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pointer-events-none absolute right-2 top-16 hidden h-[70%] w-2 rounded-full bg-slate-300 min-[640px]:right-4 min-[640px]:block">
          <div className="h-16 rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  );
}

export function EvidencePreview({ selectedEvidence }: { selectedEvidence: EvidenceCenterSelectedEvidence }) {
  if (selectedEvidence.detail.evidenceType === "pdf") {
    return <PdfPreviewMockup title={selectedEvidence.detail.name} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
      <p>Preview is not available for this evidence type.</p>
      {selectedEvidence.detail.downloadHref ? (
        <a
          href={selectedEvidence.detail.downloadHref}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 inline-flex")}
        >
          Download File
        </a>
      ) : null}
    </div>
  );
}

function MetadataSection({ selectedEvidence }: { selectedEvidence: EvidenceCenterSelectedEvidence }) {
  const columns = buildMetadataColumns(selectedEvidence);

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold text-slate-950">Evidence Metadata</h3>

      <div className="mt-7 grid grid-cols-1 gap-8 border-b border-slate-200 pb-8 lg:grid-cols-3">
        {columns.map((column, index) => (
          <dl
            key={index}
            className={cn("space-y-6", index !== 0 && "lg:border-l lg:border-slate-200 lg:pl-8")}
          >
            {column.map((item) => (
              <div key={item.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[150px_1fr] sm:gap-5">
                <dt className="text-sm font-semibold text-slate-600">{item.label}</dt>
                <dd className="text-sm font-medium text-slate-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </section>
  );
}

export function LinkedSummary({ selectedEvidence }: { selectedEvidence: EvidenceCenterSelectedEvidence }) {
  const pct = selectedEvidence.completeness.overallPercent;
  const cards: { id: string; label: string; value: ReactNode }[] = [
    { id: "linked-artifacts", label: "Linked Artifacts", value: String(selectedEvidence.linkedArtifacts.length) },
    { id: "linked-gates", label: "Linked Gates", value: String(selectedEvidence.linkedGates.length) },
    {
      id: "sections-covered",
      label: "Sections Covered",
      value: `${selectedEvidence.completeness.complete.percent}%`,
    },
    {
      id: "evidence-completeness",
      label: "Evidence Completeness",
      value: (
        <div className="flex flex-wrap items-center gap-3">
          <span>{pct}%</span>
          <div className="h-2 w-full min-w-[6rem] max-w-[8rem] overflow-hidden rounded-full bg-slate-200 sm:w-32">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold text-slate-950">Linked Summary</h3>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-600">{card.label}</p>
            <div className="mt-4 text-2xl font-semibold text-slate-950">{card.value}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EvidenceDetailHeader({ selectedEvidence }: { selectedEvidence: EvidenceCenterSelectedEvidence }) {
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

export function EvidenceMetadata({ selectedEvidence }: { selectedEvidence: EvidenceCenterSelectedEvidence }) {
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

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <EvidenceTabs selectedEvidence={selectedEvidence} selectedTab={selectedTab} onTabChange={onTabChange} />

        <article className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-7">
          <div role="tabpanel" id={`evidence-tabpanel-${selectedTab}`} aria-labelledby={`evidence-tab-${selectedTab}`}>
          {selectedTab === "overview" && (
            <>
              <h2 className="mb-6 text-lg font-semibold text-slate-950">File Preview</h2>
              <EvidencePreview selectedEvidence={selectedEvidence} />
              <MetadataSection selectedEvidence={selectedEvidence} />
              <LinkedSummary selectedEvidence={selectedEvidence} />
            </>
          )}

          {selectedTab === "linked_artifacts" && (
            <ul className="space-y-2">
              {selectedEvidence.linkedArtifacts.length === 0 ? (
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  No linked artifacts.
                </li>
              ) : (
                selectedEvidence.linkedArtifacts.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                    <Link href={item.href} className="font-medium text-blue-600 hover:underline">
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
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No linked gates.</li>
              ) : (
                selectedEvidence.linkedGates.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                    <Link href={item.href} className="font-medium text-blue-600 hover:underline">
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
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  No evidence history recorded yet.
                </li>
              ) : (
                selectedEvidence.history.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
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
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No comments yet.</li>
              ) : (
                selectedEvidence.comments.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <p className="font-medium">{item.author}</p>
                    <p className="mt-1">{item.body}</p>
                  </li>
                ))
              )}
            </ul>
          )}
          </div>
        </article>
      </section>
    </>
  );
}
