import { describe, expect, it } from "vitest";

import type { GateId } from "@/lib/gateRules";
import { getGateVisualState, indexLatestGateDecisions } from "@/lib/gateStatus";

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
});
