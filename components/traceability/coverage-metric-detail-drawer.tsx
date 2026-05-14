"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CoverageMetricDetail, CoverageMetricListItem } from "@/lib/traceability-coverage-metrics";
import { cn } from "@/lib/utils";

function ItemList({ title, items }: { title: string; items: CoverageMetricListItem[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-xs text-slate-500">None in this category.</p>
      ) : (
        <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-sm">
          {items.map((it, i) => (
            <li key={`${it.label}-${i}`}>
              <Link href={it.href} className="text-[#2563eb] hover:underline">
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CoverageMetricDetailDrawer({
  open,
  detail,
  onClose,
}: {
  open: boolean;
  detail: CoverageMetricDetail | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && detail) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, detail]);

  if (!detail) return null;

  const reportHref = `${pathname}#coverage-report-top`;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="coverage-metric-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Coverage metric</p>
            <h2
              id="coverage-metric-drawer-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              {detail.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close metric details"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 text-sm">
          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Definition</p>
            <p className="mt-1 text-slate-700 dark:text-muted-foreground">{detail.definition}</p>
          </section>

          <ItemList title="Covered objects" items={detail.covered} />
          <ItemList title="Partially covered objects" items={detail.partial} />
          <ItemList title="Missing links" items={detail.missing} />
          <ItemList title="Orphaned objects" items={detail.orphaned} />

          {detail.trendNote ? (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Trend</p>
              <p className="mt-1 text-xs text-slate-600">{detail.trendNote}</p>
            </section>
          ) : null}
        </div>

        <footer className={cn("flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 px-5 py-3 dark:border-border")}>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Link href={reportHref} onClick={onClose}>
            <Button type="button" className="gap-2">
              Open full report
              <ExternalLink className="size-4" aria-hidden />
            </Button>
          </Link>
        </footer>
      </div>
    </dialog>
  );
}
