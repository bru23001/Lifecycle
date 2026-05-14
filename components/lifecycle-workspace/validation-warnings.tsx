"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ChevronDown, Info } from "lucide-react";

import { DismissValidationWarningModal } from "@/components/lifecycle-workspace/dismiss-validation-warning-modal";
import { ValidationRunProgressModal } from "@/components/lifecycle-workspace/validation-run-progress-modal";
import { ValidationWarningDetailDrawer } from "@/components/lifecycle-workspace/validation-warning-detail-drawer";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
import { projectPhaseValidationHref } from "@/lib/projects-url";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SeverityIcon({ severity }: { severity: ValidationWarning["severity"] }) {
  if (severity === "error")
    return <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-600" aria-hidden />;
  if (severity === "info")
    return <Info className="mt-0.5 size-3.5 shrink-0 text-sky-600" aria-hidden />;
  return <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" aria-hidden />;
}

export type ValidationWarningsProps = {
  warnings: ValidationWarning[];
  projectId: string;
  phaseNumber: number;
};

export function ValidationWarnings({ warnings, projectId, phaseNumber }: ValidationWarningsProps) {
  const count = warnings.length;
  const hasBlocking = warnings.some((w) => w.severity === "error");
  const [detailWarning, setDetailWarning] = useState<ValidationWarning | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [dismissTarget, setDismissTarget] = useState<ValidationWarning | null>(null);

  const errorCount = warnings.filter((w) => w.severity === "error").length;
  const warningCount = warnings.filter((w) => w.severity === "warning").length;
  const infoCount = warnings.filter((w) => w.severity === "info").length;

  const reportHref = projectPhaseValidationHref(projectId, phaseNumber);

  return (
    <>
      <section
        id="validation-warnings"
        aria-labelledby="validation-warnings-heading"
        className={cn(
          "validation-warnings rounded-lg border bg-card p-4 shadow-sm",
          hasBlocking && "border-red-200 dark:border-red-900",
        )}
      >
        <details className="group" open={count <= 4}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <h3 id="validation-warnings-heading" className="flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex size-5 items-center justify-center rounded bg-[#fff3d9]">
                  <AlertTriangle className="size-3.5 text-amber-600" aria-hidden />
                </span>
                Validation warnings
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                  count === 0
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
                    : "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100",
                )}
              >
                {count}
              </span>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-3 flex flex-wrap gap-2 border-b border-border pb-3">
            <Button type="button" size="sm" variant="outline" onClick={() => setRunOpen(true)}>
              Run validation
            </Button>
            <Link
              href={reportHref}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              View all warnings
            </Link>
          </div>

          <ul className="mt-3 space-y-2">
            {count === 0 ? (
              <li className="text-xs text-emerald-800 dark:text-emerald-100">No validation warnings.</li>
            ) : (
              warnings.map((w) => {
                const dismissible = w.dismissible !== false && w.severity !== "error";
                return (
                  <li
                    key={w.id}
                    className="flex flex-col gap-2 rounded-md border border-transparent px-1 py-1 hover:border-border sm:flex-row sm:items-start sm:justify-between"
                  >
                    <button
                      type="button"
                      className={cn(
                        "flex flex-1 gap-2 rounded-sm text-left text-xs leading-snug outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        w.severity === "error" && "text-red-950 dark:text-red-100",
                        w.severity === "warning" && "text-amber-950 dark:text-amber-100",
                        w.severity === "info" && "text-sky-950 dark:text-sky-100",
                      )}
                      onClick={() => setDetailWarning(w)}
                      aria-label={`Open details for warning: ${w.message}`}
                    >
                      <SeverityIcon severity={w.severity} />
                      <span>{w.message}</span>
                    </button>
                    <div className="flex shrink-0 gap-2 pl-7 sm:pl-0">
                      {dismissible ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setDismissTarget(w)}
                        >
                          Dismiss
                        </Button>
                      ) : null}
                      {w.href ? (
                        <Link
                          href={w.href}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs")}
                        >
                          Open
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </details>
      </section>

      <ValidationWarningDetailDrawer
        open={Boolean(detailWarning)}
        warning={detailWarning}
        onClose={() => setDetailWarning(null)}
      />

      <ValidationRunProgressModal
        open={runOpen}
        onClose={() => setRunOpen(false)}
        errorCount={errorCount}
        warningCount={warningCount}
        infoCount={infoCount}
      />

      <DismissValidationWarningModal
        open={Boolean(dismissTarget)}
        warning={dismissTarget}
        projectId={projectId}
        phaseNumber={phaseNumber}
        onClose={() => setDismissTarget(null)}
      />
    </>
  );
}
