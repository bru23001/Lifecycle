"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { formatBytes, ToggleRow } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import { validateStoragePath } from "@/lib/settings-validation";
import { cn } from "@/lib/utils";
import type { LocalStorageSettings } from "@/types/settings.types";

export type StoragePathKey = keyof LocalStorageSettings["paths"];

const PATH_LABELS: Record<StoragePathKey, string> = {
  projectDataPath: "Project data",
  evidenceFilesPath: "Evidence files",
  exportPackagesPath: "Export packages",
  cachePath: "Cache",
};

function estimateBytesForPath(key: StoragePathKey, value: LocalStorageSettings): number {
  switch (key) {
    case "cachePath":
      return value.usage.cacheBytes;
    case "evidenceFilesPath":
      return value.usage.evidenceBytes;
    case "exportPackagesPath":
      return Math.max(0, Math.min(value.usage.usedBytes, Math.floor(value.usage.usedBytes * 0.15)));
    case "projectDataPath":
      return Math.max(0, value.usage.usedBytes - value.usage.cacheBytes - value.usage.evidenceBytes);
    default:
      return value.usage.usedBytes;
  }
}

export function ChangeStorageLocationModal({
  open,
  pathKey,
  value,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pathKey: StoragePathKey | null;
  value: LocalStorageSettings;
  onClose: () => void;
  onConfirm: (args: { key: StoragePathKey; newPath: string; migration: "references_only" | "migrate_asap" }) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newPath, setNewPath] = useState("");
  const [migration, setMigration] = useState<"references_only" | "migrate_asap">("references_only");

  useEffect(() => {
    if (open && pathKey) {
      setNewPath(value.paths[pathKey]);
      setMigration("migrate_asap");
    }
  }, [open, pathKey, value.paths]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && pathKey) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, pathKey]);

  if (!pathKey) return null;

  const currentPath = value.paths[pathKey];
  const pathValidation = validateStoragePath(newPath.trim());
  const permissionOk = pathValidation === null;
  const est = estimateBytesForPath(pathKey, value);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,500px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="change-storage-title"
    >
      <div className="flex max-h-[88vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="change-storage-title" className="text-lg font-semibold text-slate-900">
              Change storage location
            </h2>
            <p className="mt-1 text-xs text-slate-500">{PATH_LABELS[pathKey]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <div>
            <span className="text-xs font-semibold text-slate-500">Current path</span>
            <p className="mt-1 break-all rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 font-mono text-xs">{currentPath}</p>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">New path</span>
            <input
              type="text"
              className="h-9 w-full rounded-lg border border-slate-200 px-2 font-mono text-sm"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="/path/to/vault or ~/vault/…"
            />
            <p className="mt-1 text-xs text-slate-500">
              In a desktop build, a native folder picker can set this path. Here you can paste an absolute or home-relative path.
            </p>
          </label>
          <div>
            <span className="text-xs font-semibold text-slate-500">Permission validation</span>
            <p
              className={cn(
                "mt-1 rounded-lg border px-3 py-2 text-sm",
                permissionOk ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900",
              )}
            >
              {permissionOk
                ? "Path shape is valid. Full read/write checks run when the runtime attaches this location."
                : pathValidation}
            </p>
          </div>
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-500">Migration option</span>
            <div className="space-y-2">
              <label className="flex cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <input
                  type="radio"
                  name="migration"
                  checked={migration === "references_only"}
                  onChange={() => setMigration("references_only")}
                />
                <span>Update references only (you move files separately)</span>
              </label>
              <label className="flex cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <input
                  type="radio"
                  name="migration"
                  checked={migration === "migrate_asap"}
                  onChange={() => setMigration("migrate_asap")}
                />
                <span>Schedule background migration to the new path (recommended when supported)</span>
              </label>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Estimated data size (for this scope)</span>
            <p className="mt-1 font-semibold text-slate-900">{formatBytes(est)}</p>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            disabled={!permissionOk}
            onClick={() => {
              onConfirm({ key: pathKey, newPath: newPath.trim(), migration });
              onClose();
            }}
          >
            Confirm
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function ClearCacheConfirmModal({
  open,
  value,
  onClose,
  onConfirm,
}: {
  open: boolean;
  value: LocalStorageSettings;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cacheBytes = value.usage.cacheBytes;
  const itemsHint = Math.max(8, Math.min(5000, Math.round(cacheBytes / (48 * 1024))));

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
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="clear-cache-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="clear-cache-title" className="text-lg font-semibold text-slate-900">
            Clear cache?
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Cache size:</span> {formatBytes(cacheBytes)}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Items affected (estimate):</span> ~{itemsHint} cached objects under{" "}
            <span className="font-mono text-xs">{value.paths.cachePath}</span>
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            Clearing cache may slow the next session until indexes rebuild. Active exports are not removed.
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
              onConfirm();
              onClose();
            }}
          >
            Clear cache
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function RunStorageCleanupModal({
  open,
  value,
  onClose,
  onConfirm,
}: {
  open: boolean;
  value: LocalStorageSettings;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { drafts, exports, snapshots, recover } = useMemo(() => {
    const d = Math.max(0, Math.min(120, Math.round(value.retention.keepDraftsDays / 5)));
    const e = Math.max(0, Math.min(48, Math.round(value.retention.keepExportPackagesDays / 8)));
    const s = Math.max(0, Math.min(24, Math.round(value.retention.keepAuditSnapshotsDays / 40)));
    const recoverBytes = Math.min(
      value.usage.usedBytes * 0.12 + value.usage.evidenceBytes * 0.04,
      400 * 1024 * 1024,
    );
    return { drafts: d, exports: e, snapshots: s, recover: Math.floor(recoverBytes) };
  }, [value.retention, value.usage]);

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
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="cleanup-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="cleanup-title" className="text-lg font-semibold text-slate-900">
            Run storage cleanup
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Drafts to remove:</span> {drafts} (older than {value.retention.keepDraftsDays} days)
          </p>
          <p>
            <span className="font-semibold">Exports to remove:</span> {exports} (older than {value.retention.keepExportPackagesDays}{" "}
            days)
          </p>
          <p>
            <span className="font-semibold">Snapshots to remove:</span> {snapshots} (older than {value.retention.keepAuditSnapshotsDays}{" "}
            days)
          </p>
          <p>
            <span className="font-semibold">Space to recover (estimate):</span> {formatBytes(recover)}
          </p>
          <p>
            <span className="font-semibold">Retention rules applied:</span> drafts {value.retention.keepDraftsDays}d · exports{" "}
            {value.retention.keepExportPackagesDays}d · audit {value.retention.keepAuditSnapshotsDays}d · policy{" "}
            <span className="capitalize">{value.retention.cleanupPolicy}</span>
          </p>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Run cleanup
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function BackupConfigurationDrawer({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean;
  value: LocalStorageSettings;
  onClose: () => void;
  onSave: (next: LocalStorageSettings["backupSync"]) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(value.backupSync);

  useEffect(() => {
    if (open) setDraft(value.backupSync);
  }, [open, value.backupSync]);

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
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
      aria-labelledby="backup-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Local vault</p>
            <h2 id="backup-drawer-title" className="mt-1 text-lg font-semibold text-slate-900">
              Backup configuration
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 text-sm">
          <ToggleRow label="Auto backup enabled" checked={draft.autoBackupEnabled} onChange={(c) => setDraft((d) => ({ ...d, autoBackupEnabled: c }))} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Backup frequency</span>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2"
              value={draft.backupFrequency}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  backupFrequency: e.target.value as LocalStorageSettings["backupSync"]["backupFrequency"],
                }))
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Backup location</span>
            <input
              type="text"
              className="h-9 w-full rounded-lg border border-slate-200 px-2 font-mono text-sm"
              value={draft.backupLocation ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, backupLocation: e.target.value || undefined }))}
              placeholder="/backup/lifecycle-vault"
            />
          </label>
          <ToggleRow
            label="Include evidence files"
            checked={draft.includeEvidenceFiles}
            onChange={(c) => setDraft((d) => ({ ...d, includeEvidenceFiles: c }))}
          />
          <ToggleRow
            label="Include audit snapshots"
            checked={draft.includeAuditSnapshots}
            onChange={(c) => setDraft((d) => ({ ...d, includeAuditSnapshots: c }))}
          />
          <ToggleRow label="Sync enabled" checked={draft.syncEnabled} onChange={(c) => setDraft((d) => ({ ...d, syncEnabled: c }))} />
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Last backup:</span> {draft.lastBackupLabel ?? "Never recorded"}
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save backup settings
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

