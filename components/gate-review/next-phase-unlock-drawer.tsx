"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { X, Package } from "lucide-react";

import type { NextPhaseUnlockState } from "@/types/gate-review.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useDialogOpen(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);
  return ref;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0 dark:border-border/60">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-slate-800 dark:text-foreground/90">{children}</div>
    </div>
  );
}

function statusLabel(state: NextPhaseUnlockState) {
  return state.unlockStatus === "unlocked"
    ? "Unlocked"
    : state.unlockStatus === "ready"
      ? "Ready to unlock after decision"
      : state.unlockStatus === "blocked"
        ? "Blocked"
        : "Locked";
}

export function NextPhaseUnlockRequirementsDrawer({
  open,
  onClose,
  state,
  gateCode,
  gateName,
}: {
  open: boolean;
  onClose: () => void;
  state: NextPhaseUnlockState;
  gateCode: string;
  gateName: string;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cn(
        "fixed inset-y-0 right-0 z-50 m-0 flex w-[min(100vw-0.5rem,26rem)] max-w-[100vw] flex-col border-0 border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card",
      )}
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
            Next phase unlock
          </p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
            Requirements
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {gateCode} — {gateName}
          </p>
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

      <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <Field label="Unlock status">
          <p className="font-semibold capitalize">{state.unlockStatus}</p>
          <p className="mt-1 text-muted-foreground">{statusLabel(state)}</p>
        </Field>

        <Field label="Required decision state">
          <ul className="space-y-2">
            {state.requirements.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{r.label}</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    r.status === "complete" && "text-emerald-700 dark:text-emerald-400",
                    r.status === "incomplete" && "text-amber-700 dark:text-amber-400",
                    r.status === "blocked" && "text-red-700 dark:text-red-400",
                  )}
                >
                  {r.status === "complete" ? "Complete" : r.status === "blocked" ? "Blocked" : "Incomplete"}
                </span>
              </li>
            ))}
          </ul>
        </Field>

        {state.requiredTemplatesForNextPhase?.length ? (
          <Field label="Required templates (next phase)">
            <ul className="list-inside list-disc space-y-1">
              {state.requiredTemplatesForNextPhase.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Field>
        ) : null}

        {state.evidenceExpectationsForNextPhase?.length ? (
          <Field label="Required evidence expectations">
            <ul className="list-inside list-disc space-y-1">
              {state.evidenceExpectationsForNextPhase.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Field>
        ) : null}

        {state.initialChecklistItems?.length ? (
          <Field label="Initial checklist (phase objectives)">
            <ul className="space-y-1">
              {state.initialChecklistItems.map((c) => (
                <li key={c.id} className="flex gap-2 text-sm">
                  <span aria-hidden>○</span>
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          </Field>
        ) : null}

        <Field label="Required inputs & evidence (summary)">
          <p className="text-muted-foreground">
            Use the Gate Review <strong>Inputs</strong> and <strong>Completion evidence</strong> panes to satisfy
            linked templates and uploads. This drawer mirrors high-level readiness only.
          </p>
        </Field>

        <Field label="Blocking validation issues">
          {state.blockingIssues?.length ? (
            <ul className="list-inside list-disc space-y-1 text-amber-900 dark:text-amber-100">
              {state.blockingIssues.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No automated blockers listed for this view.</p>
          )}
        </Field>

        <Field label="Carried-forward artifacts">
          {state.carriedForwardArtifactLinks?.length ? (
            <ul className="space-y-1">
              {state.carriedForwardArtifactLinks.map((a) => (
                <li key={a.id}>
                  <Link href={a.href} className="text-blue-600 hover:underline dark:text-blue-400" onClick={onClose}>
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : state.carriedForwardArtifacts.length ? (
            <ul className="list-inside list-disc text-muted-foreground">
              {state.carriedForwardArtifacts.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center dark:border-border dark:bg-muted/30">
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm dark:bg-card dark:text-slate-500">
                <Package className="size-5" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">Nothing carried forward yet</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Prior-phase artifacts appear here when the gate package lists them. Add or complete artifacts in the
                workspace if your process expects carryover.
              </p>
            </div>
          )}
        </Field>

        <Field label="Gate dependency">
          <p>{state.gateDependencyLabel ?? "Complete the active gate with a governance decision before advancing."}</p>
        </Field>

        <Field label="Recommended next action">
          <p>{state.recommendedNextAction ?? "Return to Gate Review when you are ready to remediate or record a decision."}</p>
        </Field>
      </div>

      <footer className="shrink-0 border-t border-slate-200 px-5 py-3 dark:border-border">
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </footer>
    </dialog>
  );
}
