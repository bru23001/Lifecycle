import { describe, expect, it } from "vitest";

import { resolveContinueNextActionHref } from "@/lib/continue-next-action-href";

const ts = () => new Date("2024-06-01T12:00:00.000Z");

describe("resolveContinueNextActionHref", () => {
  it("routes to an open approval when present", () => {
    expect(
      resolveContinueNextActionHref({
        projectId: "proj_1",
        currentPhase: 1,
        applicabilityJson: {},
        artifacts: [],
        latestByGate: new Map(),
        firstOpenApprovalId: "appr_99",
      }),
    ).toBe("/approvals/appr_99");
  });

  it("routes to the first incomplete required template for the DB phase", () => {
    expect(
      resolveContinueNextActionHref({
        projectId: "proj_1",
        currentPhase: 1,
        applicabilityJson: {},
        artifacts: [],
        latestByGate: new Map(),
        firstOpenApprovalId: null,
      }),
    ).toBe("/projects/proj_1/templates/A-0");
  });

  it("when phase has no templates, sends user to attach evidence in the workspace", () => {
    expect(
      resolveContinueNextActionHref({
        projectId: "proj_1",
        currentPhase: 5,
        applicabilityJson: {},
        artifacts: [],
        latestByGate: new Map(),
        firstOpenApprovalId: null,
      }),
    ).toBe("/projects/proj_1/workspace?phase=5#evidence-attachments");
  });

  it("when phase templates are satisfied with evidence, sends user to the next gate review", () => {
    expect(
      resolveContinueNextActionHref({
        projectId: "proj_1",
        currentPhase: 1,
        applicabilityJson: {},
        artifacts: [
          {
            id: "art_1",
            templateId: "A-0",
            version: 1,
            status: "Final",
            updatedAt: ts(),
            markdownPath: "vault/A-0.md",
          },
        ],
        latestByGate: new Map(),
        firstOpenApprovalId: null,
      }),
    ).toBe("/projects/proj_1/gates/g1/review");
  });
});
