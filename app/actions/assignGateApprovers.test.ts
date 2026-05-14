import { describe, expect, it, vi } from "vitest";

// Mock all server-only side effects so the test runs as a pure unit on the
// Zod schema and the early-return branches of the action.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    gateApproverAssignment: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/server/current-user", () => ({
  requireCurrentUser: vi.fn().mockResolvedValue({ id: "u_test" }),
}));
vi.mock("@/lib/server/audit", () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/server/logger", () => ({
  logInfo: vi.fn(),
}));
vi.mock("@/lib/server/request-context", () => ({
  getRequestIdFromHeaders: vi.fn().mockResolvedValue("req_test"),
}));

import { assignGateApprovers } from "@/app/actions/assignGateApprovers";

describe("assignGateApprovers (input validation)", () => {
  it("rejects an empty approver list", async () => {
    const res = await assignGateApprovers({
      projectId: "proj_1",
      gateId: "G3",
      approvers: [],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.toLowerCase()).toContain("at least one approver");
    }
  });

  it("rejects approvers with missing name or role", async () => {
    const res = await assignGateApprovers({
      projectId: "proj_1",
      gateId: "G3",
      approvers: [{ name: "", role: "Governance" }],
    });

    expect(res.ok).toBe(false);
  });

  it("rejects invalid gate ids", async () => {
    const res = await assignGateApprovers({
      // @ts-expect-error: deliberately invalid for negative coverage
      gateId: "GZ",
      projectId: "proj_1",
      approvers: [{ name: "Jane", role: "Governance" }],
    });

    expect(res.ok).toBe(false);
  });

  it("returns 'Project not found' for unknown projectIds (auth-equivalent boundary)", async () => {
    const res = await assignGateApprovers({
      projectId: "proj_missing",
      gateId: "G3",
      approvers: [{ name: "Jane", role: "Governance" }],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Project not found");
    }
  });
});
