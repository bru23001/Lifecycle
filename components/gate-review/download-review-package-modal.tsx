"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  triggerReviewPackageDownload,
  type ReviewPackageDownloadOptions,
} from "@/lib/evidence-package";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  projectId: string;
  gateId: string;
  onClose: () => void;
};

const defaultOptions = (): ReviewPackageDownloadOptions => ({
  includeRequiredInputs: true,
  includeCompletionEvidence: true,
  includeDecisionCriteria: true,
  includeApproverReviewStatus: true,
  includeAuditManifest: true,
  format: "zip",
});

export function DownloadReviewPackageModal({ open, projectId, gateId, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [opts, setOpts] = useState<ReviewPackageDownloadOptions>(defaultOptions);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
      setOpts(defaultOptions());
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  function toggle<K extends keyof ReviewPackageDownloadOptions>(key: K) {
    if (key === "format") return;
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  }

  function onDownload() {
    triggerReviewPackageDownload(projectId, gateId, opts);
    onClose();
  }

  return (
    <dialog
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border dark:bg-card",
      )}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <h2 id={titleId} className="text-lg font-semibold text-slate-950 dark:text-foreground">
        Download review package
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground">
        Choose what to include. In this preview build, the download is a JSON manifest that records your
        selections; replace with ZIP or PDF generation when the packaging API is available.
      </p>

      <fieldset className="mt-5 space-y-3 border-0 p-0">
        <legend className="sr-only">Package contents</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-input"
            checked={opts.includeRequiredInputs}
            onChange={() => toggle("includeRequiredInputs")}
          />
          <span>
            <span className="font-medium text-foreground">Required inputs</span>
            <span className="mt-0.5 block text-muted-foreground">Linked artifacts and completion state</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-input"
            checked={opts.includeCompletionEvidence}
            onChange={() => toggle("includeCompletionEvidence")}
          />
          <span>
            <span className="font-medium text-foreground">Completion evidence</span>
            <span className="mt-0.5 block text-muted-foreground">Evidence items attached to this gate</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-input"
            checked={opts.includeDecisionCriteria}
            onChange={() => toggle("includeDecisionCriteria")}
          />
          <span>
            <span className="font-medium text-foreground">Decision criteria</span>
            <span className="mt-0.5 block text-muted-foreground">Criteria assessments and weights</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-input"
            checked={opts.includeApproverReviewStatus}
            onChange={() => toggle("includeApproverReviewStatus")}
          />
          <span>
            <span className="font-medium text-foreground">Approver review status</span>
            <span className="mt-0.5 block text-muted-foreground">Assignments and review outcomes</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-input"
            checked={opts.includeAuditManifest}
            onChange={() => toggle("includeAuditManifest")}
          />
          <span>
            <span className="font-medium text-foreground">Audit manifest</span>
            <span className="mt-0.5 block text-muted-foreground">Traceable list of included objects</span>
          </span>
        </label>
      </fieldset>

      <fieldset className="mt-6 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-foreground">Format</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(
            [
              { value: "zip" as const, label: "ZIP archive" },
              { value: "pdf" as const, label: "PDF bundle" },
              { value: "json" as const, label: "JSON manifest" },
            ] as const
          ).map((f) => (
            <label
              key={f.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border"
            >
              <input
                type="radio"
                name="review-package-format"
                value={f.value}
                checked={opts.format === f.value}
                onChange={() => setOpts((o) => ({ ...o, format: f.value }))}
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={onDownload}>
          Download package
        </Button>
      </div>
    </dialog>
  );
}
