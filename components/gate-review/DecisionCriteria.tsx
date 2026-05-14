"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

import type { DecisionCriteriaSummary, DecisionCriterion } from "@/types/gate-review.types";
import type { GateEvidenceItem } from "@/types/gate-review.types";
import { formatOverallAssessmentLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import { CriterionAssessmentBadge, GateCountBadge } from "./gate-review-shared-widgets";
import { CriterionAssessmentDrawer, DecisionCriteriaDetailDrawer } from "./decision-criteria-drawers";

function overallPillClass(
  key: DecisionCriteriaSummary["overallAssessment"],
): string {
  switch (key) {
    case "meets_requirements":
      return "rounded-full bg-emerald-50 px-6 py-2 text-base font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "partially_meets_requirements":
      return "rounded-full bg-amber-50 px-6 py-2 text-base font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
    case "does_not_meet_requirements":
      return "rounded-full bg-red-50 px-6 py-2 text-base font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-200";
    case "not_reviewed":
    default:
      return "rounded-full bg-slate-50 px-6 py-2 text-base font-semibold text-slate-700 dark:bg-slate-900/40 dark:text-slate-200";
  }
}

export function DecisionCriteria({
  projectId,
  gateCode,
  summary,
  completionEvidence,
  onUpdateCriterion,
  embedded = false,
}: {
  projectId: string;
  /** Gate code for settings deep link (e.g. `G1`). */
  gateCode: string;
  summary: DecisionCriteriaSummary;
  completionEvidence: GateEvidenceItem[];
  onUpdateCriterion: (id: string, patch: Partial<DecisionCriterion>) => void;
  /** When true, render without outer card chrome (used inside DecisionCriteriaApproverCard). */
  embedded?: boolean;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeCriterion, setActiveCriterion] = useState<DecisionCriterion | null>(null);

  const overallLabel = formatOverallAssessmentLabel(summary.overallAssessment);
  const settingsHref = `/settings/gates?gate=${encodeURIComponent(gateCode)}`;

  const openAssessment = useCallback((row: DecisionCriterion) => {
    setActiveCriterion(row);
  }, []);

  const onSaveAssessment = useCallback(
    (id: string, patch: Partial<DecisionCriterion>) => {
      onUpdateCriterion(id, patch);
    },
    [onUpdateCriterion],
  );

  const header = (
    <header
      className={cn(
        "shrink-0 border-b border-slate-100 dark:border-border",
        embedded ? "mb-6 pb-4" : "px-8 pb-4 pt-8",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Decision Criteria</h2>
          <GateCountBadge count={summary.criteria.length} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => setDetailOpen(true)}
            data-testid="decision-criteria-view-details"
          >
            View details
          </button>
          <Link
            href={settingsHref}
            className="text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            data-testid="decision-criteria-edit-settings"
          >
            Edit decision criteria
          </Link>
        </div>
      </div>
    </header>
  );

  const body =
    summary.criteria.length === 0 ? (
      <div className={cn(!embedded && "px-8 pb-8 pt-4")} role="alert">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
          No decision criteria configured.
        </div>
      </div>
    ) : (
      <>
        <DecisionCriteriaDetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} summary={summary} />
        <CriterionAssessmentDrawer
          open={Boolean(activeCriterion)}
          onClose={() => setActiveCriterion(null)}
          projectId={projectId}
          criterion={activeCriterion}
          completionEvidence={completionEvidence}
          onSave={onSaveAssessment}
        />

        <div className={cn(!embedded && "min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pt-4", embedded && "overflow-x-auto")}>
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-900 dark:border-border dark:text-foreground">
                <th className="pb-4 pr-8">Criterion</th>
                <th className="pb-4 pr-8">Weight</th>
                <th className="pb-4 pr-8">Assessment</th>
                <th className="pb-4 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {summary.criteria.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer border-b border-slate-100 text-base last:border-b-0 hover:bg-slate-50/80 dark:border-border dark:hover:bg-muted/40"
                  onClick={() => openAssessment(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openAssessment(row);
                    }
                  }}
                  data-testid={`decision-criterion-row-${row.id}`}
                >
                  <td className="py-5 pr-8 font-semibold text-slate-950 dark:text-foreground">{row.name}</td>

                  <td className="py-5 pr-8 text-slate-700 dark:text-foreground/90">{row.weightPercent}%</td>

                  <td className="py-5 pr-8">
                    <CriterionAssessmentBadge assessment={row.assessment} />
                  </td>

                  <td className="py-5 text-right text-sm font-semibold text-blue-600 dark:text-blue-400">Assess →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-border",
            embedded ? "mt-6 pt-6" : "px-8 pb-8 pt-5",
          )}
        >
          <p className="text-base font-semibold text-slate-950 dark:text-foreground">Overall Assessment</p>

          <span className={overallPillClass(summary.overallAssessment)}>{overallLabel}</span>
        </footer>
      </>
    );

  if (embedded) {
    return (
      <div className="flex flex-col" role="region" aria-label="Decision criteria">
        {header}
        {body}
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      {header}
      {body}
    </section>
  );
}
