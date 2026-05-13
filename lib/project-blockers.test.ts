import { describe, expect, it } from "vitest";

import {
  buildProjectBlockers,
  resolveProjectBlockerHref,
  resolveProjectBlockersOverviewHref,
} from "@/lib/project-blockers";

describe("resolveProjectBlockerHref", () => {
  it("maps every blocker target to the expected route", () => {
    const projectId = "proj_1";
    expect(
      resolveProjectBlockerHref(projectId, { kind: "workspace-phase", phaseNumber: 4 }),
    ).toBe("/projects/proj_1/workspace?phase=4");
    expect(
      resolveProjectBlockerHref(projectId, { kind: "artifact", artifactId: "art_1" }),
    ).toBe("/projects/proj_1/artifacts/art_1");
    expect(
      resolveProjectBlockerHref(projectId, { kind: "template", templateId: "A-3.2" }),
    ).toBe("/projects/proj_1/templates/A-3.2");
    expect(
      resolveProjectBlockerHref(projectId, { kind: "evidence", evidenceId: "ev_1" }),
    ).toBe("/projects/proj_1/evidence/ev_1");
    expect(
      resolveProjectBlockerHref(projectId, { kind: "evidence-overview", phaseNumber: 4, gateId: "G4" }),
    ).toBe("/projects/proj_1/evidence?phase=4&gate=G4");
    expect(
      resolveProjectBlockerHref(projectId, { kind: "gate-review", gateId: "G4" }),
    ).toBe("/projects/proj_1/gates/g4/review");
    expect(resolveProjectBlockerHref(projectId, { kind: "traceability" })).toBe(
      "/projects/proj_1/traceability",
    );
  });
});

describe("buildProjectBlockers", () => {
  it("builds context-aware blockers with deep links", () => {
    const blockers = buildProjectBlockers({
      projectId: "proj_1",
      currentPhase: 3,
      traceLinksCount: 0,
      latestByGate: new Map(),
      artifacts: [{ id: "art_1", templateId: "A-3.2", status: "Draft" }],
      evidenceItems: [],
      openApprovals: [{ approvalType: "gate_review", gateId: "G3", artifactId: null }],
    });

    expect(blockers.length).toBeGreaterThan(0);
    expect(blockers.some((b) => b.href === "/projects/proj_1/gates/g3/review")).toBe(true);
    expect(blockers.some((b) => b.href === "/projects/proj_1/templates/A-3.2")).toBe(true);
    expect(blockers.some((b) => b.href === "/projects/proj_1/evidence?phase=3")).toBe(true);
    expect(blockers.some((b) => b.href === "/projects/proj_1/traceability")).toBe(true);
  });
});

describe("resolveProjectBlockersOverviewHref", () => {
  it("routes to evidence by default when blockers are empty", () => {
    expect(resolveProjectBlockersOverviewHref("proj_1", [])).toBe("/projects/proj_1/evidence");
  });

  it("routes to evidence when any non-traceability blocker exists", () => {
    expect(
      resolveProjectBlockersOverviewHref("proj_1", [
        { target: { kind: "traceability" } },
        { target: { kind: "artifact", artifactId: "art_1" } },
      ]),
    ).toBe("/projects/proj_1/evidence");
  });

  it("routes to traceability when blockers are traceability-only", () => {
    expect(
      resolveProjectBlockersOverviewHref("proj_1", [
        { target: { kind: "traceability" } },
      ]),
    ).toBe("/projects/proj_1/traceability");
  });
});
