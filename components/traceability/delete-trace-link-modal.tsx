"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { deleteTraceLink } from "@/app/actions/deleteTraceLink";
import { Button } from "@/components/ui/button";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  projectId: string;
  linkId: string;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteTraceLinkModal({ open, projectId, linkId, onClose, onDeleted }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setReason("");
  }, [open]);

  const formValid = reason.trim().length >= 5;

  function handleConfirm() {
    if (!formValid || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteTraceLink({
          projectId,
          linkId,
          reason: reason.trim(),
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        onDeleted();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="delete-trace-link-modal-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Traceability</p>
            <h2
              id="delete-trace-link-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              Remove trace link
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              The link is soft-deleted and excluded from coverage. Provide a short reason for the audit trail.
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

        <div className="px-6 py-5 text-sm">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reason</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              rows={3}
              required
              aria-label="Deletion reason"
              placeholder="Why is this link being removed? (5–1000 characters)"
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30"
            />
          </label>
          {error ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <footer className={cn("flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border")}>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={!formValid || pending}>
            {pending ? "Removing…" : "Remove link"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
