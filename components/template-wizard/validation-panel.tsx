"use client";

import type { ValidationIssue, ValidationSummary } from "@/types/template-wizard.types";
import { cn } from "@/lib/utils";

function severityDot(sev: ValidationIssue["severity"]) {
  if (sev === "error") return "bg-[#dc2626]";
  if (sev === "warning") return "bg-[#f59e0b]";
  return "bg-[#64748b]";
}

export function ValidationPanel({
  summary,
  onIssueClick,
}: {
  summary: ValidationSummary;
  onIssueClick?: (issue: ValidationIssue) => void;
}) {
  const pct = summary.completionPercent;

  return (
    <section
      className="rounded-2xl border bg-card p-4 shadow-sm"
      aria-label="Validation panel"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Validation Panel</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Export readiness and blocking issues for this artifact.
          </p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {pct}% overall
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-[#16a34a]/25 bg-[#f0fdf4] px-2 py-2">
          <p className="text-lg font-bold text-[#15803d]">{summary.requiredFieldsComplete}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#166534]">
            Completed
          </p>
        </div>
        <div className="rounded-xl border border-[#f59e0b]/25 bg-[#fffbeb] px-2 py-2">
          <p className="text-lg font-bold text-[#d97706]">{summary.warningCount}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#92400e]">
            Warnings
          </p>
        </div>
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-2 py-2">
          <p className="text-lg font-bold text-[#dc2626]">{summary.errorCount}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#991b1b]">Errors</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Completion</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#2563eb] transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid gap-1 rounded-lg border bg-muted/20 px-3 py-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <dt>Required fields</dt>
          <dd className="font-semibold text-foreground">
            {summary.requiredFieldsComplete}/{summary.requiredFieldsTotal}
          </dd>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <dt>Sections complete</dt>
          <dd className="font-semibold text-foreground">
            {summary.sectionsComplete}/{summary.sectionsTotal}
          </dd>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <dt>Evidence links</dt>
          <dd className="font-semibold text-foreground">
            {summary.evidenceLinksComplete}/{summary.evidenceLinksRequired}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Issues
          </p>
          <button
            type="button"
            className="text-xs font-semibold text-[#2563eb] hover:underline"
          >
            View all issues
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {summary.issues.length === 0 ? (
            <li className="rounded-lg border border-[#16a34a]/30 bg-[#f0fdf4] px-3 py-2 text-sm text-[#166534]">
              No validation issues.
            </li>
          ) : (
            summary.issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    issue.severity === "error"
                      ? "border-[#fecaca] bg-[#fef2f2]"
                      : issue.severity === "warning"
                        ? "border-[#fde68a] bg-[#fffbeb]"
                        : "border-border bg-muted/30",
                  )}
                  onClick={() => onIssueClick?.(issue)}
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", severityDot(issue.severity))} />
                  <span className="text-foreground">{issue.message}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
