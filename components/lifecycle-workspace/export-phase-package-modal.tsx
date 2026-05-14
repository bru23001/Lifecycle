"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import JSZip from "jszip";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ToggleKey =
  | "artifacts"
  | "markdown"
  | "jsonEvidence"
  | "evidenceFiles"
  | "validation"
  | "checklist"
  | "traceability";

const DEFAULTS: Record<ToggleKey, boolean> = {
  artifacts: true,
  markdown: true,
  jsonEvidence: true,
  evidenceFiles: true,
  validation: true,
  checklist: true,
  traceability: true,
};

export function ExportPhasePackageModal({
  open,
  exportBase,
  onClose,
}: {
  open: boolean;
  exportBase: Record<string, unknown>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [opts, setOpts] = useState(DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setOpts(DEFAULTS);
      setError(null);
    }
  }, [open]);

  function toggle(k: ToggleKey) {
    setOpts((o) => ({ ...o, [k]: !o[k] }));
  }

  function handleExport() {
    setError(null);
    startTransition(async () => {
      try {
        const zip = new JSZip();
        const root = zip.folder("phase-package");
        if (!root) throw new Error("Could not create archive folder.");

        root.file(
          "export-manifest.json",
          JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              format: "zip",
              options: opts,
            },
            null,
            2,
          ),
        );

        if (opts.artifacts || opts.markdown || opts.jsonEvidence) {
          const core = { ...exportBase };
          if (!opts.artifacts) {
            delete core.requiredArtifacts;
            delete core.completedArtifacts;
          }
          if (!opts.markdown) {
            delete (core as { markdownHint?: string }).markdownHint;
            (core as { markdownNote?: string }).markdownNote =
              "Markdown file export omitted — re-run with “Include Markdown files” enabled.";
          }
          root.file("phase-package.json", JSON.stringify(core, null, 2));
        }

        if (opts.markdown) {
          root.file(
            "markdown-files-readme.txt",
            "Per-template Markdown exports are opened from each artifact’s workspace link in phase-package.json (href fields).\n",
          );
        }

        if (opts.jsonEvidence) {
          const ev = exportBase.evidence;
          root.file("evidence-index.json", JSON.stringify(ev ?? [], null, 2));
        }

        if (opts.evidenceFiles) {
          root.file(
            "evidence-files-note.txt",
            "Binary evidence files are not bundled in this demo export. Use Evidence Center download links from evidence-index.json.\n",
          );
        }

        if (opts.validation) {
          root.file("validation-report.json", JSON.stringify(exportBase.validationResults ?? [], null, 2));
        }

        if (opts.checklist) {
          root.file("checklist-summary.json", JSON.stringify(exportBase.checklistSummary ?? [], null, 2));
        }

        if (opts.traceability) {
          root.file("traceability.json", JSON.stringify(exportBase.traceability ?? {}, null, 2));
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const phase =
          typeof exportBase.phaseNumber === "number" ? exportBase.phaseNumber : "phase";
        const a = document.createElement("a");
        a.href = url;
        a.download = `phase-${phase}-package.zip`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Export failed.");
      }
    });
  }

  const row = (id: ToggleKey, label: string) => (
    <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={opts[id]}
        onChange={() => toggle(id)}
        className="size-4 rounded border-input"
      />
      <span>{label}</span>
    </label>
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[70] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-phase-package-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Export</p>
            <h2 id="export-phase-package-title" className="text-lg font-semibold text-foreground">
              Export phase package
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Builds a ZIP with JSON summaries and readme stubs. Binary evidence is referenced, not embedded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-3 overflow-y-auto px-6 py-4 text-sm">
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase text-muted-foreground">Include</legend>
            {row("artifacts", "Artifacts (required / completed summaries)")}
            {row("markdown", "Markdown files (readme + pointers)")}
            {row("jsonEvidence", "JSON evidence index")}
            {row("evidenceFiles", "Evidence files (download notes)")}
            {row("validation", "Validation report")}
            {row("checklist", "Checklist summary")}
            {row("traceability", "Traceability links")}
          </fieldset>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Format:</span> ZIP
          </p>
          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleExport} disabled={pending}>
            {pending ? "Building…" : "Export package"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
