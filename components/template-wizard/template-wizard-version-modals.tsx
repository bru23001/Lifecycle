"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useWizardDialog } from "@/components/template-wizard/template-wizard-flow-modals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FormFieldDiffRow } from "@/lib/template-wizard-artifact-diff";

export function UnsavedLeaveModal({
  open,
  onStay,
  onDiscardAndLeave,
  onSaveDraftAndLeave,
  saveBusy,
  targetDescription,
}: {
  open: boolean;
  onStay: () => void;
  onDiscardAndLeave: () => void;
  onSaveDraftAndLeave: () => void | Promise<void>;
  saveBusy: boolean;
  targetDescription: string;
}) {
  const ref = useWizardDialog(open);
  return (
    <dialog
      ref={ref}
      onClose={onStay}
      data-testid="template-wizard-unsaved-leave-modal"
      className="fixed left-1/2 top-1/2 z-[135] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="unsaved-leave-title"
    >
      <div className="flex flex-col gap-4 p-6">
        <div>
          <h2 id="unsaved-leave-title" className="text-lg font-semibold text-foreground">
            Unsaved changes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You have edits that are not saved to the server. What would you like to do before leaving to{" "}
            <span className="font-medium text-foreground">{targetDescription}</span>?
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onStay} data-testid="unsaved-leave-stay">
            Stay on page
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saveBusy}
            onClick={() => void onSaveDraftAndLeave()}
            data-testid="unsaved-leave-save-draft"
          >
            Save draft locally &amp; continue
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDiscardAndLeave}
            data-testid="unsaved-leave-discard"
          >
            Discard changes
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export function RestoreVersionConfirmModal({
  open,
  onClose,
  onConfirm,
  busy,
  versionLabel,
  currentImpactNote,
  artifactDetailHref,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  busy: boolean;
  versionLabel: string;
  currentImpactNote: string;
  artifactDetailHref?: string;
}) {
  const ref = useWizardDialog(open);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-restore-version-modal"
      className="fixed left-1/2 top-1/2 z-[135] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="restore-version-title"
    >
      <div className="flex flex-col gap-4 p-6">
        <div>
          <h2 id="restore-version-title" className="text-lg font-semibold text-foreground">
            Restore saved version?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You are about to load snapshot <span className="font-medium text-foreground">{versionLabel}</span> into this
            wizard draft. Saving the artifact afterward will create a new row in version history.
          </p>
          <p className="mt-3 text-sm text-foreground/90">{currentImpactNote}</p>
          {artifactDetailHref ? (
            <p className="mt-2 text-sm">
              <Link href={artifactDetailHref} className="font-medium text-[#2563eb] hover:underline">
                Open artifact record
              </Link>
            </p>
          ) : null}
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Optional change reason (local note)</span>
          <textarea
            className="min-h-[72px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you restoring this version?"
          />
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={() => void onConfirm(reason.trim())}>
            Restore into draft
          </Button>
        </div>
      </div>
    </dialog>
  );
}

type CompareTab = "fields" | "markdown" | "json";

