"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { recordEvidenceCompletenessNotApplicable } from "@/app/actions/evidence-completeness";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  downloadJson,
  type EvidenceCompletenessSegment,
} from "@/lib/evidence-completeness-segments";
import type { EvidenceByGate, EvidenceItem } from "@/types/evidence-center.types";

export function EvidenceCompletenessFilteredToolbar({
  projectId,
  projectCode,
  filterStatus,
  evidenceItems,
  gateGaps,
}: {
  projectId: string;
  projectCode: string;
  filterStatus: EvidenceCompletenessSegment;
  evidenceItems: EvidenceItem[];
  gateGaps: EvidenceByGate[];
}) {
  const base = `/projects/${projectId}/evidence/completeness`;

  const runExport = () => {
    if (filterStatus === "missing") {
      downloadJson(`${projectCode}_completeness_missing_gaps.json`, {
        exportedAt: new Date().toISOString(),
        projectId,
        segment: "missing",
        gateGaps: gateGaps.map((g) => ({
          gateCode: g.gateCode,
          gateName: g.gateName,
          status: g.status,
          evidenceLinked: g.evidenceLinked,
          requiredEvidence: g.requiredEvidence,
          coveragePercent: g.coveragePercent,
        })),
      });
      return;
    }
    downloadJson(`${projectCode}_completeness_${filterStatus}.json`, {
      exportedAt: new Date().toISOString(),
      projectId,
      segment: filterStatus,
      items: evidenceItems.map((i) => ({
        id: i.id,
        evidenceCode: i.evidenceCode,
        name: i.name,
        status: i.status,
        phaseNumber: i.phaseNumber,
        phaseName: i.phaseName,
        gateCode: i.gateCode,
        gateName: i.gateName,
        completenessPercent: i.completenessPercent,
      })),
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-700">
        Filter: <span className="font-semibold capitalize">{filterStatus}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={runExport}>
          Export filtered list
        </Button>
        <Link href={base} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          Clear filter
        </Link>
      </div>
    </div>
  );
}

export function EvidenceCompletenessResolveModal({
  open,
  onClose,
  projectId,
  scopeLabel,
  gateCode,
  gateReviewHref,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  scopeLabel: string;
  gateCode: string | null;
  gateReviewHref?: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [justification, setJustification] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
    if (open) {
      setJustification("");
      setError(null);
    }
  }, [open, scopeLabel]);

  const evidenceHref = `/projects/${projectId}/evidence`;

  const save = () => {
    startTransition(async () => {
      setError(null);
      const res = await recordEvidenceCompletenessNotApplicable({
        projectId,
        gateCode,
        scopeLabel,
        justification,
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="resolve-missing-evidence-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div>
            <h2 id="resolve-missing-evidence-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Resolve missing evidence
            </h2>
            <p className="mt-1 text-sm text-slate-600">{scopeLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          <p className="text-slate-700">
            Upload new evidence, link an existing item, or record a justified “not applicable” decision for audit.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={evidenceHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}>
              Open Evidence Center
            </Link>
            {gateReviewHref ? (
              <Link href={gateReviewHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}>
                Gate review
              </Link>
            ) : null}
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Mark not applicable — justification (required)</span>
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              maxLength={4000}
              placeholder="Explain why this requirement does not apply for this project."
            />
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            disabled={pending || justification.trim().length < 3}
            onClick={save}
          >
            {pending ? "Saving…" : "Save N/A resolution"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function EvidenceCompletenessResolveTrigger({
  projectId,
  label,
  gateCode,
  gateReviewHref,
}: {
  projectId: string;
  label: string;
  gateCode: string | null;
  gateReviewHref?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Resolve
      </Button>
      <EvidenceCompletenessResolveModal
        open={open}
        onClose={() => setOpen(false)}
        projectId={projectId}
        scopeLabel={label}
        gateCode={gateCode}
        gateReviewHref={gateReviewHref}
      />
    </>
  );
}
