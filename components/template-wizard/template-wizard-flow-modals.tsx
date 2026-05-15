"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import type { ArtifactPackageOptions } from "@/lib/template-wizard-export-package";
import type { ValidationIssue, ValidationSummary } from "@/types/template-wizard.types";

export function useWizardDialog(open: boolean) {
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

function DialogFrame({
  titleId,
  title,
  onClose,
  children,
  footer,
  testId,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  testId: string;
}) {
  return (
    <div className="flex max-h-[min(88vh,720px)] flex-col">
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
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer ? <div className="border-t px-5 py-3">{footer}</div> : null}
    </div>
  );
}

export function AutosaveFailureModal({
  open,
  onClose,
  errorMessage,
  lastSavedAt,
  onRetry,
  onDownloadLocalDraft,
}: {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
  lastSavedAt: Date | null;
  onRetry: () => void;
  onDownloadLocalDraft: () => void;
}) {
  const ref = useWizardDialog(open);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-autosave-failure-modal"
      className="fixed left-1/2 top-1/2 z-[130] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="autosave-failure-title"
    >
      <DialogFrame
        titleId="autosave-failure-title"
        title="Autosave failed"
        onClose={onClose}
        testId="autosave-failure"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadLocalDraft}
              data-testid="autosave-download-draft"
            >
              Download local draft
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onRetry} data-testid="autosave-retry">
              Retry save
            </Button>
            <Button type="button" size="sm" onClick={onClose} data-testid="autosave-continue">
              Continue editing
            </Button>
          </div>
        }
      >
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Last successful save:{" "}
          {lastSavedAt ? formatDateTimeAbsolute(lastSavedAt) : "— (none this session)"}
        </p>
      </DialogFrame>
    </dialog>
  );
}

