"use client";

import { useMemo, useState } from "react";

import type { ArtifactLibraryData, ArtifactTabKey } from "@/types/artifact-library.types";
import { cn } from "@/lib/utils";

const TABS: { key: ArtifactTabKey; label: string; count?: (a: ArtifactLibraryData["selectedArtifact"]) => number }[] = [
  { key: "markdown", label: "Markdown" },
  { key: "json_evidence", label: "JSON evidence" },
  {
    key: "version_history",
    label: "Versions",
    count: (a) => a.versionHistory.length,
  },
  {
    key: "activity_log",
    label: "Activity",
    count: (a) => a.activityLog.length,
  },
  {
    key: "comments",
    label: "Comments",
    count: (a) => a.comments.length,
  },
];

export function ArtifactContentTabs({ artifact }: { artifact: ArtifactLibraryData["selectedArtifact"] }) {
  const [tab, setTab] = useState<ArtifactTabKey>("markdown");

  const jsonPretty = useMemo(() => JSON.stringify(artifact.jsonEvidence, null, 2), [artifact.jsonEvidence]);

  return (
    <section className="cc-card-standard flex flex-col overflow-hidden p-0">
      <div
        role="tablist"
        aria-label="Artifact content"
        className="flex flex-wrap gap-1 border-b border-border bg-muted/30 px-2 py-2"
      >
        {TABS.map((t) => {
          const c = t.count?.(artifact);
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                active ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {c != null && c > 0 ? <span className="ml-1 tabular-nums text-muted-foreground">({c})</span> : null}
            </button>
          );
        })}
      </div>

      <div className="min-h-[280px] flex-1 overflow-auto p-4" role="tabpanel">
        {tab === "markdown" ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {artifact.markdownView.title} · generated {artifact.markdownView.generatedAtLabel}
              {artifact.markdownView.hasMissingPlaceholders ? " · placeholders may be incomplete" : ""}
            </p>
            <pre className="max-h-[min(60vh,560px)] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-4 font-mono text-[11px] leading-relaxed text-foreground">
              {artifact.markdownView.markdown}
            </pre>
          </div>
        ) : null}

        {tab === "json_evidence" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                Completion {artifact.jsonEvidence.validation.completionPercent}%
              </span>
              <span className={artifact.jsonEvidence.validation.exportReady ? "text-emerald-700" : "text-amber-700"}>
                {artifact.jsonEvidence.validation.exportReady ? "Export ready" : "Not export-ready"}
              </span>
            </div>
            {artifact.jsonEvidence.validation.issues.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {artifact.jsonEvidence.validation.issues.map((issue) => (
                  <li key={issue.id} className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-900">
                    <span className="font-semibold">{issue.severity}:</span> {issue.message}
                  </li>
                ))}
              </ul>
            ) : null}
            <pre className="max-h-[min(60vh,560px)] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-4 font-mono text-[11px] leading-relaxed">
              {jsonPretty}
            </pre>
          </div>
        ) : null}

        {tab === "version_history" ? (
          <ul className="space-y-2 text-sm">
            {artifact.versionHistory.map((v) => (
              <li key={v.id} className="rounded-lg border border-border px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">v{v.version}</span>
                  <span className="text-xs capitalize text-muted-foreground">{v.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{v.changeSummary}</p>
                <p className="text-[11px] text-muted-foreground">{v.createdOnLabel}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "activity_log" ? (
          <ul className="space-y-2 text-sm">
            {artifact.activityLog.map((row) => (
              <li key={row.id} className="rounded-lg border border-border px-3 py-2">
                <p className="font-medium text-foreground">{row.action}</p>
                <p className="text-xs text-muted-foreground">
                  {row.actor} · {row.timestampLabel}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "comments" ? (
          artifact.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {artifact.comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="text-xs font-semibold text-foreground">
                    {c.author} · {c.createdOnLabel}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{c.body}</p>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </section>
  );
}
