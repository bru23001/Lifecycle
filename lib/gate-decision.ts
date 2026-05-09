import type {
  DecisionCriterion,
  DecisionCriteriaSummary,
  GateDecisionType,
  GateReviewActionState,
  NextPhaseUnlockState,
} from "@/types/gate-review.types";

export function computeOverallAssessment(criteria: DecisionCriterion[]): DecisionCriteriaSummary["overallAssessment"] {
  if (criteria.length === 0) return "not_reviewed";
  if (criteria.some((c) => c.assessment === "does_not_meet")) {
    return "does_not_meet_requirements";
  }
  if (criteria.some((c) => c.assessment === "not_reviewed")) {
    return "not_reviewed";
  }

  let weightedMet = 0;
  let total = 0;
  for (const c of criteria) {
    total += c.weightPercent;
    if (c.assessment === "meets") {
      weightedMet += c.weightPercent;
    } else if (c.assessment === "partially_meets") {
      weightedMet += c.weightPercent * 0.85;
    }
  }
  if (total <= 0) return "not_reviewed";
  const ratio = weightedMet / total;
  if (ratio >= 0.92) return "meets_requirements";
  return "partially_meets_requirements";
}

export function applyUnlockRules(
  decision: GateDecisionType | undefined,
  base: NextPhaseUnlockState,
): NextPhaseUnlockState {
  if (!decision) {
    return {
      ...base,
      canUnlock: false,
      unlockStatus: base.unlockStatus === "unlocked" ? "unlocked" : "ready",
    };
  }
  if (decision === "approve" || decision === "conditional_approve") {
    return {
      ...base,
      canUnlock: true,
      unlockStatus: "unlocked",
      requirements: base.requirements.map((r) =>
        r.id === "decision" ? { ...r, status: "complete" as const } : r,
      ),
    };
  }
  return {
    ...base,
    canUnlock: false,
    unlockStatus: "blocked",
    requirements: base.requirements.map((r) =>
      r.id === "decision" ? { ...r, status: "blocked" as const } : r,
    ),
  };
}

export function buildSubmitBlockers(args: {
  draftDecision: GateDecisionType | undefined;
  decisionComments: string;
  conditions: string[];
  requiredInputsCount: number;
  approversCount: number;
  criteria: DecisionCriterion[];
}): string[] {
  const blockers: string[] = [];
  if (args.requiredInputsCount === 0) {
    blockers.push("No required inputs configured for this gate.");
  }
  if (args.approversCount === 0) {
    blockers.push("No approvers assigned.");
  }
  if (!args.draftDecision) {
    blockers.push("No decision has been selected.");
  }
  if (args.draftDecision === "request_changes" || args.draftDecision === "reject") {
    if (!args.decisionComments.trim()) {
      blockers.push("Comments are required for this decision.");
    }
  }
  if (args.draftDecision === "conditional_approve") {
    if (args.conditions.filter((c) => c.trim()).length === 0) {
      blockers.push("At least one condition is required for a conditional approval.");
    }
  }
  if (args.criteria.some((c) => c.assessment === "not_reviewed")) {
    blockers.push("All decision criteria must be assessed.");
  }
  return blockers;
}

export function computeActionState(args: {
  base: GateReviewActionState;
  draftDecision: GateDecisionType | undefined;
  decisionComments: string;
  conditions: string[];
  requiredInputsCount: number;
  approversCount: number;
  criteria: DecisionCriterion[];
}): GateReviewActionState {
  const submitBlockers = buildSubmitBlockers({
    draftDecision: args.draftDecision,
    decisionComments: args.decisionComments,
    conditions: args.conditions,
    requiredInputsCount: args.requiredInputsCount,
    approversCount: args.approversCount,
    criteria: args.criteria,
  });
  const canSubmitDecision = submitBlockers.length === 0;
  return {
    ...args.base,
    canSubmitDecision,
    submitBlockers: canSubmitDecision ? [] : submitBlockers,
  };
}
