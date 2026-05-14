"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Share2, Shield, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge, MetaItem, MetaItemLink } from "@/components/approval-center/approval-center-shared";
import { ApprovalAttachmentsTab } from "@/components/approval-center/approval-attachments-tab";
import { ApprovalDetailActionsMenu } from "@/components/approval-center/approval-detail-actions-menu";
import {
  ApprovalApproversSection,
  type ApproverManagementHandle,
} from "@/components/approval-center/approval-approvers-section";
import { ApproverCommentsSection } from "@/components/approval-center/approver-comments-section";
import { RequiredInputsBlock } from "@/components/approval-center/required-inputs-block";
import { ShareApprovalPackageModal } from "@/components/approval-center/share-approval-package-modal";
import { ApprovalPackageExportModal } from "@/components/approval-center/approval-package-export-modal";
import { approvalStatusBadgeMap } from "@/lib/approval-status";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { ApprovalPackage, ApproverComment } from "@/types/approval-center.types";

type ApprovalDetailPanelProps = {
  selectedPackage?: ApprovalPackage;
  isLoading: boolean;
  currentUser: { name: string; role: string; initials: string };
  commentDraft: string;
  commentVisibility: ApproverComment["visibility"];
  commentBoxRef: RefObject<HTMLTextAreaElement | null>;
  onCommentDraftChange: (value: string) => void;
  onCommentVisibilityChange: (value: ApproverComment["visibility"]) => void;
  onAddComment: () => void;
  onAppendComment: (comment: ApproverComment) => void;
  onReplaceComments: (next: ApproverComment[]) => void;
  onPatchSelectedPackage: (updater: (prev: ApprovalPackage) => ApprovalPackage) => void;
};

function CountLink({
  label,
  count,
  primaryHref,
  listHref,
  singular,
  plural,
}: {
  label: string;
  count: number;
  primaryHref?: string;
  listHref?: string;
  singular: string;
  plural: string;
}) {
  const href = count > 0 ? (primaryHref ?? listHref) : undefined;
  const noun = count === 1 ? singular : plural;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5">
        {href ? (
          <Link href={href} className="text-sm font-semibold text-[#2563eb] hover:underline">
            {count} {noun}
          </Link>
        ) : (
          <span className="text-sm font-medium text-slate-800">
            {count} {noun}
          </span>
        )}
        {count > 0 && listHref && primaryHref && primaryHref !== listHref ? (
          <>
            {" · "}
            <Link href={listHref} className="text-xs font-semibold text-slate-600 underline-offset-2 hover:text-[#2563eb] hover:underline">
              Open library
            </Link>
          </>
        ) : null}
      </dd>
    </div>
  );
}

