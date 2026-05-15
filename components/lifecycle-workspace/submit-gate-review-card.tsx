"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Info, Save, ShieldCheck } from "lucide-react";

import { AssignApproversModal } from "@/components/gate-review/assign-approvers-modal";
import { GateSubmissionBlockersDrawer } from "@/components/lifecycle-workspace/gate-submission-blockers-drawer";
import { SubmitGateReviewModal } from "@/components/lifecycle-workspace/submit-gate-review-modal";
import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import { projectGatePackagePreviewHref } from "@/lib/projects-url";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SubmitGateReviewCardProps = {
  state: GateSubmissionState;
};

export function SubmitGateReviewCard({ state }: SubmitGateReviewCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [blockersOpen, setBlockersOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const submitDisabled = !state.canSubmit;
  const submitLabel = state.canSubmit
    ? "Submit for Gate Review"
    : "Resolve Required Items First";

  const previewHref =
    state.packagePreviewHref ?? projectGatePackagePreviewHref(state.projectId, state.gateCode);

  useEffect(() => {
    if (!draftSavedAt) return;
    const t = setTimeout(() => setDraftSavedAt(null), 4000);
    return () => clearTimeout(t);
  }, [draftSavedAt]);

  useEffect(() => {
    if (searchParams.get("openGateSubmit") !== "1") return;
    if (state.canSubmit) {
      setSubmitOpen(true);
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete("openGateSubmit");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, state.canSubmit, router, pathname]);

  function handlePrimaryClick() {
    if (state.canSubmit) {
      setSubmitOpen(true);
    } else {
      setBlockersOpen(true);
    }
  }

  function handleSaveDraft() {
    setDraftSavedAt(formatDateTimeAbsolute(new Date()));
  }

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

      <Button
        type="button"
        className={cn(
          "mt-4 w-full",
          state.canSubmit ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : "bg-muted text-muted-foreground hover:bg-muted/80",
        )}
        size="lg"
        aria-disabled={submitDisabled}
        onClick={handlePrimaryClick}
      >
        {submitLabel}
      </Button>

      <div className="mt-2 flex flex-col gap-2">
        <Link
          href={previewHref}
          className={cn(buttonVariants({ variant: "secondary", size: "default" }), "w-full justify-center")}
        >
          Preview gate package
        </Link>
        {state.assignApprovers ? (
          <Button type="button" variant="outline" className="w-full" onClick={() => setAssignOpen(true)}>
            Assign approvers
          </Button>
        ) : null}
      </div>

      <Button type="button" variant="outline" className="mt-2 w-full gap-2" size="default" onClick={handleSaveDraft}>
        <Save className="size-4" />
        Save as draft
      </Button>
      {draftSavedAt ? (
        <p role="status" className="mt-2 text-xs text-emerald-800 dark:text-emerald-200" aria-live="polite">
          Draft snapshot noted locally at {draftSavedAt}. Continue editing; submit when ready.
        </p>
      ) : null}

      <p
        id="submit-gate-helper"
        className="mt-3 flex gap-2 text-[11px] text-muted-foreground"
      >
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {submitDisabled
          ? "Tap the primary button to see structured blockers and jump to the first fix."
          : "Work-in-progress saves automatically to your draft workspace until you submit."}
      </p>

      <SubmitGateReviewModal open={submitOpen} state={state} onClose={() => setSubmitOpen(false)} />

      <GateSubmissionBlockersDrawer open={blockersOpen} state={state} onClose={() => setBlockersOpen(false)} />

      {state.assignApprovers ? (
        <AssignApproversModal
          open={assignOpen}
          projectId={state.projectId}
          gateId={state.assignApprovers.gateId}
          gateLabel={state.assignApprovers.gateLabel}
          candidates={state.assignApprovers.candidates}
          initialSelection={state.assignApprovers.initialSelection}
          initialDueAtIso={state.assignApprovers.initialDueAtIso}
          onClose={() => setAssignOpen(false)}
        />
      ) : null}
    </section>
  );
}
