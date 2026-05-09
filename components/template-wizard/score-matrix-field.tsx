"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WizardScoreMatrix } from "@/types/template-wizard.types";

function totalWeight(m: WizardScoreMatrix): number {
  return m.criteria.reduce((acc, c) => acc + (Number.isFinite(c.weight) ? c.weight : 0), 0);
}

export function ScoreMatrixField({
  value,
  onChange,
  idPrefix,
}: {
  value: WizardScoreMatrix;
  onChange: (next: WizardScoreMatrix) => void;
  idPrefix: string;
}) {
  const tw = useMemo(() => totalWeight(value), [value]);
  const balanced = tw >= 99 && tw <= 101;

  function updateCriteria(nextCriteria: WizardScoreMatrix["criteria"]) {
    onChange({ ...value, criteria: nextCriteria });
  }

  function setWeight(idx: number, weight: number) {
    const next = value.criteria.map((c, i) =>
      i === idx ? { ...c, weight: Number.isFinite(weight) ? weight : 0 } : c,
    );
    updateCriteria(next);
  }

  function setComment(criterionId: string, comment: string) {
    onChange({
      ...value,
      rowComments: { ...value.rowComments, [criterionId]: comment },
    });
  }

  function setScore(criterionId: string, optionKey: string, score: number) {
    onChange({
      ...value,
      scores: {
        ...value.scores,
        [criterionId]: {
          ...(value.scores[criterionId] ?? {}),
          [optionKey]: score,
        },
      },
    });
  }

  function addCriterion() {
    const n = value.criteria.length + 1;
    const id = `c-new-${n}`;
    updateCriteria([
      ...value.criteria,
      {
        id,
        name: `Criterion ${n}`,
        description: "",
        weight: 0,
      },
    ]);
    onChange({
      ...value,
      scores: { ...value.scores, [id]: Object.fromEntries(value.optionKeys.map((k) => [k, undefined])) },
      rowComments: { ...value.rowComments, [id]: "" },
    });
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby={`${idPrefix}-weighting-heading`}>
        <h4 id={`${idPrefix}-weighting-heading`} className="text-base font-semibold text-foreground">
          2.1 Evaluation Criteria Weighting
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust weights so priorities reflect your evaluation goals (must total 100%).
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">#</th>
                <th className="px-3 py-2.5 font-medium">Criteria</th>
                <th className="px-3 py-2.5 font-medium">Description</th>
                <th className="px-3 py-2.5 font-medium">Weight (%)</th>
              </tr>
            </thead>
            <tbody>
              {value.criteria.map((c, idx) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-foreground">{c.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.description}</td>
                  <td className="px-3 py-2">
                    <label htmlFor={`${idPrefix}-w-${c.id}`} className="sr-only">
                      Weight for {c.name}
                    </label>
                    <input
                      id={`${idPrefix}-w-${c.id}`}
                      type="number"
                      min={0}
                      max={100}
                      className="h-9 w-20 rounded-lg border bg-background px-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      value={c.weight}
                      onChange={(e) => setWeight(idx, Number.parseInt(e.target.value, 10))}
                      aria-required="true"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
            + Add Criteria
          </Button>
          <p
            className={cn(
              "text-sm font-semibold",
              balanced ? "text-[#16a34a]" : "text-[#f59e0b]",
            )}
            role="status"
          >
            Total Weight: {tw}%
            {!balanced ? " (target 100%)" : ""}
          </p>
        </div>
      </section>

      <section aria-labelledby={`${idPrefix}-options-heading`}>
        <h4 id={`${idPrefix}-options-heading`} className="text-base font-semibold text-foreground">
          2.2 Solution Options
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Options compared in the scoring grid (aligned to your shortlist).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {value.optionKeys.map((k) => (
            <span
              key={k}
              className="inline-flex items-center rounded-full border border-[#2563eb]/25 bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1d4ed8]"
            >
              {value.optionLabels[k] ?? k}
            </span>
          ))}
        </div>
      </section>

      <section aria-labelledby={`${idPrefix}-matrix-heading`}>
        <h4 id={`${idPrefix}-matrix-heading`} className="text-base font-semibold text-foreground">
          2.3 Scoring Matrix
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Score each option from 1 (low) to 5 (high) for every criterion.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Criteria (Weight)</th>
                {value.optionKeys.map((ok) => (
                  <th key={ok} className="px-3 py-2.5 font-medium">
                    {value.optionLabels[ok]?.replace(/^Option [A-C] — /, "") ?? ok}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium">Comments (Optional)</th>
              </tr>
            </thead>
            <tbody>
              {value.criteria.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">({c.weight}%)</div>
                  </td>
                  {value.optionKeys.map((ok) => {
                    const sid = `${idPrefix}-s-${c.id}-${ok}`;
                    return (
                      <td key={ok} className="px-3 py-2 align-top">
                        <label htmlFor={sid} className="sr-only">
                          Score for {c.name}, {value.optionLabels[ok]}
                        </label>
                        <select
                          id={sid}
                          className="h-9 w-full min-w-[72px] rounded-lg border bg-background px-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                          value={value.scores[c.id]?.[ok] ?? ""}
                          onChange={(e) =>
                            setScore(c.id, ok, Number.parseInt(e.target.value, 10))
                          }
                          aria-required="true"
                        >
                          <option value="">—</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 align-top">
                    <label htmlFor={`${idPrefix}-co-${c.id}`} className="sr-only">
                      Comment for {c.name}
                    </label>
                    <textarea
                      id={`${idPrefix}-co-${c.id}`}
                      rows={2}
                      className="w-full min-w-[160px] resize-y rounded-lg border bg-background px-2 py-1.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Justification…"
                      value={value.rowComments[c.id] ?? ""}
                      onChange={(e) => setComment(c.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
