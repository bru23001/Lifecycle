"use client";

import { Check, Circle } from "lucide-react";

import type { GateReviewHeaderData } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

import { gateReviewStatusBadgeMap, StatusBadge } from "./badge-maps";

export type GateReviewHeaderChecklist = {
  allRequiredInputsProvided: boolean;
  evidenceAttached: boolean;
  decisionCriteriaMet: boolean;
  awaitingReviewerDecision: boolean;
};

function CompletionRing({ percent }: { percent: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;
  return (
    <div
      className="relative grid size-[104px] shrink-0 place-items-center"
      role="progressbar"
      aria-label={`Gate readiness ${p} percent complete`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={p}
    >
      <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="none"
          r={r}
          cx="50"
          cy="50"
        />
        <circle
          className="text-[#2563eb]"
          strokeWidth="10"
          stroke="currentColor"
          fill="none"
          r={r}
          cx="50"
          cy="50"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="pointer-events-none absolute text-lg font-semibold text-[#111827] dark:text-foreground" aria-hidden>
        {p}%
      </span>
    </div>
  );
}

function ChecklistRow({
  ok,
  label,
  pending,
}: {
  ok: boolean;
  label: string;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#475569] dark:text-muted-foreground">
      {ok ? (
        <Check className="size-4 shrink-0 text-[#16a34a]" aria-hidden />
      ) : pending ? (
        <Circle className="size-4 shrink-0 text-[#f59e0b]" aria-hidden />
      ) : (
        <Circle className="size-4 shrink-0 text-slate-300" aria-hidden />
      )}
      <span>{label}</span>
    </div>
  );
}

export function GateReviewHeader({
  data,
  checklist,
}: {
  data: GateReviewHeaderData;
  checklist: GateReviewHeaderChecklist;
}) {
  const badge = gateReviewStatusBadgeMap[data.status];

  return (
    <section
      aria-label="Gate review summary"
      className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm dark:border-border dark:bg-card"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white shadow-sm"
            aria-hidden
          >
            {data.gateCode}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#64748b] dark:text-muted-foreground">
              Gate {data.gateNumber} of {data.totalGates}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-foreground">
                {data.gateName}
              </h2>
              <StatusBadge label={badge.label} tone={badge.tone} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#475569] dark:text-muted-foreground">
              {data.purpose}
            </p>
          </div>
        </div>

        <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:min-w-[240px]">
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 text-sm dark:border-border dark:bg-muted/40">
            <dl className="space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-[#64748b] dark:text-muted-foreground">Project</dt>
                <dd className="truncate font-medium text-[#111827] dark:text-foreground">{data.projectName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#64748b] dark:text-muted-foreground">Phase</dt>
                <dd className="font-medium text-[#111827] dark:text-foreground">
                  {data.phaseNumber}. {data.phaseName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#64748b] dark:text-muted-foreground">Gate Owner</dt>
                <dd className="truncate font-medium">{data.gateOwnerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#64748b] dark:text-muted-foreground">Submitted</dt>
                <dd className="font-medium">{data.submittedOnLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#64748b] dark:text-muted-foreground">Approvers</dt>
                <dd className="font-medium">
                  {data.approversAssigned} assigned
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#64748b] dark:text-muted-foreground">Due</dt>
                <dd className="font-medium">{data.dueDateLabel}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4 dark:border-border dark:bg-card sm:flex-row sm:items-center lg:flex-col xl:min-w-[280px]",
          )}
        >
          <CompletionRing percent={data.readinessPercent} />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Gate readiness</p>
            <ChecklistRow ok={checklist.allRequiredInputsProvided} label="All required inputs provided" />
            <ChecklistRow ok={checklist.evidenceAttached} label="Evidence attached" />
            <ChecklistRow ok={checklist.decisionCriteriaMet} label="Decision criteria met" />
            <ChecklistRow
              ok={!checklist.awaitingReviewerDecision}
              pending={checklist.awaitingReviewerDecision}
              label="Awaiting reviewer decision"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
