"use client";

import { Copy, Download, Maximize2, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import type { MarkdownPreviewData } from "@/types/template-wizard.types";

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
  testId,
}: {
  title: string;
  titleId: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
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
      <div className="min-h-0 flex-1 overflow-hidden px-5 py-4">{children}</div>
      {footer ? (
        <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-3">{footer}</div>
      ) : null}
    </div>
  );
}

function defaultMarkdownFilename(data: MarkdownPreviewData): string {
  const base = data.artifactTitle.trim() || "artifact";
  const slug = base
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${slug || "artifact"}.md`;
}

function triggerMarkdownDownload(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function MarkdownPreview({
  data,
  onRegenerate,
  artifactDisplayName,
}: {
  data: MarkdownPreviewData;
  onRegenerate?: () => void;
  /** Shown in the export confirmation modal (e.g. markdown artifact title). */
  artifactDisplayName?: string;
}) {
  const empty = data.markdown.trim().length === 0;
  const text = data.markdown;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const [exportFilename, setExportFilename] = useState("");
  const [includeMissingWarning, setIncludeMissingWarning] = useState(true);

  const previewDialogRef = useDialogRef(previewOpen);
  const exportDialogRef = useDialogRef(exportOpen);

  useEffect(() => {
    if (!exportOpen) return;
    setExportFilename(defaultMarkdownFilename(data));
  }, [exportOpen, data]);

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

  const runExport = useCallback(() => {
    const header =
      includeMissingWarning && data.hasMissingPlaceholders
        ? `<!-- WARNING: preview contains required placeholders — finalize before submitting -->\n\n`
        : "";
    const base = exportFilename.trim() || defaultMarkdownFilename(data);
    triggerMarkdownDownload(base, `${header}${text}`);
    setExportOpen(false);
  }, [data, exportFilename, includeMissingWarning, text]);

  const artifactName =
    artifactDisplayName?.trim() || data.artifactTitle.trim() || "Artifact";

  const wordCount = useMemo(() => {
    const stripped = text.replace(/```[\s\S]*?```/g, "").trim();
    if (!stripped) return 0;
    return stripped.split(/\s+/).length;
  }, [text]);

  return (
    <>
      <section
        className="flex min-h-0 flex-col rounded-2xl border bg-card shadow-sm"
        aria-label="Markdown preview"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Markdown Preview</h3>
            <p className="text-[11px] text-muted-foreground">Generated artifact output</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="markdown-open-preview"
              disabled={empty}
              onClick={() => setPreviewOpen(true)}
            >
              <Maximize2 className="size-3.5" aria-hidden />
              Open Markdown preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={!onRegenerate}
            >
              Regenerate
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-testid="markdown-copy"
              onClick={() => void copyText(text)}
              disabled={empty}
            >
              <Copy className="size-3.5" aria-hidden />
              Copy Markdown
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="markdown-download"
              onClick={() => setExportOpen(true)}
              disabled={empty}
            >
              <Download className="size-3.5" aria-hidden />
              Download Markdown
            </Button>
          </div>
        </div>

        <div className="max-h-[280px] min-h-[140px] overflow-auto p-4">
          {empty ? (
            <p className="text-sm text-muted-foreground">
              Complete at least one section to preview Markdown.
            </p>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground">
              {text}
            </pre>
          )}
        </div>

        {data.hasMissingPlaceholders ? (
          <p className="border-t px-4 py-2 text-xs text-[#d97706]" role="status">
            Preview contains required placeholders — finalize fields before export.
          </p>
        ) : null}
      </section>

      {copyToast ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="markdown-copy-toast"
          className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg border bg-card px-4 py-2 text-sm shadow-lg"
        >
          Markdown copied to clipboard
        </div>
      ) : null}

      <dialog
        ref={previewDialogRef}
        onClose={() => setPreviewOpen(false)}
        data-testid="markdown-preview-modal"
        className="fixed left-1/2 top-1/2 z-[110] w-[min(100vw-1.5rem,960px)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
        aria-labelledby="markdown-preview-modal-title"
      >
        <ModalChrome
          testId="markdown-preview"
          titleId="markdown-preview-modal-title"
          title="Markdown preview"
          onClose={() => setPreviewOpen(false)}
          footer={
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void copyText(text)}>
                <Copy className="size-3.5" aria-hidden />
                Copy Markdown
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setExportOpen(true)}>
                  <Download className="size-3.5" aria-hidden />
                  Download .md
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
                <p className="text-xs font-medium text-muted-foreground">Artifact</p>
                <p className="font-medium">{artifactName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Generated</p>
                <p className="font-medium">{data.generatedAtLabel}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Word count</p>
                <p className="font-medium tabular-nums">{wordCount.toLocaleString()}</p>
              </div>
              {data.hasMissingPlaceholders ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="font-medium text-[#b45309]">Contains placeholders</p>
                </div>
              ) : null}
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
        ref={exportDialogRef}
        onClose={() => setExportOpen(false)}
        data-testid="markdown-export-modal"
        className="fixed left-1/2 top-1/2 z-[115] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
        aria-labelledby="markdown-export-title"
      >
        <ModalChrome
          testId="markdown-export"
          titleId="markdown-export-title"
          title="Export Markdown"
          onClose={() => setExportOpen(false)}
          footer={
            <div className="flex w-full flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setExportOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                data-testid="markdown-export-confirm"
                onClick={runExport}
                disabled={empty}
              >
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
              <label htmlFor="markdown-export-filename" className="text-xs font-medium">
                File name
              </label>
              <input
                id="markdown-export-filename"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                autoComplete="off"
                data-testid="markdown-export-filename"
              />
            </div>
            {data.hasMissingPlaceholders ? (
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-input"
                  checked={includeMissingWarning}
                  onChange={(e) => setIncludeMissingWarning(e.target.checked)}
                  data-testid="markdown-export-include-placeholder-warning"
                />
                <span className="text-xs">
                  Prepend a placeholder warning comment to the exported file. Required placeholders
                  are present in this draft.
                </span>
              </label>
            ) : (
              <p className="text-xs text-muted-foreground">
                Preview has no unresolved placeholders.
              </p>
            )}
          </div>
        </ModalChrome>
      </dialog>
    </>
  );
}
