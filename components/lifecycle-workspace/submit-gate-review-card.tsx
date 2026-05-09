import { Info, Save, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SubmitGateReviewCardProps = {
  state: GateSubmissionState;
};

export function SubmitGateReviewCard({ state }: SubmitGateReviewCardProps) {
  const submitDisabled = !state.canSubmit;
  const submitLabel = state.canSubmit
    ? "Submit for Gate Review"
    : "Resolve Required Items First";

  return (
    <section
      id="submit-for-gate-review"
      aria-labelledby="submit-for-gate-review-heading"
      className="submit-for-gate-review rounded-lg border bg-card p-4 shadow-sm"
    >
      <h3 id="submit-for-gate-review-heading" className="flex items-center gap-2 text-sm font-semibold">
        <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
          <ShieldCheck className="size-3.5 text-[#2563eb]" aria-hidden />
        </span>
        Submit for gate review
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Submitting sends this phase package to reviewers for Gate {state.gateCode}:{" "}
        <span className="font-medium text-foreground">{state.gateName}</span>. You can continue
        editing until the gate meeting unless the review is locked.
      </p>

      {!state.canSubmit && state.missingRequirements.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {state.missingRequirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
      ) : null}

      {state.canSubmit ? (
        <Link
          href={state.submitHref}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "mt-4 w-full bg-[#2563eb] hover:bg-[#1d4ed8]",
          )}
        >
          {submitLabel}
        </Link>
      ) : (
        <Button
          type="button"
          className="mt-4 w-full bg-[#2563eb] hover:bg-[#1d4ed8]"
          size="lg"
          disabled={submitDisabled}
          aria-describedby="submit-gate-helper"
        >
          {submitLabel}
        </Button>
      )}

      <Button type="button" variant="outline" className="mt-2 w-full gap-2" size="default">
        <Save className="size-4" />
        Save as draft
      </Button>
      <p
        id="submit-gate-helper"
        className="mt-3 flex gap-2 text-[11px] text-muted-foreground"
      >
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {submitDisabled
          ? "Complete checklist items and resolve blocking warnings before submitting."
          : "Work-in-progress saves automatically to your draft workspace until you submit."}
      </p>
    </section>
  );
}