type RestoreStep = 0 | 1 | 2 | 3 | 4 | 5;

export function RestoreBackupWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<RestoreStep>(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<unknown>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<"overwrite" | "skip_existing">("skip_existing");
  const [optEvidence, setOptEvidence] = useState(true);
  const [optSettings, setOptSettings] = useState(true);

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
    if (open) {
      setStep(0);
      setFileName(null);
      setParsed(null);
      setParseError(null);
      setConflict("skip_existing");
      setOptEvidence(true);
      setOptSettings(true);
    }
  }, [open]);

  const validationLabel = parseError ?? (parsed ? "Backup manifest parses as JSON." : "");

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="restore-wizard-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="restore-wizard-title" className="text-lg font-semibold text-slate-900">
              Restore backup
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Step {step + 1} of 6 · destructive — review each screen carefully
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          {step === 0 ? (
            <div className="space-y-3">
              <p>Select a backup archive or JSON manifest exported from this workspace.</p>
              <input
                type="file"
                accept=".json,application/json"
                className="block w-full text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFileName(file.name);
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const json = JSON.parse(String(reader.result));
                      setParsed(json);
                      setParseError(null);
                    } catch {
                      setParsed(null);
                      setParseError("File is not valid JSON.");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              {fileName ? <p className="text-xs text-slate-500">Selected: {fileName}</p> : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-2">
              <p className="font-semibold text-slate-900">Validate backup</p>
              <p className={cn("rounded-lg border px-3 py-2", parseError ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50")}>
                {parseError ?? validationLabel}
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-2">
              <p className="font-semibold text-slate-900">Backup contents preview</p>
              <pre className="max-h-40 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-2 font-mono text-[11px]">
                {parsed ? JSON.stringify(parsed, null, 2).slice(0, 1800) : "—"}
                {parsed && JSON.stringify(parsed).length > 1800 ? "\n…" : ""}
              </pre>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <p className="font-semibold text-slate-900">Conflict handling</p>
              <label className="flex gap-2">
                <input type="radio" name="conf" checked={conflict === "skip_existing"} onChange={() => setConflict("skip_existing")} />
                Skip existing records when keys collide
              </label>
              <label className="flex gap-2">
                <input type="radio" name="conf" checked={conflict === "overwrite"} onChange={() => setConflict("overwrite")} />
                Overwrite local records with backup values (destructive)
              </label>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-3">
              <p className="font-semibold text-slate-900">Restore options</p>
              <label className="flex gap-2">
                <input type="checkbox" checked={optEvidence} onChange={(e) => setOptEvidence(e.target.checked)} />
                Include evidence file references from backup
              </label>
              <label className="flex gap-2">
                <input type="checkbox" checked={optSettings} onChange={(e) => setOptSettings(e.target.checked)} />
                Include settings / lifecycle blocks from backup
              </label>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-3">
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 font-semibold text-rose-900">Final warning</p>
              <p>
                Restoring may replace paths, retention, and vault metadata. This UI records your choices only; applying a restore
                still requires the import pipeline or a trusted operator runbook.
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-600">
                <li>Conflict mode: {conflict === "overwrite" ? "Overwrite" : "Skip existing"}</li>
                <li>Evidence refs: {optEvidence ? "On" : "Off"}</li>
                <li>Settings blocks: {optSettings ? "On" : "Off"}</li>
              </ul>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => (s > 0 ? ((s - 1) as RestoreStep) : s))}>
              Back
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step < 5 ? (
            <Button
              type="button"
              className="bg-[#2563eb] hover:bg-[#1d4ed8]"
              disabled={(step === 0 && !parsed) || (step === 1 && !!parseError)}
              onClick={() => {
                if (step === 0 && !parsed) return;
                if (step === 1 && parseError) return;
                setStep((s) => Math.min(5, s + 1) as RestoreStep);
              }}
            >
              Next
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={onClose}>
              Done
            </Button>
          )}
        </footer>
      </div>
    </dialog>
  );
}
