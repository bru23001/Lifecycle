"use client";

import { Download, GitCompare, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { compareVersionLabels } from "@/lib/artifact-versioning";
import type { ArtifactVersion } from "@/types/artifact-library.types";

export function VersionHistory({
  currentVersion,
  versions,
  embedded = false,
}: {
  currentVersion: string;
  versions: ArtifactVersion[];
  embedded?: boolean;
}) {
  const list = (
    <>
      {versions.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-muted-foreground">No prior versions recorded.</p>
      ) : (
        <ul className="space-y-2">
          {versions.map((version) => (
            <li key={version.id} className="rounded-xl border border-slate-200 p-3 dark:border-border">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{version.version}</p>
                <p className="text-xs text-slate-500 dark:text-muted-foreground">{version.createdOnLabel}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-muted-foreground">{version.createdBy}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground">{version.changeSummary}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Button type="button" variant="ghost" size="xs">
                  {compareVersionLabels(currentVersion, version.version)}
                </Button>
                <Button type="button" variant="ghost" size="xs" aria-label={`Download markdown snapshot ${version.version}`}>
                  <Download className="size-3.5" />
                  Markdown
                </Button>
                <Button type="button" variant="ghost" size="xs" aria-label={`Download JSON snapshot ${version.version}`}>
                  <Download className="size-3.5" />
                  JSON
                </Button>
                <Button type="button" variant="ghost" size="xs" disabled={!version.canRestore}>
                  <RotateCcw className="size-3.5" />
                  Restore
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap justify-end gap-3 sm:gap-4">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:h-12 sm:gap-3 sm:px-5 sm:text-base dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/50"
          >
            <GitCompare className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            Compare Versions
          </button>
        </div>
        {list}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-[#111827] dark:text-foreground">Version History</h3>
        <Button type="button" variant="outline" size="xs">
          <GitCompare className="size-3.5" />
          Compare Versions
        </Button>
      </header>
      {list}
    </section>
  );
}
