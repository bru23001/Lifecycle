"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Step = {
  id: string;
  label: string;
  detail: string;
};

const STEPS: Step[] = [
  { id: "templates", label: "Templates checked", detail: "Catalog-required templates for this phase" },
  { id: "evidence", label: "Evidence checked", detail: "Linked evidence vs. required artifacts" },
  { id: "checklist", label: "Checklist checked", detail: "Completion checklist rules" },
  { id: "gate", label: "Gate readiness checked", detail: "Submission blockers and approvers" },
  { id: "summary", label: "Summary", detail: "Aggregate validation results" },
];

export type ValidationRunProgressModalProps = {
  open: boolean;
  onClose: () => void;
  errorCount: number;
  warningCount: number;
  infoCount: number;
};

export function ValidationRunProgressModal({
  open,
  onClose,
  errorCount,
  warningCount,
  infoCount,
}: ValidationRunProgressModalProps) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    function handleNativeClose() {
      onClose();
    }
    node.addEventListener("close", handleNativeClose);
    return () => node.removeEventListener("close", handleNativeClose);
  }, [onClose]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  function requestClose() {
    if (ref.current?.open) ref.current.close();
  }

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      setFinished(false);
      return;
    }
    setStepIndex(0);
    setFinished(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < STEPS.length; i += 1) {
      timers.push(
        setTimeout(() => {
          setStepIndex(i);
          if (i === STEPS.length - 1) setFinished(true);
        }, 320 * (i + 1)),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={ref}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="validation-run-modal-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Validation</p>
            <h2 id="validation-run-modal-title" className="text-base font-semibold text-foreground">
              Running phase validation
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Re-evaluating readiness for the current workspace phase.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            onClick={requestClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="space-y-3 overflow-y-auto px-6 py-4 text-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Current step</p>
          <p className="font-medium text-foreground">{STEPS[Math.min(stepIndex, STEPS.length - 1)]!.label}</p>
          <p className="text-xs text-muted-foreground">{STEPS[Math.min(stepIndex, STEPS.length - 1)]!.detail}</p>
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs dark:border-border" aria-label="Validation steps">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2 text-muted-foreground">
                {i < stepIndex ? (
                  <span className="text-emerald-600">✓</span>
                ) : i === stepIndex && !finished ? (
                  <Loader2 className="size-3.5 animate-spin text-sky-600" aria-hidden />
                ) : (
                  <span className="inline-block size-3.5 rounded-full border border-border" aria-hidden />
                )}
                <span className={i <= stepIndex ? "text-foreground" : ""}>{s.label}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
            <p>
              <span className="font-semibold text-foreground">Errors:</span> {errorCount}
            </p>
            <p>
              <span className="font-semibold text-foreground">Warnings:</span> {warningCount}
            </p>
            <p>
              <span className="font-semibold text-foreground">Informational:</span> {infoCount}
            </p>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={requestClose}>
            Close
          </Button>
          <Button
            type="button"
            disabled={!finished}
            onClick={() => {
              router.refresh();
              requestClose();
            }}
          >
            View results
          </Button>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
