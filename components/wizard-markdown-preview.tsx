"use client";

import Link from "next/link";
import { Copy, Download, ExternalLink, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { extractMarkdownOutline, type MarkdownOutlineItem } from "@/lib/markdown-outline";
import {
  buildWizardExportMarkdown,
  defaultArtifactBasename,
} from "@/lib/wizard-markdown-export";
import type { AnyLifecycleTemplate } from "@/templates/types";

export type SavedArtifactMeta = {
  dbId: string;
  localId: string;
  version: number;
};

function triggerDownload(filename: string, text: string) {
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
      <div
        className={`min-h-0 flex-1 overflow-hidden px-5 py-4 ${wide ? "" : "max-w-full"}`}
      >
        {children}
      </div>
      {footer ? (
        <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-3">{footer}</div>
      ) : null}
    </div>
  );
}

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

const mdProseClass =
  "wizard-md max-w-none text-sm leading-relaxed text-foreground " +
  "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:scroll-mt-24 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:first:mt-0 " +
  "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:scroll-mt-24 [&_h2]:border-b [&_h2]:pb-1 [&_h2]:text-xl [&_h2]:font-semibold " +
  "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:scroll-mt-24 [&_h3]:text-base [&_h3]:font-semibold " +
  "[&_h4]:mt-3 [&_h4]:text-sm [&_h4]:font-semibold " +
  "[&_p]:my-2 [&_li]:my-0.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_hr]:my-6 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs " +
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/40 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs " +
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:px-2 [&_td]:py-1 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground";

type WizardMarkdownPreviewProps = {
  template: AnyLifecycleTemplate;
  mergedData: Record<string, unknown>;
  bodyMarkdown: string;
  projectId?: string;
  savedArtifactMeta: SavedArtifactMeta | null;
};

