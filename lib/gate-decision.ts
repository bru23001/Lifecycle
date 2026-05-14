import type {
  DecisionCriterion,
  DecisionCriteriaSummary,
  GateDecisionType,
  GateEvidenceItem,
  GateReviewActionState,
  GateReviewSubmitBlocker,
  NextPhaseUnlockState,
  RequiredGateInput,
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

let blockerSeq = 0;
function nextBlockerId(prefix: string) {
  blockerSeq += 1;
  return `${prefix}-${blockerSeq}`;
}

export function buildStructuredSubmitBlockers(args: {
  /** Gate evidence / policy failures from server load (must stay blocking). */
  serverMessages: string[];
  draftDecision: GateDecisionType | undefined;
  decisionComments: string;
  conditions: string[];
  requiredInputs: RequiredGateInput[];
  completionEvidence: GateEvidenceItem[];
  approversCount: number;
  criteria: DecisionCriterion[];
}): GateReviewSubmitBlocker[] {
  const out: GateReviewSubmitBlocker[] = [];

  for (let i = 0; i < args.serverMessages.length; i += 1) {
    out.push({
      id: nextBlockerId("server"),
      category: "server",
      message: args.serverMessages[i]!,
      jumpTarget: "evidence",
      recommendedFix: "Resolve failing evidence checks or attach missing artifacts, then try again.",
    });
  }

  if (args.requiredInputs.length === 0) {
    out.push({
      id: nextBlockerId("inputs"),
      category: "required_inputs",
      message: "No required inputs configured for this gate.",
      jumpTarget: "inputs",
      recommendedFix: "Configure required inputs for this gate in project settings or templates.",
    });
  } else {
    for (const input of args.requiredInputs) {
      if (!input.provided || input.status !== "complete") {
        const label = input.inputCode ? `${input.inputCode}: ${input.name}` : input.name;
        out.push({
          id: nextBlockerId("input"),
          category: "required_inputs",
          message: `Required input incomplete: ${label}.`,
          jumpTarget: "inputs",
          recommendedFix: "Provide or complete this input on the Inputs pane.",
        });
      }
    }
  }

  if (args.completionEvidence.length === 0) {
    out.push({
      id: nextBlockerId("evidence"),
      category: "evidence",
      message: "No completion evidence attached for this gate.",
      jumpTarget: "evidence",
      recommendedFix: "Attach at least one evidence item linked to this gate.",
    });
  }

  if (args.approversCount === 0) {
    out.push({
      id: nextBlockerId("approvers"),
      category: "approvers",
      message: "No approvers assigned.",
      jumpTarget: "approvers",
      recommendedFix: "Assign at least one approver before submitting a decision.",
    });
  }

  if (args.criteria.some((c) => c.assessment === "not_reviewed")) {
    out.push({
      id: nextBlockerId("criteria"),
      category: "criteria",
      message: "All decision criteria must be assessed.",
      jumpTarget: "criteria",
      recommendedFix: "Open each criterion and set Meets / Partially meets / Does not meet / Not reviewed → resolved.",
    });
  }

  if (!args.draftDecision) {
    out.push({
      id: nextBlockerId("decision"),
      category: "decision",
      message: "No decision has been selected.",
      jumpTarget: "decision",
      recommendedFix: "Choose Approve, Conditional approval, Request changes, or Reject in the decision record.",
    });
  }

  if (args.draftDecision === "request_changes" || args.draftDecision === "reject") {
    if (!args.decisionComments.trim()) {
      out.push({
        id: nextBlockerId("comments"),
        category: "comments_conditions",
        message: "Comments are required for this decision.",
        jumpTarget: "decision",
        recommendedFix: "Add decision comments explaining the return or rejection.",
      });
    }
  }

  if (args.draftDecision === "conditional_approve") {
    if (args.conditions.filter((c) => c.trim()).length === 0) {
      out.push({
        id: nextBlockerId("conditions"),
        category: "comments_conditions",
        message: "At least one condition is required for a conditional approval.",
        jumpTarget: "decision",
        recommendedFix: "Use the conditional approval flow to capture explicit conditions before submit.",
      });
    }
  }

  return out;
}

/** Flat list of blocker messages (e.g. decision modals, tests). */
export function buildSubmitBlockers(args: {
  draftDecision: GateDecisionType | undefined;
  decisionComments: string;
  conditions: string[];
  requiredInputs: RequiredGateInput[];
  completionEvidence: GateEvidenceItem[];
  approversCount: number;
  criteria: DecisionCriterion[];
  /** When gate evidence checks failed on load, pass `base.submitBlockers` here. */
  serverMessages?: string[];
}): string[] {
  return buildStructuredSubmitBlockers({
    serverMessages: args.serverMessages ?? [],
    draftDecision: args.draftDecision,
    decisionComments: args.decisionComments,
    conditions: args.conditions,
    requiredInputs: args.requiredInputs,
    completionEvidence: args.completionEvidence,
    approversCount: args.approversCount,
    criteria: args.criteria,
  }).map((b) => b.message);
}

export function computeActionState(args: {
  base: GateReviewActionState;
  draftDecision: GateDecisionType | undefined;
  decisionComments: string;
  conditions: string[];
  requiredInputs: RequiredGateInput[];
  completionEvidence: GateEvidenceItem[];
  approversCount: number;
  criteria: DecisionCriterion[];
}): GateReviewActionState {
  const serverMessages = args.base.canSubmitDecision ? [] : args.base.submitBlockers;
  const structuredSubmitBlockers = buildStructuredSubmitBlockers({
    serverMessages,
    draftDecision: args.draftDecision,
    decisionComments: args.decisionComments,
    conditions: args.conditions,
    requiredInputs: args.requiredInputs,
    completionEvidence: args.completionEvidence,
    approversCount: args.approversCount,
    criteria: args.criteria,
  });
  const canSubmitDecision = structuredSubmitBlockers.length === 0;
  return {
    ...args.base,
    canSubmitDecision,
    submitBlockers: canSubmitDecision ? [] : structuredSubmitBlockers.map((b) => b.message),
    structuredSubmitBlockers: canSubmitDecision ? [] : structuredSubmitBlockers,
  };
}
