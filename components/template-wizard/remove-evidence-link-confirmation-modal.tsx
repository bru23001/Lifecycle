"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Trash2, Unlink, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { targetLabel } from "@/lib/wizard-evidence-store";
import type {
  WizardEvidenceItem,
  WizardEvidenceTarget,
} from "@/types/template-wizard.types";

export type RemoveEvidenceLinkAction = "unlink" | "delete";

export type RemoveEvidenceLinkConfirmationModalProps = {
  open: boolean;
  evidence: WizardEvidenceItem | null;
  target: WizardEvidenceTarget | null;
  /** Total number of targets this evidence is linked to. */
  totalLinkCount: number;
  /** True when evidence has not been written to the DB yet. */
  isStaged: boolean;
  sectionTitles: Record<string, string>;
  fieldLabels: Record<string, string>;
  artifactTitle: string;
  onCancel: () => void;
  onConfirm: (action: RemoveEvidenceLinkAction) => void;
};

export function RemoveEvidenceLinkConfirmationModal({
  open,
  evidence,
  target,
  totalLinkCount,
  isStaged,
  sectionTitles,
  fieldLabels,
  artifactTitle,
  onCancel,
  onConfirm,
}: RemoveEvidenceLinkConfirmationModalProps) {
  const [action, setAction] = useState<RemoveEvidenceLinkAction>("unlink");

  useEffect(() => {
    if (open) setAction("unlink");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const linkTargetLabel = useMemo(() => {
    if (!target) return "";
    return targetLabel(target, { sectionTitles, fieldLabels, artifactTitle });
  }, [target, sectionTitles, fieldLabels, artifactTitle]);

  if (!open || !evidence || !target) return null;

  const remainingLinks = Math.max(0, totalLinkCount - 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-evidence-link-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onCancel}
      />
      <div
        data-testid="remove-evidence-link-modal"
        className="relative flex w-[min(100vw-2rem,480px)] flex-col overflow-hidden rounded-2xl border bg-card shadow-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Evidence
            </p>
            <h2 id="remove-evidence-link-title" className="mt-1 text-lg font-semibold text-foreground">
              Remove evidence link
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="space-y-3 px-6 py-4 text-sm">
          <dl className="space-y-1">
            <Row label="Evidence" value={`${evidence.name} (${evidence.evidenceCode})`} />
            <Row label="Current link" value={linkTargetLabel} />
            <Row
              label="Other links"
              value={
                remainingLinks === 0
                  ? "None — this is the only link."
                  : `${remainingLinks} additional link${remainingLinks === 1 ? "" : "s"} elsewhere.`
              }
            />
          </dl>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-3.5" aria-hidden />
              Impact
            </p>
            <p className="mt-1">
              {action === "unlink"
                ? remainingLinks === 0
                  ? "Removing this link will leave the evidence with no artifact link, but the evidence item will remain in the catalog."
                  : "Removing this link will unlink the evidence here only. Other links remain intact."
                : isStaged
                  ? "Deletion will discard this staged evidence entirely. All links to it will be removed."
                  : "Deletion will remove this evidence from the catalog and unlink it everywhere. This may break other artifacts."}
            </p>
          </div>

          <fieldset className="space-y-2 rounded-lg border border-border p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Action
            </legend>
            <ActionRadio
              checked={action === "unlink"}
              onSelect={() => setAction("unlink")}
              icon={<Unlink className="size-3.5" aria-hidden />}
              label="Unlink only"
              description="Detach this evidence from the selected target; evidence stays in the catalog."
            />
            <ActionRadio
              checked={action === "delete"}
              onSelect={() => setAction("delete")}
              icon={<Trash2 className="size-3.5" aria-hidden />}
              label={isStaged ? "Discard staged evidence" : "Delete evidence"}
              description={
                isStaged
                  ? "Remove this staged evidence entirely (only affects this draft)."
                  : "Remove the evidence from the catalog and unlink it everywhere."
              }
              tone="destructive"
            />
          </fieldset>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action === "delete" ? "destructive" : "default"}
            onClick={() => onConfirm(action)}
            data-testid="remove-evidence-link-confirm"
          >
            {action === "delete"
              ? isStaged
                ? "Discard staged evidence"
                : "Delete evidence"
              : "Unlink"}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-xs text-foreground">{value}</dd>
    </div>
  );
}

function ActionRadio({
  checked,
  onSelect,
  icon,
  label,
  description,
  tone,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  tone?: "destructive";
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 rounded-md border px-2 py-1.5 text-xs",
        checked
          ? tone === "destructive"
            ? "border-destructive bg-destructive/10"
            : "border-ring bg-accent"
          : "border-border bg-background hover:bg-muted/50",
      )}
    >
      <input type="radio" checked={checked} onChange={onSelect} className="mt-0.5 size-3 accent-primary" />
      <span className="flex-1">
        <span className="flex items-center gap-1 font-semibold text-foreground">
          {icon}
          {label}
        </span>
        <span className="mt-0.5 block text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}
