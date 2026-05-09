"use client";

import type { DecisionCriteriaSummary, DecisionCriterion } from "@/types/gate-review.types";
import { formatOverallAssessmentLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const assessmentOptions: { value: DecisionCriterion["assessment"]; label: string }[] = [
  { value: "meets", label: "Meets" },
  { value: "partially_meets", label: "Partially Meets" },
  { value: "does_not_meet", label: "Does Not Meet" },
  { value: "not_reviewed", label: "Not Reviewed" },
];

function toneForAssessment(a: DecisionCriterion["assessment"]) {
  switch (a) {
    case "meets":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50";
    case "partially_meets":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50";
    case "does_not_meet":
      return "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-50";
    case "not_reviewed":
    default:
      return "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100";
  }
}

export function DecisionCriteria({
  summary,
  onChangeAssessment,
}: {
  summary: DecisionCriteriaSummary;
  onChangeAssessment: (id: string, assessment: DecisionCriterion["assessment"]) => void;
}) {
  const overallLabel = formatOverallAssessmentLabel(summary.overallAssessment);

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Decision Criteria</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-muted dark:text-foreground">
            {summary.criteria.length}
          </span>
        </div>
        <span className="text-sm text-[#64748b] dark:text-muted-foreground">Weighted assessment</span>
      </header>

      {summary.criteria.length === 0 ? (
        <div className="px-5 py-8">
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
            No decision criteria configured.
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead className="border-b border-[#e5e7eb] bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:border-border dark:bg-muted/40 dark:text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Criterion
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Weight
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Assessment
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] dark:divide-border">
                {summary.criteria.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-3 font-medium text-[#111827] dark:text-foreground">{row.name}</td>
                    <td className="px-5 py-3 text-[#475569] dark:text-muted-foreground">{row.weightPercent}%</td>
                    <td className="px-5 py-3">
                      <label className="sr-only" htmlFor={`criterion-${row.id}`}>
                        Assessment for {row.name}
                      </label>
                      <select
                        id={`criterion-${row.id}`}
                        value={row.assessment}
                        onChange={(e) =>
                          onChangeAssessment(row.id, e.target.value as DecisionCriterion["assessment"])
                        }
                        className={cn(
                          "w-full max-w-[200px] rounded-lg border px-2 py-1.5 text-sm font-medium outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                          toneForAssessment(row.assessment),
                        )}
                      >
                        {assessmentOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-[#64748b] dark:text-muted-foreground">
                      {row.reviewerNotes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] px-5 py-4 dark:border-border">
            <span className="text-sm font-semibold text-[#111827] dark:text-foreground">Overall Assessment</span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-semibold",
                summary.overallAssessment === "meets_requirements" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50",
                summary.overallAssessment === "partially_meets_requirements" &&
                  "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50",
                summary.overallAssessment === "does_not_meet_requirements" &&
                  "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-50",
                summary.overallAssessment === "not_reviewed" &&
                  "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100",
              )}
            >
              {overallLabel}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
