"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { archiveEvidenceItem } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

const taClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ArchiveEvidenceModal({
  open,
  projectId,
  selectedEvidence,
  onClose,
  onError,
}: {
  open: boolean;
  projectId: string;
  selectedEvidence: EvidenceCenterSelectedEvidence | null;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && selectedEvidence) {
      if (!node.open) node.showModal();
      setReason("");
    } else if (node.open) {
      node.close();
    }
  }, [open, selectedEvidence]);

  if (!selectedEvidence) return null;

  const d = selectedEvidence.detail;
  const evidenceId = d.id;

  const submit = () => {
    const r = reason.trim();
    if (r.length < 3) {
      onError("Please enter an archive reason (at least a few characters).");
      return;
    }
    startTransition(async () => {
      const res = await archiveEvidenceItem({ projectId, evidenceId, reason: r });
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        onError(res.error);
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="archive-evidence-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <h2 id="archive-evidence-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Archive evidence?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {d.evidenceCode} · {d.name}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            Archiving hides this item from default lists while preserving its audit trail. Restore flows may vary by
            environment.
          </p>

          {selectedEvidence.linkedArtifacts.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Affected artifact links</p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                {selectedEvidence.linkedArtifacts.map((a) => (
                  <li key={a.id}>{a.label}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No artifact links on this item.</p>
          )}

          {selectedEvidence.linkedGates.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Affected gate links</p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                {selectedEvidence.linkedGates.map((g) => (
                  <li key={g.id}>{g.label}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No gate links on this item.</p>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Archive reason (required)</span>
            <textarea className={taClass} value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={2000} required />
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={pending} onClick={submit}>
            {pending ? "Archiving…" : "Archive"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
