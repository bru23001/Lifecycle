"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { dismissValidationWarning } from "@/app/actions/dismissValidationWarning";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
import { Button } from "@/components/ui/button";

export type DismissValidationWarningModalProps = {
  open: boolean;
  warning: ValidationWarning | null;
  projectId: string;
  phaseNumber: number;
  onClose: () => void;
};

export function DismissValidationWarningModal({
  open,
  warning,
  projectId,
  phaseNumber,
  onClose,
}: DismissValidationWarningModalProps) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
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

  useEffect(() => {
    if (!open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  function requestClose() {
    if (ref.current?.open) ref.current.close();
  }

  function handleDismiss() {
    if (!warning || pending) return;
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError("Enter a dismissal reason (at least a few characters).");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await dismissValidationWarning({
        projectId,
        phaseNumber,
        warningId: warning.id,
        reason: trimmed,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      requestClose();
    });
  }

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={ref}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="dismiss-validation-modal-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Audit</p>
            <h2 id="dismiss-validation-modal-title" className="text-base font-semibold text-foreground">
              Dismiss warning
            </h2>
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
        <div className="space-y-4 overflow-y-auto px-6 py-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Warning</p>
            <p className="mt-1 text-foreground">{warning?.message ?? "—"}</p>
          </div>
          <div>
            <label htmlFor="dismiss-validation-reason" className="text-xs font-semibold uppercase text-muted-foreground">
              Dismissal reason
            </label>
            <textarea
              id="dismiss-validation-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Document why this warning is acceptable for now…"
            />
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-semibold">Audit notice</p>
            <p className="mt-1">
              Dismissal is written to the project record and emits an audit event. Use only for triaged,
              non-blocking findings.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Revalidation impact:</span> dismissed warnings no longer
            appear in this phase&apos;s workspace summary. Run validation again after substantive changes.
          </p>
          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" variant="default" onClick={handleDismiss} disabled={pending}>
            {pending ? "Saving…" : "Dismiss warning"}
          </Button>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
