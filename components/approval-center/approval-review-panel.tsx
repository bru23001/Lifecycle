"use client";

import Link from "next/link";
import { useState, type Dispatch, type RefObject, type SetStateAction } from "react";

import {
  AddRequiredChangeDialog,
  ApproveConfirmationDialog,
  DecisionCommentEditorDialog,
  RejectApprovalDialog,
  RequestChangesDialog,
} from "@/components/approval-center/approval-decision-modals";
import { Button } from "@/components/ui/button";
import { TimelineEvent, decisionButtonTone } from "@/components/approval-center/approval-center-shared";
import { cn } from "@/lib/utils";
import type {
  ApprovalActionState,
  ApprovalDecisionDraft,
  ApprovalHistoryEvent,
  ApprovalPackage,
} from "@/types/approval-center.types";

type ApprovalReviewPanelProps = {
  selectedPackage?: ApprovalPackage;
  decisionDraft: ApprovalDecisionDraft;
  selectedActionState: ApprovalActionState;
  decisionPanelRef: RefObject<HTMLDivElement | null>;
  onDecisionDraftChange: Dispatch<SetStateAction<ApprovalDecisionDraft>>;
  onHistoryEventClick?: (event: ApprovalHistoryEvent) => void;
  /** Used for @mention template in the decision comment editor. */
  reviewerDisplayName: string;
};

function formatRequiredChangeLine(row: {
  title: string;
  description: string;
  relatedObject: string;
  severity: string;
  assignee: string;
  dueDate: string;
}) {
  const parts = [
    `[${row.severity.toUpperCase()}] ${row.title.trim()}`,
    row.description.trim() || undefined,
    row.relatedObject.trim() ? `Related: ${row.relatedObject.trim()}` : undefined,
    row.assignee.trim() ? `Assignee: ${row.assignee.trim()}` : undefined,
    row.dueDate.trim() ? `Due: ${row.dueDate}` : undefined,
  ].filter(Boolean);
  return parts.join(" — ");
}

