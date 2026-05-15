"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToggleRow } from "@/components/settings/shared";
import { validateExportSettings } from "@/lib/settings-validation";
import { cn } from "@/lib/utils";
import type { ExportRedactionRules, ExportSettings } from "@/types/settings.types";

const FILENAME_TOKENS: { token: string; label: string }[] = [
  { token: "{projectCode}", label: "Project code" },
  { token: "{templateId}", label: "Template id" },
  { token: "{version}", label: "Version" },
  { token: "{phaseNumber}", label: "Phase number" },
  { token: "{gateCode}", label: "Gate code" },
  { token: "{date}", label: "Date" },
];

export function previewFilenamePattern(pattern: string): string {
  return pattern
    .replaceAll("{projectCode}", "PRJ-2024-ODIN")
    .replaceAll("{templateId}", "TMP-Lifecycle-Report")
    .replaceAll("{version}", "v3")
    .replaceAll("{phaseNumber}", "2")
    .replaceAll("{gateCode}", "GATE-REQ")
    .replaceAll("{date}", "2026-05-14");
}

const FORMAT_LABELS: Record<keyof ExportSettings["formats"], string> = {
  markdown: "Markdown",
  jsonEvidence: "JSON evidence",
  pdf: "PDF",
  csv: "CSV",
  zip: "ZIP",
};

/** Heuristic “usage” copy for disable-format confirmation (local demo data). */
export function formatDisableImpact(key: keyof ExportSettings["formats"]): { reports: number; packages: number } {
  const map: Record<keyof ExportSettings["formats"], { reports: number; packages: number }> = {
    markdown: { reports: 4, packages: 2 },
    jsonEvidence: { reports: 1, packages: 5 },
    pdf: { reports: 3, packages: 1 },
    csv: { reports: 2, packages: 3 },
    zip: { reports: 0, packages: 6 },
  };
  return map[key];
}

function packageRulesSummary(value: ExportSettings): string[] {
  const p = value.packageRules;
  const lines: string[] = [];
  if (p.includeArtifacts) lines.push("Include artifacts");
  if (p.includeEvidenceFiles) lines.push("Include evidence files");
  if (p.includeGateDecisions) lines.push("Include gate decisions");
  if (p.includeApprovalRecords) lines.push("Include approval records");
  if (p.includeTraceabilityLinks) lines.push("Include traceability links");
  if (p.includeAuditManifest) lines.push("Include audit manifest");
  if (p.generateChecksums) lines.push("Generate checksums");
  if (p.redactRestrictedFields) lines.push("Redact restricted fields");
  return lines.length ? lines : ["(no package inclusions selected)"];
}

function enabledFormatLabels(value: ExportSettings): string {
  return (Object.entries(value.formats) as [keyof ExportSettings["formats"], boolean][])
    .filter(([, on]) => on)
    .map(([k]) => FORMAT_LABELS[k])
    .join(", ");
}

