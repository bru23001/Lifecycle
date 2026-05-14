"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { saveTraceabilityReportSchedule } from "@/app/actions/traceabilityReportSchedule";
import { Button } from "@/components/ui/button";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "gate_submission", label: "Gate submission event" },
] as const;

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "html_print", label: "HTML (print to PDF)" },
  { value: "zip", label: "ZIP package" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
};

export function ScheduleTraceabilityReportModal({ open, onClose, projectId }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [reportName, setReportName] = useState("Weekly traceability digest");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]["value"]>("weekly");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [format, setFormat] = useState<(typeof FORMATS)[number]["value"]>("html_print");
  const [includeGapsOnly, setIncludeGapsOnly] = useState(false);
  const [includeFullMatrix, setIncludeFullMatrix] = useState(true);

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
    setError(null);
    setReportName("Weekly traceability digest");
    setFrequency("weekly");
    setRecipientsRaw("");
    setFormat("html_print");
    setIncludeGapsOnly(false);
    setIncludeFullMatrix(true);
  }, [open]);

  function submit() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await saveTraceabilityReportSchedule({
          projectId,
          reportName,
          frequency,
          recipientsRaw,
          format,
          includeGapsOnly,
          includeFullMatrix,
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        onClose();
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  const canSave = includeFullMatrix || includeGapsOnly;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="schedule-trace-report-title"
    >
      <div className="flex max-h-[88vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Traceability</p>
            <h2 id="schedule-trace-report-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Schedule report
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Stores delivery preferences for this project. Automated email dispatch is configured separately.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted">
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Report name</span>
            <input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 dark:border-input dark:bg-input/30"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Frequency</span>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as (typeof FREQUENCIES)[number]["value"])}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 dark:border-input dark:bg-input/30"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Recipients (one email per line)</span>
            <textarea
              value={recipientsRaw}
              onChange={(e) => setRecipientsRaw(e.target.value)}
              rows={4}
              placeholder="ops-lead@test.cybercube.software"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs dark:border-input dark:bg-input/30"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Format</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as (typeof FORMATS)[number]["value"])}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 dark:border-input dark:bg-input/30"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-border">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={includeFullMatrix} onChange={(e) => setIncludeFullMatrix(e.target.checked)} />
              <span>Include full matrix</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={includeGapsOnly} onChange={(e) => setIncludeGapsOnly(e.target.checked)} />
              <span>Include gaps-only appendix</span>
            </label>
            <p className="text-xs text-slate-500">At least one of the two options above must stay enabled.</p>
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <footer className={cn("flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-border")}>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={pending || !canSave}>
            {pending ? "Saving…" : "Save schedule"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
