"use client";

import type { ReactNode } from "react";
import { Copy, Download } from "lucide-react";

import { copyToClipboard, downloadTextFile } from "@/lib/artifact-export";
import { parseArtifactMarkdownBody, type ParsedMarkdownSection } from "@/lib/parse-artifact-markdown-body";
import { cn } from "@/lib/utils";
import type { ArtifactDetail, MarkdownArtifactView } from "@/types/artifact-library.types";

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:h-12 sm:gap-3 sm:px-5 sm:text-base dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/50"
    >
      {icon}
      {label}
    </button>
  );
}

function CriteriaTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const weightCol = headers.findIndex((h) => /weight/i.test(h));

  return (
    <div className="mt-6 overflow-x-auto sm:mt-7">
      <table className="w-full max-w-[1050px] min-w-[640px] border-collapse overflow-hidden rounded-lg border border-slate-200 text-left dark:border-border sm:min-w-[760px]">
        <thead>
          <tr className="bg-slate-50 text-sm font-semibold text-slate-900 dark:bg-muted/40 dark:text-foreground sm:text-base">
            {headers.map((h, hi) => (
              <th key={hi} className="border border-slate-200 px-3 py-3 dark:border-border sm:px-5 sm:py-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="text-sm text-slate-700 dark:text-muted-foreground sm:text-base">
              {row.map((cell, ci) => {
                const isWeight = weightCol === ci && /^\d+(\.\d+)?$/.test(cell.trim());
                const display = isWeight ? `${cell.trim()}%` : cell;
                return (
                  <td
                    key={ci}
                    className={cn(
                      "border border-slate-200 px-3 py-3 dark:border-border sm:px-5 sm:py-4",
                      ci === 0 && "font-medium text-slate-800 dark:text-foreground",
                      ci === 1 && "font-semibold text-slate-800 dark:text-foreground",
                    )}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownSections({ sections }: { sections: ParsedMarkdownSection[] }) {
  return (
    <>
      {sections.map((section, i) => (
        <section key={`${section.title}-${i}`} className={cn(i > 0 && "mt-10 sm:mt-12")}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-foreground sm:text-2xl">{section.title}</h2>

          {section.type === "prose" ? (
            <p className="mt-5 max-w-[980px] text-base leading-7 text-slate-700 dark:text-muted-foreground sm:mt-7 sm:text-lg sm:leading-8">
              {section.body}
            </p>
          ) : null}

          {section.type === "table" ? <CriteriaTable headers={section.headers} rows={section.rows} /> : null}

          {section.type === "list" ? (
            <ul className="mt-5 list-disc space-y-3 pl-6 text-base font-medium text-slate-800 dark:text-foreground sm:mt-7 sm:space-y-4 sm:pl-8 sm:text-lg">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </>
  );
}

export function MarkdownView({
  view,
  detail,
}: {
  view: MarkdownArtifactView;
  detail: ArtifactDetail;
}) {
  const sections = parseArtifactMarkdownBody(view.markdown);
  const phaseLine = `Phase ${detail.phaseNumber}: ${detail.phaseName}`;
  const projectLine = `${detail.projectName} (${detail.projectId.toUpperCase()})`;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-muted-foreground">{view.generatedAtLabel}</p>
        <div className="flex flex-wrap justify-end gap-3 sm:gap-4">
          <ActionButton
            icon={<Download className="h-4 w-4 stroke-[2.2] sm:h-5 sm:w-5" aria-hidden />}
            label="Download .md"
            onClick={() =>
              downloadTextFile(
                `${view.title.replaceAll(" ", "_")}.md`,
                view.markdown,
                "text/markdown;charset=utf-8",
              )
            }
          />
          <ActionButton
            icon={<Copy className="h-4 w-4 stroke-[2.2] sm:h-5 sm:w-5" aria-hidden />}
            label="Copy"
            onClick={() => copyToClipboard(view.markdown)}
          />
        </div>
      </div>

      {view.hasMissingPlaceholders ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Some placeholders are missing values in this generated document.
        </div>
      ) : null}

      <div className="max-w-[1200px]">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-foreground sm:text-4xl">
            {view.title}
          </h1>

          <p className="mt-6 text-lg font-semibold text-slate-900 dark:text-foreground sm:mt-8 sm:text-xl">
            {phaseLine}
          </p>

          <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-foreground sm:mt-5 sm:text-xl">
            {projectLine}
          </p>
        </header>

        <hr className="my-8 border-slate-300 dark:border-border sm:my-10" />

        <MarkdownSections sections={sections} />
      </div>
    </div>
  );
}
