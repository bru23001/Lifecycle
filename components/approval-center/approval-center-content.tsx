"use client";

import { ApprovalActionBar } from "@/components/approval-center/approval-action-bar";
import { ApprovalCenterGrid } from "@/components/approval-center/approval-center-grid";
import { ApprovalDetailPanel } from "@/components/approval-center/approval-detail-panel";
import { PendingApprovalsPanel } from "@/components/approval-center/pending-approvals-panel";
import { ApprovalReviewPanel } from "@/components/approval-center/approval-review-panel";
import type { QueueFilters } from "@/components/approval-center/approval-center-ui.types";
import type {
  ApprovalActionState,
  ApprovalDecisionDraft,
  ApprovalHistoryEvent,
  ApprovalPackage,
  ApprovalQueueTab,
  ApproverComment,
  PendingApproval,
} from "@/types/approval-center.types";
import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

type ApprovalCenterContentProps = {
  mobilePane: "queue" | "detail" | "review";
  queueTab: ApprovalQueueTab;
  queueRows: PendingApproval[];
  /** Rows in the active tab before list filters (used for filter drawer project list). */
  unfilteredTabRows: PendingApproval[];
  selectedApprovalId: string;
  filters: QueueFilters;
  isLoading: boolean;
  mergedHistoryEvents: ApprovalHistoryEvent[];
  fullHistoryHref?: string;
  selectedPackage?: ApprovalPackage;
  currentUser: { name: string; role: string; initials: string };
  commentDraft: string;
  commentVisibility: ApproverComment["visibility"];
  decisionDraft: ApprovalDecisionDraft;
  selectedActionState: ApprovalActionState;
  submitHelperId: string;
  commentBoxRef: RefObject<HTMLTextAreaElement | null>;
  decisionPanelRef: RefObject<HTMLDivElement | null>;
  onQueueTabChange: (tab: ApprovalQueueTab) => void;
  onFilterChange: (next: QueueFilters) => void;
  onSelectApproval: (approvalId: string) => void;
  onClearFilters: () => void;
  onHistoryEventClick: (event: ApprovalHistoryEvent) => void;
  onCommentDraftChange: (value: string) => void;
  onCommentVisibilityChange: (value: ApproverComment["visibility"]) => void;
  onAddComment: () => void;
  onAppendComment: (comment: ApproverComment) => void;
  onReplaceComments: (next: ApproverComment[]) => void;
  onPatchSelectedPackage: (updater: (prev: ApprovalPackage) => ApprovalPackage) => void;
  onDecisionDraftChange: Dispatch<SetStateAction<ApprovalDecisionDraft>>;
  onSaveReview: () => void;
  onSubmitDecision: () => void;
  submitDisabled?: boolean;
  saveNotice?: string | null;
  reviewerDisplayName: string;
  /** Renders above the three-pane grid (e.g. bulk selection toolbar). */
  bulkToolbar?: ReactNode;
  bulkSelectEnabled: boolean;
  bulkSelectedIds: ReadonlySet<string>;
  onToggleBulkSelect: (approvalId: string) => void;
  onSelectAllBulkVisible: () => void;
};

export function ApprovalCenterContent({
  mobilePane,
  queueTab,
  queueRows,
  unfilteredTabRows,
  selectedApprovalId,
  filters,
  isLoading,
  mergedHistoryEvents,
  fullHistoryHref,
  selectedPackage,
  currentUser,
  commentDraft,
  commentVisibility,
  decisionDraft,
  selectedActionState,
  submitHelperId,
  commentBoxRef,
  decisionPanelRef,
  onQueueTabChange,
  onFilterChange,
  onSelectApproval,
  onClearFilters,
  onHistoryEventClick,
  onCommentDraftChange,
  onCommentVisibilityChange,
  onAddComment,
  onAppendComment,
  onReplaceComments,
  onPatchSelectedPackage,
  onDecisionDraftChange,
  onSaveReview,
  onSubmitDecision,
  submitDisabled,
  saveNotice,
  reviewerDisplayName,
  bulkToolbar,
  bulkSelectEnabled,
  bulkSelectedIds,
  onToggleBulkSelect,
  onSelectAllBulkVisible,
}: ApprovalCenterContentProps) {
  return (
    <>
      {bulkToolbar ? (
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-2 min-[901px]:px-8">{bulkToolbar}</div>
      ) : null}
      <ApprovalCenterGrid
        mobilePane={mobilePane}
        left={
          <PendingApprovalsPanel
            queueTab={queueTab}
            queueRows={queueRows}
            unfilteredTabRows={unfilteredTabRows}
            selectedApprovalId={selectedApprovalId}
            filters={filters}
            isLoading={isLoading}
            mergedHistoryEvents={mergedHistoryEvents}
            fullHistoryHref={fullHistoryHref}
            onQueueTabChange={onQueueTabChange}
            onFilterChange={onFilterChange}
            onSelectApproval={onSelectApproval}
            onClearFilters={onClearFilters}
            onHistoryEventClick={onHistoryEventClick}
            bulkSelectEnabled={bulkSelectEnabled}
            bulkSelectedIds={bulkSelectedIds}
            onToggleBulkSelect={onToggleBulkSelect}
            onSelectAllBulkVisible={onSelectAllBulkVisible}
          />
        }
        center={
          <ApprovalDetailPanel
            selectedPackage={selectedPackage}
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
            onPatchSelectedPackage={onPatchSelectedPackage}
          />
        }
        right={
          <ApprovalReviewPanel
            selectedPackage={selectedPackage}
            decisionDraft={decisionDraft}
            selectedActionState={selectedActionState}
            decisionPanelRef={decisionPanelRef}
            onDecisionDraftChange={onDecisionDraftChange}
            onHistoryEventClick={onHistoryEventClick}
            reviewerDisplayName={reviewerDisplayName}
          />
        }
      />

      <ApprovalActionBar
        selectedActionState={selectedActionState}
        submitHelperId={submitHelperId}
        onSaveReview={onSaveReview}
        onSubmitDecision={onSubmitDecision}
        submitDisabled={submitDisabled}
        saveNotice={saveNotice}
      />
    </>
  );
}
