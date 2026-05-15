"use client";

import { useState } from "react";
import { Edit3, Shield } from "lucide-react";

import {
  DisableExportFormatModal,
  FilenamePatternEditorModal,
  RedactionRulesDrawer,
  TestExportModal,
  previewFilenamePattern,
} from "@/components/settings/export-settings-interactions";
import { ToggleRow } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import { validateExportSettings } from "@/lib/settings-validation";
import type { ExportSettings } from "@/types/settings.types";

export function ExportSettingsPanel({
  value,
  onChange,
}: {
  value: ExportSettings;
  onChange: (nextValue: ExportSettings) => void;
}) {
  const blockers = validateExportSettings(value);

  const [testOpen, setTestOpen] = useState(false);
  const [patternOpen, setPatternOpen] = useState(false);
  const [redactionOpen, setRedactionOpen] = useState(false);
  const [disableFormatKey, setDisableFormatKey] = useState<keyof ExportSettings["formats"] | null>(null);

  const setFormat = (key: keyof ExportSettings["formats"], checked: boolean) => {
    onChange({
      ...value,
      formats: {
        ...value.formats,
        [key]: checked,
      },
    });
  };

  const requestFormatChange = (key: keyof ExportSettings["formats"], checked: boolean) => {
    if (!checked && value.formats[key]) {
      setDisableFormatKey(key);
      return;
    }
    setFormat(key, checked);
  };

  const setPackageRule = (key: keyof ExportSettings["packageRules"], checked: boolean) => {
    onChange({
      ...value,
      packageRules: {
        ...value.packageRules,
        [key]: checked,
      },
    });
  };

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-900">Export Settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Configure export formats, package contents, redaction rules, and naming standards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setTestOpen(true)}>
            <Edit3 className="size-3.5" aria-hidden />
            Test export
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setPatternOpen(true)}>
            Filename pattern
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setRedactionOpen(true)}>
            <Shield className="size-3.5" aria-hidden />
            Redaction rules
          </Button>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Export formats</h3>
          <p className="mt-1 text-xs text-slate-500">Disabling a format that is in use requires confirmation.</p>
          <div className="mt-2 space-y-2">
            <ToggleRow label="Markdown" checked={value.formats.markdown} onChange={(c) => requestFormatChange("markdown", c)} />
            <ToggleRow label="JSON evidence" checked={value.formats.jsonEvidence} onChange={(c) => requestFormatChange("jsonEvidence", c)} />
            <ToggleRow label="PDF reports" checked={value.formats.pdf} onChange={(c) => requestFormatChange("pdf", c)} />
            <ToggleRow label="CSV reports" checked={value.formats.csv} onChange={(c) => requestFormatChange("csv", c)} />
            <ToggleRow label="ZIP packages" checked={value.formats.zip} onChange={(c) => requestFormatChange("zip", c)} />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Package rules</h3>
          <p className="mt-1 text-xs text-slate-500">Redaction is configured from the Redaction rules drawer.</p>
          <div className="mt-2 space-y-2">
            <ToggleRow label="Include artifacts" checked={value.packageRules.includeArtifacts} onChange={(c) => setPackageRule("includeArtifacts", c)} />
            <ToggleRow label="Include evidence files" checked={value.packageRules.includeEvidenceFiles} onChange={(c) => setPackageRule("includeEvidenceFiles", c)} />
            <ToggleRow label="Include gate decisions" checked={value.packageRules.includeGateDecisions} onChange={(c) => setPackageRule("includeGateDecisions", c)} />
            <ToggleRow label="Include approval records" checked={value.packageRules.includeApprovalRecords} onChange={(c) => setPackageRule("includeApprovalRecords", c)} />
            <ToggleRow label="Include traceability links" checked={value.packageRules.includeTraceabilityLinks} onChange={(c) => setPackageRule("includeTraceabilityLinks", c)} />
            <ToggleRow label="Include audit manifest" checked={value.packageRules.includeAuditManifest} onChange={(c) => setPackageRule("includeAuditManifest", c)} />
            <ToggleRow label="Generate checksums" checked={value.packageRules.generateChecksums} onChange={(c) => setPackageRule("generateChecksums", c)} />
          </div>
          <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Restricted-field redaction:{" "}
            <span className="font-semibold text-slate-900">{value.packageRules.redactRestrictedFields ? "On" : "Off"}</span>
            {" · "}
            <button type="button" className="text-blue-600 underline hover:text-blue-800" onClick={() => setRedactionOpen(true)}>
              Configure
            </button>
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Naming rules</h3>
          <p className="mt-1 text-xs text-slate-600">Filename tokens are edited in the pattern modal; other options stay inline.</p>
          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-xs font-semibold text-slate-500">Filename pattern</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-900">{value.namingRules.filenamePattern}</p>
              <p className="mt-1 text-xs text-slate-500">Preview: {previewFilenamePattern(value.namingRules.filenamePattern)}</p>
            </div>
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-slate-500">Date format</span>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                value={value.namingRules.dateFormat}
                onChange={(event) =>
                  onChange({
                    ...value,
                    namingRules: {
                      ...value.namingRules,
                      dateFormat: event.target.value,
                    },
                  })
                }
              />
            </label>
            <ToggleRow
              label="Project code prefix"
              checked={value.namingRules.projectCodePrefix}
              onChange={(checked) =>
                onChange({
                  ...value,
                  namingRules: {
                    ...value.namingRules,
                    projectCodePrefix: checked,
                  },
                })
              }
            />
            <ToggleRow
              label="Version suffix"
              checked={value.namingRules.versionSuffix}
              onChange={(checked) =>
                onChange({
                  ...value,
                  namingRules: {
                    ...value.namingRules,
                    versionSuffix: checked,
                  },
                })
              }
            />
          </div>
        </article>
      </div>

      {blockers.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <p className="font-semibold">Validation warnings</p>
          <ul className="mt-1 list-disc pl-5">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <TestExportModal open={testOpen} onClose={() => setTestOpen(false)} value={value} />
      <FilenamePatternEditorModal
        open={patternOpen}
        onClose={() => setPatternOpen(false)}
        initialPattern={value.namingRules.filenamePattern}
        onSave={(pattern) =>
          onChange({
            ...value,
            namingRules: { ...value.namingRules, filenamePattern: pattern },
          })
        }
      />
      <RedactionRulesDrawer
        open={redactionOpen}
        onClose={() => setRedactionOpen(false)}
        initial={value.redactionRules}
        redactRestrictedFields={value.packageRules.redactRestrictedFields}
        onSave={({ rules, redactRestrictedFields }) =>
          onChange({
            ...value,
            redactionRules: rules,
            packageRules: {
              ...value.packageRules,
              redactRestrictedFields,
            },
          })
        }
      />
      <DisableExportFormatModal
        open={disableFormatKey !== null}
        formatKey={disableFormatKey}
        onClose={() => setDisableFormatKey(null)}
        onConfirmDisable={() => {
          if (disableFormatKey) {
            const key = disableFormatKey;
            setFormat(key, false);
          }
          setDisableFormatKey(null);
        }}
      />
    </section>
  );
}
