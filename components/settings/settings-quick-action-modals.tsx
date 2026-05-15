"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SettingsValidationReport } from "@/lib/settings-validation";
import { cn } from "@/lib/utils";
import type { GateRuleSetting, RolePermissionSetting, SettingsPageData, TemplateRegistryItem } from "@/types/settings.types";

const SECTION_LABELS: Record<string, string> = {
  lifecycle_configuration: "Lifecycle configuration",
  template_registry: "Template registry",
  gate_rules: "Gate rules",
  roles_permissions: "Roles / permissions",
  export_settings: "Export settings",
  local_storage_settings: "Local storage",
};

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type ImportPayload = Partial<
  Pick<
    SettingsPageData,
    | "lifecycleConfiguration"
    | "templateRegistry"
    | "gateRules"
    | "rolesPermissions"
    | "exportSettings"
    | "localStorageSettings"
  >
>;

function extractRawImportPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if ("data" in o && typeof o.data === "object" && o.data !== null) {
    return o.data as Record<string, unknown>;
  }
  return o;
}

function schemaLooksImportable(raw: Record<string, unknown>): { ok: boolean; message: string } {
  const keys = [
    "lifecycleConfiguration",
    "templateRegistry",
    "gateRules",
    "rolesPermissions",
    "exportSettings",
    "localStorageSettings",
  ];
  const found = keys.filter((k) => k in raw && raw[k] !== undefined);
  if (found.length === 0) {
    return { ok: false, message: "No recognized settings sections found. Expected keys like lifecycleConfiguration or templateRegistry." };
  }
  return { ok: true, message: `Found: ${found.join(", ")}` };
}

function buildImportPayload(raw: Record<string, unknown>, include: Record<string, boolean>): ImportPayload {
  const out: ImportPayload = {};
  if (include.lifecycle && raw.lifecycleConfiguration) {
    out.lifecycleConfiguration = raw.lifecycleConfiguration as SettingsPageData["lifecycleConfiguration"];
  }
  if (include.templates && Array.isArray(raw.templateRegistry)) {
    out.templateRegistry = raw.templateRegistry as TemplateRegistryItem[];
  }
  if (include.gates && Array.isArray(raw.gateRules)) {
    out.gateRules = raw.gateRules as GateRuleSetting[];
  }
  if (include.roles && Array.isArray(raw.rolesPermissions)) {
    out.rolesPermissions = raw.rolesPermissions as RolePermissionSetting[];
  }
  if (include.export && raw.exportSettings) {
    out.exportSettings = raw.exportSettings as SettingsPageData["exportSettings"];
  }
  if (include.storage && raw.localStorageSettings) {
    out.localStorageSettings = raw.localStorageSettings as SettingsPageData["localStorageSettings"];
  }
  return out;
}

function detectImportConflicts(
  current: SettingsPageData,
  raw: Record<string, unknown>,
): string[] {
  const lines: string[] = [];
  const templates = raw.templateRegistry;
  if (Array.isArray(templates)) {
    for (const t of templates) {
      if (!t || typeof t !== "object") continue;
      const code = (t as { templateCode?: string }).templateCode;
      if (!code) continue;
      const existing = current.templateRegistry.find((x) => x.templateCode === code);
      if (existing && (t as { schemaVersion?: string }).schemaVersion !== existing.schemaVersion) {
        lines.push(`Template ${code}: schema version differs (${existing.schemaVersion} → ${(t as { schemaVersion?: string }).schemaVersion}).`);
      }
    }
  }
  const gates = raw.gateRules;
  if (Array.isArray(gates)) {
    for (const g of gates) {
      if (!g || typeof g !== "object") continue;
      const code = (g as { gateCode?: string }).gateCode;
      if (!code) continue;
      const existing = current.gateRules.find((x) => x.gateCode === code);
      if (existing && JSON.stringify((g as { requiredApproverRoles?: string[] }).requiredApproverRoles) !== JSON.stringify(existing.requiredApproverRoles)) {
        lines.push(`Gate ${code}: approver roles differ from current workspace.`);
      }
    }
  }
  const roles = raw.rolesPermissions;
  if (Array.isArray(roles)) {
    for (const r of roles) {
      if (!r || typeof r !== "object") continue;
      const id = (r as { roleId?: string }).roleId;
      if (!id) continue;
      if (current.rolesPermissions.some((x) => x.roleId === id)) {
        lines.push(`Role ${id}: exists locally — import will merge/replace per server rules.`);
      }
    }
  }
  return lines.slice(0, 12);
}

