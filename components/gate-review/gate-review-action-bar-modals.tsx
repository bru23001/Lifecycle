"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

import type {
  DecisionCriterion,
  GateApprover,
  GateDecisionType,
  GateEvidenceItem,
  GateReviewSubmitBlocker,
  NextPhaseUnlockState,
  RequiredGateInput,
} from "@/types/gate-review.types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function decisionTypeLabel(d: GateDecisionType | undefined): string {
  switch (d) {
    case "approve":
      return "Approve";
    case "conditional_approve":
      return "Conditional approval";
    case "request_changes":
      return "Request changes";
    case "reject":
      return "Reject";
    default:
      return "None selected";
  }
}

export type SaveReviewSummaryModalProps = {
  open: boolean;
  onClose: () => void;
  savedFieldLabels: string[];
  unresolvedWarnings: { label: string; ok: boolean }[];
  savedAtLabel: string;
};

export function SaveReviewSummaryModal({
  open,
  onClose,
  savedFieldLabels,
  unresolvedWarnings,
  savedAtLabel,
}: SaveReviewSummaryModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const warnings = unresolvedWarnings.filter((w) => !w.ok);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-review-summary-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-xl dark:border-border dark:bg-card"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Save review</p>
            <h2 id="save-review-summary-title" className="text-lg font-semibold text-foreground">
              Draft saved
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Autosave timestamp: {savedAtLabel}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <section>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Saved fields</h3>
            <ul className="mt-2 list-inside list-disc text-foreground/90">
              {savedFieldLabels.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Unresolved warnings</h3>
            {warnings.length === 0 ? (
              <p className="mt-2 text-muted-foreground">None. Readiness checklist is clear.</p>
            ) : (
              <ul className="mt-2 list-inside list-disc text-amber-900 dark:text-amber-200">
                {warnings.map((w) => (
                  <li key={w.label}>{w.label}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <div className="flex justify-end border-t border-slate-200 px-5 py-3 dark:border-border">
          <Button type="button" onClick={onClose}>
            Continue review
          </Button>
        </div>
      </div>
    </div>
  );
}

export type SubmitDecisionConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  draftDecision: GateDecisionType | undefined;
  requiredInputs: RequiredGateInput[];
  completionEvidence: GateEvidenceItem[];
  approvers: GateApprover[];
  criteria: DecisionCriterion[];
  overallAssessmentLabel: string;
  nextPhaseUnlock: NextPhaseUnlockState;
  gateCode: string;
  gateName: string;
};

export function SubmitDecisionConfirmationModal({
  open,
  onClose,
  onContinue,
  draftDecision,
  requiredInputs,
  completionEvidence,
  approvers,
  criteria,
  overallAssessmentLabel,
  nextPhaseUnlock,
  gateCode,
  gateName,
}: SubmitDecisionConfirmationModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputsComplete = requiredInputs.filter((i) => i.provided && i.status === "complete").length;
  const approverSummary = approvers
    .map((a) => `${a.name} (${a.status})`)
    .slice(0, 6)
    .join(" · ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-decision-confirm-title"
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-border dark:bg-card"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {gateCode} · {gateName}
            </p>
            <h2 id="submit-decision-confirm-title" className="text-lg font-semibold text-foreground">
              Submit decision
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Review the snapshot below, then continue to finalize.</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <Field label="Selected decision">
            <p className="font-medium text-foreground">{decisionTypeLabel(draftDecision)}</p>
          </Field>
          <Field label="Required inputs snapshot">
            <p className="text-foreground/90">
              {inputsComplete} of {requiredInputs.length} marked complete
              {requiredInputs.length ? ` (${requiredInputs.map((i) => i.inputCode ?? i.name).join(", ")})` : ""}
            </p>
          </Field>
          <Field label="Evidence snapshot">
            <p className="text-foreground/90">
              {completionEvidence.length} item{completionEvidence.length === 1 ? "" : "s"}:{" "}
              {completionEvidence.length
                ? completionEvidence.map((e) => e.name).join(", ")
                : "None attached"}
            </p>
          </Field>
          <Field label="Approver status snapshot">
            <p className="text-foreground/90">{approvers.length ? approverSummary : "No approvers assigned."}</p>
          </Field>
          <Field label="Criteria assessment snapshot">
            <p className="text-foreground/90">
              {criteria.length} criterion · overall: {overallAssessmentLabel}
            </p>
          </Field>
          <Field label="Next phase impact">
            <p className="text-foreground/90">
              Next phase: Phase {nextPhaseUnlock.nextPhaseNumber}: {nextPhaseUnlock.nextPhaseName}. Unlock status:{" "}
              {nextPhaseUnlock.unlockStatus}.
            </p>
          </Field>
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <strong className="font-semibold">Audit record:</strong> submitting creates an immutable gate decision
            record tied to this project. Ensure comments and evidence are accurate before you continue.
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onContinue}>
            Continue to finalize
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</h3>
      <div className="mt-1">{children}</div>
    </section>
  );
}

export type DecisionSubmissionBlockersDrawerProps = {
  open: boolean;
  onClose: () => void;
  blockers: GateReviewSubmitBlocker[];
  gateCode: string;
  gateName: string;
  onJump: (target: NonNullable<GateReviewSubmitBlocker["jumpTarget"]>) => void;
};

export function DecisionSubmissionBlockersDrawer({
  open,
  onClose,
  blockers,
  gateCode,
  gateName,
  onJump,
}: DecisionSubmissionBlockersDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const firstJump = blockers.find((b) => b.jumpTarget)?.jumpTarget;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close blockers" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-[var(--app-bg)] shadow-2xl dark:border-border">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Gate review</p>
            <h2 className="text-sm font-semibold text-foreground">Cannot submit decision</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {gateCode}: {gateName}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-[13px]">
          <p className="text-muted-foreground">Resolve the following before submitting a final decision.</p>
          <ul className="space-y-3">
            {blockers.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
              >
                <p className="font-medium text-foreground">{b.message}</p>
                {b.recommendedFix ? (
                  <p className="mt-1 text-xs text-muted-foreground">Recommended: {b.recommendedFix}</p>
                ) : null}
                {b.jumpTarget ? (
                  <button
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" }),
                      "mt-1 h-auto px-0 py-0 text-xs",
                    )}
                    onClick={() => {
                      onJump(b.jumpTarget!);
                      onClose();
                    }}
                  >
                    Jump to {jumpLabel(b.jumpTarget)}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <footer className="border-t border-border px-5 py-3">
          {firstJump ? (
            <Button
              type="button"
              className="w-full"
              variant="default"
              onClick={() => {
                onJump(firstJump);
                onClose();
              }}
            >
              Jump to first issue
            </Button>
          ) : (
            <Button type="button" className="w-full" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

function jumpLabel(t: NonNullable<GateReviewSubmitBlocker["jumpTarget"]>): string {
  switch (t) {
    case "inputs":
      return "required inputs";
    case "evidence":
      return "completion evidence";
    case "criteria":
      return "decision criteria";
    case "approvers":
      return "approvers";
    case "decision":
      return "decision record";
    default:
      return "section";
  }
}

export type UnsavedReviewChangesModalProps = {
  open: boolean;
  changedSummaries: string[];
  onSaveDraft: () => void;
  onDiscard: () => void;
  onContinueEditing: () => void;
};

export function UnsavedReviewChangesModal({
  open,
  changedSummaries,
  onSaveDraft,
  onDiscard,
  onContinueEditing,
}: UnsavedReviewChangesModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onContinueEditing();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onContinueEditing]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Dismiss" onClick={onContinueEditing} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-review-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-xl dark:border-border dark:bg-card"
      >
        <div className="border-b border-slate-200 px-5 py-4 dark:border-border">
          <h2 id="unsaved-review-title" className="text-lg font-semibold text-foreground">
            Unsaved changes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You have edits that are not saved to your review draft.
          </p>
        </div>
        <div className="px-5 py-4 text-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Unsaved areas</p>
          <ul className="mt-2 list-inside list-disc text-foreground/90">
            {changedSummaries.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-3 dark:border-border sm:flex-row sm:flex-wrap sm:justify-end">
          <Button type="button" variant="outline" className="sm:flex-1" onClick={onContinueEditing}>
            Continue editing
          </Button>
          <Button type="button" variant="destructive" className="sm:flex-1" onClick={onDiscard}>
            Discard changes
          </Button>
          <Button type="button" className="sm:flex-1" onClick={onSaveDraft}>
            Save draft
          </Button>
        </div>
      </div>
    </div>
  );
}

export function GateReviewSaveToast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:border-border dark:bg-foreground dark:text-background"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
