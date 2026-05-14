"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportEvidenceBundle } from "@/lib/evidence-export";
import type { ExportFullEvidenceBundleOptions } from "@/lib/evidence-export";
import type { EvidenceCenterData } from "@/types/evidence-center.types";

function buildOpts(args: {
  manifest: boolean;
  traceability: boolean;
  checksums: boolean;
  redactRestricted: boolean;
  includeGateDecisionRecord?: boolean;
}): ExportFullEvidenceBundleOptions {
  const t = args.traceability;
  return {
    includeFiles: true,
    includeManifest: args.manifest,
    includePhaseMappings: t,
    includeGateMappings: t,
    includeArtifactMappings: t,
    includeChecksums: args.checksums,
    includeAuditManifest: false,
    redactRestricted: args.redactRestricted,
    includeGateDecisionRecord: args.includeGateDecisionRecord ?? false,
  };
}

function useDialogOpen(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);
  return { ref, onClose };
}

export function ExportSelectedEvidenceModal({
  open,
  data,
  selectedIds,
  onClose,
  onExportResult,
}: {
  open: boolean;
  data: EvidenceCenterData;
  selectedIds: string[];
  onClose: () => void;
  onExportResult: (message: string | null) => void;
}) {
  const { ref, onClose: handleClose } = useDialogOpen(open, onClose);
  const [includeManifest, setIncludeManifest] = useState(true);
  const [includeTraceability, setIncludeTraceability] = useState(true);
  const [includeChecksums, setIncludeChecksums] = useState(true);
  const [redactRestricted, setRedactRestricted] = useState(false);
  const [busy, setBusy] = useState(false);

  const preview = data.evidenceItems.filter((e) => selectedIds.includes(e.id));
  const n = preview.length;

  const run = async () => {
    if (selectedIds.length === 0) {
      onExportResult("Select at least one evidence item.");
      return;
    }
    setBusy(true);
    onExportResult(null);
    try {
      await exportEvidenceBundle(
        data,
        "selected",
        selectedIds,
        buildOpts({
          manifest: includeManifest,
          traceability: includeTraceability,
          checksums: includeChecksums,
          redactRestricted,
        }),
      );
      onClose();
    } catch (e) {
      onExportResult(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      className="w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-selected-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div>
            <h2 id="export-selected-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Export selected evidence
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {n} item{n === 1 ? "" : "s"} selected · JSON download (ZIP not available in this build)
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Confidential and restricted rows follow export redaction rules. Review recipients before sharing outside the
            trust boundary.
          </p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
              {preview.length === 0 ? (
                <li className="text-slate-500">No items in export selection.</li>
              ) : (
                preview.map((e) => (
                  <li key={e.id} className="truncate">
                    <span className="font-medium text-slate-800">{e.evidenceCode}</span> · {e.name}
                  </li>
                ))
              )}
            </ul>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeManifest} onChange={(ev) => setIncludeManifest(ev.target.checked)} />
            Include metadata manifest
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeTraceability}
              onChange={(ev) => setIncludeTraceability(ev.target.checked)}
            />
            Include traceability (phase, gate, and artifact mapping flags in bundle options)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeChecksums} onChange={(ev) => setIncludeChecksums(ev.target.checked)} />
            Include checksums
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={redactRestricted} onChange={(ev) => setRedactRestricted(ev.target.checked)} />
            Redact restricted fields
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={busy || n === 0} onClick={() => void run()}>
            {busy ? "Exporting…" : "Export JSON"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function ExportByGateEvidenceModal({
  open,
  data,
  onClose,
  onExportResult,
}: {
  open: boolean;
  data: EvidenceCenterData;
  onClose: () => void;
  onExportResult: (message: string | null) => void;
}) {
  const { ref, onClose: handleClose } = useDialogOpen(open, onClose);
  const [gateCode, setGateCode] = useState(data.evidenceByGate[0]?.gateCode ?? "G1");
  const [includeManifest, setIncludeManifest] = useState(true);
  const [includeTraceability, setIncludeTraceability] = useState(true);
  const [includeChecksums, setIncludeChecksums] = useState(true);
  const [includeGateDecisionRecord, setIncludeGateDecisionRecord] = useState(true);
  const [redactRestricted, setRedactRestricted] = useState(false);
  const [busy, setBusy] = useState(false);

  const row = data.evidenceByGate.find((g) => g.gateCode === gateCode) ?? data.evidenceByGate[0];
  const missing = row ? Math.max(0, row.requiredEvidence - row.evidenceLinked) : 0;

  const run = async () => {
    if (data.evidenceByGate.length === 0) {
      onExportResult("No gate coverage rows available.");
      return;
    }
    setBusy(true);
    onExportResult(null);
    try {
      await exportEvidenceBundle(
        data,
        "gate",
        [],
        buildOpts({
          manifest: includeManifest,
          traceability: includeTraceability,
          checksums: includeChecksums,
          redactRestricted,
          includeGateDecisionRecord,
        }),
        { gateCode },
      );
      onClose();
    } catch (e) {
      onExportResult(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      className="w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-gate-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div>
            <h2 id="export-gate-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Export evidence by gate
            </h2>
            <p className="mt-1 text-xs text-slate-500">JSON bundle scoped to the selected gate</p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <label className="block text-xs font-semibold text-slate-500">
            Gate
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              value={gateCode}
              onChange={(ev) => setGateCode(ev.target.value)}
            >
              {data.evidenceByGate.map((g) => (
                <option key={g.gateId} value={g.gateCode}>
                  {g.gateCode} — {g.gateName}
                </option>
              ))}
            </select>
          </label>
          {row ? (
            <dl className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Linked</dt>
                <dd className="font-medium text-slate-900">{row.evidenceLinked}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Required</dt>
                <dd className="font-medium text-slate-900">{row.requiredEvidence}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Coverage</dt>
                <dd className="font-medium text-slate-900">{row.coveragePercent}%</dd>
              </div>
            </dl>
          ) : null}
          {missing > 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {missing} evidence slot{missing === 1 ? "" : "s"} still open for this gate — export is allowed for audit
              snapshots.
            </p>
          ) : null}
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeManifest} onChange={(ev) => setIncludeManifest(ev.target.checked)} />
            Include metadata manifest
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeTraceability}
              onChange={(ev) => setIncludeTraceability(ev.target.checked)}
            />
            Include traceability mapping flags
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeChecksums} onChange={(ev) => setIncludeChecksums(ev.target.checked)} />
            Include checksums
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeGateDecisionRecord}
              onChange={(ev) => setIncludeGateDecisionRecord(ev.target.checked)}
            />
            Include gate decision record (immutable decisions for this gate)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={redactRestricted} onChange={(ev) => setRedactRestricted(ev.target.checked)} />
            Redact restricted fields
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={busy} onClick={() => void run()}>
            {busy ? "Exporting…" : "Export JSON"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function ExportByPhaseEvidenceModal({
  open,
  data,
  onClose,
  onExportResult,
}: {
  open: boolean;
  data: EvidenceCenterData;
  onClose: () => void;
  onExportResult: (message: string | null) => void;
}) {
  const { ref, onClose: handleClose } = useDialogOpen(open, onClose);
  const [phaseNumber, setPhaseNumber] = useState(1);
  const [includeManifest, setIncludeManifest] = useState(true);
  const [includeTraceability, setIncludeTraceability] = useState(true);
  const [includeChecksums, setIncludeChecksums] = useState(true);
  const [includeArtifacts, setIncludeArtifacts] = useState(true);
  const [redactRestricted, setRedactRestricted] = useState(false);
  const [busy, setBusy] = useState(false);

  const row = data.evidenceByPhase.find((p) => p.phaseNumber === phaseNumber) ?? data.evidenceByPhase[0];
  const missing = row ? Math.max(0, row.requiredEvidence - row.evidenceItems) : 0;

  const run = async () => {
    setBusy(true);
    onExportResult(null);
    try {
      await exportEvidenceBundle(
        data,
        "phase",
        [],
        {
          includeFiles: true,
          includeManifest: includeManifest,
          includePhaseMappings: includeTraceability,
          includeGateMappings: includeTraceability,
          includeArtifactMappings: includeArtifacts,
          includeChecksums: includeChecksums,
          includeAuditManifest: false,
          redactRestricted,
          includeGateDecisionRecord: false,
        },
        undefined,
        { phaseNumber },
      );
      onClose();
    } catch (e) {
      onExportResult(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      className="w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-phase-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div>
            <h2 id="export-phase-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Export evidence by phase
            </h2>
            <p className="mt-1 text-xs text-slate-500">JSON bundle scoped to the selected lifecycle phase</p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <label className="block text-xs font-semibold text-slate-500">
            Phase
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              value={String(phaseNumber)}
              onChange={(ev) => setPhaseNumber(Number.parseInt(ev.target.value, 10))}
            >
              {data.evidenceByPhase.map((p) => (
                <option key={p.phaseId} value={String(p.phaseNumber)}>
                  {p.phaseNumber}. {p.phaseName}
                </option>
              ))}
            </select>
          </label>
          {row ? (
            <dl className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Linked evidence rows</dt>
                <dd className="font-medium text-slate-900">{row.evidenceItems}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Required (templates)</dt>
                <dd className="font-medium text-slate-900">{row.requiredEvidence}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Coverage</dt>
                <dd className="font-medium text-slate-900">{row.coveragePercent}%</dd>
              </div>
            </dl>
          ) : null}
          {missing > 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {missing} open slot{missing === 1 ? "" : "s"} for this phase — export is still available for audit use.
            </p>
          ) : null}
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeManifest} onChange={(ev) => setIncludeManifest(ev.target.checked)} />
            Include metadata manifest
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={includeTraceability}
              onChange={(ev) => setIncludeTraceability(ev.target.checked)}
            />
            Include traceability mapping flags
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeArtifacts} onChange={(ev) => setIncludeArtifacts(ev.target.checked)} />
            Include linked artifacts (artifact mapping list in JSON when items exist)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={includeChecksums} onChange={(ev) => setIncludeChecksums(ev.target.checked)} />
            Include checksums
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={redactRestricted} onChange={(ev) => setRedactRestricted(ev.target.checked)} />
            Redact restricted fields
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={busy} onClick={() => void run()}>
            {busy ? "Exporting…" : "Export JSON"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