export function VersionCompareModal({
  open,
  onClose,
  loading,
  loadError,
  artifactLabel,
  rows,
  currentMarkdown,
  otherMarkdown,
  currentJson,
  otherJson,
  otherFormValues,
  onApplySelected,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  loadError: string | null;
  artifactLabel: string;
  rows: FormFieldDiffRow[];
  currentMarkdown: string;
  otherMarkdown: string;
  currentJson: string;
  otherJson: string;
  otherFormValues: Record<string, unknown> | null;
  onApplySelected: (updates: Record<string, unknown>, removeKeys: string[]) => void;
}) {
  const ref = useWizardDialog(open);
  const [tab, setTab] = useState<CompareTab>("fields");
  const selectable = useMemo(() => rows.filter((r) => r.change !== "same"), [rows]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const init: Record<string, boolean> = {};
    for (const r of selectable) {
      init[r.fieldName] = true;
    }
    setSelected(init);
  }, [open, selectable]);

  function toggleAll(on: boolean) {
    const next: Record<string, boolean> = {};
    for (const r of selectable) {
      next[r.fieldName] = on;
    }
    setSelected(next);
  }

  function applyPatch() {
    if (!otherFormValues) return;
    const updates: Record<string, unknown> = {};
    const removeKeys: string[] = [];
    for (const r of selectable) {
      if (!selected[r.fieldName]) continue;
      if (r.change === "added") {
        removeKeys.push(r.fieldName);
        continue;
      }
      if (r.change === "changed" || r.change === "removed") {
        updates[r.fieldName] = otherFormValues[r.fieldName];
      }
    }
    onApplySelected(updates, removeKeys);
    onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      data-testid="template-wizard-version-compare-modal"
      className="fixed left-1/2 top-1/2 z-[135] w-[min(100vw-1rem,min(1120px,100vw-1rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="version-compare-title"
    >
      <div className="flex max-h-[min(90vh,860px)] flex-col">
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="version-compare-title" className="text-lg font-semibold text-foreground">
              Compare version
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{artifactLabel}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
            onClick={onClose}
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading snapshot…</p>
          ) : loadError ? (
            <p className="text-sm text-red-700">{loadError}</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {(
                  [
                    ["fields", "Field values"],
                    ["markdown", "Markdown"],
                    ["json", "JSON evidence"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      tab === id ? "bg-[#2563eb] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                    onClick={() => setTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "fields" ? (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(true)}>
                      Select all changes
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(false)}>
                      Clear selection
                    </Button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="w-10 px-2 py-2" />
                          <th className="px-2 py-2">Field</th>
                          <th className="px-2 py-2">Change</th>
                          <th className="px-2 py-2">Current draft</th>
                          <th className="px-2 py-2">Saved version</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.fieldName} className="border-t border-border">
                            <td className="px-2 py-2">
                              {r.change !== "same" ? (
                                <input
                                  type="checkbox"
                                  className="size-4"
                                  checked={Boolean(selected[r.fieldName])}
                                  onChange={(e) =>
                                    setSelected((prev) => ({ ...prev, [r.fieldName]: e.target.checked }))
                                  }
                                  aria-label={`Select ${r.fieldName}`}
                                />
                              ) : null}
                            </td>
                            <td className="px-2 py-2 font-mono text-xs">{r.fieldName}</td>
                            <td className="px-2 py-2 text-xs font-semibold capitalize">{r.change}</td>
                            <td className="max-w-[220px] whitespace-pre-wrap break-words px-2 py-2 text-xs">
                              {r.currentPreview}
                            </td>
                            <td className="max-w-[220px] whitespace-pre-wrap break-words px-2 py-2 text-xs">
                              {r.otherPreview}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    “Added” means the field exists only in your current draft — applying removes it. “Removed” on the
                    saved side means the field exists only in the saved snapshot — applying copies it into the draft.
                  </p>
                </div>
              ) : null}

              {tab === "markdown" ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Current draft</p>
                    <pre className="mt-1 max-h-[420px] overflow-auto rounded-lg border bg-muted/20 p-3 text-[11px] leading-snug">
                      {currentMarkdown}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Saved version</p>
                    <pre className="mt-1 max-h-[420px] overflow-auto rounded-lg border bg-muted/20 p-3 text-[11px] leading-snug">
                      {otherMarkdown}
                    </pre>
                  </div>
                </div>
              ) : null}

              {tab === "json" ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Current draft</p>
                    <pre className="mt-1 max-h-[420px] overflow-auto rounded-lg border bg-muted/20 p-3 text-[11px] leading-snug">
                      {currentJson}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Saved version</p>
                    <pre className="mt-1 max-h-[420px] overflow-auto rounded-lg border bg-muted/20 p-3 text-[11px] leading-snug">
                      {otherJson}
                    </pre>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading || Boolean(loadError) || !otherFormValues}
            onClick={applyPatch}
            data-testid="version-compare-apply-selected"
          >
            Apply selected fields
          </Button>
        </div>
      </div>
    </dialog>
  );
}
