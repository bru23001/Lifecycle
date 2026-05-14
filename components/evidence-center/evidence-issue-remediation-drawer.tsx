"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ValidationIssue } from "@/types/evidence-validation.types";

function SeverityBadge({ severity }: { severity: ValidationIssue["severity"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        severity === "fail" && "bg-red-100 text-red-800",
        severity === "warn" && "bg-amber-100 text-amber-900",
        severity === "info" && "bg-slate-100 text-slate-700",
      )}
    >
      {severity}
    </span>
  );
}

export function EvidenceIssueRemediationDrawer({
  open,
  issue,
  onClose,
  onBackToResults,
}: {
  open: boolean;
  issue: ValidationIssue | null;
  onClose: () => void;
  /** When results drawer stays open underneath, return focus there. */
  onBackToResults?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && issue) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, issue]);

  if (!issue) return null;

  return (
    <dialog
      ref={dialogRef}
      data-testid="evidence-issue-remediation-drawer"
      onClose={onClose}
      className="z-[55] ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="evidence-remediation-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Issue remediation</p>
            <h2 id="evidence-remediation-title" className="mt-1 break-words text-lg font-semibold text-slate-900 dark:text-foreground">
              {issue.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={issue.severity} />
              {issue.evidenceCode ? (
                <span className="text-xs font-medium text-slate-600">{issue.evidenceCode}</span>
              ) : null}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-800">
          <p className="leading-relaxed">{issue.detail}</p>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-border">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Guidance</p>
            <p className="mt-1 text-sm">{issue.remediationHint}</p>
          </div>
          <div className="flex flex-col gap-2">
            {issue.fixHref ? (
              <Link
                href={issue.fixHref}
                data-testid="evidence-remediation-fix-link"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {issue.fixLabel}
              </Link>
            ) : null}
            {issue.evidenceHref ? (
              <Link
                href={issue.evidenceHref}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Open evidence record
              </Link>
            ) : null}
          </div>
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          {onBackToResults ? (
            <Button type="button" variant="outline" onClick={onBackToResults} className="gap-1">
              <ArrowLeft className="size-4" aria-hidden />
              Back to results
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
