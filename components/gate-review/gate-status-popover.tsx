"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { GateReviewHeaderData } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

import { gateReviewStatusBadgeMap } from "./badge-maps";
import type { GateReviewHeaderChecklist } from "@/types/gate-review.types";

const statusMeanings: Record<GateReviewHeaderData["status"], string> = {
  draft:
    "The gate package is being prepared. It is not yet visible to approvers as a formal submission.",
  submitted:
    "The team has submitted materials for review. Approvers may be notified per your workflow configuration.",
  pending_decision:
    "Review work is in progress or awaiting a recorded governance decision on this gate.",
  approved:
    "The gate passed. Downstream lifecycle activities may proceed according to your phase rules.",
  conditional:
    "The gate passed with documented conditions. Satisfy conditions before treating the gate as fully cleared.",
  changes_requested:
    "The gate did not pass as submitted. Rework and resubmit when blockers are addressed.",
  rejected:
    "The gate did not pass. The project should not advance past this milestone without remediation planning.",
};

function nextStatusesFor(current: GateReviewHeaderData["status"]): string[] {
  switch (current) {
    case "draft":
      return ["Submitted"];
    case "submitted":
      return ["Pending decision", "Returned to draft"];
    case "pending_decision":
      return ["Approved", "Conditional", "Changes requested", "Rejected"];
    case "approved":
    case "conditional":
    case "changes_requested":
    case "rejected":
      return ["Reopened for amendment (if policy allows)", "Superseded by a new submission"];
    default:
      return [];
  }
}

function blockingLines(checklist: GateReviewHeaderChecklist): string[] {
  const lines: string[] = [];
  if (!checklist.allRequiredInputsProvided) {
    lines.push("All required gate inputs must be provided and marked complete.");
  }
  if (!checklist.evidenceAttached) {
    lines.push("Attach completion evidence for this gate before final approval.");
  }
  if (!checklist.decisionCriteriaMet) {
    lines.push("Every decision criterion must be assessed (not left as “not reviewed”).");
  }
  if (checklist.awaitingReviewerDecision) {
    lines.push("A reviewer decision is still required before the gate can be finalized.");
  }
  return lines;
}

const policyNote =
  "Statuses follow the Master Lifecycle decision gate model. Exact transitions may be constrained by your tenant workflow and evidence rules.";

type Tone = keyof typeof headerToneClass;

const headerToneClass = {
  gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  purple: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
} as const;

export function GateStatusPopoverTrigger({
  status,
  checklist,
}: {
  status: GateReviewHeaderData["status"];
  checklist: GateReviewHeaderChecklist;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const badge = gateReviewStatusBadgeMap[status];
  const tone = badge.tone as Tone;
  const blockers = blockingLines(checklist);
  const next = nextStatusesFor(status);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        className={cn(
          "rounded-full px-4 py-1.5 text-xs font-semibold outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          headerToneClass[tone],
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        data-testid="gate-review-status-popover-trigger"
      >
        {badge.label}
        <span className="sr-only"> — show status details</span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label="Gate status details"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg dark:border-border dark:bg-card"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current status</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{badge.label}</p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meaning</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{statusMeanings[status]}</p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Blocking conditions
          </p>
          {blockers.length ? (
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No checklist blockers at this time.</p>
          )}

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Next possible statuses
          </p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {next.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{policyNote}</p>
        </div>
      ) : null}
    </div>
  );
}
