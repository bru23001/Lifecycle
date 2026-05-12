"use client";

import Link from "next/link";
import type { Dispatch, RefObject, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { TimelineEvent, decisionButtonTone } from "@/components/approval-center/approval-center-shared";
import { cn } from "@/lib/utils";
import type { ApprovalActionState, ApprovalDecisionDraft, ApprovalPackage } from "@/types/approval-center.types";

type ApprovalReviewPanelProps = {
  selectedPackage?: ApprovalPackage;
  decisionDraft: ApprovalDecisionDraft;
  selectedActionState: ApprovalActionState;
  decisionPanelRef: RefObject<HTMLDivElement | null>;
  onDecisionDraftChange: Dispatch<SetStateAction<ApprovalDecisionDraft>>;
};

export function ApprovalReviewPanel({
  selectedPackage,
  decisionDraft,
  selectedActionState,
  decisionPanelRef,
  onDecisionDraftChange,
}: ApprovalReviewPanelProps) {
  return (
    <aside data-pane="review" className="approval-review-panel min-w-0 grid h-full min-h-0 grid-rows-2 gap-3 overflow-hidden">
      <article className="approval-history-panel flex min-h-0 flex-1 flex-col rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">8. Approval History</p>
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#111827]">Approval History</h3>
          {selectedPackage ? (
            <Link href={`/approvals/${selectedPackage.detail.id}`} className="text-xs font-semibold text-[#2563eb] hover:underline">
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
              <TimelineEvent key={event.id} event={event} />
            ))}
          </ol>
        )}
      </article>

      <article
        ref={decisionPanelRef}
        tabIndex={-1}
        className="approval-decision-panel shrink-0 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">9. Approve / Reject / Request Changes</p>
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
              {(["approve", "request_changes", "reject"] as const).map((decision) => (
                <button
                  key={decision}
                  type="button"
                  className={cn(
                    "rounded-md border px-2 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    decisionButtonTone(decision, decisionDraft.decision === decision),
                  )}
                  aria-pressed={decisionDraft.decision === decision}
                  onClick={() => onDecisionDraftChange((prev) => ({ ...prev, decision }))}
                >
                  {decision === "approve" ? "Approve" : decision === "request_changes" ? "Request Changes" : "Reject"}
                </button>
              ))}
            </div>

            <div className="mt-2.5">
              <label htmlFor="decision-comments" className="text-sm font-semibold text-slate-800">
                Comments {decisionDraft.decision === "request_changes" || decisionDraft.decision === "reject" ? "(required)" : "(optional)"}
              </label>
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
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => onDecisionDraftChange((prev) => ({ ...prev, requiredChanges: [...prev.requiredChanges, ""] }))}
                  >
                    Add
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
