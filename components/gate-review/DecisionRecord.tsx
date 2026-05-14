"use client";

import type { ComponentType, RefObject } from "react";
import { BadgeCheck, Check, CircleX, Expand, FileText, SquarePen } from "lucide-react";

import type { GateDecisionRecord, GateDecisionType } from "@/types/gate-review.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DecisionRecord({
  record,
  draftDecision,
  onOpenDecisionModal,
  comments,
  onCommentsChange,
  onExpandComments,
  onViewFinalRecord,
  decisionRecordRef,
  embedded = false,
}: {
  record: GateDecisionRecord;
  draftDecision: GateDecisionType | undefined;
  onOpenDecisionModal: (d: GateDecisionType) => void;
  comments: string;
  onCommentsChange: (v: string) => void;
  onExpandComments?: () => void;
  onViewFinalRecord?: () => void;
  decisionRecordRef?: RefObject<HTMLDivElement | null>;
  /** When true, render without outer card chrome (used inside combined decision + unlock card). */
  embedded?: boolean;
}) {
  const finalized = record.status === "finalized" || record.status === "submitted";

  const inner = (
    <>
      <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Decision Record</h2>

      {finalized ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-50">
              {record.decisionLabel ?? record.decision ?? "Decision recorded"}
            </p>
            {record.decidedOn ? (
              <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">
                {record.decidedBy ? `${record.decidedBy} · ` : ""}
                {record.decidedOn}
              </p>
            ) : null}
            {record.comments ? (
              <p className="mt-3 text-sm text-emerald-950 dark:text-emerald-50">{record.comments}</p>
            ) : null}
          </div>
          {onViewFinalRecord ? (
            <Button type="button" variant="outline" className="gap-2" onClick={onViewFinalRecord}>
              <FileText className="size-4" aria-hidden />
              View existing decision record
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <p className="mt-5 text-base text-slate-600 dark:text-muted-foreground">
            {draftDecision
              ? "Decision selected — confirm in the dialog to record it in the audit trail."
              : "No decision recorded yet."}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DecisionChoiceButton
              label="Approve"
              icon={Check}
              active={draftDecision === "approve"}
              onClick={() => onOpenDecisionModal("approve")}
              className="bg-emerald-600 hover:bg-emerald-700"
            />
            <DecisionChoiceButton
              label="Conditional Approve"
              icon={BadgeCheck}
              active={draftDecision === "conditional_approve"}
              onClick={() => onOpenDecisionModal("conditional_approve")}
              className="bg-blue-600 hover:bg-blue-700"
            />
            <DecisionChoiceButton
              label="Request Changes"
              icon={SquarePen}
              active={draftDecision === "request_changes"}
              onClick={() => onOpenDecisionModal("request_changes")}
              className="bg-amber-500 hover:bg-amber-600"
            />
            <DecisionChoiceButton
              label="Reject"
              icon={CircleX}
              active={draftDecision === "reject"}
              onClick={() => onOpenDecisionModal("reject")}
              className="bg-red-600 hover:bg-red-700"
            />
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="decision-comments" className="text-sm font-medium text-slate-700 dark:text-foreground/90">
                Decision comments
              </label>
              {onExpandComments ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-blue-600 dark:text-blue-400"
                  onClick={onExpandComments}
                >
                  <Expand className="size-4" aria-hidden />
                  Expand editor
                </Button>
              ) : null}
            </div>
            <textarea
              id="decision-comments"
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              rows={3}
              placeholder="Add decision comments (optional for approve; required for request changes / reject)…"
              className="mt-2 min-h-[48px] w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-border dark:bg-background dark:text-foreground dark:focus:ring-blue-950/40"
            />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-muted-foreground">
            Your decision is confirmed through the modals above; comments and structured fields are written to the audit
            trail.
          </p>
        </>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="flex flex-col" role="region" aria-label="Decision record">
        {inner}
      </div>
    );
  }

  return (
    <section
      ref={decisionRecordRef}
      tabIndex={-1}
      className="flex h-full min-h-0 flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-8 shadow-sm outline-none dark:border-border dark:bg-card"
      aria-label="Decision record"
    >
      {inner}
    </section>
  );
}

function DecisionChoiceButton({
  label,
  icon: Icon,
  active,
  onClick,
  className,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-active={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-3 rounded-md px-6 text-base font-bold text-white shadow-sm",
        className,
        active && "ring-4 ring-white/40 ring-offset-2 ring-offset-background dark:ring-offset-card",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
