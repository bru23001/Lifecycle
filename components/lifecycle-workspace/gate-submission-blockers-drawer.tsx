"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X } from "lucide-react";

import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import { resolveFirstGateBlockerHref } from "@/lib/gate-submission-blockers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GateSubmissionBlockersDrawerProps = {
  open: boolean;
  state: GateSubmissionState;
  onClose: () => void;
};

export function GateSubmissionBlockersDrawer({ open, state, onClose }: GateSubmissionBlockersDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const inputs = state.requiredInputs ?? [];
  const missingTemplates = inputs.filter((i) => i.status === "missing").map((i) => i.label);
  const incompleteArtifacts = inputs.filter((i) => i.status === "incomplete" || i.status === "needs_review");
  const missingEvidence = !state.evidenceItems || state.evidenceItems.length === 0;
  const blockingValidation =
    state.validationWarnings?.filter((w) => w.severity === "error") ?? [];
  const otherValidation = state.validationWarnings?.filter((w) => w.severity === "warning") ?? [];
  const missingApprovers = !state.assignedApprovers || state.assignedApprovers.length === 0;
  const firstHref = resolveFirstGateBlockerHref(state);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close blockers" onClick={onClose} />
      <div
        data-testid="gate-submission-blockers-drawer"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-[var(--app-bg)] shadow-2xl dark:border-border"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Gate submission</p>
            <h2 id="gate-blockers-drawer-title" className="text-sm font-semibold text-foreground">
              Why submission is blocked
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Gate {state.gateCode}: {state.gateName}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-[12px]">
          <BlockSection title="Missing templates" items={missingTemplates} emptyLabel="None." />
          <BlockSection
            title="Incomplete artifacts"
            items={incompleteArtifacts.map((i) => i.label)}
            emptyLabel="None."
          />
          <section>
            <h3 className="text-[11px] font-semibold uppercase text-muted-foreground">Missing evidence</h3>
            <p className="mt-1 text-foreground/90">{missingEvidence ? "No evidence linked for this phase." : "Evidence attached."}</p>
          </section>
          <BlockSection
            title="Blocking validation errors"
            items={blockingValidation.map((w) => w.message)}
            emptyLabel="None."
          />
          <BlockSection
            title="Other validation warnings"
            items={otherValidation.map((w) => w.message)}
            emptyLabel="None."
          />
          <section>
            <h3 className="text-[11px] font-semibold uppercase text-muted-foreground">Missing approvers</h3>
            <p className="mt-1 text-foreground/90">
              {missingApprovers
                ? "No approvers assigned yet. Assign reviewers before or after opening the Gate Review screen."
                : `${state.assignedApprovers!.length} approver(s) on file.`}
            </p>
          </section>
          <section>
            <h3 className="text-[11px] font-semibold uppercase text-muted-foreground">Required actions</h3>
            {state.missingRequirements.length === 0 ? (
              <p className="mt-1 text-muted-foreground">No aggregated list (resolve items above).</p>
            ) : (
              <ul className="mt-1 list-inside list-disc text-foreground/90">
                {state.missingRequirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </section>

          <div className="border-t border-border pt-4">
            <Link
              href={firstHref}
              className={cn(buttonVariants({ variant: "default", size: "default" }), "inline-flex w-full justify-center")}
              onClick={onClose}
            >
              Go to first blocker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockSection({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="mt-1 list-inside list-disc text-foreground/90">
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
