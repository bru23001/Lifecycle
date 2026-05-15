"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import { cn } from "@/lib/utils";
import { issuesForCategory } from "@/lib/evidence-validation";
import type { EvidenceValidationResult, ValidationIssue, ValidationIssueCategory } from "@/types/evidence-validation.types";

const CATEGORY_ORDER: ValidationIssueCategory[] = [
  "metadata",
  "required_fields",
  "links",
  "classification",
  "gate_readiness",
  "phase_completion",
];

const CATEGORY_LABEL: Record<ValidationIssueCategory, string> = {
  metadata: "Metadata & titling",
  required_fields: "Required fields",
  links: "Lifecycle linkage",
  classification: "Classification & custody",
  gate_readiness: "Gate readiness",
  phase_completion: "Phase completion",
};

function SeverityIcon({ severity }: { severity: ValidationIssue["severity"] }) {
  if (severity === "fail") return <AlertTriangle className="size-4 text-red-600" aria-hidden />;
  if (severity === "warn") return <AlertTriangle className="size-4 text-amber-600" aria-hidden />;
  return <Info className="size-4 text-slate-500" aria-hidden />;
}

export function EvidenceValidationResultsDrawer({
  open,
  result,
  onClose,
  onSelectIssue,
}: {
  open: boolean;
  result: EvidenceValidationResult | null;
  onClose: () => void;
  onSelectIssue: (issue: ValidationIssue) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && result) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, result]);

  if (!result) return null;

  const { summary } = result;
  const hasBlocking = summary.fail > 0;

  return (
    <dialog
      ref={dialogRef}
      data-testid="evidence-validation-results-drawer"
      onClose={onClose}
      className="z-[50] ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,480px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="evidence-validation-results-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence validation</p>
            <h2 id="evidence-validation-results-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Validation results
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Snapshot {formatDateTimeAbsolute(new Date(result.generatedAtIso))} · {summary.evidenceRowsScanned} evidence row
              {summary.evidenceRowsScanned === 1 ? "" : "s"} scanned
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-border dark:bg-muted/40">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-red-700">
                <AlertTriangle className="size-4" aria-hidden />
                {summary.fail} fail
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                <AlertTriangle className="size-4 text-amber-600" aria-hidden />
                {summary.warn} warn
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                <Info className="size-4" aria-hidden />
                {summary.info} info
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-700">
              {hasBlocking ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
              ) : (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              )}
              <p>{hasBlocking ? "Blocking issues require remediation before audit sign-off." : "No blocking validation failures detected for this snapshot."}</p>
            </div>
          </div>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Gate readiness impact</h3>
            <p className="mt-1 text-sm text-slate-800">{result.gateReadinessImpact}</p>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Phase completion impact</h3>
            <p className="mt-1 text-sm text-slate-800">{result.phaseCompletionImpact}</p>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Findings by category</h3>
            {result.issues.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600" data-testid="evidence-validation-empty">
                No validation findings for this snapshot. Re-run after adding or linking evidence.
              </p>
            ) : (
            <div className="mt-2 space-y-4">
              {CATEGORY_ORDER.map((cat) => {
                const list = issuesForCategory(result.issues, cat);
                if (list.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-slate-600">{CATEGORY_LABEL[cat]}</p>
                    <ul className="mt-2 space-y-2">
                      {list.map((issue) => (
                        <li key={issue.id}>
                          <button
                            type="button"
                            data-testid={`evidence-validation-issue-${issue.id}`}
                            className={cn(
                              "flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left text-sm transition",
                              issue.severity === "fail" && "border-red-200 bg-red-50/60 hover:bg-red-50",
                              issue.severity === "warn" && "border-amber-200 bg-amber-50/50 hover:bg-amber-50/80",
                              issue.severity === "info" && "border-slate-200 bg-white hover:bg-slate-50 dark:border-border",
                            )}
                            onClick={() => onSelectIssue(issue)}
                          >
                            <span className="flex items-center gap-2 font-medium text-slate-900">
                              <SeverityIcon severity={issue.severity} />
                              {issue.title}
                            </span>
                            <span className="text-xs text-slate-600">{issue.detail}</span>
                            <span className="text-[11px] font-medium text-blue-700">Remediation →</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            )}
          </section>
        </div>

        <footer className="border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
