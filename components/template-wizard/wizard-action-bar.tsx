"use client";

import { Button } from "@/components/ui/button";

export function WizardActionBar({
  autosaveLabel,
  onSaveDraft,
  onExportMarkdown,
  onExportJson,
  onExportPackage,
  onCancel,
  onSaveArtifact,
  onMarkComplete,
  showSubmitGateReview,
  onSubmitGateReview,
  saveArtifactDisabledReason,
  markCompleteDisabledReason,
}: {
  autosaveLabel?: string | null;
  onSaveDraft: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onExportPackage: () => void;
  onCancel: () => void;
  onSaveArtifact: () => void;
  onMarkComplete: () => void;
  showSubmitGateReview?: boolean;
  onSubmitGateReview: () => void;
  saveArtifactDisabledReason?: string | null;
  markCompleteDisabledReason?: string | null;
}) {
  return (
    <footer className="wizard-action-bar shrink-0">
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
        <Button type="button" variant="outline" size="sm" onClick={onExportPackage} data-testid="wizard-export-package">
          Export package (.zip)
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
          <Button type="button" variant="default" size="sm" onClick={onMarkComplete} data-testid="wizard-mark-complete">
            Mark Complete
          </Button>
          {markCompleteDisabledReason ? (
            <span className="pointer-events-none absolute -top-8 right-0 hidden max-w-xs rounded border bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow group-hover:block">
              {markCompleteDisabledReason}
            </span>
          ) : null}
        </span>
        {showSubmitGateReview ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onSubmitGateReview}
            data-testid="wizard-submit-gate-review"
          >
            Submit for gate review
          </Button>
        ) : null}
      </div>
    </footer>
  );
}
