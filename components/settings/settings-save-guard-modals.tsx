"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SETTINGS_SLICE_LABEL, type SettingsSliceId } from "@/lib/settings-dirty-summary";
import { cn } from "@/lib/utils";
import type { SettingsPageData } from "@/types/settings.types";

function sliceListLabels(ids: SettingsSliceId[]): string {
  return ids.map((id) => SETTINGS_SLICE_LABEL[id]).join(" · ");
}

export function SaveSettingsConfirmationModal({
  open,
  changedSlices,
  impactLevel,
  systemOverview,
  isSaving,
  onClose,
  onConfirmSave,
}: {
  open: boolean;
  changedSlices: SettingsSliceId[];
  impactLevel: "high" | "standard";
  systemOverview: SettingsPageData["systemOverview"];
  isSaving: boolean;
  onClose: () => void;
  onConfirmSave: () => void | Promise<void>;
  /** Parent closes the modal after a successful save. */
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [auditNote, setAuditNote] = useState("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) setAuditNote("");
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[70] w-[min(100vw-2rem,500px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="save-confirm-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="save-confirm-title" className="text-lg font-semibold text-slate-900">
              Save settings?
            </h2>
            <p className="mt-1 text-xs text-slate-500">High-impact edits require explicit confirmation.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Changed areas</p>
            <p className="mt-1 text-slate-900">{sliceListLabels(changedSlices)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Impact level</p>
            <p className={cn("mt-1 font-semibold", impactLevel === "high" ? "text-amber-800" : "text-slate-800")}>
              {impactLevel === "high" ? "High — governance-sensitive configuration" : "Standard"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Affected active projects</p>
            <p className="mt-1 text-slate-800">
              Workspace model: {systemOverview.lifecycleModelName} · {systemOverview.gateCount} gates ·{" "}
              {systemOverview.activeTemplateCount} active templates. Connected clients should reload after save to pick up
              structural changes.
            </p>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Audit note (optional)</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
              placeholder="Reason for change, ticket ID, or approver reference…"
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Stored locally with this session only; wire to your audit API when available. Saves are still logged in recent
              activity.
            </p>
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isSaving}
            onClick={() => void onConfirmSave()}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function ResetUnsavedChangesModal({
  open,
  changedSlices,
  onClose,
  onConfirmReset,
}: {
  open: boolean;
  changedSlices: SettingsSliceId[];
  onClose: () => void;
  onConfirmReset: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[70] w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="reset-unsaved-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="reset-unsaved-title" className="text-lg font-semibold text-slate-900">
            Discard unsaved changes?
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Unsaved sections:</span> {changedSlices.length}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Changed areas</span>
          </p>
          <p>{sliceListLabels(changedSlices)}</p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            You will lose all edits since the last successful save. This cannot be undone.
          </p>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
          >
            Reset
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function UnsavedChangesLeaveModal({
  open,
  targetHref,
  isSaving,
  onStay,
  onDiscardAndLeave,
  onSaveAndLeave,
}: {
  open: boolean;
  targetHref: string | null;
  isSaving: boolean;
  onStay: () => void;
  onDiscardAndLeave: () => void;
  onSaveAndLeave: () => void | Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onStay}
      className="fixed left-1/2 top-1/2 z-[80] w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="leave-unsaved-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="leave-unsaved-title" className="text-lg font-semibold text-slate-900">
            Unsaved changes
          </h2>
          <button type="button" onClick={onStay} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <p>You have unsaved settings. Leave without saving?</p>
          {targetHref ? (
            <p className="text-xs text-slate-500">
              Go to: <span className="font-mono">{targetHref}</span>
            </p>
          ) : null}
        </div>
        <footer className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 min-[480px]:flex-row min-[480px]:justify-end">
          <Button type="button" variant="outline" onClick={onStay}>
            Stay on page
          </Button>
          <Button type="button" variant="outline" onClick={onDiscardAndLeave} disabled={isSaving}>
            Discard changes
          </Button>
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isSaving}
            onClick={() => void Promise.resolve(onSaveAndLeave())}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
