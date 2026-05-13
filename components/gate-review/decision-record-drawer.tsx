"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, ShieldCheck, X, XCircle } from "lucide-react";

import type { GateDecisionRecordSnapshot } from "@/lib/server/gates-list";
import { Button } from "@/components/ui/button";

/**
 * Right-side drawer showing an immutable `GateDecisionRecordSnapshot`.
 *
 * Read-only by design — no mutation actions are surfaced from this component.
 * Triggered from the gates list "View Decision Record" CTA.
 */
export function DecisionRecordDrawer({
  open,
  record,
  gateTitle,
  onClose,
}: {
  open: boolean;
  record: GateDecisionRecordSnapshot | null;
  gateTitle: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && record) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, record]);

  if (!record) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="decision-record-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {record.gateId} · Sealed decision
            </p>
            <h2
              id="decision-record-drawer-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              {gateTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close decision record"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 text-sm">
          <Section title="Decision outcome">
            <p className="text-lg font-semibold text-slate-950 dark:text-foreground">
              {record.decisionLabel}
            </p>
          </Section>

          <Section title="Decided by">
            <p className="font-medium text-slate-900 dark:text-foreground">{record.decidedByName}</p>
            <p className="text-xs text-slate-500">{record.decidedByRole}</p>
          </Section>

          <Section title="Decision timestamp">
            <p className="text-slate-700 dark:text-muted-foreground">
              <time dateTime={record.decidedOnIso}>{record.decidedOnLabel}</time>
            </p>
          </Section>

          <Section title="Decision comments">
            {record.comments.trim() ? (
              <p className="whitespace-pre-line text-slate-700 dark:text-muted-foreground">
                {record.comments}
              </p>
            ) : (
              <p className="text-slate-500 italic">No comments recorded.</p>
            )}
          </Section>

          <Section title="Conditions">
            {record.conditions.length === 0 ? (
              <p className="text-slate-500 italic">No conditions recorded.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-muted-foreground">
                {record.conditions.map((c, i) => (
                  <li key={`${i}-${c.slice(0, 8)}`}>{c}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Evidence snapshot">
            <div className="flex items-center gap-2">
              {record.evidenceSnapshot.passed ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <XCircle className="size-4 shrink-0 text-amber-600" aria-hidden />
              )}
              <span
                className={
                  record.evidenceSnapshot.passed
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-amber-800 dark:text-amber-200"
                }
              >
                {record.evidenceSnapshot.label}
              </span>
            </div>
          </Section>

          <Section title="Audit reference">
            {record.auditHref ? (
              <Link
                href={record.auditHref}
                className="inline-flex items-center gap-2 text-[#1d4ed8] hover:underline"
              >
                <ShieldCheck className="size-4" aria-hidden />
                View audit entry
                <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            ) : (
              <p className="text-slate-500 italic">No audit entry available.</p>
            )}
          </Section>

          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-border dark:bg-muted dark:text-muted-foreground">
            This record is sealed and cannot be edited. To open a new review, use the Review
            action on the gate row.
          </p>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
