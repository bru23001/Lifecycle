"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadJson } from "@/lib/download-json";
import { projectGatePackagePreviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { ApprovalPackage } from "@/types/approval-center.types";

function useModalOpen(open: boolean, onReset?: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const resetRef = useRef(onReset);
  resetRef.current = onReset;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) resetRef.current?.();
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open]);

  return dialogRef;
}

const dialogFrame =
  "w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card";

type FormatChoice = "zip" | "pdf_packet";

export function ApprovalPackageExportModal({
  open,
  pkg,
  onClose,
}: {
  open: boolean;
  pkg: ApprovalPackage | null;
  onClose: () => void;
}) {
  const [includeInputs, setIncludeInputs] = useState(true);
  const [includeArtifacts, setIncludeArtifacts] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeAuditManifest, setIncludeAuditManifest] = useState(true);
  const [format, setFormat] = useState<FormatChoice>("zip");

  const dialogRef = useModalOpen(open, () => {
    setIncludeInputs(true);
    setIncludeArtifacts(true);
    setIncludeEvidence(true);
    setIncludeComments(true);
    setIncludeHistory(true);
    setIncludeAuditManifest(true);
    setFormat("zip");
  });

  const d = pkg?.detail;
  const pid = d?.projectId;
  const gateLower = d?.gateCode?.trim().toLowerCase();
  const gatePreviewHref =
    pid && gateLower && d.approvalType === "gate_review" ? projectGatePackagePreviewHref(pid, gateLower) : null;

  const anyInclude =
    includeInputs ||
    includeArtifacts ||
    includeEvidence ||
    includeComments ||
    includeHistory ||
    includeAuditManifest;

  const downloadManifest = () => {
    if (!pkg || !d) return;
    if (!anyInclude) return;
    downloadJson(`approval-${d.id}-export-manifest.json`, {
      schema: "cybercube.approval_export_manifest@v1",
      approvalId: d.id,
      approvalCode: d.approvalCode,
      title: d.title,
      format,
      generatedAt: new Date().toISOString(),
      includes: {
        requiredInputs: includeInputs,
        artifacts: includeArtifacts,
        evidence: includeEvidence,
        comments: includeComments,
        approvalHistory: includeHistory,
        auditManifest: includeAuditManifest,
      },
      counts: {
        requiredInputs: pkg.requiredInputs.length,
        comments: pkg.comments.length,
        history: pkg.history.length,
        attachments: pkg.attachments.length,
        approvers: pkg.approvers.length,
      },
      note:
        "Local manifest only. A backend job would assemble the ZIP or PDF packet from these flags (not implemented in this preview).",
    });
    onClose();
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="export-pkg-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="export-pkg-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Download review package
            </h2>
            <p className="mt-1 text-sm text-slate-600">Choose what would be included in an export (manifest download for now).</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {gatePreviewHref ? (
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-700 dark:border-border dark:bg-muted">
              Prefer the canonical gate PDF?{" "}
              <Link href={gatePreviewHref} className="font-semibold text-[#2563eb] underline-offset-2 hover:underline">
                Open gate package preview
              </Link>
            </p>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Include</legend>
            {(
              [
                ["Required inputs", includeInputs, setIncludeInputs],
                ["Artifacts", includeArtifacts, setIncludeArtifacts],
                ["Evidence", includeEvidence, setIncludeEvidence],
                ["Comments", includeComments, setIncludeComments],
                ["Approval history", includeHistory, setIncludeHistory],
                ["Audit manifest", includeAuditManifest, setIncludeAuditManifest],
              ] as const
            ).map(([label, checked, set]) => (
              <label key={label} className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" className="size-4 rounded border-slate-300" checked={checked} onChange={(e) => set(e.target.checked)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Format</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["zip", "pdf_packet"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium",
                    format === f
                      ? "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-border dark:bg-card",
                  )}
                >
                  {f === "zip" ? "ZIP archive" : "PDF packet"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={downloadManifest} disabled={!pkg || !anyInclude}>
            Download package
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
