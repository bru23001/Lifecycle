import { describe, expect, it } from "vitest";

import { classifyArtifactBulkTargets } from "@/lib/approval-bulk-targets";
import type { ApprovalPackage, PendingApproval } from "@/types/approval-center.types";

function makeRow(overrides: Partial<PendingApproval> = {}): PendingApproval {
  return {
    id: "approval-1",
    approvalCode: "APR-1",
    title: "Sample Approval",
    approvalType: "artifact_review",
    projectId: "project-1",
    projectName: "Project 1",
    submittedBy: "User",
    submittedOnLabel: "Now",
    submittedAtMs: Date.now(),
    updatedAtMs: Date.now(),
    dueAtMs: null,
    priority: "medium",
    status: "in_review",
    href: "/approvals/approval-1",
    queueTab: "pending",
    ...overrides,
  };
}

function makePackage(overrides: Partial<ApprovalPackage> = {}): ApprovalPackage {
  return {
    detail: {
      id: "approval-1",
      approvalCode: "APR-1",
      title: "Sample Approval",
      description: "",
      approvalType: "artifact_review",
      projectId: "project-1",
      projectName: "Project 1",
      status: "in_review",
      submittedBy: "User",
      submittedOnLabel: "Now",
      priority: "medium",
      linkedArtifactsCount: 0,
      evidenceItemsCount: 0,
      approversCount: 1,
      reviewType: "standard",
    },
    requiredInputs: [],
    comments: [],
    approvers: [],
    attachments: [],
    decisionDraft: {
      approvalId: "approval-1",
      comments: "",
      requiredChanges: [],
      conditions: [],
      canSubmit: false,
      blockers: [],
    },
    history: [],
    actionState: {
      readinessLabel: "Ready",
      readinessSummary: "Ready",
      canSaveReview: true,
      canSubmitDecision: false,
      submitBlockers: [],
    },
    ...overrides,
  };
}

describe("classifyArtifactBulkTargets", () => {
  it("keeps artifact rows that are loaded and not blocked", () => {
    const row = makeRow();
    const pkg = makePackage();
    const out = classifyArtifactBulkTargets([row], { [row.id]: pkg });

    expect(out.eligible).toHaveLength(1);
    expect(out.skipped).toHaveLength(0);
    expect(out.eligible[0]?.id).toBe(row.id);
  });

  it("skips rows with missing packages", () => {
    const row = makeRow();
    const out = classifyArtifactBulkTargets([row], {});

    expect(out.eligible).toHaveLength(0);
    expect(out.skipped).toHaveLength(1);
    expect(out.skipped[0]?.reason).toBe("Package not loaded.");
  });

  it("skips gate review approvals", () => {
    const row = makeRow({ id: "approval-gate", approvalType: "gate_review" });
    const pkg = makePackage({
      detail: { ...makePackage().detail, id: row.id, approvalType: "gate_review" },
    });
    const out = classifyArtifactBulkTargets([row], { [row.id]: pkg });

    expect(out.eligible).toHaveLength(0);
    expect(out.skipped).toHaveLength(1);
    expect(out.skipped[0]?.reason).toBe("Use Gate Review to complete this approval.");
  });

  it("skips blocked rows", () => {
    const row = makeRow({ id: "approval-blocked", status: "blocked" });
    const pkg = makePackage({ detail: { ...makePackage().detail, id: row.id } });
    const out = classifyArtifactBulkTargets([row], { [row.id]: pkg });

    expect(out.eligible).toHaveLength(0);
    expect(out.skipped).toHaveLength(1);
    expect(out.skipped[0]?.reason).toBe("Approval is blocked.");
  });
});
