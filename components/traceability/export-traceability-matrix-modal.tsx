"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  runTraceabilityExport,
  type TraceabilityExportFormat,
  type TraceabilityExportOptions,
  type TraceabilityExportScope,
  type TraceabilityExportViewModel,
} from "@/lib/traceability-export";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

const SCOPES: { value: TraceabilityExportScope; label: string; hint: string }[] = [
  { value: "current_filters", label: "Current filters", hint: "Rows visible with the matrix filter bar and gap tab." },
  { value: "full_matrix", label: "Full project matrix", hint: "All coverage buckets and gaps for this project." },
  { value: "gaps_only", label: "Gaps only", hint: "Traceability gap and orphan records." },
  { value: "requirement_coverage", label: "Requirement coverage only", hint: "Requirement ↔ design and requirement ↔ test rows." },
  { value: "gate_evidence_only", label: "Gate evidence only", hint: "Gate evidence coverage rows." },
];

const FORMATS: { value: TraceabilityExportFormat; label: string; hint?: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "pdf", label: "HTML (print to PDF)", hint: "Downloads HTML; use browser Print → Save as PDF." },
  { value: "zip", label: "ZIP package", hint: "CSV + JSON + HTML report + README." },
];

type Props = {
  open: boolean;
  onClose: () => void;
  /** Matrix page passes filtered rows; report page can pass `slicesFromFull(data)` for both. */
  viewModel: TraceabilityExportViewModel;
  /** When the UI has no live matrix filters, prefer `full_matrix`. */
  defaultScope?: TraceabilityExportScope;
};

export function ExportTraceabilityMatrixModal({ open, onClose, viewModel, defaultScope = "current_filters" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const scopeOptions = useMemo(() => {
    const onReport = defaultScope === "full_matrix";
    return onReport ? SCOPES.filter((s) => s.value !== "current_filters") : SCOPES;
  }, [defaultScope]);

  const [scope, setScope] = useState<TraceabilityExportScope>(defaultScope);
  const [format, setFormat] = useState<TraceabilityExportFormat>("csv");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeGapDetails, setIncludeGapDetails] = useState(true);
  const [includeEvidenceLinks, setIncludeEvidenceLinks] = useState(true);
  const [includeAuditReferences, setIncludeAuditReferences] = useState(false);

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
    setScope(defaultScope);
    setFormat("csv");
    setIncludeMetadata(true);
    setIncludeGapDetails(true);
    setIncludeEvidenceLinks(true);
    setIncludeAuditReferences(false);
  }, [open, defaultScope]);

  useEffect(() => {
    if (!scopeOptions.some((s) => s.value === scope)) {
      setScope(scopeOptions[0]?.value ?? "full_matrix");
    }
  }, [scopeOptions, scope]);

  function handleExport() {
    if (pending) return;
    setError(null);
    const options: TraceabilityExportOptions = {
      includeMetadata,
      includeGapDetails,
      includeEvidenceLinks,
      includeAuditReferences,
    };
    startTransition(async () => {
      try {
        await runTraceabilityExport(viewModel, scope, format, options);
        onClose();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-trace-matrix-title"
    >
      <div className="flex max-h-[88vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Traceability</p>
            <h2 id="export-trace-matrix-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Export matrix
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Project {viewModel.full.project.code} — choose scope, format, and optional metadata for downloads.
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Scope</p>
            <div className="mt-2 space-y-2">
              {scopeOptions.map((s) => (
                <label key={s.value} className="flex cursor-pointer gap-2 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-border dark:hover:bg-muted/40">
                  <input type="radio" name="export-scope" value={s.value} checked={scope === s.value} onChange={() => setScope(s.value)} />
                  <span>
                    <span className="font-medium text-slate-900 dark:text-foreground">{s.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{s.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Format</p>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as TraceabilityExportFormat)}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm dark:border-input dark:bg-input/30"
              aria-label="Export format"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{FORMATS.find((f) => f.value === format)?.hint}</p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Include</legend>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={includeMetadata} onChange={(e) => setIncludeMetadata(e.target.checked)} />
              <span>Metadata (project id, filter snapshot, export options)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={includeGapDetails} onChange={(e) => setIncludeGapDetails(e.target.checked)} />
              <span>Gap issue text (omit for minimal gap exports)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={includeEvidenceLinks} onChange={(e) => setIncludeEvidenceLinks(e.target.checked)} />
              <span>Evidence / navigation links (href fields)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={includeAuditReferences} onChange={(e) => setIncludeAuditReferences(e.target.checked)} />
              <span>Audit reference placeholder (reserved)</span>
            </label>
          </fieldset>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <footer className={cn("flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-border")}>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleExport} disabled={pending}>
            {pending ? "Preparing…" : "Export"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}