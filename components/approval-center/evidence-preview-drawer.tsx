"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FileSearch, X } from "lucide-react";

import { Badge } from "@/components/approval-center/approval-center-shared";
import { inputStatusBadgeMap } from "@/lib/approval-status";
import type { ApprovalRequiredInput } from "@/types/approval-center.types";

type Props = {
  open: boolean;
  onClose: () => void;
  row: ApprovalRequiredInput | null;
  fullHref?: string;
  projectName: string;
};

export function EvidencePreviewDrawer({ open, onClose, row, fullHref, projectName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
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
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,420px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="evidence-preview-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence preview</p>
            <h2 id="evidence-preview-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              {row.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{row.inputCode}</p>
            <p className="mt-1 text-xs text-slate-500">{projectName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge {...inputStatusBadgeMap[row.status]} />
            <span className="text-xs text-slate-500">Completeness: see evidence detail</span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-border dark:bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileSearch className="size-4 shrink-0 text-slate-500" aria-hidden />
              File preview
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Binary and rich previews open on the evidence detail route. Linked objects and metadata are listed there.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700 dark:border-border">
            <p className="font-semibold text-slate-800">Metadata</p>
            <dl className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Description</dt>
                <dd className="max-w-[60%] text-right text-slate-800">{row.description || "—"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-200 px-5 py-4 dark:border-border">
          {fullHref ? (
            <Link
              href={fullHref}
              onClick={onClose}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Open evidence detail
            </Link>
          ) : (
            <p className="text-center text-sm text-slate-500">No evidence URL for this input.</p>
          )}
        </footer>
      </div>
    </dialog>
  );
}
