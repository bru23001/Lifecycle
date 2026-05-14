"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CoverageStatus } from "@/types/traceability.types";
import type { PhaseEvidenceTraceListRow } from "@/types/phase-evidence-traceability.types";

import { CoverageProgressBar } from "@/components/traceability/traceability-shared";

function linkStatusLabel(s: CoverageStatus): string {
  switch (s) {
    case "complete":
      return "Complete";
    case "partial":
      return "Partial";
    case "missing":
      return "Missing";
    default:
      return s;
  }
}

export function PhaseEvidenceGapDrawer({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: PhaseEvidenceTraceListRow | null;
  onClose: () => void;
}) {
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

  const linkedAvailable = row.evidenceLinked > 0;
  const suggested =
    row.missingCount > 0
      ? `Add or link at least ${row.missingCount} more evidence item${row.missingCount === 1 ? "" : "s"} mapped to phase ${row.phaseNumber}, or record not-applicable decisions where templates allow.`
      : "Coverage meets the configured template count; verify workspace checklist and gate readiness before advancing.";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="phase-evidence-gap-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Phase evidence gap</p>
            <h2 id="phase-evidence-gap-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Phase {row.phaseNumber} · {row.phaseName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Coverage: {linkStatusLabel(row.linkStatus)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coverage</p>
            <div className="mt-2">
              <CoverageProgressBar value={row.coveragePercent} label={`Phase ${row.phaseNumber} coverage`} />
            </div>
          </div>

          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-semibold text-slate-500">Required evidence (missing)</dt>
              <dd className="mt-1 text-slate-800">
                {row.missingCount} slot{row.missingCount === 1 ? "" : "s"} open of {row.requiredEvidence} required ·{" "}
                {row.evidenceLinked} linked
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">Linked evidence available</dt>
              <dd className="mt-1 text-slate-800">{linkedAvailable ? "Yes — see phase detail." : "None yet."}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">Phase completion impact</dt>
              <dd className="mt-1 text-slate-800">{row.completionImpact}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">Suggested remediation</dt>
              <dd className="mt-1 text-slate-800">{suggested}</dd>
            </div>
          </dl>
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 dark:border-border sm:flex-row sm:justify-end">
          <Link href={row.addEvidenceHref} className={cn(buttonVariants({ variant: "outline" }))}>
            Add / link evidence
          </Link>
          <Link href={row.detailHref} className={cn(buttonVariants(), "bg-[#2563eb] text-white hover:bg-[#1d4ed8] [a]:hover:bg-[#1d4ed8]")}>
            Open phase evidence detail
          </Link>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