export function ApprovalReviewPanel({
  selectedPackage,
  decisionDraft,
  selectedActionState,
  decisionPanelRef,
  onDecisionDraftChange,
  onHistoryEventClick,
  reviewerDisplayName,
}: ApprovalReviewPanelProps) {
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [inputsCompleteConfirmed, setInputsCompleteConfirmed] = useState(false);
  const [evidenceCompleteConfirmed, setEvidenceCompleteConfirmed] = useState(false);
  const [approveOptionalComment, setApproveOptionalComment] = useState("");

  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectConfirmCode, setRejectConfirmCode] = useState("");

  const [commentEditorOpen, setCommentEditorOpen] = useState(false);
  const [evidenceLinkDraft, setEvidenceLinkDraft] = useState("");
  const [addChangeOpen, setAddChangeOpen] = useState(false);

  const openApproveFlow = () => {
    onDecisionDraftChange((prev) => ({ ...prev, decision: "approve" }));
    setInputsCompleteConfirmed(false);
    setEvidenceCompleteConfirmed(false);
    setApproveOptionalComment("");
    setApproveModalOpen(true);
  };

  const confirmApprove = () => {
    onDecisionDraftChange((prev) => {
      const extra = approveOptionalComment.trim();
      const nextComments =
        extra ? (prev.comments.trim() ? `${prev.comments.trim()}\n${extra}` : extra) : prev.comments;
      return { ...prev, decision: "approve" as const, comments: nextComments };
    });
    setApproveModalOpen(false);
  };

  const openRequestChangesFlow = () => {
    onDecisionDraftChange((prev) => ({ ...prev, decision: "request_changes" }));
    setRequestChangesOpen(true);
  };

  const openRejectFlow = () => {
    onDecisionDraftChange((prev) => ({ ...prev, decision: "reject", resubmissionAllowed: true }));
    setRejectConfirmCode("");
    setRejectOpen(true);
  };

  const confirmReject = () => {
    onDecisionDraftChange((prev) => {
      const trimmed = prev.comments.trim();
      const lines = prev.requiredChanges.filter((c) => c.trim());
      const nextRequired =
        lines.length > 0 ? lines : trimmed ? [`Rejection: ${trimmed.split("\n")[0]}`] : prev.requiredChanges;
      return {
        ...prev,
        decision: "reject" as const,
        requiredChanges: nextRequired,
      };
    });
    setRejectOpen(false);
  };

  const cancelApprove = () => {
    setApproveModalOpen(false);
    onDecisionDraftChange((prev) => ({ ...prev, decision: undefined }));
  };

  return (
    <aside data-pane="review" className="approval-review-panel min-w-0 grid h-full min-h-0 grid-rows-2 gap-3 overflow-hidden">
      {selectedPackage ? (
        <>
          <ApproveConfirmationDialog
            open={approveModalOpen}
            packageTitle={selectedPackage.detail.title}
            inputsCompleteConfirmed={inputsCompleteConfirmed}
            evidenceCompleteConfirmed={evidenceCompleteConfirmed}
            optionalComment={approveOptionalComment}
            onInputsCompleteChange={setInputsCompleteConfirmed}
            onEvidenceCompleteChange={setEvidenceCompleteConfirmed}
            onOptionalCommentChange={setApproveOptionalComment}
            onConfirm={confirmApprove}
            onClose={cancelApprove}
          />
          <RequestChangesDialog
            open={requestChangesOpen}
            packageTitle={selectedPackage.detail.title}
            onClose={() => setRequestChangesOpen(false)}
            onApply={(payload) => {
              const line = [
                `[${payload.category}] ${payload.summary.trim() || "Requested change"}`,
                payload.relatedObject.trim() ? `Related: ${payload.relatedObject.trim()}` : null,
                payload.owner.trim() ? `Owner: ${payload.owner.trim()}` : null,
                payload.dueDate ? `Due: ${payload.dueDate}` : null,
              ]
                .filter(Boolean)
                .join(" — ");
              onDecisionDraftChange((prev) => ({
                ...prev,
                decision: "request_changes",
                comments: payload.reviewerComments.trim() || prev.comments,
                requiredChanges: [...prev.requiredChanges, line],
              }));
            }}
          />
          <RejectApprovalDialog
            open={rejectOpen}
            approvalCode={selectedPackage.detail.approvalCode}
            packageTitle={selectedPackage.detail.title}
            comments={decisionDraft.comments}
            resubmissionAllowed={decisionDraft.resubmissionAllowed ?? true}
            confirmCode={rejectConfirmCode}
            onCommentsChange={(v) => onDecisionDraftChange((prev) => ({ ...prev, comments: v }))}
            onResubmissionChange={(v) => onDecisionDraftChange((prev) => ({ ...prev, resubmissionAllowed: v }))}
            onConfirmCodeChange={setRejectConfirmCode}
            onConfirm={confirmReject}
            onClose={() => {
              setRejectOpen(false);
              onDecisionDraftChange((prev) => ({ ...prev, decision: undefined }));
            }}
          />
          <DecisionCommentEditorDialog
            open={commentEditorOpen}
            value={decisionDraft.comments}
            mentionSeed={reviewerDisplayName}
            evidenceLinkDraft={evidenceLinkDraft}
            onValueChange={(v) => onDecisionDraftChange((prev) => ({ ...prev, comments: v }))}
            onEvidenceLinkChange={setEvidenceLinkDraft}
            onInsertTemplate={(template) =>
              onDecisionDraftChange((prev) => ({
                ...prev,
                comments: (prev.comments.trim() ? `${prev.comments.trim()}\n` : "") + template,
              }))
            }
            onSave={() => {
              if (evidenceLinkDraft.trim()) {
                onDecisionDraftChange((prev) => ({
                  ...prev,
                  comments: `${prev.comments.trim()}\nEvidence: ${evidenceLinkDraft.trim()}`.trim(),
                }));
                setEvidenceLinkDraft("");
              }
            }}
            onClose={() => {
              setCommentEditorOpen(false);
              setEvidenceLinkDraft("");
            }}
          />
          <AddRequiredChangeDialog
            open={addChangeOpen}
            onClose={() => setAddChangeOpen(false)}
            onAdd={(row) => {
              const line = formatRequiredChangeLine(row);
              onDecisionDraftChange((prev) => ({
                ...prev,
                requiredChanges: [...prev.requiredChanges, line],
              }));
            }}
          />
        </>
      ) : null}

      <article className="approval-history-panel flex min-h-0 flex-1 flex-col rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">Approval History</p>
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#111827]">Approval History</h3>
          {selectedPackage && selectedPackage.detail.id !== "approval-none" ? (
            <Link
              href={`/approvals/${selectedPackage.detail.id}/history`}
              className="text-xs font-semibold text-[#2563eb] hover:underline"
            >
              View full history
            </Link>
          ) : null}
        </header>
        {!selectedPackage || selectedPackage.history.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p>No approval history recorded yet.</p>
          </div>
        ) : (
          <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {selectedPackage.history.map((event) => (
              <TimelineEvent
                key={event.id}
                event={{ ...event, approvalId: event.approvalId ?? selectedPackage.detail.id }}
                onSelect={onHistoryEventClick}
              />
            ))}
          </ol>
        )}
      </article>

      <article
        ref={decisionPanelRef}
        tabIndex={-1}
        className="approval-decision-panel shrink-0 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">Approve / Reject / Request Changes</p>
        <header className="mb-2">
          <h3 className="text-base font-semibold text-[#111827]">Record Your Decision</h3>
          <p className="text-xs text-slate-500">Select a decision and provide optional comments.</p>
        </header>

        {!selectedPackage ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p>Select an approval to record a decision.</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                className={cn(
                  "rounded-md border px-2 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  decisionButtonTone("approve", decisionDraft.decision === "approve"),
                )}
                aria-pressed={decisionDraft.decision === "approve"}
                onClick={openApproveFlow}
              >
                Approve
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-md border px-2 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  decisionButtonTone("request_changes", decisionDraft.decision === "request_changes"),
                )}
                aria-pressed={decisionDraft.decision === "request_changes"}
                onClick={openRequestChangesFlow}
              >
                Request Changes
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-md border px-2 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  decisionButtonTone("reject", decisionDraft.decision === "reject"),
                )}
                aria-pressed={decisionDraft.decision === "reject"}
                onClick={openRejectFlow}
              >
                Reject
              </button>
            </div>

            <div className="mt-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="decision-comments" className="text-sm font-semibold text-slate-800">
                  Comments {decisionDraft.decision === "request_changes" || decisionDraft.decision === "reject" ? "(required)" : "(optional)"}
                </label>
                <Button type="button" size="xs" variant="outline" onClick={() => setCommentEditorOpen(true)}>
                  Expand editor
                </Button>
              </div>
              <textarea
                id="decision-comments"
                rows={3}
                value={decisionDraft.comments}
                onChange={(event) => onDecisionDraftChange((prev) => ({ ...prev, comments: event.target.value.slice(0, 2000) }))}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add decision comments or instructions..."
              />
              <p className="mt-1 text-[11px] text-slate-500">{decisionDraft.comments.length}/2000 characters</p>
            </div>

            {(decisionDraft.decision === "request_changes" || decisionDraft.decision === "reject") && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    {decisionDraft.decision === "request_changes" ? "Required Changes" : "Rejection Reasons"}
                  </p>
                  <Button type="button" size="xs" variant="outline" onClick={() => setAddChangeOpen(true)}>
                    Add required change
                  </Button>
                </div>
                {decisionDraft.requiredChanges.length === 0 ? (
                  <p className="text-xs text-amber-700">Add at least one item before submitting this decision.</p>
                ) : null}
                {decisionDraft.requiredChanges.map((item, index) => (
                  <div key={`required-change-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(event) =>
                        onDecisionDraftChange((prev) => ({
                          ...prev,
                          requiredChanges: prev.requiredChanges.map((value, i) => (i === index ? event.target.value : value)),
                        }))
                      }
                      className="h-9 flex-1 rounded-md border border-slate-200 bg-white px-2 text-sm"
                      aria-label={`Required change ${index + 1}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onDecisionDraftChange((prev) => ({
                          ...prev,
                          requiredChanges: prev.requiredChanges.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!selectedActionState.canSubmitDecision && selectedActionState.submitBlockers.length > 0 ? (
              <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-800" role="alert">
                {selectedActionState.submitBlockers.join(" · ")}
              </div>
            ) : null}
          </div>
        )}
      </article>
    </aside>
  );
}
