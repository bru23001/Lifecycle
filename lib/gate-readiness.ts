import type { DecisionCriterion } from "@/types/gate-review.types";

/**
 * Heuristic readiness percent from criteria completion (for draft UI updates).
 * Base header percent is authoritative when not editing.
 */
export function criteriaCompletionPercent(criteria: DecisionCriterion[]): number {
  if (criteria.length === 0) return 0;
  const done = criteria.filter((c) => c.assessment !== "not_reviewed").length;
  return Math.round((done / criteria.length) * 100);
}
