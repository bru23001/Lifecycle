"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FileText, MoreHorizontal, Share2, Star } from "lucide-react";

import {
  WorkspaceCard,
  WorkspaceCardBody,
  WorkspaceCardHeader,
} from "@/components/lifecycle-workspace/workspace-card";
import { Button } from "@/components/ui/button";
import {
  evidenceClassificationBadgeMap,
  evidenceStatusBadgeMap,
} from "@/lib/evidence-status";
import { cn } from "@/lib/utils";
import type {
  EvidenceCenterSelectedEvidence,
  EvidenceGateLinkOption,
  EvidenceHistoryEvent,
  EvidenceLinkableArtifact,
  EvidencePhaseLinkOption,
} from "@/types/evidence-center.types";

import { ArchiveEvidenceModal } from "./archive-evidence-modal";
import type { EvidenceTab } from "./evidence-center-shared";
import { EvidenceBadge, MetaItem } from "./evidence-center-shared";
import { DeleteEvidenceModal } from "./delete-evidence-modal";
import {
  DownloadEvidenceConfirmModal,
  evidenceDownloadNeedsConfirmation,
} from "./download-evidence-confirm-modal";
import { EditEvidenceMetadataDrawer } from "./edit-evidence-metadata-drawer";
import { EvidenceCommentsBlock } from "./evidence-comments-block";
import {
  EvidenceFilePreview,
  EvidencePreviewToolbarActions,
} from "./evidence-file-preview";
import { EvidenceHistoryEventDrawer } from "./evidence-history-event-drawer";
import { EvidencePreviewModal } from "./evidence-preview-modal";
import {
  LinkEvidenceArtifactModal,
  type ArtifactPick,
} from "./link-evidence-artifact-modal";
import { LinkEvidenceGateModal } from "./link-evidence-gate-modal";
import { LinkEvidencePhaseModal } from "./link-evidence-phase-modal";
import { ReplaceEvidenceFileModal } from "./replace-evidence-file-modal";
import { ShareEvidenceModal } from "./share-evidence-modal";
import { UnlinkArtifactConfirmModal } from "./unlink-artifact-confirm-modal";
import { UnlinkGateConfirmModal } from "./unlink-gate-confirm-modal";
import { UnlinkPhaseConfirmModal } from "./unlink-phase-confirm-modal";

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

