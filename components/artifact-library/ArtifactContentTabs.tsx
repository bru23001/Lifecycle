"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { ArtifactLibraryData, ArtifactTabKey } from "@/types/artifact-library.types";

import { JsonEvidenceView } from "./JsonEvidenceView";
import { MarkdownView } from "./MarkdownView";
import { VersionHistory } from "./VersionHistory";

const TAB_ORDER: ArtifactTabKey[] = [
  "markdown",
  "json_evidence",
  "version_history",
  "activity_log",
  "comments",
];

function tabLabel(key: ArtifactTabKey, artifact: ArtifactLibraryData["selectedArtifact"]): string {
  switch (key) {
    case "markdown":
      return "Markdown View";
    case "json_evidence":
      return "JSON Evidence View";
    case "version_history":
      return "Version History";
    case "activity_log":
      return "Activity Log";
    case "comments":
      return `Comments (${artifact.comments.length})`;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export function ArtifactContentTabs({
  artifact,
}: {
  artifact: ArtifactLibraryData["selectedArtifact"];
}) {
  const [activeTab, setActiveTab] = useState<ArtifactTabKey>("markdown");

  const tabs = useMemo(
    () => TAB_ORDER.map((key) => ({ key, label: tabLabel(key, artifact) })),
    [artifact],
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      <nav
        role="tablist"
        aria-label="Artifact content tabs"
        className="flex overflow-x-auto border-b border-slate-200 px-4 dark:border-border sm:px-6"
      >
        {tabs.map((tab, index) => {
          const selected = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "relative h-14 shrink-0 px-4 text-sm font-semibold sm:h-16 sm:px-5 sm:text-base",
                selected
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-700 hover:text-slate-950 dark:text-muted-foreground dark:hover:text-foreground",
              )}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const delta = e.key === "ArrowRight" ? 1 : -1;
                const next = (index + delta + tabs.length) % tabs.length;
                setActiveTab(tabs[next].key);
              }}
            >
              {tab.label}
              {selected ? (
                <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-blue-600 dark:bg-blue-400 sm:inset-x-4" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <article className="p-6 sm:p-10">
          {activeTab === "markdown" && (
            <MarkdownView view={artifact.markdownView} detail={artifact.detail} />
          )}
          {activeTab === "json_evidence" && <JsonEvidenceView evidence={artifact.jsonEvidence} embedded />}
          {activeTab === "version_history" && (
            <VersionHistory
              currentVersion={artifact.detail.version}
              versions={artifact.versionHistory}
              embedded
            />
          )}
          {activeTab === "activity_log" && (
            <ul className="space-y-4">
              {artifact.activityLog.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-border dark:bg-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{item.actor}</p>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">{item.timestampLabel}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-muted-foreground">
                    {item.action}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {activeTab === "comments" && (
            <ul className="space-y-4">
              {artifact.comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-border dark:bg-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{c.author}</p>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">{c.createdOnLabel}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-muted-foreground">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
