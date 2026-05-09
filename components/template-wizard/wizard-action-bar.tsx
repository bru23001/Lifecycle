"use client";

import { Button } from "@/components/ui/button";

export function WizardActionBar({
  autosaveLabel,
  onSaveDraft,
  onExportMarkdown,
  onExportJson,
  onCancel,
  onSaveArtifact,
  onMarkComplete,
  saveArtifactDisabledReason,
  markCompleteDisabledReason,
}: {
  autosaveLabel?: string | null;
  onSaveDraft: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onCancel: () => void;
  onSaveArtifact: () => void;
  onMarkComplete: () => void;
  saveArtifactDisabledReason?: string | null;
  markCompleteDisabledReason?: string | null;
}) {
  return (
    <footer className="wizard-action-bar">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {autosaveLabel ? (
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {autosaveLabel}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground">Draft not saved yet</span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onSaveDraft}>
          Save Draft <span className="hidden sm:inline">(Ctrl+S)</span>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onExportMarkdown}>
          Export Markdown (.md)
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onExportJson}>
          Export JSON Evidence (.json)
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <span className="group relative">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onSaveArtifact}
            disabled={Boolean(saveArtifactDisabledReason)}
          >
            Save Artifact <span className="hidden sm:inline">(Ctrl+Enter)</span>
          </Button>
          {saveArtifactDisabledReason ? (
            <span className="pointer-events-none absolute -top-8 right-0 hidden max-w-xs rounded border bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow group-hover:block">
              {saveArtifactDisabledReason}
            </span>
          ) : null}
        </span>
        <span className="group relative">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onMarkComplete}
            disabled={Boolean(markCompleteDisabledReason)}
          >
            Mark Complete
          </Button>
          {markCompleteDisabledReason ? (
            <span className="pointer-events-none absolute -top-8 right-0 hidden max-w-xs rounded border bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow group-hover:block">
              {markCompleteDisabledReason}
            </span>
          ) : null}
        </span>
      </div>
    </footer>
  );
}
