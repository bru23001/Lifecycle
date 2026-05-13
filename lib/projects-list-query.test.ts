import { describe, expect, it } from "vitest";

import {
  parseProjectsListQuery,
  rowMatchesListQuery,
  serializeProjectsListFilters,
  sortProjectListRows,
  stripProjectListFilterRow,
  type ProjectListFilterRow,
} from "@/lib/projects-list-query";

function sampleRow(overrides: Partial<ProjectListFilterRow> = {}): ProjectListFilterRow {
  return {
    id: "p1",
    name: "Alpha",
    code: "ALP-001",
    owner: "Ada Lovelace",
    currentPhase: 3,
    progressPercent: 40,
    status: "In Progress",
    updatedLabel: "1h ago",
    missingEvidenceCount: 0,
    updatedAtMs: 1_000_000,
    createdAtMs: 500_000,
    openApprovalsCount: 0,
    lastGateDecisionAtMs: 900_000,
    ...overrides,
  };
}

describe("parseProjectsListQuery", () => {
  it("applies defaults", () => {
    expect(parseProjectsListQuery({})).toEqual({
      q: "",
      sort: "updated",
      status: "",
      ownerContains: "",
      phase: null,
      gatePendingOnly: false,
      missingEvidenceOnly: false,
      updatedFrom: null,
      updatedToExclusive: null,
    });
  });

  it("parses filters", () => {
    const q = parseProjectsListQuery({
      q: "  north  ",
      sort: "name",
      f_status: "Blocked",
      f_owner: "ada",
      f_phase: "7",
      f_gate: "pending",
      f_missing: "1",
      f_from: "2026-01-01",
      f_to: "2026-01-10",
    });
    expect(q.q).toBe("north");
    expect(q.sort).toBe("name");
    expect(q.status).toBe("Blocked");
    expect(q.ownerContains).toBe("ada");
    expect(q.phase).toBe(7);
    expect(q.gatePendingOnly).toBe(true);
    expect(q.missingEvidenceOnly).toBe(true);
    expect(q.updatedFrom?.toISOString().slice(0, 10)).toBe("2026-01-01");
    expect(q.updatedToExclusive?.toISOString().slice(0, 10)).toBe("2026-01-11");
  });
});

describe("rowMatchesListQuery", () => {
  it("matches search on name and code", () => {
    const q = parseProjectsListQuery({ q: "alp" });
    expect(rowMatchesListQuery(sampleRow({ name: "Northwind", code: "ALP-001" }), q)).toBe(true);
    expect(rowMatchesListQuery(sampleRow({ name: "Other", code: "ZZZ-001" }), q)).toBe(false);
  });

  it("respects gate pending filter", () => {
    const q = parseProjectsListQuery({ f_gate: "pending" });
    expect(rowMatchesListQuery(sampleRow({ openApprovalsCount: 1 }), q)).toBe(true);
    expect(rowMatchesListQuery(sampleRow({ openApprovalsCount: 0 }), q)).toBe(false);
  });
});

describe("sortProjectListRows", () => {
  it("sorts by name ascending", () => {
    const sorted = sortProjectListRows(
      [sampleRow({ name: "Zulu" }), sampleRow({ id: "p2", name: "Bravo" })],
      "name",
    );
    expect(sorted.map((r) => r.name)).toEqual(["Bravo", "Zulu"]);
  });
});

describe("serializeProjectsListFilters", () => {
  it("round-trips through URLSearchParams", () => {
    const original = parseProjectsListQuery({
      q: "x",
      sort: "missing",
      f_status: "Blocked",
      f_owner: "o",
      f_phase: "2",
      f_gate: "pending",
      f_missing: "1",
      f_from: "2026-02-01",
      f_to: "2026-02-05",
    });
    const serialized = serializeProjectsListFilters(original);
    const back = parseProjectsListQuery(Object.fromEntries(new URLSearchParams(serialized).entries()));
    expect(back.q).toBe(original.q);
    expect(back.sort).toBe(original.sort);
    expect(back.status).toBe(original.status);
    expect(back.ownerContains).toBe(original.ownerContains);
    expect(back.phase).toBe(original.phase);
    expect(back.gatePendingOnly).toBe(original.gatePendingOnly);
    expect(back.missingEvidenceOnly).toBe(original.missingEvidenceOnly);
    expect(back.updatedFrom?.toISOString()).toBe(original.updatedFrom?.toISOString());
    expect(back.updatedToExclusive?.toISOString()).toBe(original.updatedToExclusive?.toISOString());
  });
});

describe("stripProjectListFilterRow", () => {
  it("removes sort meta only", () => {
    const row = sampleRow({ missingEvidenceCount: 2 });
    const stripped = stripProjectListFilterRow(row);
    expect(stripped).not.toHaveProperty("updatedAtMs");
    expect(stripped.missingEvidenceCount).toBe(2);
  });
});
