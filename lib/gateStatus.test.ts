import { describe, expect, it } from "vitest";

import type { GateId } from "@/lib/gateRules";
import {
  gateAuditTooltip,
  getGateVisualState,
  indexLatestGateDecisions,
  nextOpenGateForPhase,
} from "@/lib/gateStatus";

describe("getGateVisualState", () => {
  const cases: Array<{ phase: number; gate: GateId; want: ReturnType<typeof getGateVisualState> }> = [
    { phase: 1, gate: "G1", want: "ready" },
    { phase: 2, gate: "G1", want: "done" },
    { phase: 2, gate: "G2", want: "ready" },
    { phase: 1, gate: "G2", want: "upcoming" },
    { phase: 5, gate: "G3", want: "ready" },
    { phase: 6, gate: "G4", want: "ready" },
    { phase: 8, gate: "G5", want: "ready" },
    { phase: 9, gate: "G6", want: "ready" },
  ];

  for (const c of cases) {
    it(`${c.gate} @ phase ${c.phase} → ${c.want}`, () => {
      expect(getGateVisualState(c.phase, c.gate)).toBe(c.want);
    });
  }

  it("G7 done when decision map shows pass", () => {
    const m = indexLatestGateDecisions([
      {
        gateId: "G7",
        decision: "Accepted",
        evidencePassSnapshot: true,
        createdAt: new Date(),
      },
    ]);
    expect(getGateVisualState(12, "G7", m)).toBe("done");
  });

  it("applies late-gate readiness sequence for G8→G10", () => {
    const g8Passed = indexLatestGateDecisions([
      {
        gateId: "G8",
        decision: "Accepted",
        evidencePassSnapshot: true,
        createdAt: new Date(),
      },
    ]);
    const g9Passed = indexLatestGateDecisions([
      {
        gateId: "G9",
        decision: "Accepted",
        evidencePassSnapshot: true,
        createdAt: new Date(),
      },
    ]);
    expect(getGateVisualState(13, "G8")).toBe("ready");
    expect(getGateVisualState(14, "G9", g8Passed)).toBe("ready");
    expect(getGateVisualState(14, "G10", g9Passed)).toBe("ready");
  });
});

describe("gate decision helpers", () => {
  it("indexes latest decision per gate from sorted rows", () => {
    const first = new Date("2026-01-02T00:00:00.000Z");
    const older = new Date("2026-01-01T00:00:00.000Z");
    const rows = [
      { gateId: "G2", decision: "Accepted", evidencePassSnapshot: true, createdAt: first },
      { gateId: "G2", decision: "Rejected", evidencePassSnapshot: false, createdAt: older },
    ];
    const latest = indexLatestGateDecisions(rows);
    expect(latest.get("G2")?.decision).toBe("Accepted");
  });

  it("computes next open gate and audit tooltip", () => {
    expect(nextOpenGateForPhase(1)).toBe("G1");
    const text = gateAuditTooltip("G2", {
      gateId: "G2",
      decision: "Accepted",
      evidencePassSnapshot: true,
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    });
    expect(text).toContain("Accepted");
    expect(text).toContain("2026-01-02");
  });
});
