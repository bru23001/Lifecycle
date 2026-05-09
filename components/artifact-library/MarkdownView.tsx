"use client";

import { Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copyToClipboard, downloadTextFile } from "@/lib/artifact-export";
import { markdownToPreview } from "@/lib/markdown-renderer";
import type { MarkdownArtifactView } from "@/types/artifact-library.types";

export function MarkdownView({ view }: { view: MarkdownArtifactView }) {
  const lines = markdownToPreview(view.markdown);

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-[#111827] dark:text-foreground">Markdown View</h3>
          <p className="text-xs text-[#64748b] dark:text-muted-foreground">{view.generatedAtLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              downloadTextFile(
                `${view.title.replaceAll(" ", "_")}.md`,
                view.markdown,
                "text/markdown;charset=utf-8",
              )
            }
          >
            <Download className="size-3.5" />
            Download .md
          </Button>
          <Button type="button" variant="outline" size="xs" onClick={() => copyToClipboard(view.markdown)}>
            <Copy className="size-3.5" />
            Copy
          </Button>
        </div>
      </header>

      {view.hasMissingPlaceholders ? (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Some placeholders are missing values in this generated document.
        </div>
      ) : null}

      <article className="rounded-xl border border-[#e5e7eb] bg-[#fcfdff] p-4 dark:border-border dark:bg-background">
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-[#0f172a] dark:text-slate-200">
          {lines.join("\n")}
        </pre>
      </article>
    </section>
  );
}
