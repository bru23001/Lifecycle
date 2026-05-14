"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { DecisionCriterion, DecisionCriteriaSummary } from "@/types/gate-review.types";
import type { GateEvidenceItem } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

import { CriterionAssessmentBadge } from "./gate-review-shared-widgets";

function useDialogOpen(open: boolean) {
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
  return ref;
}

function scoringRationale(c: DecisionCriterion): string {
  const w = c.weightPercent;
  switch (c.assessment) {
    case "meets":
      return `This criterion contributes ${w}% toward the gate score. With a “Meets” assessment, its full weight counts toward an overall “meets requirements” posture when peers are also satisfied.`;
    case "partially_meets":
      return `At ${w}% weight, a “Partially meets” assessment signals residual risk. Governance may still advance with conditions if other criteria and evidence checks compensate.`;
    case "does_not_meet":
      return `Marked “Does not meet” at ${w}% weight blocks a clean pass until remediated or explicitly accepted under exception policy.`;
    default:
      return `Not yet reviewed (${w}% weight). Record an assessment before finalizing the gate decision.`;
  }
}

function requiredThresholdCopy(c: DecisionCriterion): string {
  return c.assessment === "not_reviewed"
    ? "Assessment required before the criterion counts toward readiness."
    : "Aligned with automated gate evidence checks and reviewer judgment for this template.";
}

function hrefForEvidenceRef(projectId: string, ref: string, evidence: GateEvidenceItem[]): string {
  const hit = evidence.find((e) => e.id === ref);
  if (hit) return hit.href;
  return `/projects/${projectId}/evidence?search=${encodeURIComponent(ref)}`;
}

const assessmentOptions: { value: DecisionCriterion["assessment"]; label: string }[] = [
  { value: "meets", label: "Meets" },
  { value: "partially_meets", label: "Partially meets" },
  { value: "does_not_meet", label: "Does not meet" },
  { value: "not_reviewed", label: "Not reviewed" },
];

export function DecisionCriteriaDetailDrawer({
  open,
  onClose,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  summary: DecisionCriteriaSummary;
}) {
  const ref = useDialogOpen(open);
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-y-0 right-0 z-50 m-0 flex w-[min(100vw-0.5rem,28rem)] max-w-[100vw] flex-col border-0 border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          Decision criteria — full model
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </header>
      <div className="lifecycle-scroll min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
        {summary.criteria.map((c) => (
          <section key={c.id} className="rounded-lg border border-border bg-card/40 p-4">
            <h3 className="font-semibold text-foreground">{c.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Weight {c.weightPercent}%</p>
            <div className="mt-2">
              <CriterionAssessmentBadge assessment={c.assessment} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Required threshold: </span>
              {requiredThresholdCopy(c)}
            </p>
            {c.description ? (
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{c.description}</p>
            ) : null}
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Evidence references
            </p>
            {c.evidenceRefs.length ? (
              <ul className="mt-1 list-inside list-disc text-sm text-foreground/90">
                {c.evidenceRefs.map((r) => (
                  <li key={r} className="font-mono text-xs">
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">None listed.</p>
            )}
            {c.reviewerNotes ? (
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Reviewer notes: </span>
                {c.reviewerNotes}
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Scoring rationale: </span>
              {scoringRationale(c)}
            </p>
          </section>
        ))}
      </div>
      <footer className="shrink-0 border-t border-border px-5 py-3">
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </footer>
    </dialog>
  );
}

export function CriterionAssessmentDrawer({
  open,
  onClose,
  projectId,
  criterion,
  completionEvidence,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  criterion: DecisionCriterion | null;
  completionEvidence: GateEvidenceItem[];
  onSave: (id: string, patch: Partial<DecisionCriterion>) => void;
}) {
  const ref = useDialogOpen(open);
  const titleId = useId();
  const [assessment, setAssessment] = useState<DecisionCriterion["assessment"]>("not_reviewed");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [evidenceRefs, setEvidenceRefs] = useState<string[]>([]);
  const [newRef, setNewRef] = useState("");

  useEffect(() => {
    if (!criterion) return;
    setAssessment(criterion.assessment);
    setReviewerNotes(criterion.reviewerNotes ?? "");
    setEvidenceRefs([...criterion.evidenceRefs]);
    setNewRef("");
  }, [criterion]);

  if (!criterion) return null;

  const active = criterion;

  function addRef() {
    const t = newRef.trim();
    if (!t || evidenceRefs.includes(t)) return;
    setEvidenceRefs((prev) => [...prev, t]);
    setNewRef("");
  }

  function removeRef(r: string) {
    setEvidenceRefs((prev) => prev.filter((x) => x !== r));
  }

  function handleSave() {
    onSave(active.id, {
      assessment,
      reviewerNotes: reviewerNotes.trim() || undefined,
      evidenceRefs,
    });
    onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-y-0 right-0 z-50 m-0 flex w-[min(100vw-0.5rem,26rem)] max-w-[100vw] flex-col border-0 border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Criterion assessment</p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-foreground">
            {active.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Weight {active.weightPercent}%</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </header>

      <div className="lifecycle-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {active.description ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{active.description}</p>
          </div>
        ) : null}

        <div>
          <label htmlFor="crit-assess" className="text-sm font-medium text-foreground">
            Assessment
          </label>
          <select
            id="crit-assess"
            value={assessment}
            onChange={(e) => setAssessment(e.target.value as DecisionCriterion["assessment"])}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {assessmentOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="crit-notes" className="text-sm font-medium text-foreground">
            Reviewer notes
          </label>
          <textarea
            id="crit-notes"
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Record rationale, conditions, or follow-ups…"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Linked evidence</p>
          <ul className="mt-2 space-y-2">
            {evidenceRefs.map((r) => (
              <li
                key={r}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
              >
                <Link
                  href={hrefForEvidenceRef(projectId, r, completionEvidence)}
                  className={cn(buttonVariants({ variant: "link", size: "sm", className: "h-auto p-0 font-mono text-xs" }))}
                  data-testid={`criterion-evidence-ref-${active.id}-${r}`}
                >
                  {r}
                </Link>
                <Button type="button" variant="ghost" size="xs" onClick={() => removeRef(r)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          {evidenceRefs.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">No references yet — add an evidence id or template key.</p>
          ) : null}

          <div className="mt-3 flex gap-2">
            <input
              value={newRef}
              onChange={(e) => setNewRef(e.target.value)}
              placeholder="Evidence id or reference"
              className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="criterion-add-evidence-ref-input"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addRef}>
              Add
            </Button>
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 gap-2 border-t border-border px-5 py-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" className="flex-1" onClick={handleSave} data-testid="criterion-assessment-save">
          Save assessment
        </Button>
      </footer>
    </dialog>
  );
}
