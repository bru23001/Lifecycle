import { describe, expect, it } from "vitest";

import { buildDecisionRecordSnapshot } from "@/lib/server/gates-list";

describe("buildDecisionRecordSnapshot", () => {
  const baseRow = {
    id: "gd_1",
    gateId: "G3",
    decision: "Accepted",
    authorityName: "Reviewer One",
    authorityRole: "Governance",
    nextAction: "Proceed to phase 6.",
    evidencePassSnapshot: true,
    createdAt: new Date("2026-05-13T10:00:00.000Z"),
  };

  it("returns sealed metadata and resolves the audit deep-link when available", () => {
    const auditByDecisionId = new Map<string, string>([["gd_1", "aud_42"]]);
    const snap = buildDecisionRecordSnapshot("proj_1", "G3", baseRow, auditByDecisionId);

    expect(snap.gateDecisionId).toBe("gd_1");
    expect(snap.gateId).toBe("G3");
    expect(snap.decisionLabel).toBe("Accepted");
    expect(snap.decidedByName).toBe("Reviewer One");
    expect(snap.decidedByRole).toBe("Governance");
    expect(snap.comments).toBe("Proceed to phase 6.");
    expect(snap.conditions).toEqual([]);
    expect(snap.evidenceSnapshot.passed).toBe(true);
    expect(snap.evidenceSnapshot.label).toContain("cleared");
    expect(snap.decidedOnIso).toBe("2026-05-13T10:00:00.000Z");
    expect(snap.auditEntryId).toBe("aud_42");
    expect(snap.auditHref).toBe("/projects/proj_1/audit/aud_42");
  });

  it("returns null audit fields when no audit entry exists", () => {
    const snap = buildDecisionRecordSnapshot("proj_1", "G3", baseRow, new Map());

    expect(snap.auditEntryId).toBeNull();
    expect(snap.auditHref).toBeNull();
  });

  it("labels failed evidence snapshots as not cleared", () => {
    const snap = buildDecisionRecordSnapshot(
      "proj_1",
      "G4",
      { ...baseRow, evidencePassSnapshot: false },
      new Map(),
    );

    expect(snap.evidenceSnapshot.passed).toBe(false);
    expect(snap.evidenceSnapshot.label).toContain("not cleared");
  });
});
