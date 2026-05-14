"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { classificationLabel } from "@/lib/add-evidence-form";
import type { EvidenceDetail } from "@/types/evidence-center.types";

export function evidenceDownloadNeedsConfirmation(classification: EvidenceDetail["classification"]) {
  return classification === "confidential" || classification === "restricted";
}

export function DownloadEvidenceConfirmModal({
  open,
  fileName,
  classification,
  onClose,
  onConfirm,
}: {
  open: boolean;
  fileName: string;
  classification: EvidenceDetail["classification"];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50 dark:border-border dark:bg-card"
      aria-labelledby="download-evidence-confirm-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <h2 id="download-evidence-confirm-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Confirm download
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold">File:</span> {fileName}
          </p>
          <p>
            <span className="font-semibold">Classification:</span> {classificationLabel(classification)} — handle this
            file according to STD-DAT-001 and your local data-handling policy.
          </p>
          <p className="text-xs text-slate-500">
            This download may be recorded in the audit log. Only proceed on a trusted device and approved network.
          </p>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={onConfirm}>
            Download
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
