import { describe, expect, it } from "vitest";

import { applyDismissedValidationWarnings } from "@/lib/workspacePhaseDetails";

describe("applyDismissedValidationWarnings", () => {
  it("should remove warnings whose ids were dismissed", () => {
    const warnings = [
      { id: "a", message: "m1", severity: "warning" as const },
      { id: "b", message: "m2", severity: "info" as const },
    ];
    const dismissed = [{ warningId: "a", reason: "triaged", dismissedAt: "2026-01-01T00:00:00.000Z" }];
    expect(applyDismissedValidationWarnings(warnings, dismissed)).toEqual([warnings[1]]);
  });

  it("should return all warnings when dismissed list is empty", () => {
    const warnings = [{ id: "x", message: "m", severity: "warning" as const }];
    expect(applyDismissedValidationWarnings(warnings, undefined)).toEqual(warnings);
    expect(applyDismissedValidationWarnings(warnings, [])).toEqual(warnings);
  });
});
