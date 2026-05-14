"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { GateOverviewData } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

import {
  GateConsequencesModal,
  GatePolicyDrawer,
  GateSuccessCriteriaDrawer,
} from "./gate-overview-interaction-dialogs";

const textLinkClass =
  "inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300";

function successCriteriaWithIds(criteria: string[]) {
  return criteria.map((label, index) => ({
    id: `criterion-${index + 1}`,
    label,
  }));
}

export function GateOverviewSidebar({ data }: { data: GateOverviewData }) {
  const [policyOpen, setPolicyOpen] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [consequencesOpen, setConsequencesOpen] = useState(false);

  const successCriteria = successCriteriaWithIds(data.successCriteria);
  const pct = Math.min(100, Math.max(0, data.phaseProgressPercent));

  return (
    <aside className="flex w-full max-w-[430px] flex-col gap-6 xl:h-full xl:min-h-0 xl:max-w-none">
      <GatePolicyDrawer open={policyOpen} onClose={() => setPolicyOpen(false)} policy={data.policy} />
      <GateSuccessCriteriaDrawer
        open={criteriaOpen}
        onClose={() => setCriteriaOpen(false)}
        details={data.successCriteriaDetails}
      />
      <GateConsequencesModal
        open={consequencesOpen}
        onClose={() => setConsequencesOpen(false)}
        consequences={data.consequences}
      />

      <section className="flex min-h-0 flex-none flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card xl:flex-1 xl:min-h-0">
        <h2 className="shrink-0 border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-950 dark:border-border dark:text-foreground">
          Gate Overview
        </h2>

        <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">Purpose</h3>

            <p className="mt-2 max-w-[330px] text-sm leading-6 text-slate-600 dark:text-muted-foreground">{data.purpose}</p>

            <button
              type="button"
              className={cn(textLinkClass, "mt-3")}
              onClick={() => setPolicyOpen(true)}
              data-testid="gate-overview-view-policy"
            >
              View gate policy
            </button>
          </div>

          <hr className="my-5 border-slate-200 dark:border-border" />

          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">Success Criteria</h3>
              <button
                type="button"
                className={cn(textLinkClass, "shrink-0 text-xs font-semibold sm:text-sm")}
                onClick={() => setCriteriaOpen(true)}
                data-testid="gate-overview-view-success-criteria"
              >
                View full success criteria
              </button>
            </div>

            <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-muted-foreground">
              {successCriteria.map((criterion) => (
                <li key={criterion.id} className="list-disc pl-2">
                  {criterion.label}
                </li>
              ))}
            </ul>
          </div>

          <hr className="my-5 border-slate-200 dark:border-border" />

          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">Gate Consequence</h3>
              <button
                type="button"
                className={cn(textLinkClass, "shrink-0 text-xs font-semibold sm:text-sm")}
                onClick={() => setConsequencesOpen(true)}
                data-testid="gate-overview-view-consequences"
              >
                View all gate consequences
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-[52px_1fr] items-start gap-3">
                <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-emerald-500 px-2 text-xs font-bold text-emerald-600 dark:border-emerald-400 dark:text-emerald-400">
                  Go
                </span>

                <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">{data.approvalConsequence}</p>
              </div>

              <div className="grid grid-cols-[52px_1fr] items-center gap-3">
                <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-red-500 px-2 text-xs font-bold text-red-500 dark:border-red-400 dark:text-red-400">
                  No-Go
                </span>

                <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">{data.rejectionConsequence}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shrink-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-border dark:bg-card">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-foreground">Phase Progress</h2>

        <div className="mt-4">
          <p className="text-sm font-medium leading-6 text-slate-700 dark:text-foreground/90">{data.currentPhaseLabel}</p>

          <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-foreground/90">{pct}% Complete</p>
        </div>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`Phase progress ${pct} percent`}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] dark:bg-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <Link
          href={data.phaseWorkspaceHref}
          className={cn(textLinkClass, "mt-4")}
          data-testid="gate-overview-view-phase-workspace"
        >
          View phase workspace
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </section>
    </aside>
  );
}
