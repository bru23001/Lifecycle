"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConfirmEvidenceActionModal({
  open,
  title,
  description,
  confirmLabel,
  destructive,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
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
      className="w-[min(100vw-2rem,440px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="confirm-evidence-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <h2 id="confirm-evidence-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <p className="px-5 py-4 text-sm text-slate-700">{description}</p>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className={destructive ? "bg-red-600 hover:bg-red-700" : "bg-[#2563eb] hover:bg-[#1d4ed8]"}
            onClick={() => {
              void Promise.resolve(onConfirm()).finally(() => onClose());
            }}
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
