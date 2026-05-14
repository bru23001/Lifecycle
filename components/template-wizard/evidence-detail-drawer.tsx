"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Download,
  ExternalLink,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  Link2,
  Unlink,
  X,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { targetLabel } from "@/lib/wizard-evidence-store";
import type {
  WizardEvidenceItem,
  WizardEvidenceTarget,
} from "@/types/template-wizard.types";

const typeIcon: Record<WizardEvidenceItem["evidenceType"], typeof Link2> = {
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  image: FileImage,
  link: ExternalLink,
  json: FileJson,
  markdown: FileText,
  report: FileText,
};

export type EvidenceDetailDrawerProps = {
  open: boolean;
  evidence: WizardEvidenceItem | null;
  /** All targets this evidence is currently linked to. */
  linkedTargets: WizardEvidenceTarget[];
  sectionTitles: Record<string, string>;
  fieldLabels: Record<string, string>;
  artifactTitle: string;
  onClose: () => void;
  onRequestUnlink: (evidenceId: string, target: WizardEvidenceTarget) => void;
};

export function EvidenceDetailDrawer({
  open,
  evidence,
  linkedTargets,
  sectionTitles,
  fieldLabels,
  artifactTitle,
  onClose,
  onRequestUnlink,
}: EvidenceDetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !evidence) return null;

  const Icon = typeIcon[evidence.evidenceType] ?? Link2;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        data-testid="evidence-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-detail-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Evidence
            </p>
            <h2
              id="evidence-detail-drawer-title"
              className="mt-1 truncate text-sm font-semibold text-foreground"
            >
              {evidence.name}
            </h2>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {evidence.evidenceCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 text-sm">
          <section
            aria-label="Evidence preview"
            className={cn(
              "flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground",
            )}
          >
            <div className="text-center">
              <Icon className="mx-auto size-8" aria-hidden />
              <p className="mt-2 text-[11px] uppercase tracking-wide">
                Preview available in full evidence view
              </p>
            </div>
          </section>

          {evidence.description ? (
            <p className="text-xs leading-relaxed text-foreground">{evidence.description}</p>
          ) : null}

          <dl className="grid grid-cols-2 gap-3 text-xs">
            <Meta label="Type" value={evidence.evidenceType} />
            <Meta label="Classification" value={evidence.classification} />
            {evidence.source ? <Meta label="Source" value={evidence.source} /> : null}
            {evidence.retentionPolicyLabel ? (
              <Meta label="Retention" value={evidence.retentionPolicyLabel} />
            ) : null}
            {evidence.uploadedBy ? <Meta label="Uploaded by" value={evidence.uploadedBy} /> : null}
            {evidence.uploadedOnLabel ? (
              <Meta label="Uploaded" value={evidence.uploadedOnLabel} />
            ) : null}
            {evidence.phaseNumber ? (
              <Meta
                label="Linked phase"
                value={`Phase ${evidence.phaseNumber}${evidence.phaseName ? ` · ${evidence.phaseName}` : ""}`}
              />
            ) : null}
            {evidence.gateCode ? <Meta label="Linked gate" value={evidence.gateCode} /> : null}
          </dl>

          {evidence.tags.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Tags
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {evidence.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Linked to this artifact
            </h3>
            {linkedTargets.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                This evidence is not linked anywhere yet.
              </p>
            ) : (
              <ul className="mt-1 space-y-1">
                {linkedTargets.map((t, idx) => (
                  <li
                    key={`${t.kind}:${idx}`}
                    className="flex items-center justify-between gap-2 rounded border border-border bg-background px-2 py-1 text-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Link2 className="size-3 text-muted-foreground" aria-hidden />
                      <span>{targetLabel(t, { sectionTitles, fieldLabels, artifactTitle })}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRequestUnlink(evidence.id, t)}
                      data-testid="evidence-detail-unlink"
                      className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-muted"
                    >
                      <Unlink className="size-3" aria-hidden />
                      Remove link
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-3">
          <Link
            href={evidence.href}
            className="text-xs font-semibold text-[#2563eb] hover:underline"
          >
            Open full evidence →
          </Link>
          {evidence.downloadHref ? (
            <a
              href={evidence.downloadHref}
              download
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              data-testid="evidence-detail-download"
            >
              <Download className="size-3" aria-hidden />
              Download
            </a>
          ) : (
            <Button type="button" variant="outline" size="sm" disabled>
              <Download className="size-3" aria-hidden />
              Download
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-xs text-foreground">{value}</dd>
    </div>
  );
}
