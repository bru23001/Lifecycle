"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Package, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EVIDENCE_PACKAGE_SCOPE_KEYS,
  type EvidencePackageScopeKey,
  type EvidencePackageScopes,
} from "@/lib/evidence-package-scopes";
import { buildProjectPackageConfigureUrl } from "@/lib/project-package-export-url";
import { cn } from "@/lib/utils";

const SCOPE_LABEL: Record<EvidencePackageScopeKey, string> = {
  artifacts: "Include artifacts",
  evidence: "Include evidence",
  gateDecisions: "Include gate decisions",
  approvals: "Include approval history",
  traceability: "Include traceability matrix",
  auditManifest: "Include audit trail",
};

type Props = {
  open: boolean;
  projectId: string;
  /** Initial scope toggle state — defaults to all enabled. */
  initialScopes?: EvidencePackageScopes;
  /** Optional per-scope availability flags (`false` → toggle disabled). */
  availability?: Partial<Record<EvidencePackageScopeKey, boolean>>;
  onClose: () => void;
};

/**
 * "Export Project Package" modal (§9). Hands off to the existing configure
 * screen so users can review filters, scopes, and trigger the generation
 * pipeline that's already in place. No new server logic.
 */
export function ExportProjectPackageModal({
  open,
  projectId,
  initialScopes,
  availability,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const [scopes, setScopes] = useState<EvidencePackageScopes>(() =>
    initialScopes ?? allEnabledScopes(),
  );

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
    if (!open) return;
    setScopes(initialScopes ?? allEnabledScopes());
  }, [open, initialScopes]);

  function toggle(key: EvidencePackageScopeKey) {
    setScopes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const href = buildProjectPackageConfigureUrl({
      projectId,
      scopes,
      format: "zip",
    });
    onClose();
    router.push(href);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,600px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-project-package-modal-title"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reports · Package</p>
            <h2
              id="export-project-package-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              Export Project Package
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Choose what to include. Continue to the configure screen to review filters and start the ZIP export.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 text-sm">
          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Include</p>
            <ul className="mt-2 space-y-1.5">
              {EVIDENCE_PACKAGE_SCOPE_KEYS.map((key) => {
                const available = availability?.[key] ?? true;
                const checked = scopes[key];
                return (
                  <li key={key}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                        !available && "cursor-not-allowed opacity-60",
                        checked && available
                          ? "border-blue-300 bg-blue-50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked && available}
                        disabled={!available}
                        onChange={() => toggle(key)}
                        className="size-3.5"
                      />
                      <span className="flex-1">{SCOPE_LABEL[key]}</span>
                      {!available ? (
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          unavailable
                        </span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Format</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-900">
              <Package className="size-4" aria-hidden />
              ZIP
              <span className="ml-1 text-[10px] uppercase tracking-wide text-blue-700">Locked</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Other formats can be selected on the configure screen.
            </p>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            Export package
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </footer>
      </form>
    </dialog>
  );
}

function allEnabledScopes(): EvidencePackageScopes {
  return {
    artifacts: true,
    evidence: true,
    gateDecisions: true,
    traceability: true,
    approvals: true,
    auditManifest: true,
  };
}