export function WizardMarkdownPreview({
  template,
  mergedData,
  bodyMarkdown,
  projectId,
  savedArtifactMeta,
}: WizardMarkdownPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const [exportFilename, setExportFilename] = useState("");
  const [includeMeta, setIncludeMeta] = useState(true);
  const [includeValidation, setIncludeValidation] = useState(true);

  const outline = useMemo(() => extractMarkdownOutline(bodyMarkdown), [bodyMarkdown]);

  const artifactIdForMeta = savedArtifactMeta
    ? `${template.templateId}-${savedArtifactMeta.localId}-v${savedArtifactMeta.version}`
    : `PREVIEW-${template.templateId}`;

  const headingSeq = useRef(0);
  if (previewOpen) headingSeq.current = 0;

  const markdownComponents = useMemo(() => {
    function makeHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
      function MdHeading({
        children,
        className,
        ...rest
      }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
        const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        const idx = headingSeq.current;
        const item: MarkdownOutlineItem | undefined = outline[idx];
        headingSeq.current += 1;
        const id = item?.id ?? `heading-${idx}`;
        return (
          <Tag id={id} className={className} {...rest}>
            {children}
          </Tag>
        );
      }
      MdHeading.displayName = `MarkdownHeadingH${level}`;
      return MdHeading;
    }
    return {
      h1: makeHeading(1),
      h2: makeHeading(2),
      h3: makeHeading(3),
      h4: makeHeading(4),
      h5: makeHeading(5),
      h6: makeHeading(6),
    };
  }, [outline]);

  const previewDialogRef = useDialogRef(previewOpen);
  const exportDialogRef = useDialogRef(exportOpen);

  useEffect(() => {
    if (!exportOpen) return;
    setExportFilename(defaultArtifactBasename(template, mergedData));
  }, [exportOpen, template, mergedData]);

  const copyBody = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bodyMarkdown);
      setCopyToast(true);
      window.setTimeout(() => setCopyToast(false), 2200);
    } catch {
      setCopyToast(true);
      window.setTimeout(() => setCopyToast(false), 2200);
    }
  }, [bodyMarkdown]);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const runExport = useCallback(() => {
    const doc = buildWizardExportMarkdown({
      template,
      data: mergedData,
      bodyMarkdown,
      includeMetadata: includeMeta,
      includeValidationSummary: includeValidation,
      artifactIdForMeta,
      version: savedArtifactMeta?.version ?? 1,
    });
    const base = exportFilename.trim() || defaultArtifactBasename(template, mergedData);
    triggerDownload(base, doc);
    setExportOpen(false);
  }, [
    artifactIdForMeta,
    bodyMarkdown,
    exportFilename,
    includeMeta,
    includeValidation,
    mergedData,
    savedArtifactMeta?.version,
    template,
  ]);

  const viewerHref =
    projectId && savedArtifactMeta
      ? `/projects/${projectId}/artifacts/${savedArtifactMeta.dbId}`
      : null;

  return (
    <>
      <div className="rounded-2xl border bg-muted/30 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Markdown preview</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Live preview from current values (empty fields show as not provided).
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="xs"
              data-testid="wizard-open-markdown-preview"
              onClick={() => setPreviewOpen(true)}
            >
              <Maximize2 className="size-3.5" aria-hidden />
              Open preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              data-testid="wizard-copy-markdown"
              onClick={() => void copyBody()}
            >
              <Copy className="size-3.5" aria-hidden />
              Copy
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              data-testid="wizard-download-markdown"
              onClick={() => setExportOpen(true)}
            >
              <Download className="size-3.5" aria-hidden />
              Download
            </Button>
            {viewerHref ? (
              <Link
                href={viewerHref}
                className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
                data-testid="wizard-open-artifact-viewer"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Artifact viewer
              </Link>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled
                title={
                  projectId
                    ? "Save the artifact once to open it in the library."
                    : "Save under a project to open in the artifact viewer."
                }
                data-testid="wizard-open-artifact-viewer-disabled"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Artifact viewer
              </Button>
            )}
          </div>
        </div>
        <pre className="mt-3 max-h-[min(40vh,320px)] overflow-auto rounded-xl border bg-background p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap lg:max-h-[min(70vh,560px)]">
          {bodyMarkdown}
        </pre>
      </div>

      {copyToast ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="wizard-markdown-copy-toast"
          className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg border bg-card px-4 py-2 text-sm shadow-lg"
        >
          Markdown copied to clipboard
        </div>
      ) : null}

      <dialog
        ref={previewDialogRef}
        onClose={() => setPreviewOpen(false)}
        data-testid="wizard-markdown-preview-modal"
        className="fixed left-1/2 top-1/2 z-[110] w-[min(100vw-1.5rem,1120px)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
        aria-labelledby="wizard-markdown-preview-modal-title"
      >
        <ModalChrome
          testId="wizard-md-preview"
          titleId="wizard-markdown-preview-modal-title"
          title={template.title}
          onClose={() => setPreviewOpen(false)}
          wide
          footer={
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void copyBody()}>
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
          <div className="flex h-[min(72vh,640px)] gap-4">
            <nav
              aria-label="Section outline"
              className="hidden w-52 shrink-0 flex-col gap-1 overflow-y-auto border-r pr-3 md:flex"
            >
              <p className="text-xs font-medium text-muted-foreground">Outline</p>
              {outline.length === 0 ? (
                <p className="text-xs text-muted-foreground">No headings found.</p>
              ) : (
                outline.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`wizard-md-outline-${item.id}`}
                    className="truncate rounded-md px-2 py-1 text-left text-xs hover:bg-muted"
                    style={{ paddingLeft: `${6 + (item.level - 1) * 10}px` }}
                    onClick={() => scrollToId(item.id)}
                  >
                    {item.text}
                  </button>
                ))
              )}
            </nav>
            <div
              className={`min-h-0 min-w-0 flex-1 overflow-y-auto rounded-xl border bg-background p-4 ${mdProseClass}`}
            >
              {previewOpen ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {bodyMarkdown}
                </ReactMarkdown>
              ) : null}
            </div>
          </div>
        </ModalChrome>
      </dialog>

      <dialog
        ref={exportDialogRef}
        onClose={() => setExportOpen(false)}
        data-testid="wizard-export-markdown-modal"
        className="fixed left-1/2 top-1/2 z-[115] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
        aria-labelledby="wizard-export-markdown-title"
      >
        <ModalChrome
          testId="wizard-export"
          titleId="wizard-export-markdown-title"
          title="Export Markdown"
          onClose={() => setExportOpen(false)}
          footer={
            <div className="flex w-full flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setExportOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" data-testid="wizard-export-markdown-confirm" onClick={runExport}>
                Export
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Artifact</p>
              <p className="font-medium">{template.title}</p>
              <p className="text-xs text-muted-foreground">{template.templateId}</p>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="export-md-filename" className="text-xs font-medium">
                File name
              </label>
              <input
                id="export-md-filename"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                autoComplete="off"
                data-testid="wizard-export-filename"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={includeMeta}
                onChange={(e) => setIncludeMeta(e.target.checked)}
                data-testid="wizard-export-include-metadata"
              />
              Include metadata header (Appendix A block)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={includeValidation}
                onChange={(e) => setIncludeValidation(e.target.checked)}
                data-testid="wizard-export-include-validation"
              />
              Include validation summary
            </label>
          </div>
        </ModalChrome>
      </dialog>
    </>
  );
}
