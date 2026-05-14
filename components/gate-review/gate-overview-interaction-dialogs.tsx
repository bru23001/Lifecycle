"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  GateConsequencesOverview,
  GatePolicyOverview,
  GateSuccessCriterionDetail,
} from "@/types/gate-review.types";
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

function DrawerShell({
  ref,
  titleId,
  title,
  subtitle,
  onClose,
  children,
  className,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cn(
        "fixed inset-y-0 right-0 z-50 m-0 flex w-[min(100vw-0.5rem,28rem)] max-w-[100vw] flex-col border-0 border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card",
        className,
      )}
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
            {subtitle}
          </p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
            {title}
          </h2>
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
      <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
    </dialog>
  );
}

function ModalShell({
  ref,
  titleId,
  title,
  subtitle,
  onClose,
  children,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <div className="flex max-h-[min(85vh,640px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
              {subtitle}
            </p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
              {title}
            </h2>
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
        <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <footer className="shrink-0 border-t border-slate-200 px-5 py-3 dark:border-border">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0 dark:border-border/60">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-slate-800 dark:text-foreground/90">{children}</div>
    </div>
  );
}

export function GatePolicyDrawer({
  open,
  onClose,
  policy,
}: {
  open: boolean;
  onClose: () => void;
  policy: GatePolicyOverview;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);

  return (
    <DrawerShell
      ref={ref}
      titleId={titleId}
      subtitle="Gate policy"
      title={`${policy.gateCode} — ${policy.gateName}`}
      onClose={onClose}
    >
      <FieldBlock label="Gate code">{policy.gateCode}</FieldBlock>
      <FieldBlock label="Gate name">{policy.gateName}</FieldBlock>
      <FieldBlock label="Related phase">{policy.relatedPhaseLabel}</FieldBlock>
      <FieldBlock label="Required inputs">
        {policy.requiredInputs.length ? (
          <ul className="list-inside list-disc space-y-2">
            {policy.requiredInputs.map((i) => (
              <li key={i.inputCode}>
                <span className="font-medium">{i.inputCode}</span>
                {i.name !== i.inputCode ? ` — ${i.name}` : null}
                {i.description ? (
                  <span className="mt-0.5 block text-muted-foreground">{i.description}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No linked templates in the gate evaluation for this view yet.</p>
        )}
      </FieldBlock>
      <FieldBlock label="Required evidence">
        {policy.requiredEvidence.length ? (
          <ul className="list-inside list-disc space-y-1">
            {policy.requiredEvidence.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No completion evidence attached for this gate yet.</p>
        )}
      </FieldBlock>
      <FieldBlock label="Required approver roles">
        <ul className="flex flex-wrap gap-2">
          {policy.requiredApproverRoles.map((r) => (
            <li
              key={r}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium dark:border-border dark:bg-muted"
            >
              {r}
            </li>
          ))}
        </ul>
      </FieldBlock>
      <FieldBlock label="Decision rule">{policy.decisionRule}</FieldBlock>
      <FieldBlock label="Unlock rule">{policy.unlockRule}</FieldBlock>
      <FieldBlock label="Policy version">{policy.policyVersion}</FieldBlock>
      <div className="pt-2">
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </DrawerShell>
  );
}

export function GateSuccessCriteriaDrawer({
  open,
  onClose,
  details,
}: {
  open: boolean;
  onClose: () => void;
  details: GateSuccessCriterionDetail[];
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);

  return (
    <DrawerShell
      ref={ref}
      titleId={titleId}
      subtitle="Success criteria"
      title="Full success criteria"
      onClose={onClose}
    >
      <ol className="space-y-6">
        {details.map((row, idx) => (
          <li key={row.id} className="rounded-lg border border-slate-100 p-4 dark:border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Criterion {idx + 1}
            </p>
            <p className="mt-1 font-semibold text-foreground">{row.label}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Required threshold</dt>
                <dd className="mt-0.5 text-foreground/90">{row.requiredThreshold}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Evidence expectation</dt>
                <dd className="mt-0.5 text-foreground/90">{row.evidenceExpectation}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Acceptance notes</dt>
                <dd className="mt-0.5 text-foreground/90">{row.acceptanceNotes}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Related templates</dt>
                <dd className="mt-0.5">
                  {row.relatedTemplates.length ? (
                    <ul className="list-inside list-disc">
                      {row.relatedTemplates.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      {details.length === 0 ? (
        <p className="text-sm text-muted-foreground">No success criteria are configured for this gate view.</p>
      ) : null}
      <div className="pt-4">
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </DrawerShell>
  );
}

export function GateConsequencesModal({
  open,
  onClose,
  consequences,
}: {
  open: boolean;
  onClose: () => void;
  consequences: GateConsequencesOverview;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);

  return (
    <ModalShell
      ref={ref}
      titleId={titleId}
      subtitle="Gate consequences"
      title="Outcomes and impacts"
      onClose={onClose}
    >
      <div className="space-y-1">
        <FieldBlock label="If approved">{consequences.ifApproved}</FieldBlock>
        <FieldBlock label="If conditionally approved">{consequences.ifConditional}</FieldBlock>
        <FieldBlock label="If changes requested">{consequences.ifChangesRequested}</FieldBlock>
        <FieldBlock label="If rejected">{consequences.ifRejected}</FieldBlock>
        <FieldBlock label="Next phase impact">{consequences.nextPhaseImpact}</FieldBlock>
        <FieldBlock label="Audit impact">{consequences.auditImpact}</FieldBlock>
      </div>
    </ModalShell>
  );
}
