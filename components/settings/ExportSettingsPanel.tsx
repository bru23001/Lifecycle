"use client";

import { SectionHeader, ToggleRow } from "@/components/settings/shared";
import { validateExportSettings } from "@/lib/settings-validation";
import type { ExportSettings } from "@/types/settings.types";

export function ExportSettingsPanel({
  value,
  onChange,
  onTestExport,
}: {
  value: ExportSettings;
  onChange: (nextValue: ExportSettings) => void;
  onTestExport: () => void;
}) {
  const blockers = validateExportSettings(value);

  const setFormat = (key: keyof ExportSettings["formats"], checked: boolean) => {
    onChange({
      ...value,
      formats: {
        ...value.formats,
        [key]: checked,
      },
    });
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
      <SectionHeader
        title="Export Settings"
        description="Configure export formats, package contents, redaction rules, and naming standards."
        actionLabel="Test Export"
        onActionClick={onTestExport}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Export Formats</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow label="Markdown Enabled" checked={value.formats.markdown} onChange={(checked) => setFormat("markdown", checked)} />
            <ToggleRow label="JSON Evidence Enabled" checked={value.formats.jsonEvidence} onChange={(checked) => setFormat("jsonEvidence", checked)} />
            <ToggleRow label="PDF Reports Enabled" checked={value.formats.pdf} onChange={(checked) => setFormat("pdf", checked)} />
            <ToggleRow label="CSV Reports Enabled" checked={value.formats.csv} onChange={(checked) => setFormat("csv", checked)} />
            <ToggleRow label="ZIP Packages Enabled" checked={value.formats.zip} onChange={(checked) => setFormat("zip", checked)} />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Package Rules</h3>
          <div className="mt-2 space-y-2">
            <ToggleRow label="Include Artifacts" checked={value.packageRules.includeArtifacts} onChange={(checked) => setPackageRule("includeArtifacts", checked)} />
            <ToggleRow label="Include Evidence Files" checked={value.packageRules.includeEvidenceFiles} onChange={(checked) => setPackageRule("includeEvidenceFiles", checked)} />
            <ToggleRow label="Include Gate Decisions" checked={value.packageRules.includeGateDecisions} onChange={(checked) => setPackageRule("includeGateDecisions", checked)} />
            <ToggleRow label="Include Approval Records" checked={value.packageRules.includeApprovalRecords} onChange={(checked) => setPackageRule("includeApprovalRecords", checked)} />
            <ToggleRow label="Include Traceability Links" checked={value.packageRules.includeTraceabilityLinks} onChange={(checked) => setPackageRule("includeTraceabilityLinks", checked)} />
            <ToggleRow label="Include Audit Manifest" checked={value.packageRules.includeAuditManifest} onChange={(checked) => setPackageRule("includeAuditManifest", checked)} />
            <ToggleRow label="Generate Checksums" checked={value.packageRules.generateChecksums} onChange={(checked) => setPackageRule("generateChecksums", checked)} />
            <ToggleRow label="Redact Restricted Fields" checked={value.packageRules.redactRestrictedFields} onChange={(checked) => setPackageRule("redactRestrictedFields", checked)} />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Naming Rules</h3>
          <div className="mt-2 space-y-2">
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-slate-500">Filename Pattern</span>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                value={value.namingRules.filenamePattern}
                onChange={(event) =>
                  onChange({
                    ...value,
                    namingRules: {
                      ...value.namingRules,
                      filenamePattern: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-slate-500">Date Format</span>
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
              label="Project Code Prefix"
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
              label="Version Suffix"
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
    </section>
  );
}