export function ExportPackageModal({
  open,
  onClose,
  artifactName,
  packageBasename,
  onBasenameChange,
  options,
  onToggle,
  onExport,
  exporting,
}: {
  open: boolean;
  onClose: () => void;
  artifactName: string;
  packageBasename: string;
  onBasenameChange: (v: string) => void;
  options: ArtifactPackageOptions;
  onToggle: (key: keyof ArtifactPackageOptions, value: boolean) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  const ref = useWizardDialog(open);
  const row = (key: keyof ArtifactPackageOptions, label: string) => (
    <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="size-4 rounded border-input"
        checked={options[key]}
        onChange={(e) => onToggle(key, e.target.checked)}
        data-testid={`export-package-${String(key)}`}
      />
      {label}
    </label>
  );
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-export-package-modal"
      className="fixed left-1/2 top-1/2 z-[125] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="export-package-title"
    >
      <DialogFrame
        titleId="export-package-title"
        title="Export artifact package"
        onClose={onClose}
        testId="export-package"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={exporting}
              onClick={onExport}
              data-testid="export-package-confirm"
            >
              {exporting ? "Exporting…" : "Export package"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Artifact name</p>
            <p className="font-medium">{artifactName}</p>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="pkg-basename" className="text-xs font-medium">
              Package filename
            </label>
            <input
              id="pkg-basename"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={packageBasename}
              onChange={(e) => onBasenameChange(e.target.value)}
              data-testid="export-package-filename"
            />
            <p className="text-xs text-muted-foreground">`.zip` is added automatically if missing.</p>
          </div>
          <div className="space-y-2 border-t pt-3">
            {row("includeMarkdown", "Include Markdown")}
            {row("includeJsonEvidence", "Include JSON evidence")}
            {row("includeEvidenceManifest", "Include evidence manifest")}
            {row("includeLinkedEvidenceFiles", "Include linked evidence files (link index)")}
            {row("includeValidationReport", "Include validation report")}
            {row("includeVersionMetadata", "Include version metadata")}
          </div>
        </div>
      </DialogFrame>
    </dialog>
  );
}

export function SaveArtifactConfirmModal({
  open,
  onClose,
  onConfirm,
  saving,
  saveError,
  artifactName,
  artifactCode,
  versionLabel,
  statusAfterSave,
  phaseLabel,
  gateLabel,
  validationSummary,
  isFirstSave,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
  saveError: string | null;
  artifactName: string;
  artifactCode: string;
  versionLabel: string;
  statusAfterSave: string;
  phaseLabel: string;
  gateLabel: string;
  validationSummary: ValidationSummary;
  isFirstSave: boolean;
}) {
  const ref = useWizardDialog(open);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-save-artifact-modal"
      className="fixed left-1/2 top-1/2 z-[125] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="save-artifact-title"
    >
      <DialogFrame
        titleId="save-artifact-title"
        title="Save artifact"
        onClose={onClose}
        testId="save-artifact"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={onConfirm} disabled={saving} data-testid="save-artifact-confirm">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        {isFirstSave ? (
          <p className="mb-3 text-xs text-muted-foreground">First save — confirm details before persisting.</p>
        ) : null}
        {saveError ? (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Artifact name</dt>
            <dd className="font-medium">{artifactName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Artifact code</dt>
            <dd className="font-mono text-xs">{artifactCode}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Version</dt>
            <dd>{versionLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status after save</dt>
            <dd>{statusAfterSave}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Linked phase</dt>
            <dd>{phaseLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Linked gate</dt>
            <dd>{gateLabel}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-lg border bg-muted/20 p-3 text-xs">
          <p className="font-semibold">Validation summary</p>
          <p className="mt-1 text-muted-foreground">
            {validationSummary.completionPercent}% complete · {validationSummary.errorCount} errors ·{" "}
            {validationSummary.warningCount} warnings · Export{" "}
            {validationSummary.exportReady ? "ready" : "not ready"}
          </p>
        </div>
      </DialogFrame>
    </dialog>
  );
}

export function MarkCompleteConfirmModal({
  open,
  onClose,
  onConfirm,
  validationSummary,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  validationSummary: ValidationSummary;
}) {
  const ref = useWizardDialog(open);
  const warnings = validationSummary.issues.filter((i) => i.severity === "warning");
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-mark-complete-modal"
      className="fixed left-1/2 top-1/2 z-[125] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="mark-complete-title"
    >
      <DialogFrame
        titleId="mark-complete-title"
        title="Mark complete"
        onClose={onClose}
        testId="mark-complete"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={onConfirm} data-testid="mark-complete-confirm">
              Mark complete
            </Button>
          </div>
        }
      >
        <ul className="list-inside list-disc space-y-2 text-sm">
          <li>Completion: {validationSummary.completionPercent}%</li>
          <li>
            Required sections: {validationSummary.sectionsComplete}/{validationSummary.sectionsTotal} complete
          </li>
          <li>
            Evidence linked: {validationSummary.evidenceLinksComplete}/{validationSummary.evidenceLinksRequired}
          </li>
        </ul>
        {warnings.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Validation warnings</p>
            <ul className="mt-2 max-h-40 list-inside list-disc space-y-1 overflow-y-auto text-xs">
              {warnings.map((w) => (
                <li key={w.id}>{w.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </DialogFrame>
    </dialog>
  );
}

export function CannotMarkCompleteModal({
  open,
  onClose,
  issues,
  onJumpToIssue,
}: {
  open: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  onJumpToIssue: (issue: ValidationIssue) => void;
}) {
  const ref = useWizardDialog(open);
  const errors = issues.filter((i) => i.severity === "error");
  const blocking = errors.length > 0 ? errors : issues;
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-cannot-mark-complete-modal"
      className="fixed left-1/2 top-1/2 z-[125] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="cannot-complete-title"
    >
      <DialogFrame
        titleId="cannot-complete-title"
        title="Cannot mark complete"
        onClose={onClose}
        testId="cannot-complete"
        footer={
          <Button type="button" size="sm" onClick={onClose} data-testid="cannot-complete-close">
            Close
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">Resolve the following before marking complete.</p>
        <ul className="mt-3 space-y-2">
          {blocking.map((issue) => (
            <li key={issue.id} className="rounded-lg border bg-muted/15 px-3 py-2 text-sm">
              <p className="font-medium text-destructive">{issue.severity}</p>
              <p>{issue.message}</p>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="mt-1 h-auto px-0"
                onClick={() => onJumpToIssue(issue)}
                data-testid={`cannot-complete-jump-${issue.id}`}
              >
                Jump to issue
              </Button>
            </li>
          ))}
        </ul>
      </DialogFrame>
    </dialog>
  );
}

export function SubmitGateReviewModal({
  open,
  onClose,
  onSubmit,
  projectId,
  gateHref,
  validationSummary,
  artifactName,
  approverNote,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  projectId: string;
  gateHref: string;
  validationSummary: ValidationSummary;
  artifactName: string;
  approverNote: string;
}) {
  const ref = useWizardDialog(open);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-submit-gate-modal"
      className="fixed left-1/2 top-1/2 z-[125] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="submit-gate-title"
    >
      <DialogFrame
        titleId="submit-gate-title"
        title="Submit for gate review"
        onClose={onClose}
        testId="submit-gate"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={onSubmit} data-testid="submit-gate-confirm">
              Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Artifact readiness</p>
            <p className="font-medium">{artifactName}</p>
            <p className="text-xs text-muted-foreground">
              Export {validationSummary.exportReady ? "ready" : "not ready"} · {validationSummary.completionPercent}%
              complete
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Required gate inputs</p>
            <p className="text-xs text-muted-foreground">
              Gate review captures authority, decision, and evidence attachments on the gate screen.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Evidence summary</p>
            <p className="text-xs">
              {validationSummary.evidenceLinksComplete}/{validationSummary.evidenceLinksRequired} evidence links
              recorded in this artifact draft.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Validation summary</p>
            <p className="text-xs">
              {validationSummary.errorCount} errors · {validationSummary.warningCount} warnings
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Assigned approvers</p>
            <p className="text-xs text-muted-foreground">{approverNote}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            After submit you will be taken to{" "}
            <Link href={gateHref} className="text-primary underline-offset-2 hover:underline">
              gate review
            </Link>{" "}
            for project <span className="font-mono">{projectId}</span>.
          </p>
        </div>
      </DialogFrame>
    </dialog>
  );
}
