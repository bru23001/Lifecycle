import { describe, expect, it } from "vitest";

import { buildStructuredSubmitBlockers, buildSubmitBlockers, computeActionState } from "@/lib/gate-decision";
import type { GateReviewActionState, RequiredGateInput, DecisionCriterion, GateEvidenceItem } from "@/types/gate-review.types";

const baseInput = (overrides: Partial<RequiredGateInput> = {}): RequiredGateInput => ({
  id: "in1",
  inputCode: "REQ",
  name: "Requirements",
  description: "",
  provided: true,
  status: "complete",
  ...overrides,
});

const baseCriterion = (overrides: Partial<DecisionCriterion> = {}): DecisionCriterion => ({
  id: "c1",
  name: "Security",
  weightPercent: 100,
  assessment: "meets",
  evidenceRefs: [],
  ...overrides,
});

const baseEvidence = (): GateEvidenceItem => ({
  id: "ev1",
  name: "Pack",
  type: "pdf",
  linkedTo: [],
  addedBy: "u",
  addedOnLabel: "today",
  href: "/e",
});

describe("buildStructuredSubmitBlockers", () => {
  it("includes server messages as server-category blockers", () => {
    const blockers = buildStructuredSubmitBlockers({
      serverMessages: ["Evidence check failed"],
      draftDecision: "approve",
      decisionComments: "ok",
      conditions: [],
      requiredInputs: [baseInput()],
      completionEvidence: [baseEvidence()],
      approversCount: 1,
      criteria: [baseCriterion()],
    });
    expect(blockers.some((b) => b.category === "server" && b.message === "Evidence check failed")).toBe(true);
  });

  it("requires comments for request_changes", () => {
    const blockers = buildStructuredSubmitBlockers({
      serverMessages: [],
      draftDecision: "request_changes",
      decisionComments: "   ",
      conditions: [],
      requiredInputs: [baseInput()],
      completionEvidence: [baseEvidence()],
      approversCount: 1,
      criteria: [baseCriterion()],
    });
    expect(blockers.some((b) => b.message.includes("Comments are required"))).toBe(true);
  });

  it("requires conditions for conditional_approve", () => {
    const blockers = buildStructuredSubmitBlockers({
      serverMessages: [],
      draftDecision: "conditional_approve",
      decisionComments: "ok",
      conditions: ["", "  "],
      requiredInputs: [baseInput()],
      completionEvidence: [baseEvidence()],
      approversCount: 1,
      criteria: [baseCriterion()],
    });
    expect(blockers.some((b) => b.message.includes("condition"))).toBe(true);
  });
});

describe("buildSubmitBlockers", () => {
  it("returns flat message strings", () => {
    const msgs = buildSubmitBlockers({
      draftDecision: undefined,
      decisionComments: "",
      conditions: [],
      requiredInputs: [baseInput()],
      completionEvidence: [baseEvidence()],
      approversCount: 1,
      criteria: [baseCriterion({ assessment: "not_reviewed" })],
    });
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs.every((m) => typeof m === "string")).toBe(true);
  });
});

describe("computeActionState", () => {
  it("merges server blockers from base when canSubmitDecision is false", () => {
    const base: GateReviewActionState = {
      readinessLabel: "Ready",
      readinessDescription: "desc",
      canSaveReview: true,
      canSubmitDecision: false,
      submitBlockers: ["Server policy"],
      structuredSubmitBlockers: [],
    };
    const next = computeActionState({
      base,
      draftDecision: "approve",
      decisionComments: "ok",
      conditions: [],
      requiredInputs: [baseInput()],
      completionEvidence: [baseEvidence()],
      approversCount: 1,
      criteria: [baseCriterion()],
    });
    expect(next.canSubmitDecision).toBe(false);
    expect(next.submitBlockers.some((m) => m === "Server policy")).toBe(true);
    expect(next.structuredSubmitBlockers?.some((b) => b.message === "Server policy")).toBe(true);
  });

  it("clears blockers when base allows submit and client state is complete", () => {
    const base: GateReviewActionState = {
      readinessLabel: "Ready",
      readinessDescription: "desc",
      canSaveReview: true,
      canSubmitDecision: true,
      submitBlockers: [],
      structuredSubmitBlockers: [],
    };
    const next = computeActionState({
      base,
      draftDecision: "approve",
      decisionComments: "ok",
      conditions: [],
      requiredInputs: [baseInput()],
      completionEvidence: [baseEvidence()],
      approversCount: 1,
      criteria: [baseCriterion()],
    });
    expect(next.canSubmitDecision).toBe(true);
    expect(next.submitBlockers).toEqual([]);
    expect(next.structuredSubmitBlockers).toEqual([]);
  });
});
