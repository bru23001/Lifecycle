"use client";

import type { RefObject } from "react";
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
}) {
  const finalized = record.status === "finalized" || record.status === "submitted";

  return (
    <section
      ref={decisionRecordRef}
      tabIndex={-1}
      className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm outline-none dark:border-border dark:bg-card"
      aria-label="Decision record"
    >
      <header className="border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Decision Record</h3>
      </header>

      <div className="space-y-5 px-5 py-5">
        {finalized ? (
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
        ) : (
          <>
            <p className="text-sm text-[#475569] dark:text-muted-foreground">
              {draftDecision ? "Draft decision selected — add comments if required, then submit." : "No decision recorded yet."}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <DecisionButton
                label="Approve"
                tone="green"
                pressed={draftDecision === "approve"}
                onClick={() => onSelectDecision("approve")}
              />
              <DecisionButton
                label="Conditional Approve"
                tone="blue"
                pressed={draftDecision === "conditional_approve"}
                onClick={() => onSelectDecision("conditional_approve")}
              />
              <DecisionButton
                label="Request Changes"
                tone="amber"
                pressed={draftDecision === "request_changes"}
                onClick={() => onSelectDecision("request_changes")}
              />
              <DecisionButton
                label="Reject"
                tone="red"
                pressed={draftDecision === "reject"}
                onClick={() => onSelectDecision("reject")}
              />
            </div>

            {draftDecision === "conditional_approve" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Conditions</p>
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
                        className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:bg-background"
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

            <div>
              <label htmlFor="decision-comments" className="text-sm font-semibold text-[#111827] dark:text-foreground">
                Decision comments {draftDecision === "request_changes" || draftDecision === "reject" ? "(required)" : "(optional)"}
              </label>
              <textarea
                id="decision-comments"
                value={comments}
                onChange={(e) => onCommentsChange(e.target.value)}
                rows={4}
                placeholder="Add decision comments..."
                className="mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:bg-background"
              />
            </div>

            <p className="text-xs leading-relaxed text-[#64748b] dark:text-muted-foreground">
              Submitting a decision creates an immutable audit record for this gate. Ensure criteria assessments and evidence are
              accurate before finalizing.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function DecisionButton({
  label,
  tone,
  pressed,
  onClick,
}: {
  label: string;
  tone: "green" | "amber" | "red" | "blue";
  pressed: boolean;
  onClick: () => void;
}) {
  const tones = {
    green: "border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 data-[pressed=true]:ring-2 data-[pressed=true]:ring-emerald-400",
    amber:
      "border-amber-300 bg-amber-500 text-white hover:bg-amber-600 data-[pressed=true]:ring-2 data-[pressed=true]:ring-amber-300",
    red: "border-red-300 bg-red-600 text-white hover:bg-red-700 data-[pressed=true]:ring-2 data-[pressed=true]:ring-red-400",
    blue: "border-blue-300 bg-[#2563eb] text-white hover:bg-blue-700 data-[pressed=true]:ring-2 data-[pressed=true]:ring-blue-400",
  };

  return (
    <Button
      type="button"
      data-pressed={pressed}
      aria-pressed={pressed}
      variant="outline"
      size="lg"
      className={cn(
        "h-11 justify-center border font-semibold shadow-sm",
        tones[tone],
        !pressed && "opacity-90",
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
