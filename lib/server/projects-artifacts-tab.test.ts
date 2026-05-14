import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  projectFindFirst: vi.fn(),
  getAllTemplates: vi.fn(),
  hasTemplate: vi.fn(),
  getTemplate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findFirst: mocks.projectFindFirst,
    },
  },
}));
vi.mock("@/templates/registry", () => ({
  getAllTemplates: mocks.getAllTemplates,
  hasTemplate: mocks.hasTemplate,
  getTemplate: mocks.getTemplate,
}));

import { loadProjectsArtifactsTabData } from "@/lib/server/projects-artifacts-tab";

describe("loadProjectsArtifactsTabData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T15:00:00.000Z"));
    mocks.projectFindFirst.mockReset();
    mocks.getAllTemplates.mockReset();
    mocks.hasTemplate.mockReset();
    mocks.getTemplate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for unknown or archived project", async () => {
    mocks.projectFindFirst.mockResolvedValueOnce(null);
    const result = await loadProjectsArtifactsTabData("proj_missing");
    expect(result).toBeNull();
  });

  it("filters modal templates by applicability and maps artifact versions", async () => {
    mocks.getAllTemplates.mockReturnValue([
      { templateId: "A-1", title: "CRS", phase: 1 },
      { templateId: "A-11", title: "ERD", phase: 9 },
      { templateId: "A-12", title: "API Contract", phase: 9 },
      { templateId: "UXD-001", title: "UX Design", phase: 8, applicabilityKey: "ui" },
    ]);
    mocks.hasTemplate.mockImplementation((templateId: string) =>
      ["A-1", "A-12"].includes(templateId),
    );
    mocks.getTemplate.mockImplementation((templateId: string) => {
      if (templateId === "A-1") return { title: "CRS", phase: 1 };
      if (templateId === "A-12") return { title: "API Contract", phase: 9 };
      throw new Error(`Unexpected template: ${templateId}`);
    });

    mocks.projectFindFirst.mockResolvedValueOnce({
      id: "proj_1",
      name: "Apollo",
      currentPhase: 9,
      applicabilityJson: {
        data: false,
        apis: true,
        ui: false,
      },
      artifacts: [
        {
          id: "art_new",
          templateId: "A-1",
          localId: "01",
          version: 2,
          status: "Draft",
          dataJson: { title: "v2" },
          createdAt: new Date("2026-05-13T10:00:00.000Z"),
          updatedAt: new Date("2026-05-13T14:00:00.000Z"),
          evidenceLinks: [],
        },
        {
          id: "art_old",
          templateId: "A-1",
          localId: "01",
          version: 1,
          status: "Approved",
          dataJson: { title: "v1", documentStatus: "Approved" },
          createdAt: new Date("2026-05-12T10:00:00.000Z"),
          updatedAt: new Date("2026-05-12T11:00:00.000Z"),
          evidenceLinks: [],
        },
        {
          id: "art_archived",
          templateId: "A-12",
          localId: "A",
          version: 1,
          status: "Archived",
          dataJson: { endpoint: "/health" },
          createdAt: new Date("2026-05-13T11:00:00.000Z"),
          updatedAt: new Date("2026-05-13T12:00:00.000Z"),
          evidenceLinks: [{ evidenceId: "ev_1" }],
        },
      ],
    });

    const result = await loadProjectsArtifactsTabData("proj_1");
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.templatesForModal.map((t) => t.templateId)).toEqual([
      "A-1",
      "A-12",
    ]);

    const latestA1 = result.artifacts.find(
      (a) => a.templateId === "A-1" && a.localId === "01",
    );
    expect(latestA1?.version).toBe("2");
    expect(latestA1?.status).toBe("draft");
    expect(latestA1?.versions.map((v) => v.version)).toEqual(["2", "1"]);
    expect(latestA1?.versions[0]?.isCurrent).toBe(true);
    expect(latestA1?.versions[1]?.isCurrent).toBe(false);
    expect(latestA1?.lastUpdatedLabel).toBe("1h ago");

    const archived = result.artifacts.find((a) => a.id === "art_archived");
    expect(archived?.status).toBe("archived");
    expect(archived?.detailHref).toBe("/projects/proj_1/artifacts/art_archived");
    expect(archived?.templateWizardHref).toBe("/projects/proj_1/templates/A-12");
  });
});
