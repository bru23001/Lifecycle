import { describe, expect, it } from "vitest";

import { nextOpenGateForPhase } from "@/lib/gateStatus";
import {
  WORKSPACE_PHASE_MAX,
  WORKSPACE_PHASES,
  gateHeaderDisplayName,
  gateReviewSubtitle,
  workspacePhaseMeta,
  workspacePhaseProgressPercent,
} from "@/lib/workspacePhases";

describe("workspacePhaseProgressPercent", () => {
  it("uses 14 phases", () => {
    expect(workspacePhaseProgressPercent(14)).toBe(100);
    expect(workspacePhaseProgressPercent(1)).toBe(10);
  });

  it("clamps phase", () => {
    expect(workspacePhaseProgressPercent(99)).toBe(100);
    expect(workspacePhaseProgressPercent(-3)).toBe(10);
  });
});

describe("gateHeaderDisplayName", () => {
  it("maps G1", () => {
    expect(gateHeaderDisplayName("G1")).toBe("Idea Acceptance");
  });

  it("maps G1–G10", () => {
    for (const g of ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"] as const) {
      expect(gateHeaderDisplayName(g)).toMatch(/\w/);
    }
    expect(gateHeaderDisplayName(undefined)).toBe("Not assigned");
  });
});

describe("nextOpenGateForPhase", () => {
  it("returns first ready gate for phase 1", () => {
    expect(nextOpenGateForPhase(1)).toBe("G1");
  });
});

describe("gateReviewSubtitle", () => {
  it("covers G1–G10", () => {
    for (const g of ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"] as const) {
      expect(gateReviewSubtitle(g).length).toBeGreaterThan(3);
    }
    expect(gateReviewSubtitle(undefined)).toBe("Not gated");
  });
});

describe("workspacePhaseMeta", () => {
  it("returns meta for each index", () => {
    for (let i = 1; i <= WORKSPACE_PHASE_MAX; i++) {
      const m = workspacePhaseMeta(i);
      expect(m.index).toBe(i);
      expect(m.title.length).toBeGreaterThan(2);
    }
  });
});

describe("WORKSPACE_PHASES", () => {
  it("has 14 milestones", () => {
    expect(WORKSPACE_PHASES.length).toBe(WORKSPACE_PHASE_MAX);
  });
});