export function ApprovalDetailPanel({
  selectedPackage,
  isLoading,
  currentUser,
  commentDraft,
  commentVisibility,
  commentBoxRef,
  onCommentDraftChange,
  onCommentVisibilityChange,
  onAddComment,
  onAppendComment,
  onReplaceComments,
  onPatchSelectedPackage,
}: ApprovalDetailPanelProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"package" | "attachments">("package");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const approverMgmtRef = useRef<ApproverManagementHandle>(null);
  const d = selectedPackage?.detail;
  const canShare = Boolean(d && d.id !== "approval-none");

  useEffect(() => {
    setDetailTab("package");
  }, [selectedPackage?.detail.id]);

  return (
    <section data-pane="detail" className="approval-detail-panel min-w-0 flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {d && canShare ? (
        <ApprovalPackageExportModal open={exportModalOpen} pkg={selectedPackage ?? null} onClose={() => setExportModalOpen(false)} />
      ) : null}

      {d && canShare ? (
        <ShareApprovalPackageModal
          open={shareOpen}
          approvalId={d.id}
          packageTitle={d.title}
          onClose={() => setShareOpen(false)}
        />
      ) : null}

      {!selectedPackage ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          <p>Select an approval to review details.</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,auto)_auto_1fr] gap-3 overflow-hidden">
          <article className="min-h-0 overflow-auto rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <Shield className="size-5" aria-hidden />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[28px] font-semibold leading-none text-[#111827]">{selectedPackage.detail.approvalCode}</h2>
                    <h3 className="text-2xl font-semibold text-[#111827]">{selectedPackage.detail.title}</h3>
                    <Badge {...approvalStatusBadgeMap[selectedPackage.detail.status]} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{selectedPackage.detail.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon-sm" aria-label="Star approval" disabled title="Coming soon">
                  <Star className="size-4 opacity-50" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  aria-label="Share approval"
                  disabled={!canShare}
                  onClick={() => canShare && setShareOpen(true)}
                >
                  <Share2 className="size-3.5" aria-hidden />
                  Share
                </Button>
                <ApprovalDetailActionsMenu
                  detail={selectedPackage.detail}
                  onOpenDownloadPackage={canShare ? () => setExportModalOpen(true) : undefined}
                  approverQuickActions={
                    canShare
                      ? {
                          onAddApprover: () => approverMgmtRef.current?.openAddApprover(),
                          onReassign: () => approverMgmtRef.current?.openReassign(),
                          onEscalate: () => approverMgmtRef.current?.openEscalate(),
                        }
                      : undefined
                  }
                />
              </div>
            </header>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm min-[1024px]:grid-cols-5">
              {selectedPackage.detail.projectId ? (
                <MetaItemLink label="Project" href={projectOverviewHref(selectedPackage.detail.projectId)}>
                  {selectedPackage.detail.projectName}
                </MetaItemLink>
              ) : (
                <MetaItem label="Project" value={selectedPackage.detail.projectName || "—"} />
              )}
              {selectedPackage.detail.workspaceHref ? (
                <MetaItemLink label="Phase" href={selectedPackage.detail.workspaceHref}>
                  {selectedPackage.detail.phaseNumber && selectedPackage.detail.phaseName
                    ? `${selectedPackage.detail.phaseNumber} · ${selectedPackage.detail.phaseName}`
                    : "Workspace"}
                </MetaItemLink>
              ) : (
                <MetaItem
                  label="Phase"
                  value={
                    selectedPackage.detail.phaseNumber && selectedPackage.detail.phaseName
                      ? `${selectedPackage.detail.phaseNumber} ${selectedPackage.detail.phaseName}`
                      : "—"
                  }
                />
              )}
              {selectedPackage.detail.gateReviewHref && selectedPackage.detail.gateCode ? (
                <MetaItemLink label="Gate" href={selectedPackage.detail.gateReviewHref}>
                  {selectedPackage.detail.gateCode}
                  {selectedPackage.detail.gateName ? ` — ${selectedPackage.detail.gateName}` : ""}
                </MetaItemLink>
              ) : selectedPackage.detail.approvalType === "gate_review" ? (
                <MetaItem label="Gate" value="—" />
              ) : null}
              <MetaItem label="Type" value={selectedPackage.detail.approvalType.replaceAll("_", " ")} />
              <MetaItem label="Submitted By" value={selectedPackage.detail.submittedBy} />
              <MetaItem label="Submitted On" value={selectedPackage.detail.submittedOnLabel} />
              <MetaItem label="Due Date" value={selectedPackage.detail.dueDateLabel ?? "—"} />
              <MetaItem label="Priority" value={selectedPackage.detail.priority} />
              <CountLink
                label="Linked Artifacts"
                count={selectedPackage.detail.linkedArtifactsCount}
                primaryHref={selectedPackage.detail.primaryArtifactDetailHref}
                listHref={selectedPackage.detail.artifactsLibraryHref}
                singular="artifact"
                plural="artifacts"
              />
              <CountLink
                label="Evidence Items"
                count={selectedPackage.detail.evidenceItemsCount}
                primaryHref={selectedPackage.detail.primaryEvidenceDetailHref}
                listHref={selectedPackage.detail.evidenceListHref}
                singular="item"
                plural="items"
              />
              <MetaItem label="Approvers" value={String(selectedPackage.detail.approversCount)} />
              <MetaItem label="Attachments" value={String(selectedPackage.attachments.length)} />
            </dl>
          </article>

          <div
            className="flex shrink-0 gap-1 rounded-xl border border-slate-200 bg-slate-50/90 p-1 dark:border-border dark:bg-muted/50"
            role="tablist"
            aria-label="Approval detail sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={detailTab === "package"}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                detailTab === "package"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-card dark:text-foreground"
                  : "text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground",
              )}
              onClick={() => setDetailTab("package")}
            >
              Package
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={detailTab === "attachments"}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                detailTab === "attachments"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-card dark:text-foreground"
                  : "text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground",
              )}
              onClick={() => setDetailTab("attachments")}
            >
              Attachments
              <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-muted-foreground/20 dark:text-foreground">
                {selectedPackage.attachments.length}
              </span>
            </button>
          </div>

          <div className="min-h-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            {detailTab === "package" ? (
              <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,1.1fr)] gap-3">
                <article className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white p-3 dark:border-border dark:bg-card">
                  <RequiredInputsBlock
                    approvalId={selectedPackage.detail.id}
                    detail={selectedPackage.detail}
                    requiredInputs={selectedPackage.requiredInputs}
                    isLoading={isLoading}
                    variant="embedded"
                  />
                </article>

                <article className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white p-3 dark:border-border dark:bg-card">
                  <ApprovalApproversSection
                    ref={approverMgmtRef}
                    pkg={selectedPackage}
                    onPatchPackage={onPatchSelectedPackage}
                    currentUser={currentUser}
                    disabled={!canShare}
                  />
                </article>

                <ApproverCommentsSection
                  approvalId={selectedPackage.detail.id}
                  detail={selectedPackage.detail}
                  comments={selectedPackage.comments}
                  requiredInputs={selectedPackage.requiredInputs}
                  isLoading={isLoading}
                  currentUser={currentUser}
                  commentDraft={commentDraft}
                  commentVisibility={commentVisibility}
                  commentBoxRef={commentBoxRef}
                  onCommentDraftChange={onCommentDraftChange}
                  onCommentVisibilityChange={onCommentVisibilityChange}
                  onAddComment={onAddComment}
                  onAppendComment={onAppendComment}
                  onReplaceComments={onReplaceComments}
                />
              </div>
            ) : (
              <ApprovalAttachmentsTab
                pkg={selectedPackage}
                uploadedBy={currentUser.name}
                onPatchPackage={onPatchSelectedPackage}
                disabled={!canShare}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
