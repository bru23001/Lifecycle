import { describe, expect, it, vi, beforeEach } from "vitest";

// All server-only side effects are mocked so this runs as a pure unit on the
// Zod schema and the early-return / authz branches of the action.
// `vi.hoisted` defers nothing — its body runs before any `vi.mock` factories.
const mocks = vi.hoisted(() => ({
  projectFindUnique: vi.fn(),
  requirementFindUnique: vi.fn(),
  featureFindUnique: vi.fn(),
  artifactFindUnique: vi.fn(),
  traceLinkFindFirst: vi.fn(),
  traceLinkCreate: vi.fn(),
  recordAuditMock: vi.fn().mockResolvedValue(undefined),
  logInfoMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findUnique: mocks.projectFindUnique },
    requirement: { findUnique: mocks.requirementFindUnique },
    feature: { findUnique: mocks.featureFindUnique },
    artifact: { findUnique: mocks.artifactFindUnique },
    traceLink: {
      findFirst: mocks.traceLinkFindFirst,
      create: mocks.traceLinkCreate,
    },
  },
}));
vi.mock("@/lib/server/current-user", () => ({
  requireCurrentUser: vi.fn().mockResolvedValue({ id: "u_test" }),
}));
vi.mock("@/lib/server/audit", () => ({ recordAudit: mocks.recordAuditMock }));
vi.mock("@/lib/server/logger", () => ({ logInfo: mocks.logInfoMock }));
vi.mock("@/lib/server/request-context", () => ({
  getRequestIdFromHeaders: vi.fn().mockResolvedValue("req_test"),
}));

const {
  projectFindUnique,
  requirementFindUnique,
  featureFindUnique,
  traceLinkFindFirst,
  traceLinkCreate,
  recordAuditMock,
  logInfoMock,
} = mocks;

import { createTraceLink } from "@/app/actions/createTraceLink";

const validInput = {
  projectId: "proj_1",
  fromKind: "requirement" as const,
  fromId: "req_1",
  toKind: "feature" as const,
  toId: "feat_1",
  relation: "derives" as const,
  rationale: "Customer login requirement derived into the auth feature.",
  confidence: "medium" as const,
  evidenceReference: "",
};

beforeEach(() => {
  projectFindUnique.mockReset();
  requirementFindUnique.mockReset();
  featureFindUnique.mockReset();
  mocks.artifactFindUnique.mockReset();
  traceLinkFindFirst.mockReset();
  traceLinkCreate.mockReset();
  recordAuditMock.mockClear();
  logInfoMock.mockClear();
});

describe("createTraceLink (input validation)", () => {
  it("rejects rationale shorter than 3 chars", async () => {
    const res = await createTraceLink({ ...validInput, rationale: "ok" });
    expect(res.ok).toBe(false);
  });

  it("rejects rationale longer than 500 chars", async () => {
    const res = await createTraceLink({ ...validInput, rationale: "a".repeat(501) });
    expect(res.ok).toBe(false);
  });

  it("rejects invalid `relation`", async () => {
    const res = await createTraceLink({
      ...validInput,
      // @ts-expect-error: deliberately invalid for negative coverage
      relation: "bogus",
    });
    expect(res.ok).toBe(false);
  });

  it("rejects invalid endpoint `kind`", async () => {
    const res = await createTraceLink({
      ...validInput,
      // @ts-expect-error: deliberately invalid for negative coverage
      fromKind: "evidence",
    });
    expect(res.ok).toBe(false);
  });

  it("rejects identical source and target", async () => {
    const res = await createTraceLink({
      ...validInput,
      fromKind: "requirement",
      fromId: "same",
      toKind: "requirement",
      toId: "same",
    });
    expect(res.ok).toBe(false);
  });
});

describe("createTraceLink (authz / project boundary)", () => {
  it("returns 'Project not found' when the project is missing", async () => {
    projectFindUnique.mockResolvedValueOnce(null);

    const res = await createTraceLink(validInput);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Project not found");
    }
  });

  it("rejects cross-project source endpoint", async () => {
    projectFindUnique.mockResolvedValueOnce({ id: "proj_1" });
    requirementFindUnique.mockResolvedValueOnce({ projectId: "proj_OTHER" });
    featureFindUnique.mockResolvedValueOnce({ projectId: "proj_1" });

    const res = await createTraceLink(validInput);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.toLowerCase()).toContain("source object not found");
    }
  });

  it("rejects cross-project target endpoint", async () => {
    projectFindUnique.mockResolvedValueOnce({ id: "proj_1" });
    requirementFindUnique.mockResolvedValueOnce({ projectId: "proj_1" });
    featureFindUnique.mockResolvedValueOnce({ projectId: "proj_OTHER" });

    const res = await createTraceLink(validInput);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.toLowerCase()).toContain("target object not found");
    }
  });
});

describe("createTraceLink (dedup + happy path)", () => {
  it("rejects a duplicate link", async () => {
    projectFindUnique.mockResolvedValueOnce({ id: "proj_1" });
    requirementFindUnique.mockResolvedValueOnce({ projectId: "proj_1" });
    featureFindUnique.mockResolvedValueOnce({ projectId: "proj_1" });
    traceLinkFindFirst.mockResolvedValueOnce({ id: "tl_existing" });

    const res = await createTraceLink(validInput);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.toLowerCase()).toContain("already exists");
    }
    expect(traceLinkCreate).not.toHaveBeenCalled();
  });

  it("creates the link + writes audit + log on success", async () => {
    projectFindUnique.mockResolvedValueOnce({ id: "proj_1" });
    requirementFindUnique.mockResolvedValueOnce({ projectId: "proj_1" });
    featureFindUnique.mockResolvedValueOnce({ projectId: "proj_1" });
    traceLinkFindFirst.mockResolvedValueOnce(null);
    traceLinkCreate.mockResolvedValueOnce({ id: "tl_new" });

    const res = await createTraceLink(validInput);
    expect(res).toEqual({ ok: true, linkId: "tl_new" });
    expect(traceLinkCreate).toHaveBeenCalledTimes(1);
    expect(traceLinkCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "proj_1",
          fromKind: "requirement",
          fromId: "req_1",
          toKind: "feature",
          toId: "feat_1",
          relation: "derives",
          rationale: validInput.rationale,
          confidence: "medium",
          evidenceReference: "",
          createdByUserId: "u_test",
        }),
      }),
    );
    expect(recordAuditMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "trace_link.created",
        subjectKind: "trace_link",
        subjectId: "tl_new",
        projectId: "proj_1",
      }),
    );
    expect(logInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "trace_link.created",
        rationale_present: true,
      }),
    );
    // PII hygiene: the free-form rationale text MUST NOT appear in the log payload.
    const logCall = logInfoMock.mock.calls[0]?.[0];
    expect(JSON.stringify(logCall)).not.toContain(validInput.rationale);
  });
});
