"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { deleteEvidenceItem } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DeleteEvidenceModal({
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
  const [codeConfirm, setCodeConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && selectedEvidence) {
      if (!node.open) node.showModal();
      setCodeConfirm("");
      setReason("");
    } else if (node.open) {
      node.close();
    }
  }, [open, selectedEvidence]);

  if (!selectedEvidence) return null;

  const d = selectedEvidence.detail;
  const evidenceId = d.id;
  const codeOk = codeConfirm.trim() === d.evidenceCode.trim();

  const submit = () => {
    const r = reason.trim();
    if (!codeOk) {
      onError("Type the evidence code exactly to confirm deletion.");
      return;
    }
    if (r.length < 3) {
      onError("Please enter a delete reason (at least a few characters).");
      return;
    }
    startTransition(async () => {
      const res = await deleteEvidenceItem({ projectId, evidenceId, reason: r });
      if (res.ok) {
        onClose();
        router.push(`/projects/${projectId}/evidence`);
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
      aria-labelledby="delete-evidence-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <h2 id="delete-evidence-title" className="text-lg font-semibold text-red-800 dark:text-foreground">
              Delete evidence permanently?
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
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
            This removes the evidence record and links from the project. Prefer archival when audit retention is
            required. A database soft-delete tier may be introduced later; today this action is hard-delete with audit
            metadata.
          </p>

          {selectedEvidence.linkedArtifacts.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Linked artifacts impacted</p>
              <ul className="mt-1 list-inside list-disc text-sm">
                {selectedEvidence.linkedArtifacts.map((a) => (
                  <li key={a.id}>{a.label}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {selectedEvidence.linkedGates.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Linked gates impacted</p>
              <ul className="mt-1 list-inside list-disc text-sm">
                {selectedEvidence.linkedGates.map((g) => (
                  <li key={g.id}>{g.label}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              Type evidence code to confirm: <span className="font-mono text-slate-900">{d.evidenceCode}</span>
            </span>
            <input
              className={inputClass}
              value={codeConfirm}
              onChange={(e) => setCodeConfirm(e.target.value)}
              autoComplete="off"
              placeholder={d.evidenceCode}
              aria-label="Evidence code confirmation"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Delete reason (required)</span>
            <textarea className={cn(inputClass, "min-h-[72px]")} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} />
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700" disabled={pending || !codeOk} onClick={submit}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
