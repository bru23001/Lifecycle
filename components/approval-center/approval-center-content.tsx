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
import type { Dispatch, RefObject, SetStateAction } from "react";

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
  selectedPackage?: ApprovalPackage;
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
  onCommentDraftChange: (value: string) => void;
  onCommentVisibilityChange: (value: ApproverComment["visibility"]) => void;
  onAddComment: () => void;
  onDecisionDraftChange: Dispatch<SetStateAction<ApprovalDecisionDraft>>;
  onSaveReview: () => void;
  onSubmitDecision: () => void;
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
  selectedPackage,
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
  onCommentDraftChange,
  onCommentVisibilityChange,
  onAddComment,
  onDecisionDraftChange,
  onSaveReview,
  onSubmitDecision,
}: ApprovalCenterContentProps) {
  return (
    <>
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
            onQueueTabChange={onQueueTabChange}
            onFilterChange={onFilterChange}
            onSelectApproval={onSelectApproval}
            onClearFilters={onClearFilters}
          />
        }
        center={
          <ApprovalDetailPanel
            selectedPackage={selectedPackage}
            isLoading={isLoading}
            commentDraft={commentDraft}
            commentVisibility={commentVisibility}
            commentBoxRef={commentBoxRef}
            onCommentDraftChange={onCommentDraftChange}
            onCommentVisibilityChange={onCommentVisibilityChange}
            onAddComment={onAddComment}
          />
        }
        right={
          <ApprovalReviewPanel
            selectedPackage={selectedPackage}
            decisionDraft={decisionDraft}
            selectedActionState={selectedActionState}
            decisionPanelRef={decisionPanelRef}
            onDecisionDraftChange={onDecisionDraftChange}
          />
        }
      />

      <ApprovalActionBar
        selectedActionState={selectedActionState}
        submitHelperId={submitHelperId}
        onSaveReview={onSaveReview}
        onSubmitDecision={onSubmitDecision}
      />
    </>
  );
}
