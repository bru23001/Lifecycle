import { describe, expect, it } from "vitest";

import { evaluateDecisionState } from "@/lib/approval-decision";
import type { ApprovalDecisionDraft, ApprovalPackage } from "@/types/approval-center.types";

function basePackage(overrides: Partial<ApprovalPackage> = {}): ApprovalPackage {
  const detail = {
    id: "a1",
    approvalCode: "G2",
    title: "G2",
    description: "d",
    approvalType: "gate_review" as const,
    projectId: "p1",
    projectName: "Proj",
    status: "pending" as const,
    submittedBy: "u",
    submittedOnLabel: "t",
    priority: "medium" as const,
    linkedArtifactsCount: 0,
    evidenceItemsCount: 0,
    approversCount: 1,
    reviewType: "standard" as const,
    gateCode: "G2",
    gateName: "Feasibility",
    gateReviewHref: "/projects/p1/gates/g2/review",
  };
  const decisionDraft: ApprovalDecisionDraft = {
    approvalId: "a1",
    decision: "approve",
    comments: "",
    requiredChanges: [],
    conditions: [],
    canSubmit: false,
    blockers: [],
  };
  return {
    detail,
    requiredInputs: [],
    comments: [],
    decisionDraft,
    history: [],
    actionState: {
      readinessLabel: "r",
      readinessSummary: "s",
      canSaveReview: true,
      canSubmitDecision: false,
      submitBlockers: [],
    },
    ...overrides,
  };
}

describe("evaluateDecisionState", () => {
  it("blocks submit for gate_review even when draft looks valid", () => {
    const pkg = basePackage();
    const state = evaluateDecisionState(pkg.decisionDraft, pkg);
    expect(state.canSubmitDecision).toBe(false);
    expect(state.submitBlockers.some((b) => b.includes("Gate Review"))).toBe(true);
  });

  it("allows artifact_review approve when no incomplete inputs", () => {
    const pkg = basePackage({
      detail: {
        ...basePackage().detail,
        id: "art1",
        approvalType: "artifact_review",
        approvalCode: "A-0",
        title: "A-0",
        gateCode: undefined,
        gateName: undefined,
        gateReviewHref: undefined,
      },
      decisionDraft: {
        ...basePackage().decisionDraft,
        approvalId: "art1",
        decision: "approve",
      },
    });
    const state = evaluateDecisionState(pkg.decisionDraft, pkg);
    expect(state.canSubmitDecision).toBe(true);
  });

  it("blocks request_changes without comments", () => {
    const pkg = basePackage({
      detail: { ...basePackage().detail, approvalType: "artifact_review", gateCode: undefined },
      decisionDraft: {
        ...basePackage().decisionDraft,
        decision: "request_changes",
        comments: "",
        requiredChanges: [""],
      },
    });
    const state = evaluateDecisionState(pkg.decisionDraft, pkg);
    expect(state.canSubmitDecision).toBe(false);
  });

  it("allows request_changes with comments and changes", () => {
    const pkg = basePackage({
      detail: { ...basePackage().detail, approvalType: "artifact_review", gateCode: undefined },
      decisionDraft: {
        ...basePackage().decisionDraft,
        decision: "request_changes",
        comments: "Please fix section 2.",
        requiredChanges: ["Update risk table"],
      },
    });
    const state = evaluateDecisionState(pkg.decisionDraft, pkg);
    expect(state.canSubmitDecision).toBe(true);
  });
});
