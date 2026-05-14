"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { acceptTraceabilityRisk } from "@/app/actions/acceptTraceabilityRisk";
import { Button } from "@/components/ui/button";
import { getGapTypeLabel } from "@/lib/traceability-gap-details";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";
import type { TraceabilityGap } from "@/types/traceability.types";

type Props = {
  open: boolean;
  gap: TraceabilityGap | null;
  projectId: string;
  onClose: () => void;
};

function gapSummaryText(gap: TraceabilityGap): string {
  return `${gap.objectId} · ${gap.objectName}\n${gap.issue}`;
}

export function AcceptTraceabilityRiskModal({ open, gap, projectId, onClose }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [riskImpact, setRiskImpact] = useState("");
  const [justification, setJustification] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [approverRequired, setApproverRequired] = useState(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && gap) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, gap]);

  useEffect(() => {
    if (!open || !gap) return;
    setError(null);
    setRiskImpact(
      gap.impact === "critical" || gap.impact === "high"
        ? "Residual traceability exposure may affect gate readiness and audit evidence."
        : "Controlled residual exposure with documented rationale and review date.",
    );
    setJustification("");
    setApproverRequired(gap.impact === "critical" || gap.impact === "high");
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setReviewDate(d.toISOString().slice(0, 10));
  }, [open, gap]);

  if (!gap) return null;

  const valid =
    riskImpact.trim().length >= 3 && justification.trim().length >= 10 && /^\d{4}-\d{2}-\d{2}$/.test(reviewDate);

  function submit() {
    if (!valid || pending || !gap) return;
    const g = gap;
    setError(null);
    startTransition(async () => {
      try {
        const res = await acceptTraceabilityRisk({
          projectId,
          gapId: g.id,
          gapSummary: gapSummaryText(g),
          riskImpact: riskImpact.trim(),
          justification: justification.trim(),
          reviewDate,
          approverRequired,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onClose();
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="accept-trace-risk-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Traceability</p>
            <h2 id="accept-trace-risk-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Accept traceability risk
            </h2>
            <p className="mt-1 text-xs text-slate-500">{getGapTypeLabel(gap.type)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5 text-sm">
          <Field label="Gap summary">
            <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
              {gapSummaryText(gap)}
            </pre>
          </Field>

          <Field label="Risk impact">
            <textarea
              value={riskImpact}
              onChange={(e) => setRiskImpact(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              aria-label="Risk impact"
            />
          </Field>

          <Field label="Justification">
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              required
              minLength={10}
              placeholder="Document why this gap is acceptable for now (min. 10 characters)."
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              aria-label="Justification"
            />
          </Field>

          <Field label="Expiration / review date">
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              aria-label="Review date"
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={approverRequired}
              onChange={(e) => setApproverRequired(e.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="font-semibold">Approver required</span>
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                Check if policy requires a named approver before this acceptance is effective.
              </span>
            </span>
          </label>

          {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}
        </div>

        <footer className={cn("flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border")}>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!valid || pending}>
            {pending ? "Recording…" : "Confirm accepted risk"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
