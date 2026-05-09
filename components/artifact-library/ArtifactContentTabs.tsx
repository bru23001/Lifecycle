"use client";

import { useState } from "react";

import type { ArtifactTab, ArtifactTabKey, ArtifactLibraryData } from "@/types/artifact-library.types";

import { ActivityLog } from "./ActivityLog";
import { CommentsPanel } from "./CommentsPanel";
import { JsonEvidenceView } from "./JsonEvidenceView";
import { MarkdownView } from "./MarkdownView";
import { VersionHistory } from "./VersionHistory";

const tabs: ArtifactTab[] = [
  { key: "markdown", label: "Markdown View" },
  { key: "json_evidence", label: "JSON Evidence View" },
  { key: "version_history", label: "Version History" },
  { key: "activity_log", label: "Activity Log" },
  { key: "comments", label: "Comments" },
];

export function ArtifactContentTabs({
  artifact,
}: {
  artifact: ArtifactLibraryData["selectedArtifact"];
}) {
  const [activeTab, setActiveTab] = useState<ArtifactTabKey>("markdown");
  const commentsCount = artifact.comments.length;
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <div role="tablist" aria-label="Artifact content tabs" className="flex flex-wrap gap-1 border-b border-[#e5e7eb] pb-3 dark:border-border">
        {tabs.map((tab, index) => {
          const selected = tab.key === activeTab;
          const count = tab.key === "comments" ? commentsCount : tab.count;
          return (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? "bg-[#eff6ff] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-200"
                  : "text-[#64748b] hover:bg-slate-100 dark:text-muted-foreground dark:hover:bg-muted"
              }`}
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
              {count ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="min-h-[280px]"
        >
          {activeTab === "markdown" && <MarkdownView view={artifact.markdownView} />}
          {activeTab === "json_evidence" && <JsonEvidenceView evidence={artifact.jsonEvidence} />}
          {activeTab === "version_history" && (
            <VersionHistory currentVersion={artifact.detail.version} versions={artifact.versionHistory} />
          )}
          {activeTab === "activity_log" && <ActivityLog items={artifact.activityLog} />}
          {activeTab === "comments" && <CommentsPanel comments={artifact.comments} />}
        </div>
      </div>
    </section>
  );
}
