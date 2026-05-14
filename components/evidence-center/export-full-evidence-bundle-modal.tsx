"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ExportFullEvidenceBundleOptions } from "@/lib/evidence-export";
import type { EvidenceCenterData } from "@/types/evidence-center.types";

export type { ExportFullEvidenceBundleOptions } from "@/lib/evidence-export";

export function ExportFullEvidenceBundleModal({
  open,
  data,
  selectedIds,
  onClose,
  onExport,
}: {
  open: boolean;
  data: EvidenceCenterData;
  selectedIds: string[];
  onClose: () => void;
  onExport: (opts: ExportFullEvidenceBundleOptions) => void | Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [includeFiles, setIncludeFiles] = useState(true);
  const [includeManifest, setIncludeManifest] = useState(true);
  const [includePhaseMappings, setIncludePhaseMappings] = useState(true);
  const [includeGateMappings, setIncludeGateMappings] = useState(true);
  const [includeArtifactMappings, setIncludeArtifactMappings] = useState(true);
  const [includeChecksums, setIncludeChecksums] = useState(true);
  const [includeAuditManifest, setIncludeAuditManifest] = useState(false);
  const [redactRestricted, setRedactRestricted] = useState(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const n = data.evidenceItems.length;
  const estSizeKb = Math.max(8, Math.round(n * 12 * (includeFiles ? 1 : 0.2)));

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-bundle-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div>
            <h2 id="export-bundle-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Export full evidence bundle
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {data.project.name} · {n} evidence item{n === 1 ? "" : "s"}
              {selectedIds.length > 0 ? ` · ${selectedIds.length} starred for selection export` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <p className="text-xs text-slate-500">
            Options are captured for the export manifest. The current build still streams a JSON stub from the API; toggles
            shape the payload metadata where supported.
          </p>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeFiles} onChange={(e) => setIncludeFiles(e.target.checked)} />
            Include all evidence files (metadata when binary pipeline is off)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeManifest}
              onChange={(e) => setIncludeManifest(e.target.checked)}
            />
            Include metadata manifest
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includePhaseMappings}
              onChange={(e) => setIncludePhaseMappings(e.target.checked)}
            />
            Include phase mappings
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeGateMappings}
              onChange={(e) => setIncludeGateMappings(e.target.checked)}
            />
            Include gate mappings
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeArtifactMappings}
              onChange={(e) => setIncludeArtifactMappings(e.target.checked)}
            />
            Include artifact mappings
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeChecksums}
              onChange={(e) => setIncludeChecksums(e.target.checked)}
            />
            Include checksums
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeAuditManifest}
              onChange={(e) => setIncludeAuditManifest(e.target.checked)}
            />
            Include audit manifest
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={redactRestricted}
              onChange={(e) => setRedactRestricted(e.target.checked)}
            />
            Redact restricted fields in export view
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Estimated package size:</span> ~{estSizeKb} KB (stub)
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-800">File count:</span> {n} evidence rows
            </p>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={() =>
              void Promise.resolve(
                onExport({
                  includeFiles,
                  includeManifest,
                  includePhaseMappings,
                  includeGateMappings,
                  includeArtifactMappings,
                  includeChecksums,
                  includeAuditManifest,
                  redactRestricted,
                }),
              ).finally(() => onClose())
            }
          >
            Export
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
