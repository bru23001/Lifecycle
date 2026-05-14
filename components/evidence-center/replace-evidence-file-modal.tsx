"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ReplaceEvidenceFileModal({
  open,
  selectedEvidence,
  onClose,
}: {
  open: boolean;
  selectedEvidence: EvidenceCenterSelectedEvidence | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [preserveLinks, setPreserveLinks] = useState(true);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && selectedEvidence) {
      if (!node.open) node.showModal();
      setReason("");
      setPreserveLinks(true);
    } else if (node.open) {
      node.close();
    }
  }, [open, selectedEvidence]);

  if (!selectedEvidence) return null;

  const d = selectedEvidence.detail;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="replace-evidence-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence</p>
            <h2 id="replace-evidence-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Replace file
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{d.evidenceCode}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Current file</p>
            <p className="mt-1">{d.name}</p>
            <p className="mt-1 text-xs text-slate-600">
              Type: {d.fileTypeLabel}
              {d.fileSizeLabel ? ` · Size: ${d.fileSizeLabel}` : null}
            </p>
          </div>

          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            <strong>Version impact:</strong> replacing the file may invalidate prior review snapshots. Downstream gates
            may require re-confirmation when a classified upload pipeline is enabled.
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Upload replacement file</span>
            <input type="file" disabled className={cn(inputClass, "cursor-not-allowed opacity-60")} />
            <p className="mt-1 text-xs text-slate-500">Binary upload is not wired yet (STD-SEC-002 + STD-DAT-001).</p>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Replacement reason</span>
            <textarea className={cn(inputClass, "min-h-[72px]")} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} />
          </label>

          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={preserveLinks}
              onChange={(e) => setPreserveLinks(e.target.checked)}
              className="mt-1 size-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Preserve existing artifact and gate links when supported</span>
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled title="Replacement upload is not available yet." className="bg-slate-400">
            Replace
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
