import { describe, expect, it } from "vitest";

import {
  deriveMissingTarget,
  deriveRecommendedFix,
  getGapTypeLabel,
  mapGapToCreateLinkPrefill,
} from "@/lib/traceability-gap-details";
import type { TraceabilityGap, TraceabilityGapType } from "@/types/traceability.types";

function makeGap(overrides: Partial<TraceabilityGap> & { type: TraceabilityGapType }): TraceabilityGap {
  return {
    id: "gap-1",
    objectId: "CRS-001",
    objectName: "Customer must be able to log in",
    issue: "No trace links (incoming or outgoing)",
    impact: "medium",
    href: "/projects/p1/requirements",
    ...overrides,
  };
}

describe("getGapTypeLabel", () => {
  it.each<[TraceabilityGapType, string]>([
    ["requirement_gap", "Requirement gap"],
    ["design_orphan", "Design orphan"],
    ["test_orphan", "Test orphan"],
    ["evidence_orphan", "Evidence orphan"],
    ["broken_link", "Broken link"],
  ])("returns a stable label for %s", (type, label) => {
    expect(getGapTypeLabel(type)).toBe(label);
  });
});

describe("deriveMissingTarget", () => {
  it("returns requirement-side text for requirement_gap", () => {
    expect(deriveMissingTarget(makeGap({ type: "requirement_gap" }))).toMatch(/downstream/i);
  });

  it("returns design-side text for design_orphan", () => {
    expect(deriveMissingTarget(makeGap({ type: "design_orphan" }))).toMatch(/upstream requirement/i);
  });

  it("returns test-side text for test_orphan", () => {
    expect(deriveMissingTarget(makeGap({ type: "test_orphan" }))).toMatch(/under test/i);
  });

  it("returns evidence-side text for evidence_orphan", () => {
    expect(deriveMissingTarget(makeGap({ type: "evidence_orphan" }))).toMatch(/gate review/i);
  });

  it("returns broken-link text for broken_link", () => {
    expect(deriveMissingTarget(makeGap({ type: "broken_link" }))).toMatch(/missing object/i);
  });
});

describe("deriveRecommendedFix", () => {
  it.each<[TraceabilityGapType, "create-link" | "open-source"]>([
    ["requirement_gap", "create-link"],
    ["design_orphan", "create-link"],
    ["test_orphan", "create-link"],
    ["evidence_orphan", "open-source"],
    ["broken_link", "open-source"],
  ])("returns the expected ctaKind for %s", (type, expected) => {
    expect(deriveRecommendedFix(makeGap({ type })).ctaKind).toBe(expected);
  });

  it("always includes a non-empty CTA label and recommendation text", () => {
    const types: TraceabilityGapType[] = [
      "requirement_gap",
      "design_orphan",
      "test_orphan",
      "evidence_orphan",
      "broken_link",
    ];
    for (const t of types) {
      const fix = deriveRecommendedFix(makeGap({ type: t }));
      expect(fix.ctaLabel.length).toBeGreaterThan(0);
      expect(fix.text.length).toBeGreaterThan(0);
    }
  });
});

describe("mapGapToCreateLinkPrefill", () => {
  it("prefills source kind+id for requirement_gap", () => {
    const prefill = mapGapToCreateLinkPrefill(makeGap({ type: "requirement_gap", objectId: "CRS-001" }));
    expect(prefill).toEqual({ fromKind: "requirement", fromId: "CRS-001", relationHint: "derives" });
  });

  it("prefills source kind+id for design_orphan", () => {
    const prefill = mapGapToCreateLinkPrefill(makeGap({ type: "design_orphan", objectId: "FEAT-001" }));
    expect(prefill).toEqual({ fromKind: "feature", fromId: "FEAT-001", relationHint: "implements" });
  });

  it("returns only a relation hint for test_orphan (caller picks the artifact)", () => {
    const prefill = mapGapToCreateLinkPrefill(makeGap({ type: "test_orphan", objectId: "ART-001" }));
    expect(prefill).toEqual({ relationHint: "tests" });
  });

  it.each<TraceabilityGapType>(["evidence_orphan", "broken_link"])(
    "returns an empty prefill for %s (not safe to derive)",
    (type) => {
      expect(mapGapToCreateLinkPrefill(makeGap({ type }))).toEqual({});
    },
  );
});
