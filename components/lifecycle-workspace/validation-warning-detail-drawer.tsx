"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ValidationWarningDetailDrawerProps = {
  open: boolean;
  warning: ValidationWarning | null;
  onClose: () => void;
};

export function ValidationWarningDetailDrawer({
  open,
  warning,
  onClose,
}: ValidationWarningDetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !warning) return null;

  const rows: { label: string; value: string }[] = [
    { label: "Severity", value: warning.severity },
    { label: "Message", value: warning.message },
    { label: "Affected phase", value: warning.affectedPhaseLabel ?? "—" },
    { label: "Affected template", value: warning.affectedTemplateTitle ?? warning.affectedTemplateId ?? "—" },
    { label: "Affected artifact", value: warning.affectedArtifactLabel ?? "—" },
    { label: "Affected evidence", value: warning.affectedEvidenceLabel ?? "—" },
    { label: "Rule", value: warning.ruleId ?? "—" },
    { label: "Recommended fix", value: warning.recommendedFix ?? "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close warning details" onClick={onClose} />
      <div
        data-testid="validation-warning-detail-drawer"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-[var(--app-bg)] shadow-2xl dark:border-border"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Validation</p>
            <h2 id="validation-warning-drawer-title" className="text-sm font-semibold text-foreground">
              Warning detail
            </h2>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-[12px]">
          {rows.map((r) => (
            <div key={r.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</p>
              <p className="mt-1 whitespace-pre-wrap text-foreground">{r.value}</p>
            </div>
          ))}
          {warning.href ? (
            <div className="border-t border-slate-200 pt-4 dark:border-border">
              <Link
                href={warning.href}
                className={cn(buttonVariants({ variant: "default", size: "default" }), "inline-flex w-full gap-2")}
              >
                Open correction target
                <ExternalLink className="size-3.5 opacity-80" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
