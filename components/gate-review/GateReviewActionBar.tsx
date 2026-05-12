import { Info } from "lucide-react";

import type { GateReviewActionState } from "@/types/gate-review.types";
import { Button } from "@/components/ui/button";
export function GateReviewActionBar({
  actionState,
  onSaveReview,
  onSubmitDecision,
  submitHelperId,
  submitting = false,
}: {
  actionState: GateReviewActionState;
  onSaveReview: () => void;
  onSubmitDecision: () => void;
  submitHelperId: string;
  /** Server action in flight */
  submitting?: boolean;
}) {
  return (
    <div className="gate-review-action-bar sticky bottom-0 z-10 flex shrink-0 flex-col gap-3 border-t border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] dark:border-border dark:bg-card max-[900px]:items-stretch min-[901px]:flex-row min-[901px]:items-center min-[901px]:justify-between min-[901px]:px-8">
      <div className="flex min-w-0 items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3 dark:border-blue-900 dark:bg-blue-950/40">
        <Info className="mt-0.5 size-5 shrink-0 text-[#2563eb]" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827] dark:text-foreground">{actionState.readinessLabel}</p>
          <p className="mt-0.5 text-sm text-[#475569] dark:text-muted-foreground">{actionState.readinessDescription}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {!actionState.canSubmitDecision && actionState.submitBlockers.length > 0 ? (
          <>
            <p id={submitHelperId} className="sr-only">
              Submit disabled: {actionState.submitBlockers.join(" ")}
            </p>
            <p
              className="hidden max-w-md text-right text-xs text-[#64748b] dark:text-muted-foreground lg:block"
              aria-hidden
            >
              {actionState.submitBlockers.join(" · ")}
            </p>
          </>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!actionState.canSaveReview}
          onClick={onSaveReview}
        >
          Save Review
        </Button>
        <Button
          type="button"
          size="lg"
          className="gap-2 bg-[#2563eb] text-white hover:bg-blue-700"
          disabled={!actionState.canSubmitDecision || submitting}
          aria-describedby={!actionState.canSubmitDecision ? submitHelperId : undefined}
          onClick={onSubmitDecision}
        >
          {submitting ? "Recording…" : "Submit Decision"}
          <span aria-hidden>→</span>
        </Button>
      </div>

      {!actionState.canSubmitDecision && actionState.submitBlockers.length > 0 ? (
        <div className="w-full min-[901px]:hidden" role="alert">
          <p className="text-xs text-red-700 dark:text-red-400">{actionState.submitBlockers.join(" · ")}</p>
        </div>
      ) : null}
    </div>
  );
}