export function TestExportModal({
  open,
  onClose,
  value,
}: {
  open: boolean;
  onClose: () => void;
  value: ExportSettings;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [exportType, setExportType] = useState("evidence_bundle");
  const [sampleProject, setSampleProject] = useState("demo-project-saturn");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const validation = useMemo(() => validateExportSettings(value), [value]);
  const validationLabel = validation.length === 0 ? "All checks passed for a test export." : validation.join(" ");

  const downloadSample = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportType,
            sampleProject,
            formats: value.formats,
            packageRules: value.packageRules,
            namingRules: value.namingRules,
            redactionRules: value.redactionRules,
            validationWarnings: validation,
            generatedAt: new Date().toISOString(),
            note: "Sample manifest for local test export — not production data.",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-test-sample-${sampleProject}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="test-export-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="test-export-title" className="text-lg font-semibold text-slate-900">
              Test export
            </h2>
            <p className="mt-1 text-xs text-slate-500">Runs a dry-run using the current settings (no server job).</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Export type</span>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="evidence_bundle">Evidence bundle</option>
              <option value="governance_report">Governance report</option>
              <option value="traceability_matrix">Traceability matrix extract</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Sample project</span>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={sampleProject}
              onChange={(e) => setSampleProject(e.target.value)}
            >
              <option value="demo-project-saturn">ACC-DEMO-SATURN (sample)</option>
              <option value="demo-project-lyra">ACC-DEMO-LYRA (sample)</option>
              <option value="empty-sandbox">Empty sandbox workspace</option>
            </select>
          </label>
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">Selected formats</span>
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">{enabledFormatLabels(value)}</p>
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">Package rules preview</span>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {packageRulesSummary(value).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">Validation result</span>
            <p
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                validation.length === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900",
              )}
            >
              {validationLabel}
            </p>
          </div>
        </div>
        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={downloadSample}>
            Download sample
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function FilenamePatternEditorModal({
  open,
  onClose,
  initialPattern,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialPattern: string;
  onSave: (pattern: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pattern, setPattern] = useState(initialPattern);

  useEffect(() => {
    if (open) setPattern(initialPattern);
  }, [open, initialPattern]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const example = previewFilenamePattern(pattern);
  const patternIssues: string[] = [];
  if (!pattern.includes("{projectCode}")) patternIssues.push("Pattern should include {projectCode} for traceability.");
  if (pattern.trim().length < 3) patternIssues.push("Pattern is too short.");

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="filename-pattern-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="filename-pattern-title" className="text-lg font-semibold text-slate-900">
            Filename pattern
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-4 px-5 py-4 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Pattern string</span>
            <input
              type="text"
              className="h-9 w-full rounded-lg border border-slate-200 px-2 font-mono text-sm"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
          </label>
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-500">Available tokens</span>
            <div className="flex flex-wrap gap-2">
              {FILENAME_TOKENS.map(({ token, label }) => (
                <button
                  key={token}
                  type="button"
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-800 hover:bg-slate-100"
                  title={label}
                  onClick={() => setPattern((p) => `${p}${token}`)}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">Example output</span>
            <p className="break-all rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">{example}</p>
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">Validation result</span>
            <p
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                patternIssues.length === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900",
              )}
            >
              {patternIssues.length === 0 ? "Pattern looks usable." : patternIssues.join(" ")}
            </p>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={() => {
              onSave(pattern);
              onClose();
            }}
          >
            Save pattern
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function RedactionRulesDrawer({
  open,
  onClose,
  initial,
  redactRestrictedFields,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: ExportRedactionRules;
  redactRestrictedFields: boolean;
  onSave: (next: { rules: ExportRedactionRules; redactRestrictedFields: boolean }) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ExportRedactionRules>(initial);
  const [masterRedact, setMasterRedact] = useState(redactRestrictedFields);

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setMasterRedact(redactRestrictedFields);
    }
  }, [open, initial, redactRestrictedFields]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const setRule = (key: keyof ExportRedactionRules, checked: boolean) => {
    setDraft((d) => ({ ...d, [key]: checked }));
  };

  const previewLines = useMemo(() => {
    const author = draft.evidenceUploaderIdentity ? "[uploader redacted]" : "j***@example.com";
    const url = draft.restrictInternalUrls ? "[internal URL]" : "https://git.internal/acme/repo";
    const key = draft.restrictApiKeys ? "[API key redacted]" : "sk_live_****";
    return { author, url, key };
  }, [draft]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
      aria-labelledby="redaction-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Export privacy</p>
            <h2 id="redaction-drawer-title" className="mt-1 text-lg font-semibold text-slate-900">
              Redaction rules
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5 text-sm">
          <ToggleRow label="Redact restricted fields (master)" checked={masterRedact} onChange={setMasterRedact} />

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Restricted fields</h3>
            <div className="mt-2 space-y-2">
              <ToggleRow label="API keys & tokens" checked={draft.restrictApiKeys} onChange={(c) => setRule("restrictApiKeys", c)} />
              <ToggleRow label="Internal URLs" checked={draft.restrictInternalUrls} onChange={(c) => setRule("restrictInternalUrls", c)} />
              <ToggleRow label="Financial / cost codes" checked={draft.restrictFinancialCodes} onChange={(c) => setRule("restrictFinancialCodes", c)} />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">PII fields</h3>
            <div className="mt-2 space-y-2">
              <ToggleRow label="Email addresses" checked={draft.piiEmails} onChange={(c) => setRule("piiEmails", c)} />
              <ToggleRow label="Phone numbers" checked={draft.piiPhones} onChange={(c) => setRule("piiPhones", c)} />
              <ToggleRow label="Person names" checked={draft.piiNames} onChange={(c) => setRule("piiNames", c)} />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Evidence metadata</h3>
            <div className="mt-2 space-y-2">
              <ToggleRow label="Uploader identity" checked={draft.evidenceUploaderIdentity} onChange={(c) => setRule("evidenceUploaderIdentity", c)} />
              <ToggleRow label="Location hints" checked={draft.evidenceLocationHints} onChange={(c) => setRule("evidenceLocationHints", c)} />
              <ToggleRow label="Device fingerprints" checked={draft.evidenceDeviceFingerprints} onChange={(c) => setRule("evidenceDeviceFingerprints", c)} />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Export-specific rules</h3>
            <div className="mt-2 space-y-2">
              <ToggleRow label="Strip wiki-style markup" checked={draft.exportStripWikiMarkup} onChange={(c) => setRule("exportStripWikiMarkup", c)} />
              <ToggleRow label="Collapse timestamps to date only" checked={draft.exportCollapseTimestamps} onChange={(c) => setRule("exportCollapseTimestamps", c)} />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Preview redaction</h3>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-xs text-slate-800">
              {`uploader: ${previewLines.author}\nrepo: ${previewLines.url}\nsecret: ${previewLines.key}`}
            </pre>
          </section>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            onClick={() => {
              onSave({
                rules: draft,
                redactRestrictedFields: masterRedact,
              });
              onClose();
            }}
          >
            Save rules
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function DisableExportFormatModal({
  open,
  formatKey,
  onClose,
  onConfirmDisable,
}: {
  open: boolean;
  formatKey: keyof ExportSettings["formats"] | null;
  onClose: () => void;
  onConfirmDisable: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && formatKey) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, formatKey]);

  if (!formatKey) return null;
  const label = FORMAT_LABELS[formatKey];
  const impact = formatDisableImpact(formatKey);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="disable-format-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="disable-format-title" className="text-lg font-semibold text-slate-900">
            Disable export format?
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Format affected:</span> {label}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Reports / packages affected (estimated):</span>{" "}
            {impact.reports} scheduled or default reports, {impact.packages} package templates referencing this format.
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            Disabling may break automations that assume this format is available. You can re-enable it later from the same
            screen.
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
              onConfirmDisable();
              onClose();
            }}
          >
            Disable
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
