import { describe, expect, it } from "vitest";

import { filterWideAuditRowsForGate, type WideGateAuditRow } from "@/lib/gate-audit-trail-filter";

const row = (overrides: Partial<WideGateAuditRow>): WideGateAuditRow => ({
  id: "r1",
  action: "a",
  subjectKind: "x",
  subjectId: "s1",
  metadata: {},
  createdAt: new Date("2026-01-01"),
  actorId: null,
  ...overrides,
});

describe("filterWideAuditRowsForGate", () => {
  it("keeps rows whose metadata.gateId matches the gate", () => {
    const out = filterWideAuditRowsForGate(
      [row({ id: "1", metadata: { gateId: "gate-a" } }), row({ id: "2", metadata: { gateId: "other" } })],
      "gate-a",
      new Set(),
    );
    expect(out.map((r) => r.id)).toEqual(["1"]);
  });

  it("keeps gate_decision rows when subjectId is in decisionIds", () => {
    const out = filterWideAuditRowsForGate(
      [row({ id: "d1", subjectKind: "gate_decision", subjectId: "dec-1", metadata: {} })],
      "gate-a",
      new Set(["dec-1"]),
    );
    expect(out).toHaveLength(1);
  });

  it("drops gate_decision rows when decision id is unknown", () => {
    const out = filterWideAuditRowsForGate(
      [row({ id: "d1", subjectKind: "gate_decision", subjectId: "dec-1", metadata: {} })],
      "gate-a",
      new Set(),
    );
    expect(out).toHaveLength(0);
  });

  it("respects maxRows cap after filter", () => {
    const rows = Array.from({ length: 10 }, (_, i) =>
      row({ id: `g${i}`, metadata: { gateId: "g" } }),
    );
    const out = filterWideAuditRowsForGate(rows, "g", new Set(), 3);
    expect(out).toHaveLength(3);
  });
});
