"use client";

import type { ComponentType, RefObject } from "react";
import { BadgeCheck, Check, CircleX, SquarePen } from "lucide-react";

import type { GateDecisionRecord, GateDecisionType } from "@/types/gate-review.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DecisionRecord({
  record,
  draftDecision,
  onSelectDecision,
  comments,
  onCommentsChange,
  conditions,
  onAddCondition,
  onRemoveCondition,
  onConditionChange,
  decisionRecordRef,
  embedded = false,
}: {
  record: GateDecisionRecord;
  draftDecision: GateDecisionType | undefined;
  onSelectDecision: (d: GateDecisionType) => void;
  comments: string;
  onCommentsChange: (v: string) => void;
  conditions: string[];
  onAddCondition: () => void;
  onRemoveCondition: (index: number) => void;
  onConditionChange: (index: number, value: string) => void;
  decisionRecordRef?: RefObject<HTMLDivElement | null>;
  /** When true, render without outer card chrome (used inside combined decision + unlock card). */
  embedded?: boolean;
}) {
  const finalized = record.status === "finalized" || record.status === "submitted";

  const inner = (
    <>
      <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Decision Record</h2>

      {finalized ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
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
      ) : (
        <>
          <p className="mt-5 text-base text-slate-600 dark:text-muted-foreground">
            {draftDecision
              ? "Draft decision selected — add comments if required, then submit."
              : "No decision recorded yet."}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DecisionChoiceButton
              label="Approve"
              icon={Check}
              active={draftDecision === "approve"}
              onClick={() => onSelectDecision("approve")}
              className="bg-emerald-600 hover:bg-emerald-700"
            />
            <DecisionChoiceButton
              label="Conditional Approve"
              icon={BadgeCheck}
              active={draftDecision === "conditional_approve"}
              onClick={() => onSelectDecision("conditional_approve")}
              className="bg-blue-600 hover:bg-blue-700"
            />
            <DecisionChoiceButton
              label="Request Changes"
              icon={SquarePen}
              active={draftDecision === "request_changes"}
              onClick={() => onSelectDecision("request_changes")}
              className="bg-amber-500 hover:bg-amber-600"
            />
            <DecisionChoiceButton
              label="Reject"
              icon={CircleX}
              active={draftDecision === "reject"}
              onClick={() => onSelectDecision("reject")}
              className="bg-red-600 hover:bg-red-700"
            />
          </div>

          {draftDecision === "conditional_approve" ? (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">Conditions</p>
                <Button type="button" variant="outline" size="xs" onClick={onAddCondition}>
                  Add condition
                </Button>
              </div>
              {conditions.length === 0 ? (
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Add at least one condition for conditional approval.
                </p>
              ) : null}
              <ul className="space-y-2">
                {conditions.map((c, i) => (
                  <li key={`${i}-${c.slice(0, 8)}`} className="flex gap-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => onConditionChange(i, e.target.value)}
                      className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:bg-background"
                      aria-label={`Condition ${i + 1}`}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveCondition(i)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <label className="mt-5 block">
            <span className="sr-only">Decision comments</span>
            <textarea
              id="decision-comments"
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              rows={3}
              placeholder="Add decision comments (optional)..."
              className="min-h-[48px] w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-border dark:bg-background dark:text-foreground dark:focus:ring-blue-950/40"
            />
          </label>

          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-muted-foreground">
            Your decision and comments will be recorded in the audit trail.
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
