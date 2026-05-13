import { describe, expect, it } from "vitest";

import { formatProjectCode, normalizeProjectCodeForConfirm } from "@/lib/format-project-code";

describe("formatProjectCode", () => {
  it("matches projects list convention for demo slug", () => {
    expect(formatProjectCode("demo", "IDEA-0001")).toMatch(/^DEM-\d{3}$/);
  });
});

describe("normalizeProjectCodeForConfirm", () => {
  it("strips spaces and punctuation for destructive confirm", () => {
    expect(normalizeProjectCodeForConfirm("  dem-001 ")).toBe("DEM001");
    expect(normalizeProjectCodeForConfirm("DEM001")).toBe("DEM001");
  });
});
