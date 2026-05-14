import { describe, expect, it } from "vitest";

import { diffFormFieldRecords, diffFormFieldRecordsChangedOnly } from "@/lib/template-wizard-artifact-diff";

describe("diffFormFieldRecords", () => {
  it("should classify added, removed, changed, and same", () => {
    const rows = diffFormFieldRecords({ a: 1, b: 2, c: 3 }, { b: 2, c: 4, d: 5 });
    const by = Object.fromEntries(rows.map((r) => [r.fieldName, r.change]));
    expect(by.a).toBe("added");
    expect(by.b).toBe("same");
    expect(by.c).toBe("changed");
    expect(by.d).toBe("removed");
  });
});

describe("diffFormFieldRecordsChangedOnly", () => {
  it("should omit same keys", () => {
    const rows = diffFormFieldRecordsChangedOnly({ x: 1, y: 2 }, { x: 1, y: 3 });
    expect(rows.map((r) => r.fieldName)).toEqual(["y"]);
  });
});
