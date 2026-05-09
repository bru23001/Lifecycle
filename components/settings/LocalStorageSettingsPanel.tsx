"use client";

import { formatBytes, SectionHeader, ToggleRow } from "@/components/settings/shared";
import type { LocalStorageSettings } from "@/types/settings.types";

export function LocalStorageSettingsPanel({
  value,
  pathError,
  onChange,
  onChangePath,
}: {
  value: LocalStorageSettings;
  pathError: string | null;
  onChange: (nextValue: LocalStorageSettings) => void;
  onChangePath: (key: keyof LocalStorageSettings["paths"]) => void;
}) {
  const usagePercent = value.usage.quotaBytes
    ? Math.min(100, Math.round((value.usage.usedBytes / value.usage.quotaBytes) * 100))
    : 0;

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <SectionHeader
        title="Local Storage Settings"
        description="Configure local project storage, retention behavior, and backup/sync preferences."
        actionLabel="Change Storage Location"
        onActionClick={() => onChangePath("projectDataPath")}
      />

      {pathError ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {pathError}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Storage Paths</h3>
          <div className="mt-2 space-y-2 text-sm">
            {(
              [
                ["projectDataPath", "Project Data Path"],
                ["evidenceFilesPath", "Evidence Files Path"],
                ["exportPackagesPath", "Export Packages Path"],
                ["cachePath", "Cache Path"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="text-sm text-slate-700">{value.paths[key]}</p>
                </div>
                <button
                  type="button"
                  className="rounded border border-slate-200 px-2 py-1 text-xs"
                  onClick={() => onChangePath(key)}
                >
                  Change
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Storage Usage</h3>
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Used Space</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatBytes(value.usage.usedBytes)} / {formatBytes(value.usage.quotaBytes ?? value.usage.availableBytes)}
            </p>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-xs text-slate-500">Cache Size</p>
              <p className="font-semibold text-slate-800">{formatBytes(value.usage.cacheBytes)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="text-xs text-slate-500">Evidence Size</p>
              <p className="font-semibold text-slate-800">{formatBytes(value.usage.evidenceBytes)}</p>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Retention Rules</h3>
          <div className="mt-2 space-y-2 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Keep Drafts (days)</span>
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
              <span className="mb-1 block text-xs font-semibold text-slate-500">Keep Export Packages (days)</span>
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
              <span className="mb-1 block text-xs font-semibold text-slate-500">Cleanup Policy</span>
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
          <h3 className="text-sm font-semibold text-slate-900">Backup & Sync</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow
              label="Auto Backup"
              checked={value.backupSync.autoBackupEnabled}
              onChange={(checked) =>
                onChange({
                  ...value,
                  backupSync: {
                    ...value.backupSync,
                    autoBackupEnabled: checked,
                  },
                })
              }
            />
            <ToggleRow
              label="Sync Enabled"
              checked={value.backupSync.syncEnabled}
              onChange={(checked) =>
                onChange({
                  ...value,
                  backupSync: {
                    ...value.backupSync,
                    syncEnabled: checked,
                  },
                })
              }
            />
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <p className="text-xs text-slate-500">Backup Location</p>
              <p className="font-semibold text-slate-800">{value.backupSync.backupLocation ?? "Not configured"}</p>
              <p className="mt-1 text-xs text-slate-500">Last backup: {value.backupSync.lastBackupLabel ?? "Never"}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
