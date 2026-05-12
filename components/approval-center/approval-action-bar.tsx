"use client";

import { CheckCircle2, Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ApprovalActionState } from "@/types/approval-center.types";

type ApprovalActionBarProps = {
  selectedActionState: ApprovalActionState;
  submitHelperId: string;
  onSaveReview: () => void;
  onSubmitDecision: () => void;
};

export function ApprovalActionBar({
  selectedActionState,
  submitHelperId,
  onSaveReview,
  onSubmitDecision,
}: ApprovalActionBarProps) {
  return (
    <footer className="approval-action-bar shrink-0 border-t border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] min-[901px]:px-8">
      <div className="flex min-w-0 items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#2563eb]" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827]">{selectedActionState.readinessLabel}</p>
          <p className="text-sm text-slate-600">{selectedActionState.readinessSummary}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {!selectedActionState.canSubmitDecision && selectedActionState.submitBlockers.length > 0 ? (
          <>
            <p id={submitHelperId} className="sr-only">
              Submit disabled: {selectedActionState.submitBlockers.join(" ")}
            </p>
            <p className="hidden max-w-md text-right text-xs text-slate-500 min-[901px]:block">
              {selectedActionState.submitBlockers.join(" · ")}
            </p>
          </>
        ) : null}
        <Button type="button" variant="outline" size="lg" disabled={!selectedActionState.canSaveReview} onClick={onSaveReview}>
          Save Review
        </Button>
        <Button
          type="button"
          size="lg"
          className="gap-2 bg-[#2563eb] text-white hover:bg-blue-700"
          disabled={!selectedActionState.canSubmitDecision}
          aria-describedby={!selectedActionState.canSubmitDecision ? submitHelperId : undefined}
          onClick={onSubmitDecision}
        >
          Submit Decision
          <Flag className="size-4" aria-hidden />
        </Button>
      </div>
    </footer>
  );
}
