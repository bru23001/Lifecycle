"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Clock,
  Info,
  ShieldCheck,
  X,
} from "lucide-react";

import { initiateGateReviewSubmission } from "@/app/actions/initiateGateReviewSubmission";
import type {
  GateSubmissionState,
  GateSubmissionRequiredInput,
  GateSubmissionValidationWarning,
} from "@/components/lifecycle-workspace/submit-gate-review-types";
import { Button } from "@/components/ui/button";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  state: GateSubmissionState;
  onClose: () => void;
};

/**
 * Confirmation modal shown before navigating to the Gate Review screen.
 *
 * Per spec (`projects-list-new-screens.md` §6):
 *   - Gate readiness
 *   - Required inputs
 *   - Evidence checklist
 *   - Validation warnings
 *   - Assigned approvers
 *   - Submit / Cancel
 *
 * Submit is disabled when `state.canSubmit` is false (fail-secure — mirrors
 * the server-side readiness check in `evaluateGateForProject`).
 */
export function SubmitGateReviewModal({ open, state, onClose }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [submissionComments, setSubmissionComments] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSubmissionComments("");
    }
  }, [open]);

  function handleSubmit() {
    if (!state.canSubmit || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await initiateGateReviewSubmission({
          projectId: state.projectId,
          gateCode: state.gateCode,
          submissionComments: submissionComments.trim() || undefined,
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        router.push(state.submitHref);
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="submit-gate-review-modal-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Confirm submission
            </p>
            <h2
              id="submit-gate-review-modal-title"
              className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground"
            >
              Submit for Gate {state.gateCode} review
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-muted-foreground">
              {state.gateName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close submit dialog"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 text-sm">
          <ReadinessBanner canSubmit={state.canSubmit} readinessPercent={state.readinessPercent} />

          <Section title="Required inputs" icon={CircleDashed}>
            {!state.requiredInputs || state.requiredInputs.length === 0 ? (
              <p className="text-slate-500 italic">No required inputs reported for this gate.</p>
            ) : (
              <ul className="space-y-1.5">
                {state.requiredInputs.map((item) => (
                  <RequiredInputRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </Section>

          <Section title="Completed artifacts" icon={CheckCircle2}>
            {!state.requiredInputs || state.requiredInputs.every((i) => i.status !== "complete") ? (
              <p className="text-slate-500 italic">No completed artifacts listed for this gate yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {state.requiredInputs
                  .filter((i) => i.status === "complete")
                  .map((item) => (
                    <RequiredInputRow key={`done-${item.id}`} item={item} />
                  ))}
              </ul>
            )}
          </Section>

          <Section title="Evidence checklist" icon={ShieldCheck}>
            {!state.evidenceItems || state.evidenceItems.length === 0 ? (
              <p className="text-slate-500 italic">
                No evidence attached yet. Attach evidence from the workspace before submitting.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {state.evidenceItems.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                    <span className="text-slate-700 dark:text-muted-foreground">{ev.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Validation warnings" icon={AlertTriangle}>
            {!state.validationWarnings || state.validationWarnings.length === 0 ? (
              <p className="text-slate-500 italic">No warnings.</p>
            ) : (
              <ul className="space-y-1.5">
                {state.validationWarnings.map((w) => (
                  <ValidationWarningRow key={w.id} warning={w} />
                ))}
              </ul>
            )}
          </Section>

          <Section title="Assigned approvers" icon={ShieldCheck}>
            {!state.assignedApprovers || state.assignedApprovers.length === 0 ? (
              <p className="text-slate-500 italic">
                Approvers will be assigned on the Gate Review screen.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {state.assignedApprovers.map((a) => (
                  <li key={a.id} className="text-slate-700 dark:text-muted-foreground">
                    <span className="font-medium text-slate-900 dark:text-foreground">{a.name}</span>
                    <span className="text-slate-500"> · {a.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-border dark:bg-muted/40">
            <p className="font-semibold text-slate-800 dark:text-foreground">Review due date</p>
            <p className="mt-1 text-slate-600 dark:text-muted-foreground">
              {state.reviewDueDateLabel?.trim() ? state.reviewDueDateLabel : "— (set target date in phase details)"}
            </p>
          </div>

          <div>
            <label htmlFor="gate-submission-comments" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Submission comments
            </label>
            <textarea
              id="gate-submission-comments"
              rows={3}
              value={submissionComments}
              onChange={(e) => setSubmissionComments(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Optional context for reviewers (kept in audit trail summary only)…"
            />
          </div>

          {state.missingRequirements.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="font-semibold">Resolve the following before submitting:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {state.missingRequirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              {error}
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!state.canSubmit || pending}
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
            aria-disabled={!state.canSubmit || pending}
          >
            {pending ? "Submitting…" : "Submit for Gate Review"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function ReadinessBanner({ canSubmit, readinessPercent }: { canSubmit: boolean; readinessPercent?: number }) {
  if (canSubmit) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">
            Gate readiness: ready to submit
            {readinessPercent !== undefined ? (
              <span className="ml-2 tabular-nums text-emerald-800 dark:text-emerald-200">
                (score {readinessPercent})
              </span>
            ) : null}
          </p>
          <p className="text-emerald-800 dark:text-emerald-200">
            Phase requirements are satisfied. Submitting will open the Gate Review screen so a
            decision can be recorded.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/40">
      <Clock className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
      <div>
        <p className="font-semibold text-amber-900 dark:text-amber-100">
          Gate readiness: not ready
          {readinessPercent !== undefined ? (
            <span className="ml-2 tabular-nums text-amber-800 dark:text-amber-200">
              (score {readinessPercent})
            </span>
          ) : null}
        </p>
        <p className="text-amber-800 dark:text-amber-200">
          One or more requirements are still open. Resolve them before submitting.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

function RequiredInputRow({ item }: { item: GateSubmissionRequiredInput }) {
  const { icon: Icon, color } = statusVisual(item.status);
  const label = (
    <span className={cn("text-slate-700 dark:text-muted-foreground")}>
      <span className="font-medium text-slate-900 dark:text-foreground">{item.label}</span>{" "}
      <span className={cn("text-xs", color)}>· {statusLabel(item.status)}</span>
    </span>
  );
  return (
    <li className="flex items-start gap-2">
      <Icon className={cn("mt-0.5 size-4 shrink-0", color)} aria-hidden />
      {item.href ? (
        <a href={item.href} className="hover:underline">
          {label}
        </a>
      ) : (
        label
      )}
    </li>
  );
}

function statusVisual(status: GateSubmissionRequiredInput["status"]): {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
} {
  switch (status) {
    case "complete":
      return { icon: CheckCircle2, color: "text-emerald-600" };
    case "needs_review":
      return { icon: Info, color: "text-blue-600" };
    case "incomplete":
      return { icon: CircleDashed, color: "text-amber-600" };
    case "missing":
      return { icon: CircleX, color: "text-red-600" };
  }
}

function statusLabel(status: GateSubmissionRequiredInput["status"]): string {
  switch (status) {
    case "complete":
      return "complete";
    case "needs_review":
      return "needs review";
    case "incomplete":
      return "incomplete";
    case "missing":
      return "missing";
  }
}

function ValidationWarningRow({ warning }: { warning: GateSubmissionValidationWarning }) {
  const color =
    warning.severity === "error"
      ? "text-red-700"
      : warning.severity === "warning"
        ? "text-amber-700"
        : "text-slate-600";
  const content = <span className={color}>{warning.message}</span>;
  return (
    <li className="flex items-start gap-2">
      <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", color)} aria-hidden />
      {warning.href ? (
        <a href={warning.href} className="hover:underline">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}
