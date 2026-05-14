"use client";

import { Copy, Download, Maximize2, ShieldCheck, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import {
  buildJsonEvidenceExportObject,
  defaultJsonEvidenceFilename,
  runJsonEvidenceSchemaValidation,
  TEMPLATE_WIZARD_JSON_SCHEMA_NAME,
  type JsonEvidenceSchemaRun,
} from "@/lib/template-wizard-json-evidence";
import type { JsonEvidence } from "@/types/template-wizard.types";

function useDialogRef(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);
  return ref;
}

function ModalChrome({
  title,
  titleId,
  children,
  footer,
  onClose,
  wide,
  testId,
}: {
  title: string;
  titleId: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
  testId: string;
}) {
  return (
    <div className="flex max-h-[min(92vh,880px)] flex-col">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <h2 id={titleId} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close"
          data-testid={`${testId}-close`}
          onClick={onClose}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className={`min-h-0 flex-1 overflow-hidden px-5 py-4 ${wide ? "" : "max-w-full"}`}>
        {children}
      </div>
      {footer ? (
        <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-3">{footer}</div>
      ) : null}
    </div>
  );
}

function triggerJsonDownload(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ValidationResultBody({ run }: { run: JsonEvidenceSchemaRun }) {
  const RowList = ({ title, rows }: { title: string; rows: { path: string; message: string }[] }) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">None.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((r, i) => (
            <li key={`${r.path}-${i}`} className="rounded-lg border bg-muted/20 px-3 py-2">
              <p className="font-mono text-xs text-primary">{r.path}</p>
              <p className="mt-1 text-foreground">{r.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            run.pass ? "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300" : "bg-destructive/15 text-destructive"
          }`}
        >
          {run.pass ? "Pass" : "Fail"}
        </span>
        {!run.parseOk ? (
          <span className="text-sm text-destructive">JSON parse error: {run.parseError}</span>
        ) : !run.shapeOk ? (
          <span className="text-sm text-muted-foreground">Shape validation failed.</span>
        ) : run.issueErrors.length > 0 ? (
          <span className="text-sm text-muted-foreground">Wizard validation reports blocking errors.</span>
        ) : (
          <span className="text-sm text-muted-foreground">Structure valid; no blocking issues.</span>
        )}
      </div>
      <RowList title="Shape / parse" rows={run.shapeErrors} />
      <RowList title="Errors (wizard)" rows={run.issueErrors} />
      <RowList title="Warnings (wizard)" rows={run.issueWarnings} />
    </div>
  );
}

export function JsonEvidencePreview({
  data,
  artifactDisplayName,
}: {
  data: JsonEvidence;
  /** Shown in export confirmation (e.g. markdown artifact title). */
  artifactDisplayName?: string;
}) {
  const text = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const [exportFilename, setExportFilename] = useState("");
  const [includeValidationSummary, setIncludeValidationSummary] = useState(true);
  const [includeEvidenceLinks, setIncludeEvidenceLinks] = useState(true);

  const [validationRun, setValidationRun] = useState<JsonEvidenceSchemaRun | null>(null);

  const previewDialogRef = useDialogRef(previewOpen);
  const validationDialogRef = useDialogRef(validationOpen);
  const exportDialogRef = useDialogRef(exportOpen);

  useEffect(() => {
    if (!exportOpen) return;
    setExportFilename(defaultJsonEvidenceFilename(data));
  }, [exportOpen, data]);

  const validationStatusLabel = useMemo(() => {
    if (!data.validation.exportReady) return "Not export-ready";
    const err = data.validation.issues.filter((i) => i.severity === "error").length;
    const warn = data.validation.issues.filter((i) => i.severity === "warning").length;
    if (err > 0) return `${err} error${err === 1 ? "" : "s"} · ${warn} warning${warn === 1 ? "" : "s"}`;
    if (warn > 0) return `Valid JSON · ${warn} warning${warn === 1 ? "" : "s"}`;
    return "Valid · export-ready";
  }, [data.validation.exportReady, data.validation.issues]);

  const flashCopyToast = useCallback(() => {
    setCopyToast(true);
    window.setTimeout(() => setCopyToast(false), 2200);
  }, []);

  const copyText = useCallback(
    async (payload: string) => {
      try {
        await navigator.clipboard.writeText(payload);
        flashCopyToast();
      } catch {
        flashCopyToast();
      }
    },
    [flashCopyToast],
  );

  const openSchemaValidation = useCallback(() => {
    setValidationRun(runJsonEvidenceSchemaValidation(data, text));
    setValidationOpen(true);
  }, [data, text]);

  const runExport = useCallback(() => {
    const obj = buildJsonEvidenceExportObject(data, {
      includeValidationSummary,
      includeEvidenceLinks,
    });
    const out = JSON.stringify(obj, null, 2);
    const base = exportFilename.trim() || defaultJsonEvidenceFilename(data);
    triggerJsonDownload(base, out);
    setExportOpen(false);
  }, [data, exportFilename, includeEvidenceLinks, includeValidationSummary]);

  const artifactName =
    artifactDisplayName?.trim() ||
    `${data.templateCode} ${data.templateId}`.trim();

  return (
    <>
      <section
        className="flex min-h-0 flex-col rounded-2xl border bg-card shadow-sm"
        aria-label="JSON evidence preview"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">JSON Evidence Preview</h3>
            <p className="text-[11px] text-muted-foreground">Structured evidence package</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="json-evidence-open-preview"
              onClick={() => setPreviewOpen(true)}
            >
              <Maximize2 className="size-3.5" aria-hidden />
              Open JSON preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="json-evidence-validate-schema"
              onClick={openSchemaValidation}
            >
              <ShieldCheck className="size-3.5" aria-hidden />
              Validate JSON schema
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-testid="json-evidence-copy"
              onClick={() => void copyText(text)}
            >
              <Copy className="size-3.5" aria-hidden />
              Copy JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="json-evidence-download"
              onClick={() => setExportOpen(true)}
            >
              <Download className="size-3.5" aria-hidden />
              Download JSON
            </Button>
          </div>
        </div>

        <div className="max-h-[280px] min-h-[140px] overflow-auto p-4">
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground">
            {text}
          </pre>
        </div>
      </section>

      {copyToast ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="json-evidence-copy-toast"
          className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg border bg-card px-4 py-2 text-sm shadow-lg"
        >
          JSON copied to clipboard
        </div>
      ) : null}

      <dialog
        ref={previewDialogRef}
        onClose={() => setPreviewOpen(false)}
        data-testid="json-evidence-preview-modal"
        className="fixed left-1/2 top-1/2 z-[110] w-[min(100vw-1.5rem,960px)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
        aria-labelledby="json-evidence-preview-modal-title"
      >
        <ModalChrome
          testId="json-preview"
          titleId="json-evidence-preview-modal-title"
          title="JSON evidence"
          onClose={() => setPreviewOpen(false)}
          wide
          footer={
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void copyText(text)}>
                <Copy className="size-3.5" aria-hidden />
                Copy JSON
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setExportOpen(true)}>
                  <Download className="size-3.5" aria-hidden />
                  Download .json
                </Button>
                <Button type="button" size="sm" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="flex h-[min(72vh,620px)] flex-col gap-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Schema version</p>
                <p className="font-medium">{data.templateVersion}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Validation status</p>
                <p className="font-medium">{validationStatusLabel}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Template</p>
                <p className="font-medium">
                  {data.templateCode} · {data.templateId}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border bg-muted/15 p-3">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                {text}
              </pre>
            </div>
          </div>
        </ModalChrome>
      </dialog>

      <dialog
        ref={validationDialogRef}
        onClose={() => setValidationOpen(false)}
        data-testid="json-schema-validation-modal"
        className="fixed left-1/2 top-1/2 z-[115] w-[min(100vw-2rem,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
        aria-labelledby="json-schema-validation-title"
      >
        <ModalChrome
          testId="json-schema"
          titleId="json-schema-validation-title"
          title="JSON schema validation"
          onClose={() => setValidationOpen(false)}
          footer={
            <Button type="button" size="sm" onClick={() => setValidationOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Schema name</p>
                <p className="font-medium leading-snug">{TEMPLATE_WIZARD_JSON_SCHEMA_NAME}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Schema version</p>
                <p className="font-medium">{data.templateVersion}</p>
              </div>
            </div>
            {validationRun ? <ValidationResultBody run={validationRun} /> : (
              <p className="text-muted-foreground">Run validation from the toolbar.</p>
            )}
          </div>
        </ModalChrome>
      </dialog>

      <dialog
        ref={exportDialogRef}
        onClose={() => setExportOpen(false)}
        data-testid="json-evidence-export-modal"
        className="fixed left-1/2 top-1/2 z-[115] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
        aria-labelledby="json-evidence-export-title"
      >
        <ModalChrome
          testId="json-export"
          titleId="json-evidence-export-title"
          title="Export JSON evidence"
          onClose={() => setExportOpen(false)}
          footer={
            <div className="flex w-full flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setExportOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" data-testid="json-evidence-export-confirm" onClick={runExport}>
                Export
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Artifact name</p>
              <p className="font-medium">{artifactName}</p>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="json-export-filename" className="text-xs font-medium">
                File name
              </label>
              <input
                id="json-export-filename"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                autoComplete="off"
                data-testid="json-evidence-export-filename"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={includeValidationSummary}
                onChange={(e) => setIncludeValidationSummary(e.target.checked)}
                data-testid="json-export-include-validation"
              />
              Include validation summary
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={includeEvidenceLinks}
                onChange={(e) => setIncludeEvidenceLinks(e.target.checked)}
                data-testid="json-export-include-evidence-links"
              />
              Include evidence links
            </label>
          </div>
        </ModalChrome>
      </dialog>
    </>
  );
}
