"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import type { MarkdownPreviewData } from "@/types/template-wizard.types";

export function MarkdownPreview({
  data,
  onRegenerate,
}: {
  data: MarkdownPreviewData;
  onRegenerate?: () => void;
}) {
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(data.markdown);
  }, [data.markdown]);

  const empty = data.markdown.trim().length === 0;

  return (
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
            onClick={onRegenerate}
            disabled={!onRegenerate}
          >
            Regenerate
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={copy} disabled={empty}>
            Copy Markdown
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
            {data.markdown}
          </pre>
        )}
      </div>

      {data.hasMissingPlaceholders ? (
        <p className="border-t px-4 py-2 text-xs text-[#d97706]" role="status">
          Preview contains required placeholders — finalize fields before export.
        </p>
      ) : null}
    </section>
  );
}
