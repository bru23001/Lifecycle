import { AlertCircle, Check, Circle, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { CompletionChecklistItem } from "@/components/lifecycle-workspace/completion-checklist-types";
import { cn } from "@/lib/utils";

export type CompletionChecklistProps = {
  items: CompletionChecklistItem[];
};

export function CompletionChecklist({ items }: CompletionChecklistProps) {
  const completedCount = items.filter((i) => i.status === "complete").length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const firstIncompleteIndex = items.findIndex((i) => i.status !== "complete");

  return (
    <section
      id="completion-checklist"
      aria-labelledby="completion-checklist-heading"
      className="completion-checklist rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="completion-checklist-heading" className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
            <ShieldCheck className="size-3.5 text-[#2563eb]" aria-hidden />
          </span>
          Completion checklist
        </h3>
        <p className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground" aria-live="polite">
          {completedCount} of {totalCount} completed
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Checklist completion"
      >
        <div
          className="h-full rounded-full bg-[#2563eb] transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => {
          const emphasize =
            item.status !== "complete" &&
            index === firstIncompleteIndex &&
            item.status !== "blocked";
          const content = (
            <span
              className={cn(
                item.status === "complete" && "text-foreground",
                item.status === "incomplete" && !emphasize && "text-muted-foreground",
                emphasize && "font-medium text-foreground",
                item.status === "blocked" && "font-medium text-amber-900 dark:text-amber-100",
              )}
            >
              {item.label}
              {item.required ? (
                <span className="sr-only"> (required)</span>
              ) : (
                <span className="sr-only"> (optional)</span>
              )}
            </span>
          );

          return (
            <li key={item.id} className="flex gap-2 text-sm">
              {item.status === "complete" ? (
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              ) : item.status === "blocked" ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
              ) : emphasize ? (
                <Circle className="mt-0.5 size-4 shrink-0 text-[#2563eb]" aria-hidden />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" aria-hidden />
              )}
              {item.href ? (
                <Link href={item.href} className="min-w-0 hover:underline">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
