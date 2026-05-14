"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

import { DownloadEvidenceConfirmModal, evidenceDownloadNeedsConfirmation } from "./download-evidence-confirm-modal";
import { EvidenceFilePreview } from "./evidence-file-preview";

export function EvidencePreviewModal({
  open,
  selectedEvidence,
  onClose,
}: {
  open: boolean;
  selectedEvidence: EvidenceCenterSelectedEvidence | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && selectedEvidence) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, selectedEvidence]);

  useEffect(() => {
    if (!open) setDownloadConfirmOpen(false);
  }, [open]);

  if (!selectedEvidence) return null;

  const href = selectedEvidence.detail.previewHref ?? selectedEvidence.detail.downloadHref;
  const downloadHref = selectedEvidence.detail.downloadHref;
  const sensitive = evidenceDownloadNeedsConfirmation(selectedEvidence.detail.classification);

  const startDownload = () => {
    if (!downloadHref) return;
    window.open(downloadHref, "_blank", "noopener,noreferrer");
  };

  const onDownloadClick = () => {
    if (!downloadHref) return;
    if (sensitive) setDownloadConfirmOpen(true);
    else startDownload();
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={onClose}
        className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-1rem,min(96vw,1200px))] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 dark:border-border dark:bg-card"
        aria-labelledby="evidence-preview-modal-title"
      >
        <div className="flex max-h-[92vh] flex-col">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
            <div className="min-w-0">
              <h2 id="evidence-preview-modal-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
                Evidence preview
              </h2>
              <p className="mt-1 truncate text-sm text-slate-600" title={selectedEvidence.detail.name}>
                {selectedEvidence.detail.evidenceCode} · {selectedEvidence.detail.name}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {downloadHref ? (
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex items-center")}
                  onClick={onDownloadClick}
                >
                  Download
                </button>
              ) : null}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex items-center gap-1.5")}
                >
                  <ExternalLink className="size-3.5" aria-hidden />
                  Open in new tab
                </a>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <EvidenceFilePreview selectedEvidence={selectedEvidence} interactivePdf />
          </div>
        </div>
      </dialog>

      <DownloadEvidenceConfirmModal
        open={downloadConfirmOpen}
        fileName={selectedEvidence.detail.name}
        classification={selectedEvidence.detail.classification}
        onClose={() => setDownloadConfirmOpen(false)}
        onConfirm={() => {
          startDownload();
          setDownloadConfirmOpen(false);
        }}
      />
    </>
  );
}
