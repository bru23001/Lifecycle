import { describe, expect, it } from "vitest";

import { applySeedDataTypoFixes, applySeedDataTypoFixesToJson } from "@/lib/seed-data-typo-fixes";

describe("applySeedDataTypoFixes", () => {
  it("replaces Rentral with Rental (case-insensitive, word boundary)", () => {
    expect(applySeedDataTypoFixes("Heavy equipment Rentral portal")).toBe("Heavy equipment Rental portal");
    expect(applySeedDataTypoFixes("RENTAL market")).toBe("RENTAL market");
    expect(applySeedDataTypoFixes("REntral billing")).toBe("Rental billing");
    expect(applySeedDataTypoFixes("rentral billing")).toBe("Rental billing");
  });

  it("does not alter substring inside unrelated words", () => {
    expect(applySeedDataTypoFixes("Parental controls")).toBe("Parental controls");
  });
});

describe("applySeedDataTypoFixesToJson", () => {
  it("fixes nested strings", () => {
    const input = { a: { b: "North America Rentral market" }, c: ["ok", "Rentral"] };
    expect(applySeedDataTypoFixesToJson(input)).toEqual({
      a: { b: "North America Rental market" },
      c: ["ok", "Rental"],
    });
  });
});
