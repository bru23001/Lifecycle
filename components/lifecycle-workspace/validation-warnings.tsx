import { AlertCircle, AlertTriangle, ChevronDown, Info } from "lucide-react";
import Link from "next/link";

import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
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
};

export function ValidationWarnings({ warnings }: ValidationWarningsProps) {
  const count = warnings.length;
  const hasBlocking = warnings.some((w) => w.severity === "error");

  return (
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
        <ul className="mt-3 space-y-2">
          {count === 0 ? (
            <li className="text-xs text-emerald-800 dark:text-emerald-100">
              No validation warnings.
            </li>
          ) : (
            warnings.map((w) => {
              const inner = (
                <span
                  className={cn(
                    "flex gap-2 text-xs leading-snug",
                    w.severity === "error" && "text-red-950 dark:text-red-100",
                    w.severity === "warning" && "text-amber-950 dark:text-amber-100",
                    w.severity === "info" && "text-sky-950 dark:text-sky-100",
                  )}
                >
                  <SeverityIcon severity={w.severity} />
                  {w.message}
                </span>
              );
              return (
                <li key={w.id}>
                  {w.href ? (
                    <Link href={w.href} className="block rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })
          )}
        </ul>
      </details>
    </section>
  );
}
