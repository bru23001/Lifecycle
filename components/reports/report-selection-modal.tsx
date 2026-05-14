"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildReportSelectionTarget,
  REPORT_SELECTION_FORMATS,
  REPORT_SELECTION_KEYS,
  reportSelectionLabel,
  type ReportSelectionFormat,
  type ReportSelectionKey,
} from "@/lib/report-selection-url";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  projectId: string;
  onClose: () => void;
  /** Optional initial selections (used by deep-links from quick actions). */
  initialReportKey?: ReportSelectionKey;
  initialFormat?: ReportSelectionFormat;
};

/**
 * "Generate Report" modal (§9). UX shortcut for the existing Reports Screen:
 *
 *   - `format === "view"`  → navigate to the per-report detail page.
 *   - `format ∈ {csv,json,pdf}` → trigger the existing
 *     `/api/projects/{id}/reports/export?key=…&format=…` download endpoint.
 *
 * No new server logic — all targets are produced by the pure helper
 * `buildReportSelectionTarget` (covered by unit tests).
 */
export function ReportSelectionModal({
  open,
  projectId,
  onClose,
  initialReportKey = "lifecycleStatus",
  initialFormat = "view",
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const [reportKey, setReportKey] = useState<ReportSelectionKey>(initialReportKey);
  const [format, setFormat] = useState<ReportSelectionFormat>(initialFormat);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setReportKey(initialReportKey);
    setFormat(initialFormat);
    setStartDate("");
    setEndDate("");
  }, [open, initialReportKey, initialFormat]);

  const validDateRange = useMemo(() => {
    if (!startDate || !endDate) return true;
    return new Date(startDate).getTime() <= new Date(endDate).getTime();
  }, [startDate, endDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validDateRange) return;
    const target = buildReportSelectionTarget({
      projectId,
      reportKey,
      format,
      startDate: startDate || null,
      endDate: endDate || null,
    });
    onClose();
    if (target.mode === "navigate") {
      router.push(target.href);
    } else if (typeof window !== "undefined") {
      window.location.assign(target.href);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,600px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="report-selection-modal-title"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reports</p>
            <h2
              id="report-selection-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              Generate Report
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Pick a report type and format. CSV/JSON/PDF will download immediately; View opens the full report screen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 text-sm">
          <fieldset>
            <legend className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Report type</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {REPORT_SELECTION_KEYS.map((k) => (
                <label
                  key={k}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                    reportKey === k
                      ? "border-blue-300 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="report-selection-key"
                    value={k}
                    checked={reportKey === k}
                    onChange={() => setReportKey(k)}
                    className="size-3"
                  />
                  {reportSelectionLabel(k)}
                </label>
              ))}
            </div>
          </fieldset>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Date range (optional)</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <label className="flex w-full flex-col gap-1 text-xs text-slate-600">
                From
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex w-full flex-col gap-1 text-xs text-slate-600">
                To
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            {!validDateRange ? (
              <p className="mt-1 text-xs text-rose-700">From date must be on or before To date.</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Leave blank to use the report&apos;s default range.</p>
            )}
          </section>

          <fieldset>
            <legend className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Format</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {REPORT_SELECTION_FORMATS.map((f) => (
                <label
                  key={f}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1 text-sm",
                    format === f
                      ? "border-blue-300 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="report-selection-format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="size-3"
                  />
                  {f.toUpperCase()}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2" disabled={!validDateRange}>
            Generate
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </footer>
      </form>
    </dialog>
  );
}

const inputClass =
  "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
