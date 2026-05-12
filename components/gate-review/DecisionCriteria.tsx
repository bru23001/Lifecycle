"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { DecisionCriteriaSummary, DecisionCriterion } from "@/types/gate-review.types";
import { formatOverallAssessmentLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import { CriterionAssessmentBadge, GateCountBadge } from "./gate-review-shared-widgets";

const assessmentOptions: { value: DecisionCriterion["assessment"]; label: string }[] = [
  { value: "meets", label: "Meets" },
  { value: "partially_meets", label: "Partially Meets" },
  { value: "does_not_meet", label: "Does Not Meet" },
  { value: "not_reviewed", label: "Not Reviewed" },
];

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
  gateId,
  summary,
  onChangeAssessment,
  embedded = false,
}: {
  projectId: string;
  gateId: string;
  summary: DecisionCriteriaSummary;
  onChangeAssessment: (id: string, assessment: DecisionCriterion["assessment"]) => void;
  /** When true, render without outer card chrome (used inside DecisionCriteriaApproverCard). */
  embedded?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const overallLabel = formatOverallAssessmentLabel(summary.overallAssessment);
  const viewDetailsHref = `/projects/${projectId}/gates/${gateId}/decision-criteria`;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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

        <Link
          href={viewDetailsHref}
          className="text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View details
        </Link>
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
        <div className={cn(!embedded && "min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pt-4", embedded && "overflow-x-auto")}>
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-900 dark:border-border dark:text-foreground">
                <th className="pb-4 pr-8">Criterion</th>
                <th className="pb-4 pr-8">Weight</th>
                <th className="pb-4 pr-8">Assessment</th>
                <th className="pb-4 text-right" />
              </tr>
            </thead>
            <tbody>
              {summary.criteria.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-slate-100 text-base last:border-b-0 dark:border-border">
                    <td className="py-5 pr-8 font-semibold text-slate-950 dark:text-foreground">{row.name}</td>

                    <td className="py-5 pr-8 text-slate-700 dark:text-foreground/90">{row.weightPercent}%</td>

                    <td className="py-5 pr-8">
                      <CriterionAssessmentBadge assessment={row.assessment} />
                    </td>

                    <td className="py-5 text-right">
                      <button
                        type="button"
                        aria-expanded={expandedId === row.id}
                        aria-label={`Expand ${row.name}`}
                        onClick={() => toggleExpand(row.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-50 dark:text-foreground dark:hover:bg-muted/60"
                      >
                        <ChevronDown
                          className={cn("h-5 w-5 transition-transform", expandedId === row.id && "rotate-180")}
                          aria-hidden
                        />
                      </button>
                    </td>
                  </tr>

                  {expandedId === row.id ? (
                    <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-muted/30">
                      <td colSpan={4} className="px-8 pb-5 pt-2">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-foreground" htmlFor={`criterion-${row.id}`}>
                          Update assessment
                        </label>
                        <select
                          id={`criterion-${row.id}`}
                          value={row.assessment}
                          onChange={(e) =>
                            onChangeAssessment(row.id, e.target.value as DecisionCriterion["assessment"])
                          }
                          className="mt-2 w-full max-w-xs rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-border dark:bg-background dark:text-foreground dark:focus:ring-blue-950/40"
                        >
                          {assessmentOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {row.reviewerNotes ? (
                          <p className="mt-3 text-sm text-slate-600 dark:text-muted-foreground">
                            Notes: {row.reviewerNotes}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
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
