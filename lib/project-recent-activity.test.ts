import { describe, expect, it } from "vitest";

import { buildSelectedProjectRecentActivity } from "@/lib/project-recent-activity";
import type { ProjectScreenAuditEntry } from "@/types/projects.types";

const baseAudit = (overrides: Partial<ProjectScreenAuditEntry>): ProjectScreenAuditEntry => ({
  id: "ae1",
  createdAt: "2020-01-02T12:00:00.000Z",
  action: "artifact.saved",
  title: "Artifact saved",
  subjectKind: "artifact",
  subjectId: "art_old",
  detail: "template A-1",
  actorLabel: "Tester",
  actorEmail: null,
  metadata: {},
  lifecycleRelevant: false,
  relatedHrefs: [],
  ...overrides,
});

describe("buildSelectedProjectRecentActivity", () => {
  it("sorts newest first across gates and audit rows", () => {
    const gates = [
      {
        gateId: "G1",
        decision: "Accepted",
        authorityName: "A",
        authorityRole: "R",
        createdAt: new Date("2020-01-01T00:00:00.000Z"),
      },
    ];
    const audit: ProjectScreenAuditEntry[] = [
      baseAudit({
        id: "newer",
        createdAt: "2020-01-03T00:00:00.000Z",
        subjectId: "art_new",
        href: "/projects/p1/artifacts/art_new",
      }),
      baseAudit({
        id: "older",
        createdAt: "2020-01-02T00:00:00.000Z",
        subjectId: "art_mid",
        href: "/projects/p1/artifacts/art_mid",
      }),
    ];
    const out = buildSelectedProjectRecentActivity("p1", gates, audit, 10);
    expect(out[0]?.id).toBe("audit-newer");
    expect(out[1]?.id).toBe("audit-older");
    expect(out[2]?.id).toMatch(/^gate-G1-\d+$/);
  });

  it("excludes audit rows without href", () => {
    const audit: ProjectScreenAuditEntry[] = [
      baseAudit({
        id: "no-link",
        href: undefined,
        createdAt: "2020-06-01T00:00:00.000Z",
      }),
      baseAudit({
        id: "with-link",
        href: "/projects/p1/artifacts/art_x",
        createdAt: "2020-01-01T00:00:00.000Z",
      }),
    ];
    const out = buildSelectedProjectRecentActivity("p1", [], audit, 10);
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe("audit-with-link");
  });
});
