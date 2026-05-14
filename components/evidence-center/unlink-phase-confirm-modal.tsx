"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { unlinkEvidenceFromPhase } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";

const taClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function UnlinkPhaseConfirmModal({
  open,
  projectId,
  evidenceId,
  evidenceSummary,
  phaseNumber,
  phaseLabel,
  onClose,
  onError,
}: {
  open: boolean;
  projectId: string;
  evidenceId: string;
  evidenceSummary: string;
  phaseNumber: number;
  phaseLabel: string;
  onClose: () => void;
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      setReason("");
      setError(null);
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const reportError = (msg: string) => {
    setError(msg);
    onError?.(msg);
  };

  const submit = () => {
    const r = reason.trim();
    if (r.length < 1) {
      reportError("A reason is required to unlink this phase.");
      return;
    }
    startTransition(async () => {
      const res = await unlinkEvidenceFromPhase({
        projectId,
        evidenceId,
        phaseNumber,
        reason: r,
      });
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        reportError(res.error);
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="unlink-phase-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <h2 id="unlink-phase-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Unlink lifecycle phase?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This removes the association between evidence <span className="font-medium text-slate-800">{evidenceSummary}</span> and{" "}
              <span className="font-medium text-slate-800">{phaseLabel}</span>. Phase-level traceability coverage and completeness views
              may show a gap for that phase until other evidence is linked.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 overflow-y-auto px-5 py-4 text-sm">
          {error ? <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">{error}</p> : null}
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Reason (required)</span>
            <textarea
              className={taClass}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this phase link should be removed (audit trail)."
              maxLength={2000}
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={submit}>
            {pending ? "Unlinking…" : "Unlink"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