export function ImportConfigurationWizardModal({
  open,
  currentData,
  onClose,
  onImported,
  onError,
}: {
  open: boolean;
  currentData: SettingsPageData;
  onClose: () => void;
  onImported: (data: SettingsPageData) => void;
  onError: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [rawParsed, setRawParsed] = useState<Record<string, unknown> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [include, setInclude] = useState({
    lifecycle: true,
    templates: true,
    gates: true,
    roles: true,
    export: true,
    storage: true,
  });
  const [busy, setBusy] = useState(false);

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
    if (!open) {
      setStep(0);
      setRawParsed(null);
      setParseError(null);
      setInclude({ lifecycle: true, templates: true, gates: true, roles: true, export: true, storage: true });
      setBusy(false);
    }
  }, [open]);

  const schema = useMemo(() => (rawParsed ? schemaLooksImportable(rawParsed) : null), [rawParsed]);
  const conflicts = useMemo(() => (rawParsed ? detectImportConflicts(currentData, rawParsed) : []), [currentData, rawParsed]);

  const previewPayload = useMemo(() => {
    if (!rawParsed) return null;
    return buildImportPayload(rawParsed, include);
  }, [rawParsed, include]);

  const runImport = async () => {
    if (!previewPayload || Object.keys(previewPayload).length === 0) {
      onError("Select at least one section to import.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/settings/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          payload: previewPayload,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string; blockers?: string[] };
        onError(body.error ?? body.blockers?.join(" ") ?? "Import rejected.");
        return;
      }
      const payload = (await response.json()) as { data: SettingsPageData };
      onImported(payload.data);
      onClose();
    } catch {
      onError("Import request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="import-wizard-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="import-wizard-title" className="text-lg font-semibold text-slate-900">
              Import configuration
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Step {step + 1} of 3 · JSON from export or compatible tooling
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          {step === 0 ? (
            <>
              <p>Upload a JSON file. Exports that nest the payload under a top-level <code className="rounded bg-slate-100 px-1">data</code> key are accepted.</p>
              <input
                type="file"
                accept="application/json,.json"
                className="w-full text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const json = JSON.parse(String(reader.result));
                      const extracted = extractRawImportPayload(json);
                      if (!extracted) {
                        setParseError("Invalid JSON object.");
                        setRawParsed(null);
                        return;
                      }
                      setRawParsed(extracted);
                      setParseError(null);
                    } catch {
                      setParseError("Could not parse JSON.");
                      setRawParsed(null);
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              {parseError ? <p className="text-sm text-rose-700">{parseError}</p> : null}
              {schema && !parseError ? (
                <p
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    schema.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900",
                  )}
                >
                  {schema.message}
                </p>
              ) : null}
            </>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-900">Conflict detection</p>
                {conflicts.length === 0 ? (
                  <p className="mt-1 text-slate-600">No high-risk identifier collisions detected beyond normal merge behavior.</p>
                ) : (
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                    {conflicts.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Import mode</p>
                <p className="mt-1 text-xs text-slate-600">
                  Selected sections are sent to the import API and merged with your current workspace. Leave sections unchecked to
                  skip them, or disable the checkbox when that section is missing from the file.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Sections to import</p>
                <div className="mt-2 space-y-2">
                  {(
                    [
                      ["lifecycle", "Lifecycle configuration", "lifecycleConfiguration"],
                      ["templates", "Template registry", "templateRegistry"],
                      ["gates", "Gate rules", "gateRules"],
                      ["roles", "Roles / permissions", "rolesPermissions"],
                      ["export", "Export settings", "exportSettings"],
                      ["storage", "Local storage", "localStorageSettings"],
                    ] as const
                  ).map(([key, label, jsonKey]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={include[key]}
                        disabled={!rawParsed || !(jsonKey in rawParsed)}
                        onChange={(e) => setInclude((s) => ({ ...s, [key]: e.target.checked }))}
                      />
                      <span className={!rawParsed || !(jsonKey in rawParsed) ? "text-slate-400" : ""}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-2">
              <p className="font-semibold text-slate-900">Preview changes</p>
              <pre className="max-h-48 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-2 font-mono text-[11px]">
                {JSON.stringify(previewPayload, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
          ) : null}
          {step < 2 ? (
            <Button
              type="button"
              className="bg-[#2563eb] hover:bg-[#1d4ed8]"
              disabled={
                (step === 0 && (!schema?.ok || !rawParsed)) ||
                (step === 1 && (!previewPayload || Object.keys(previewPayload).length === 0))
              }
              onClick={() => setStep((s) => Math.min(2, s + 1))}
            >
              Next
            </Button>
          ) : (
            <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={busy} onClick={() => void runImport()}>
              {busy ? "Importing…" : "Import"}
            </Button>
          )}
        </footer>
      </div>
    </dialog>
  );
}

export type ExportScope = {
  lifecycle: boolean;
  templates: boolean;
  gates: boolean;
  roles: boolean;
  export: boolean;
  storage: boolean;
};

export function ExportConfigurationModal({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: SettingsPageData;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scope, setScope] = useState<ExportScope>({
    lifecycle: true,
    templates: true,
    gates: true,
    roles: true,
    export: true,
    storage: true,
  });

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const buildExport = () => {
    const out: Record<string, unknown> = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: "lifecycle-platform-settings",
    };
    if (scope.lifecycle) out.lifecycleConfiguration = data.lifecycleConfiguration;
    if (scope.templates) out.templateRegistry = data.templateRegistry;
    if (scope.gates) out.gateRules = data.gateRules;
    if (scope.roles) out.rolesPermissions = data.rolesPermissions;
    if (scope.export) out.exportSettings = data.exportSettings;
    if (scope.storage) out.localStorageSettings = data.localStorageSettings;
    return out;
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="export-config-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="export-config-title" className="text-lg font-semibold text-slate-900">
              Export configuration
            </h2>
            <p className="mt-1 text-xs text-slate-500">Choose sections, then download JSON.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm">
          {(
            [
              ["lifecycle", "Include lifecycle phases"] as const,
              ["templates", "Include templates"],
              ["gates", "Include gate rules"],
              ["roles", "Include roles and permissions"],
              ["export", "Include export settings"],
              ["storage", "Include storage settings"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" checked={scope[key]} onChange={(e) => setScope((s) => ({ ...s, [key]: e.target.checked }))} />
              {label}
            </label>
          ))}
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={() => {
              downloadJson(`settings-export-${new Date().toISOString().slice(0, 10)}.json`, buildExport());
              onClose();
            }}
          >
            Export JSON
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function ResetToDefaultModal({
  open,
  section,
  systemOverview,
  onClose,
  onConfirmReset,
}: {
  open: boolean;
  section: SettingsPageData["activeSection"];
  systemOverview: SettingsPageData["systemOverview"];
  onClose: () => void;
  onConfirmReset: () => boolean | Promise<boolean>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");

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
    if (!open) setTyped("");
  }, [open]);

  const sectionLabel = SECTION_LABELS[section] ?? section;
  const canReset = typed === "RESET";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="reset-default-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="reset-default-title" className="text-lg font-semibold text-rose-900">
            Reset to default?
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Configuration area reset:</span> {sectionLabel}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Workspace signals:</span> {systemOverview.gateCount} gates ·{" "}
            {systemOverview.activeTemplateCount} active templates · {systemOverview.roleCount} roles · usage{" "}
            {systemOverview.localStorageUsageLabel}
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            Export a backup before resetting. Other settings sections stay as-is until you reset them separately.
          </p>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Type RESET to confirm</span>
            <input
              type="text"
              className="h-9 w-full rounded-lg border border-slate-200 px-2 font-mono text-sm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canReset}
            onClick={() => {
              void (async () => {
                const ok = await onConfirmReset();
                if (ok) onClose();
              })();
            }}
          >
            Reset
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function ReportList({ title, items, tone }: { title: string; items: string[]; tone: "slate" | "rose" | "amber" | "emerald" }) {
  const box =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-900"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : tone === "emerald"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-slate-200 bg-slate-50 text-slate-800";
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className={cn("list-disc space-y-1 rounded-lg border px-3 py-2 text-sm", box)}>
        {items.map((item) => (
          <li key={item} className="ml-4">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ValidationResultsDrawer({
  open,
  report,
  onClose,
}: {
  open: boolean;
  report: SettingsValidationReport;
  onClose: () => void;
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
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
      aria-labelledby="validation-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Settings</p>
            <h2 id="validation-drawer-title" className="mt-1 text-lg font-semibold text-slate-900">
              Validation results
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 text-sm">
          <div className={cn("rounded-lg border px-3 py-2", report.valid ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50")}>
            <p className="font-semibold text-slate-900">Summary</p>
            <p className="mt-1 text-slate-800">{report.summary}</p>
          </div>
          <ReportList title="Errors" items={report.errors} tone="rose" />
          <ReportList title="Warnings" items={report.warnings} tone="amber" />
          <ReportList title="Informational" items={report.informational} tone="slate" />
          {report.affectedAreas.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Affected areas</p>
              <div className="flex flex-wrap gap-2">
                {report.affectedAreas.map((a) => (
                  <span key={a} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-800">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <ReportList title="Recommended fixes" items={report.recommendedFixes} tone="emerald" />
        </div>
        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={() => {
              downloadJson(`settings-validation-report-${new Date().toISOString().slice(0, 10)}.json`, report);
            }}
          >
            Export validation report
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
