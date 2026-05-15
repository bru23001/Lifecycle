"use client";

import { useState } from "react";
import { Database, HardDrive, RefreshCw, RotateCcw, Shield } from "lucide-react";

import {
  BackupConfigurationDrawer,
  ChangeStorageLocationModal,
  ClearCacheConfirmModal,
  type StoragePathKey,
  RestoreBackupWizard,
  RunStorageCleanupModal,
} from "@/components/settings/local-storage-settings-interactions";
import { formatBytes } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import { validateStoragePath } from "@/lib/settings-validation";
import type { LocalStorageSettings } from "@/types/settings.types";

export function LocalStorageSettingsPanel({
  value,
  pathError,
  onChange,
}: {
  value: LocalStorageSettings;
  pathError: string | null;
  onChange: (nextValue: LocalStorageSettings) => void;
}) {
  const [banner, setBanner] = useState<string | null>(null);
  const [pathModalKey, setPathModalKey] = useState<StoragePathKey | null>(null);
  const [clearCacheOpen, setClearCacheOpen] = useState(false);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [backupDrawerOpen, setBackupDrawerOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const usagePercent = value.usage.quotaBytes
    ? Math.min(100, Math.round((value.usage.usedBytes / value.usage.quotaBytes) * 100))
    : 0;

  const openPathModal = (key: StoragePathKey) => {
    setBanner(null);
    setPathModalKey(key);
  };

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-900">Local Storage Settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Configure local project storage, retention behavior, and backup/sync preferences.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => openPathModal("projectDataPath")}>
            <HardDrive className="size-3.5" aria-hidden />
            Change storage location
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setClearCacheOpen(true)}>
            <Database className="size-3.5" aria-hidden />
            Clear cache
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setCleanupOpen(true)}>
            <RefreshCw className="size-3.5" aria-hidden />
            Run cleanup
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setBackupDrawerOpen(true)}>
            <Shield className="size-3.5" aria-hidden />
            Configure backup
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setRestoreOpen(true)}>
            <RotateCcw className="size-3.5" aria-hidden />
            Restore backup
          </Button>
        </div>
      </header>

      {banner ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {banner}
        </div>
      ) : null}

      {pathError ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {pathError}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Storage paths</h3>
          <div className="mt-2 space-y-2 text-sm">
            {(
              [
                ["projectDataPath", "Project data path"],
                ["evidenceFilesPath", "Evidence files path"],
                ["exportPackagesPath", "Export packages path"],
                ["cachePath", "Cache path"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="text-sm text-slate-700">{value.paths[key]}</p>
                </div>
                <button type="button" className="rounded border border-slate-200 px-2 py-1 text-xs" onClick={() => openPathModal(key)}>
                  Change
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Storage usage</h3>
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Used space</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatBytes(value.usage.usedBytes)} / {formatBytes(value.usage.quotaBytes ?? value.usage.availableBytes)}
            </p>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-xs text-slate-500">Cache size</p>
              <p className="font-semibold text-slate-800">{formatBytes(value.usage.cacheBytes)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-xs text-slate-500">Evidence size</p>
              <p className="font-semibold text-slate-800">{formatBytes(value.usage.evidenceBytes)}</p>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Retention rules</h3>
          <div className="mt-2 space-y-2 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Keep drafts (days)</span>
              <input
                type="number"
                className="h-9 w-full rounded-lg border border-slate-200 px-2"
                value={value.retention.keepDraftsDays}
                onChange={(event) =>
                  onChange({
                    ...value,
                    retention: {
                      ...value.retention,
                      keepDraftsDays: Number(event.target.value),
                    },
                  })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Keep export packages (days)</span>
              <input
                type="number"
                className="h-9 w-full rounded-lg border border-slate-200 px-2"
                value={value.retention.keepExportPackagesDays}
                onChange={(event) =>
                  onChange({
                    ...value,
                    retention: {
                      ...value.retention,
                      keepExportPackagesDays: Number(event.target.value),
                    },
                  })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Keep audit snapshots (days)</span>
              <input
                type="number"
                className="h-9 w-full rounded-lg border border-slate-200 px-2"
                value={value.retention.keepAuditSnapshotsDays}
                onChange={(event) =>
                  onChange({
                    ...value,
                    retention: {
                      ...value.retention,
                      keepAuditSnapshotsDays: Number(event.target.value),
                    },
                  })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Cleanup policy</span>
              <select
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2"
                value={value.retention.cleanupPolicy}
                onChange={(event) =>
                  onChange({
                    ...value,
                    retention: {
                      ...value.retention,
                      cleanupPolicy: event.target.value as LocalStorageSettings["retention"]["cleanupPolicy"],
                    },
                  })
                }
              >
                <option value="manual">Manual</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 p-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Backup & sync</h3>
            <p className="mt-1 text-xs text-slate-600">
              Open the drawer for frequency, scope, and location. Quick status stays on this card.
            </p>
          </div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-xs text-slate-500">Auto backup</p>
              <p className="font-semibold text-slate-800">{value.backupSync.autoBackupEnabled ? "On" : "Off"}</p>
              <p className="mt-1 text-xs text-slate-500">
                Frequency: <span className="capitalize">{value.backupSync.backupFrequency}</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-xs text-slate-500">Backup location</p>
              <p className="break-all font-semibold text-slate-800">{value.backupSync.backupLocation ?? "Not configured"}</p>
              <p className="mt-1 text-xs text-slate-500">Last backup: {value.backupSync.lastBackupLabel ?? "Never"}</p>
            </div>
            <p className="text-xs text-slate-500">
              Includes evidence files: {value.backupSync.includeEvidenceFiles ? "Yes" : "No"} · audit snapshots:{" "}
              {value.backupSync.includeAuditSnapshots ? "Yes" : "No"}
            </p>
          </div>
        </article>
      </div>

      <ChangeStorageLocationModal
        open={pathModalKey !== null}
        pathKey={pathModalKey}
        value={value}
        onClose={() => setPathModalKey(null)}
        onConfirm={({ key, newPath, migration }) => {
          const err = validateStoragePath(newPath);
          if (err) return;
          onChange({
            ...value,
            paths: { ...value.paths, [key]: newPath },
          });
          setBanner(
            `Updated ${key === "projectDataPath" ? "Project data" : key === "evidenceFilesPath" ? "Evidence" : key === "exportPackagesPath" ? "Exports" : "Cache"} path. Migration: ${migration === "migrate_asap" ? "scheduled" : "references only"} (local preview).`,
          );
        }}
      />

      <ClearCacheConfirmModal
        open={clearCacheOpen}
        value={value}
        onClose={() => setClearCacheOpen(false)}
        onConfirm={() => {
          const freed = value.usage.cacheBytes;
          onChange({
            ...value,
            usage: {
              ...value.usage,
              usedBytes: Math.max(0, value.usage.usedBytes - freed),
              cacheBytes: 0,
            },
          });
          setBanner(`Cache cleared (simulated). Freed about ${formatBytes(freed)}.`);
        }}
      />

      <RunStorageCleanupModal
        open={cleanupOpen}
        value={value}
        onClose={() => setCleanupOpen(false)}
        onConfirm={() => {
          const recover = Math.min(
            value.usage.usedBytes * 0.12 + value.usage.evidenceBytes * 0.04,
            400 * 1024 * 1024,
          );
          const recoverInt = Math.floor(recover);
          onChange({
            ...value,
            usage: {
              ...value.usage,
              usedBytes: Math.max(0, value.usage.usedBytes - recoverInt),
              evidenceBytes: Math.floor(value.usage.evidenceBytes * 0.95),
            },
          });
          setBanner(`Cleanup completed (simulated). Reclaimed about ${formatBytes(recoverInt)}.`);
        }}
      />

      <BackupConfigurationDrawer
        open={backupDrawerOpen}
        value={value}
        onClose={() => setBackupDrawerOpen(false)}
        onSave={(nextBackup) => {
          onChange({
            ...value,
            backupSync: nextBackup,
          });
          setBanner("Backup settings saved in draft — use Save in the bar below to persist.");
        }}
      />

      <RestoreBackupWizard open={restoreOpen} onClose={() => setRestoreOpen(false)} />
    </section>
  );
}
