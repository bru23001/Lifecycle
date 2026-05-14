import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
  recordAudit: vi.fn().mockResolvedValue(undefined),
  requireCurrentUser: vi.fn().mockResolvedValue({ id: "u_test" }),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artifact: {
      findFirst: mocks.findFirst,
      update: mocks.update,
    },
  },
}));
vi.mock("@/lib/server/audit", () => ({ recordAudit: mocks.recordAudit }));
vi.mock("@/lib/server/current-user", () => ({
  requireCurrentUser: mocks.requireCurrentUser,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { archiveProjectArtifact } from "@/app/actions/archiveProjectArtifact";

describe("archiveProjectArtifact", () => {
  beforeEach(() => {
    mocks.findFirst.mockReset();
    mocks.update.mockReset();
    mocks.recordAudit.mockClear();
    mocks.requireCurrentUser.mockClear();
    mocks.revalidatePath.mockClear();
  });

  it("returns a not-found error when artifact is missing", async () => {
    mocks.findFirst.mockResolvedValueOnce(null);

    const res = await archiveProjectArtifact({
      projectId: "proj_1",
      artifactId: "art_missing",
    });

    expect(res).toEqual({ ok: false, error: "Artifact not found." });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.recordAudit).not.toHaveBeenCalled();
  });

  it("is idempotent when artifact is already archived", async () => {
    mocks.findFirst.mockResolvedValueOnce({
      id: "art_1",
      status: "Archived",
      templateId: "A-1",
    });

    const res = await archiveProjectArtifact({
      projectId: "proj_1",
      artifactId: "art_1",
    });

    expect(res).toEqual({ ok: true });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.recordAudit).not.toHaveBeenCalled();
  });

  it("archives a draft artifact, writes audit, and revalidates routes", async () => {
    mocks.findFirst.mockResolvedValueOnce({
      id: "art_2",
      status: "Draft",
      templateId: "A-2",
    });
    mocks.update.mockResolvedValueOnce({ id: "art_2" });

    const res = await archiveProjectArtifact({
      projectId: "proj_9",
      artifactId: "art_2",
    });

    expect(res).toEqual({ ok: true });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "art_2" },
      data: { status: "Archived" },
    });
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "artifact.archived",
        subjectKind: "artifact",
        subjectId: "art_2",
        projectId: "proj_9",
        metadata: { templateId: "A-2" },
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/proj_9");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/projects/proj_9/artifacts",
    );
  });
});
