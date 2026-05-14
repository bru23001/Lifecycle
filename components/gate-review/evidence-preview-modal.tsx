"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { GateEvidenceItem } from "@/types/gate-review.types";

import { evidenceTypeLabel } from "./gate-review-shared-widgets";

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function EvidencePreviewModal({
  item,
  open,
  onClose,
}: {
  item: GateEvidenceItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const optionsRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const optionsTitleId = useId();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [includeManifest, setIncludeManifest] = useState(true);
  const [includeChecksum, setIncludeChecksum] = useState(true);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && item) {
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open, item]);

  useEffect(() => {
    const d = optionsRef.current;
    if (!d) return;
    if (optionsOpen) {
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [optionsOpen]);

  useEffect(() => {
    if (!open) setOptionsOpen(false);
  }, [open]);

  if (!item) return null;

  const typeLabel = evidenceTypeLabel(item.type);
  const detailHref = item.href;
  const downloadTarget = item.downloadHref ?? item.href;

  function onDownloadWithOptions() {
    if (!item) return;
    const payload = {
      evidenceId: item.id,
      name: item.name,
      type: item.type,
      includeMetadataManifest: includeManifest,
      includeChecksum,
      generatedAt: new Date().toISOString(),
    };
    downloadJson(`evidence-download-${item.id}.json`, payload);
    setOptionsOpen(false);
  }

  return (
    <>
      <dialog
        ref={ref}
        className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
        aria-labelledby={titleId}
        onClose={onClose}
      >
        <div className="flex max-h-[85vh] flex-col p-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-950 dark:text-foreground">
            Evidence preview
          </h2>
          <p className="mt-1 text-sm font-medium text-foreground">{item.name}</p>

          <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-muted-foreground dark:border-border dark:bg-muted/30">
            File preview is not available in this build. Use{" "}
            <span className="font-medium text-foreground">Open detail</span> for the full evidence workspace.
          </div>

          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium text-foreground">{typeLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Added by</dt>
              <dd className="font-medium text-foreground">{item.addedBy}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Added on</dt>
              <dd className="font-medium text-foreground">{item.addedOnLabel}</dd>
            </div>
            {item.classification ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Classification</dt>
                <dd className="font-medium capitalize text-foreground">{item.classification}</dd>
              </div>
            ) : null}
            {item.gateCode ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Linked gate</dt>
                <dd className="font-medium text-foreground">{item.gateCode}</dd>
              </div>
            ) : null}
            {item.phaseNumber != null ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Linked phase</dt>
                <dd className="font-medium text-foreground">Phase {item.phaseNumber}</dd>
              </div>
            ) : null}
            {item.linkedArtifactSummary ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Linked artifact</dt>
                <dd className="text-right font-medium text-foreground">{item.linkedArtifactSummary}</dd>
              </div>
            ) : null}
            {item.evidenceCode ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Evidence code</dt>
                <dd className="font-mono text-xs text-foreground">{item.evidenceCode}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={downloadTarget}
              download
              className={buttonVariants({ variant: "outline", size: "sm", className: "no-underline" })}
              data-testid="evidence-preview-download"
            >
              Download
            </a>
            <Button type="button" variant="outline" size="sm" onClick={() => setOptionsOpen(true)}>
              Download options…
            </Button>
            <Link
              href={detailHref}
              className={buttonVariants({ variant: "default", size: "sm", className: "no-underline" })}
              data-testid="evidence-preview-open-detail"
            >
              Open detail
            </Link>
            <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={optionsRef}
        className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-900/50 dark:border-border dark:bg-card"
        aria-labelledby={optionsTitleId}
        onClose={() => setOptionsOpen(false)}
      >
        <h3 id={optionsTitleId} className="text-base font-semibold text-foreground">
          Download options
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo export: generates a JSON sidecar describing the download. Wire to storage for original files and
          manifests.
        </p>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={includeManifest}
            onChange={() => setIncludeManifest((v) => !v)}
          />
          Download with metadata manifest
        </label>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={includeChecksum}
            onChange={() => setIncludeChecksum((v) => !v)}
          />
          Include checksum field
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOptionsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onDownloadWithOptions}>
            Download
          </Button>
        </div>
      </dialog>
    </>
  );
}
