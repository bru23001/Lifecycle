"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { impactBadgeMap } from "@/lib/coverage-status";
import {
  deriveBrokenRelationship,
  deriveLifecycleRisk,
  deriveMissingTarget,
  deriveRecommendedFix,
  getGapTypeLabel,
} from "@/lib/traceability-gap-details";
import { cn } from "@/lib/utils";
import type { TraceabilityGap } from "@/types/traceability.types";

import { StatusBadge } from "./traceability-shared";

/**
 * Right-side drawer surfacing the details of a single TraceabilityGap.
 *
 * Read-only descriptive content with a single primary CTA:
 *   - "create-link" → calls `onCreateLink(gap)` so the parent can open the
 *     Create Trace Link modal pre-filled from the gap.
 *   - "open-source" → routes the user to the gap's source `href`
 *     (workspace / evidence detail / requirements list).
 *
 * Native `<dialog>` mirrors `DecisionRecordDrawer` for accessibility
 * (focus trap, ESC + backdrop close).
 */
export function TraceabilityGapDrawer({
  open,
  gap,
  onClose,
  onCreateLink,
  onAcceptRisk,
  onAssignRemediation,
}: {
  open: boolean;
  gap: TraceabilityGap | null;
  onClose: () => void;
  onCreateLink: (gap: TraceabilityGap) => void;
  onAcceptRisk: (gap: TraceabilityGap) => void;
  onAssignRemediation: (gap: TraceabilityGap) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && gap) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, gap]);

  if (!gap) return null;

  const fix = deriveRecommendedFix(gap);
  const impact = impactBadgeMap[gap.impact];
  const sourceObjectLinkLabel = gap.type === "broken_link" ? "Open trace link detail" : "Open record";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="traceability-gap-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Traceability gap
            </p>
            <h2
              id="traceability-gap-drawer-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              {gap.objectId} · {gap.objectName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge label={getGapTypeLabel(gap.type)} tone="gray" />
              <StatusBadge label={`Impact: ${impact.label}`} tone={impact.tone} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gap details"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 text-sm">
          <Section title="Gap ID">
            <p className="font-mono text-xs text-slate-800">{gap.id}</p>
          </Section>

          <Section title="Source object">
            <p className="font-medium text-slate-900 dark:text-foreground">{gap.objectId}</p>
            <p className="text-xs text-slate-500">{gap.objectName}</p>
            <Link
              href={gap.href}
              className="mt-1 inline-flex items-center gap-1 text-xs text-[#1d4ed8] hover:underline"
            >
              {sourceObjectLinkLabel}
              <ExternalLink className="size-3" aria-hidden />
            </Link>
          </Section>

          <Section title="Missing target">
            <p className="text-slate-700 dark:text-muted-foreground">{deriveMissingTarget(gap)}</p>
            {gap.issue && gap.issue !== deriveMissingTarget(gap) ? (
              <p className="mt-1 text-xs text-slate-500">{gap.issue}</p>
            ) : null}
          </Section>

          <Section title="Broken / missing relationship">
            <p className="text-slate-700 dark:text-muted-foreground">{deriveBrokenRelationship(gap)}</p>
          </Section>

          <Section title="Impact level">
            <StatusBadge label={impact.label} tone={impact.tone} />
          </Section>

          <Section title="Lifecycle risk">
            <p className="text-slate-700 dark:text-muted-foreground">{deriveLifecycleRisk(gap)}</p>
          </Section>

          <Section title="Recommended fix">
            <p className="text-slate-700 dark:text-muted-foreground">{fix.text}</p>
          </Section>
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-200 px-5 py-3 dark:border-border">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onAcceptRisk(gap)}>
              Mark as accepted risk
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onAssignRemediation(gap)}>
              Assign remediation owner
            </Button>
          </div>
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 pt-1",
            )}
          >
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            {fix.ctaKind === "create-link" ? (
              <Button type="button" className="gap-2" onClick={() => onCreateLink(gap)}>
                {fix.ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <Link href={gap.href}>
                <Button type="button" className="gap-2">
                  {fix.ctaLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
