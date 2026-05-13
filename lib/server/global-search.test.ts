import { describe, expect, it } from "vitest";

import { normalizeGlobalSearchQuery } from "@/lib/server/global-search";

describe("normalizeGlobalSearchQuery", () => {
  it("trims and caps length", () => {
    expect(normalizeGlobalSearchQuery("  ab  ")).toBe("ab");
    expect(normalizeGlobalSearchQuery("x".repeat(100)).length).toBe(64);
  });
});