function buildMetadataColumns(
  selectedEvidence: EvidenceCenterSelectedEvidence,
): MetadataItem[][] {
  const d = selectedEvidence.detail;
  const classificationLabel =
    evidenceClassificationBadgeMap[d.classification].label;
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
          <span
            key={tag}
            className="rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
          >
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
      {
        id: "confidentiality",
        label: "Confidentiality",
        value: classificationLabel,
      },
      {
        id: "retention-policy",
        label: "Retention Policy",
        value: d.retentionPolicyLabel ?? "—",
      },
    ],
    [
      {
        id: "classification",
        label: "Classification",
        value: classificationLabel,
      },
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
    [
      "linked_artifacts",
      `Linked Artifacts (${selectedEvidence.linkedArtifacts.length})`,
    ],
    ["linked_gates", `Linked Gates (${selectedEvidence.linkedGates.length})`],
    [
      "linked_phases",
      `Linked Phases (${selectedEvidence.linkedPhases.length})`,
    ],
    ["history", `History (${selectedEvidence.history.length})`],
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
            {active ? (
              <span className="absolute inset-x-5 bottom-0 h-[3px] rounded-full bg-blue-600" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function MetadataSection({
  selectedEvidence,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
}) {
  const columns = buildMetadataColumns(selectedEvidence);

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold text-slate-950">
        Evidence Metadata
      </h3>

      <div className="mt-7 grid grid-cols-1 gap-8 border-b border-slate-200 pb-8 lg:grid-cols-3">
        {columns.map((column, index) => (
          <dl
            key={index}
            className={cn(
              "space-y-6",
              index !== 0 && "lg:border-l lg:border-slate-200 lg:pl-8",
            )}
          >
            {column.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[150px_1fr] sm:gap-5"
              >
                <dt className="text-sm font-semibold text-slate-600">
                  {item.label}
                </dt>
                <dd className="text-sm font-medium text-slate-800">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </section>
  );
}

export function LinkedSummary({
  selectedEvidence,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
}) {
  const pct = selectedEvidence.completeness.overallPercent;
  const cards: { id: string; label: string; value: ReactNode }[] = [
    {
      id: "linked-artifacts",
      label: "Linked Artifacts",
      value: String(selectedEvidence.linkedArtifacts.length),
    },
    {
      id: "linked-gates",
      label: "Linked Gates",
      value: String(selectedEvidence.linkedGates.length),
    },
    {
      id: "linked-phases",
      label: "Linked Phases",
      value: String(selectedEvidence.linkedPhases.length),
    },
    {
      id: "sections-covered",
      label: "Sections Covered",
      value: `${selectedEvidence.completeness.complete.percent}%`,
    },
    {
      id: "evidence-completeness",
      label: "Evidence Completeness",
      value: (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span>{pct}%</span>
            <div className="h-2 w-full min-w-[6rem] max-w-[8rem] overflow-hidden rounded-full bg-slate-200 sm:w-32">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <Link
              href={selectedEvidence.completeness.detailsHref}
              className="text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
            >
              View completeness details
            </Link>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
              <Link
                href={`${selectedEvidence.completeness.detailsHref}?status=complete`}
                className="text-blue-600 underline-offset-2 hover:underline"
              >
                Fully linked
              </Link>
              <Link
                href={`${selectedEvidence.completeness.detailsHref}?status=partial`}
                className="text-blue-600 underline-offset-2 hover:underline"
              >
                Partial
              </Link>
              <Link
                href={`${selectedEvidence.completeness.detailsHref}?status=missing`}
                className="text-blue-600 underline-offset-2 hover:underline"
              >
                Gate gaps
              </Link>
              <Link
                href={`${selectedEvidence.completeness.detailsHref}?status=unlinked`}
                className="text-blue-600 underline-offset-2 hover:underline"
              >
                Unlinked
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold text-slate-950">Linked Summary</h3>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article
            key={card.id}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-semibold text-slate-600">{card.label}</p>
            <div className="mt-4 text-2xl font-semibold text-slate-950">
              {card.value}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EvidenceOverflowMenu({
  disabled,
  onPreview,
  onEditMetadata,
  onLinkArtifact,
  onLinkGate,
  onLinkPhase,
  onDownload,
  onReplaceFile,
  onArchive,
  onDelete,
}: {
  disabled?: boolean;
  onPreview: () => void;
  onEditMetadata: () => void;
  onLinkArtifact: () => void;
  onLinkGate: () => void;
  onLinkPhase: () => void;
  onDownload: () => void;
  onReplaceFile: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const itemClass =
    "block w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        aria-label="More evidence actions"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onPreview();
            }}
          >
            Preview
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onEditMetadata();
            }}
          >
            Edit metadata
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onLinkArtifact();
            }}
          >
            Link to artifact
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onLinkGate();
            }}
          >
            Link to gate
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onLinkPhase();
            }}
          >
            Link to phase
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onDownload();
            }}
          >
            Download
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onReplaceFile();
            }}
          >
            Replace file
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onArchive();
            }}
          >
            Archive
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-red-700 hover:bg-red-50`}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function EvidenceDetailHeader({
  selectedEvidence,
  actionsDisabled,
  onShare,
  onOverflowPreview,
  onEditMetadata,
  onLinkArtifact,
  onLinkGate,
  onLinkPhase,
  onDownload,
  onReplaceFile,
  onArchive,
  onDelete,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
  actionsDisabled?: boolean;
  onShare: () => void;
  onOverflowPreview: () => void;
  onEditMetadata: () => void;
  onLinkArtifact: () => void;
  onLinkGate: () => void;
  onLinkPhase: () => void;
  onDownload: () => void;
  onReplaceFile: () => void;
  onArchive: () => void;
  onDelete: () => void;
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
              <h2 className="text-2xl font-semibold text-[#111827]">
                {selectedEvidence.detail.name}
              </h2>
              <EvidenceBadge
                {...evidenceStatusBadgeMap[selectedEvidence.detail.status]}
              />
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {selectedEvidence.detail.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Star evidence"
          >
            <Star className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            aria-label="Share evidence"
            disabled={actionsDisabled}
            onClick={onShare}
          >
            <Share2 className="size-3.5" aria-hidden />
            Share
          </Button>
          <EvidenceOverflowMenu
            disabled={actionsDisabled}
            onPreview={onOverflowPreview}
            onEditMetadata={onEditMetadata}
            onLinkArtifact={onLinkArtifact}
            onLinkGate={onLinkGate}
            onLinkPhase={onLinkPhase}
            onDownload={onDownload}
            onReplaceFile={onReplaceFile}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>
      </div>
    </WorkspaceCardHeader>
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
          selectedEvidence.detail.phaseNumber &&
          selectedEvidence.detail.phaseName
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
      <MetaItem
        label="Uploaded By"
        value={selectedEvidence.detail.uploadedBy}
      />
      <MetaItem
        label="Uploaded On"
        value={selectedEvidence.detail.uploadedOnLabel}
      />
      <MetaItem
        label="File Type"
        value={selectedEvidence.detail.fileTypeLabel}
      />
      <MetaItem
        label="File Size"
        value={selectedEvidence.detail.fileSizeLabel ?? "—"}
      />
      <MetaItem
        label="Evidence ID"
        value={selectedEvidence.detail.evidenceCode}
      />
      <MetaItem
        label="Status"
        value={evidenceStatusBadgeMap[selectedEvidence.detail.status].label}
      />
    </dl>
  );
}

export function EvidenceDetailPanel({
  projectId,
  artifacts,
  linkableArtifacts,
  gateLinkOptions,
  phaseLinkOptions,
  selectedEvidence,
  selectedTab,
  onTabChange,
  onOpenAuditDetail,
}: {
  projectId: string;
  artifacts: ArtifactPick[];
  linkableArtifacts: EvidenceLinkableArtifact[];
  gateLinkOptions: EvidenceGateLinkOption[];
  phaseLinkOptions: EvidencePhaseLinkOption[];
  selectedEvidence: EvidenceCenterSelectedEvidence | null;
  selectedTab: EvidenceTab;
  onTabChange: (tab: EvidenceTab) => void;
  onOpenAuditDetail?: (auditId: string) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [linkArtifactOpen, setLinkArtifactOpen] = useState(false);
  const [linkGateOpen, setLinkGateOpen] = useState(false);
  const [linkPhaseOpen, setLinkPhaseOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [historyDrawerEvent, setHistoryDrawerEvent] =
    useState<EvidenceHistoryEvent | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unlinkGateTarget, setUnlinkGateTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unlinkPhaseTarget, setUnlinkPhaseTarget] = useState<{
    phaseNumber: number;
    label: string;
  } | null>(null);

  if (!selectedEvidence) {
    return (
      <WorkspaceCard fixed>
        <WorkspaceCardBody className="text-sm text-slate-600">
          <p>Select an evidence item to view details.</p>
        </WorkspaceCardBody>
      </WorkspaceCard>
    );
  }

  const evidenceId = selectedEvidence.detail.id;
  const isPlaceholder = evidenceId === "empty";

  const requestDownload = () => {
    const href = selectedEvidence.detail.downloadHref;
    if (!href) return;
    if (
      evidenceDownloadNeedsConfirmation(selectedEvidence.detail.classification)
    ) {
      setDownloadConfirmOpen(true);
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  const runConfirmedDownload = () => {
    const href = selectedEvidence.detail.downloadHref;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    setDownloadConfirmOpen(false);
  };

  return (
    <>
      {mutationError ? (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          <div className="flex items-center justify-between gap-2">
            <p>{mutationError}</p>
            <button
              type="button"
              className="shrink-0 font-medium underline"
              onClick={() => setMutationError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <WorkspaceCard fixed>
        <EvidenceDetailHeader
          selectedEvidence={selectedEvidence}
          actionsDisabled={isPlaceholder}
          onShare={() => setShareOpen(true)}
          onOverflowPreview={() => setPreviewOpen(true)}
          onEditMetadata={() => setEditOpen(true)}
          onLinkArtifact={() => setLinkArtifactOpen(true)}
          onLinkGate={() => setLinkGateOpen(true)}
          onLinkPhase={() => setLinkPhaseOpen(true)}
          onDownload={requestDownload}
          onReplaceFile={() => setReplaceOpen(true)}
          onArchive={() => setConfirmArchiveOpen(true)}
          onDelete={() => setConfirmDeleteOpen(true)}
        />
        <WorkspaceCardBody className="pt-4">
          <EvidenceMetadata selectedEvidence={selectedEvidence} />
        </WorkspaceCardBody>
      </WorkspaceCard>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <EvidenceTabs
          selectedEvidence={selectedEvidence}
          selectedTab={selectedTab}
          onTabChange={onTabChange}
        />

        <article className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-7">
          <div
            role="tabpanel"
            id={`evidence-tabpanel-${selectedTab}`}
            aria-labelledby={`evidence-tab-${selectedTab}`}
          >
            {selectedTab === "overview" && (
              <>
                <h2 className="mb-6 text-lg font-semibold text-slate-950">
                  File Preview
                </h2>
                {!isPlaceholder ? (
                  <EvidencePreviewToolbarActions
                    onOpenModal={() => setPreviewOpen(true)}
                    downloadHref={selectedEvidence.detail.downloadHref}
                    previewPageHref={`/projects/${projectId}/evidence/${selectedEvidence.detail.id}/preview`}
                  />
                ) : null}
                <EvidenceFilePreview selectedEvidence={selectedEvidence} />
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
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm"
                    >
                      <Link
                        href={item.href}
                        className="min-w-0 font-medium text-blue-600 hover:underline"
                      >
                        {item.label}
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                        disabled={isPlaceholder}
                        onClick={() =>
                          setUnlinkTarget({ id: item.id, label: item.label })
                        }
                      >
                        Unlink
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            )}

            {selectedTab === "linked_gates" && (
              <ul className="space-y-2">
                {selectedEvidence.linkedGates.length === 0 ? (
                  <li className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No linked gates.
                  </li>
                ) : (
                  selectedEvidence.linkedGates.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm"
                    >
                      <Link
                        href={item.href}
                        className="min-w-0 font-medium text-blue-600 hover:underline"
                      >
                        {item.label}
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                        disabled={isPlaceholder}
                        onClick={() =>
                          setUnlinkGateTarget({
                            id: item.id,
                            label: item.label,
                          })
                        }
                      >
                        Unlink
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            )}

            {selectedTab === "linked_phases" && (
              <ul className="space-y-2">
                {selectedEvidence.linkedPhases.length === 0 ? (
                  <li className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No linked lifecycle phases.
                  </li>
                ) : (
                  selectedEvidence.linkedPhases.map((item) => {
                    const m = /^phase-(\d{1,2})$/.exec(item.id);
                    const phaseNumber = m ? Number.parseInt(m[1], 10) : null;
                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm"
                      >
                        <Link
                          href={item.href}
                          className="min-w-0 font-medium text-blue-600 hover:underline"
                        >
                          {item.label}
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="shrink-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                          disabled={isPlaceholder || phaseNumber == null}
                          onClick={() => {
                            if (phaseNumber != null)
                              setUnlinkPhaseTarget({
                                phaseNumber,
                                label: item.label,
                              });
                          }}
                        >
                          Unlink
                        </Button>
                      </li>
                    );
                  })
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
                    <li
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-white p-0 text-sm text-slate-700"
                    >
                      <button
                        type="button"
                        className="flex w-full flex-col items-start gap-1 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
                        onClick={() => setHistoryDrawerEvent(item)}
                      >
                        <span className="font-medium text-slate-900">
                          {item.summaryLabel}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.timestampLabel}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}

            {selectedTab === "comments" && (
              <EvidenceCommentsBlock
                projectId={projectId}
                evidenceId={evidenceId}
                comments={selectedEvidence.comments}
                disabled={isPlaceholder}
                onMutationError={(msg) => setMutationError(msg)}
              />
            )}
          </div>
        </article>
      </section>

      {!isPlaceholder ? (
        <>
          <EvidenceHistoryEventDrawer
            open={historyDrawerEvent != null}
            event={historyDrawerEvent}
            onClose={() => setHistoryDrawerEvent(null)}
            onOpenAuditDetail={onOpenAuditDetail}
          />
          <EvidencePreviewModal
            open={previewOpen}
            selectedEvidence={selectedEvidence}
            onClose={() => setPreviewOpen(false)}
          />
          <EditEvidenceMetadataDrawer
            open={editOpen}
            projectId={projectId}
            selectedEvidence={selectedEvidence}
            onClose={() => setEditOpen(false)}
          />
          <LinkEvidenceArtifactModal
            open={linkArtifactOpen}
            evidenceId={evidenceId}
            selectedEvidence={selectedEvidence}
            linkableArtifacts={linkableArtifacts}
            linkedArtifactIds={selectedEvidence.linkedArtifacts.map(
              (x) => x.id,
            )}
            onClose={() => setLinkArtifactOpen(false)}
          />
          <LinkEvidenceGateModal
            open={linkGateOpen}
            projectId={projectId}
            evidenceId={evidenceId}
            selectedEvidence={selectedEvidence}
            gateLinkOptions={gateLinkOptions}
            linkedGateIds={selectedEvidence.linkedGates.map((x) => x.id)}
            onClose={() => setLinkGateOpen(false)}
          />
          <LinkEvidencePhaseModal
            open={linkPhaseOpen}
            projectId={projectId}
            evidenceId={evidenceId}
            evidenceSummary={`${selectedEvidence.detail.evidenceCode} · ${selectedEvidence.detail.name}`}
            phaseLinkOptions={phaseLinkOptions}
            linkedPhaseIds={selectedEvidence.linkedPhases.map((p) => p.id)}
            artifacts={artifacts}
            onClose={() => setLinkPhaseOpen(false)}
          />
          <ShareEvidenceModal
            open={shareOpen}
            projectId={projectId}
            evidenceId={evidenceId}
            evidenceCode={selectedEvidence.detail.evidenceCode}
            evidenceName={selectedEvidence.detail.name}
            onClose={() => setShareOpen(false)}
          />
          <ReplaceEvidenceFileModal
            open={replaceOpen}
            selectedEvidence={selectedEvidence}
            onClose={() => setReplaceOpen(false)}
          />
          <DownloadEvidenceConfirmModal
            open={downloadConfirmOpen}
            fileName={selectedEvidence.detail.name}
            classification={selectedEvidence.detail.classification}
            onClose={() => setDownloadConfirmOpen(false)}
            onConfirm={runConfirmedDownload}
          />
          <ArchiveEvidenceModal
            open={confirmArchiveOpen}
            projectId={projectId}
            selectedEvidence={selectedEvidence}
            onClose={() => setConfirmArchiveOpen(false)}
            onError={(msg) => setMutationError(msg)}
          />
          <DeleteEvidenceModal
            open={confirmDeleteOpen}
            projectId={projectId}
            selectedEvidence={selectedEvidence}
            onClose={() => setConfirmDeleteOpen(false)}
            onError={(msg) => setMutationError(msg)}
          />
          <UnlinkArtifactConfirmModal
            open={unlinkTarget != null}
            projectId={projectId}
            evidenceId={evidenceId}
            evidenceSummary={`${selectedEvidence.detail.evidenceCode} · ${selectedEvidence.detail.name}`}
            artifactId={unlinkTarget?.id ?? ""}
            artifactLabel={unlinkTarget?.label ?? ""}
            onClose={() => setUnlinkTarget(null)}
            onError={(msg) => setMutationError(msg)}
          />
          <UnlinkGateConfirmModal
            open={unlinkGateTarget != null}
            projectId={projectId}
            evidenceId={evidenceId}
            evidenceSummary={`${selectedEvidence.detail.evidenceCode} · ${selectedEvidence.detail.name}`}
            gateCode={unlinkGateTarget?.id ?? ""}
            gateLabel={unlinkGateTarget?.label ?? ""}
            onClose={() => setUnlinkGateTarget(null)}
            onError={(msg) => setMutationError(msg)}
          />
          <UnlinkPhaseConfirmModal
            open={unlinkPhaseTarget != null}
            projectId={projectId}
            evidenceId={evidenceId}
            evidenceSummary={`${selectedEvidence.detail.evidenceCode} · ${selectedEvidence.detail.name}`}
            phaseNumber={unlinkPhaseTarget?.phaseNumber ?? 1}
            phaseLabel={unlinkPhaseTarget?.label ?? ""}
            onClose={() => setUnlinkPhaseTarget(null)}
            onError={(msg) => setMutationError(msg)}
          />
        </>
      ) : null}
    </>
  );
}
