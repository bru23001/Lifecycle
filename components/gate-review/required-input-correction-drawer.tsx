"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { RequiredGateInput } from "@/types/gate-review.types";

function missingRequirementCopy(status: RequiredGateInput["status"]): string {
  switch (status) {
    case "missing":
      return "No artifact has been created for this template yet.";
    case "incomplete":
      return "An artifact exists but is not approved for this gate evidence bar.";
    case "needs_review":
      return "Artifact is submitted and awaiting review before it counts as complete.";
    default:
      return "Confirm this input still meets the gate before recording a decision.";
  }
}

function recommendedFixCopy(status: RequiredGateInput["status"]): string {
  switch (status) {
    case "missing":
      return "Open the Template Wizard to create and save the required artifact, then return to Gate Review.";
    case "incomplete":
      return "Finish the template in the wizard, submit for review, or resolve validation errors on the artifact.";
    case "needs_review":
      return "Have an authorized reviewer approve the artifact or request changes with a clear follow-up.";
    default:
      return "Review linked evidence and update the artifact if the gate check message still applies.";
  }
}

export function RequiredInputCorrectionDrawer({
  open,
  onClose,
  row,
  gateLabel,
  linkedPhaseLabel,
}: {
  open: boolean;
  onClose: () => void;
  row: RequiredGateInput | null;
  gateLabel: string;
  linkedPhaseLabel: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && row) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, row]);

  if (!row) return null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-y-0 right-0 z-50 m-0 flex w-[min(100vw-0.5rem,26rem)] max-w-[100vw] flex-col border-0 border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
            Required input — {gateLabel}
          </p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
            {row.inputCode}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{row.name !== row.inputCode ? row.name : "Template output"}</p>
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

      <div className="lifecycle-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Missing requirement</h3>
          <p className="mt-1.5 leading-relaxed text-foreground/90">{missingRequirementCopy(row.status)}</p>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Related template</h3>
          <p className="mt-1.5 font-mono text-sm text-foreground">{row.inputCode}</p>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Linked phase</h3>
          <p className="mt-1.5 text-foreground/90">{linkedPhaseLabel}</p>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Related artifact</h3>
          {row.href ? (
            <Link href={row.href} className="mt-1.5 inline-block font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Open artifact detail
            </Link>
          ) : (
            <p className="mt-1.5 text-muted-foreground">None yet — create one from the template wizard.</p>
          )}
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recommended fix</h3>
          <p className="mt-1.5 leading-relaxed text-foreground/90">{recommendedFixCopy(row.status)}</p>
        </section>

        {row.wizardHref ? (
          <div className="flex flex-col gap-2">
            <Link
              href={row.wizardHref}
              className={buttonVariants({ variant: "default", size: "lg", className: "inline-flex w-full justify-center" })}
            >
              Open Template Wizard
            </Link>
          </div>
        ) : null}
      </div>

      <footer className="shrink-0 space-y-2 border-t border-slate-200 px-5 py-4 dark:border-border">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled
          title="Wire to approval service to mark evidence reviewed without leaving Gate Review."
        >
          Mark reviewed
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </footer>
    </dialog>
  );
}
