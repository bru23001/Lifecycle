import { describe, expect, it } from "vitest";

import { parseStructuredG3Waiver } from "@/lib/waiver";

describe("parseStructuredG3Waiver", () => {
  it("returns null when missing", () => {
    expect(parseStructuredG3Waiver({})).toBeNull();
    expect(parseStructuredG3Waiver(null)).toBeNull();
  });

  it("parses granted waiver for G3", () => {
    const w = parseStructuredG3Waiver({
      waiverGranted: {
        granted: true,
        gateId: "G3",
        rationale: "A long enough rationale for testing purposes.",
        approver: "Security Lead",
      },
    });
    expect(w?.gateId).toBe("G3");
    expect(w?.rationale.length).toBeGreaterThan(9);
    expect(w?.approver).toBe("Security Lead");
  });

  it("rejects wrong gate", () => {
    expect(
      parseStructuredG3Waiver({
        waiverGranted: {
          granted: true,
          gateId: "G4",
          rationale: "12345678901",
        },
      }),
    ).toBeNull();
  });
});
