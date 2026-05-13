import { describe, expect, it } from "vitest";

import { decisionLabelFromStatus, resolveRecentDecisionHref } from "@/lib/recent-decision-href";

describe("resolveRecentDecisionHref", () => {
  it("maps gate review targets", () => {
    expect(
      resolveRecentDecisionHref({
        targetType: "gate_review",
        projectId: "proj_1",
        gateId: "G4",
      }),
    ).toBe("/projects/proj_1/gates/g4/review");
  });

  it("maps approval detail targets", () => {
    expect(
      resolveRecentDecisionHref({
        targetType: "approval_detail",
        approvalId: "appr_1",
      }),
    ).toBe("/approvals/appr_1");
  });

  it("maps audit detail targets", () => {
    expect(
      resolveRecentDecisionHref({
        targetType: "audit_detail",
        projectId: "proj_1",
        auditEventId: "audit_1",
      }),
    ).toBe("/projects/proj_1/audit/audit_1");
  });

  it("maps audit trail list when project is known but event id is missing", () => {
    expect(
      resolveRecentDecisionHref({
        targetType: "audit_detail",
        projectId: "proj_1",
        auditEventId: null,
      }),
    ).toBe("/projects/proj_1?tab=audit_trail");
  });

  it("falls back safely when ids are missing", () => {
    expect(
      resolveRecentDecisionHref({
        targetType: "gate_review",
        projectId: null,
        gateId: "G1",
      }),
    ).toBe("/projects");
    expect(
      resolveRecentDecisionHref({
        targetType: "approval_detail",
        approvalId: null,
      }),
    ).toBe("/approvals");
    expect(
      resolveRecentDecisionHref({
        targetType: "audit_detail",
        projectId: null,
        auditEventId: null,
      }),
    ).toBe("/projects");
  });
});

describe("decisionLabelFromStatus", () => {
  it("normalizes approval and gate statuses", () => {
    expect(decisionLabelFromStatus("Accepted")).toBe("Approved");
    expect(decisionLabelFromStatus("approved")).toBe("Approved");
    expect(decisionLabelFromStatus("Rejected")).toBe("Changes Requested");
    expect(decisionLabelFromStatus("changes_requested")).toBe("Changes Requested");
    expect(decisionLabelFromStatus("pending")).toBe("Pending");
  });
});
