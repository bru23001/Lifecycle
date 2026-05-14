import { describe, expect, it } from "vitest";

import {
  deriveBeforeAfter,
  formatAuditReference,
  humanizeAction,
  humanizeMetadataKey,
  maskEmail,
  redactSensitive,
} from "@/lib/audit-event-details";

describe("redactSensitive", () => {
  it("drops sensitive keys at any depth", () => {
    const result = redactSensitive({
      password: "hunter2",
      apiKey: "abcd",
      api_key: "xyz",
      nested: { token: "t", keepMe: 1 },
      list: [{ secret: "s" }, { keepThis: true }],
    });
    expect(result).toEqual({
      nested: { keepMe: 1 },
      list: [{}, { keepThis: true }],
    });
  });

  it("masks email-shaped strings inside metadata", () => {
    const result = redactSensitive({
      contact: "John Doe <jdoe@example.com>",
      direct: "jane@example.org",
    });
    expect(result.contact).toContain("j***@example.com");
    expect(result.direct).toBe("j***@example.org");
  });

  it("leaves plain values untouched", () => {
    expect(redactSensitive({ count: 12, label: "phase 3" })).toEqual({
      count: 12,
      label: "phase 3",
    });
  });
});

describe("maskEmail", () => {
  it("returns the original string when not an email", () => {
    expect(maskEmail("not an email")).toBe("not an email");
  });
  it("masks the local part with one initial", () => {
    expect(maskEmail("alice@example.com")).toBe("a***@example.com");
  });
});

describe("humanizeAction", () => {
  it("converts dotted snake-case to title-cased segments", () => {
    expect(humanizeAction("gate_review.recorded")).toBe("Gate Review · Recorded");
    expect(humanizeAction("project.created")).toBe("Project · Created");
  });
});

describe("humanizeMetadataKey", () => {
  it("turns snake_case into Sentence case", () => {
    expect(humanizeMetadataKey("vault_folder")).toBe("Vault folder");
    expect(humanizeMetadataKey("slug")).toBe("Slug");
    expect(humanizeMetadataKey("")).toBe("");
  });
});

describe("deriveBeforeAfter", () => {
  it("matches before_/after_ prefix pairs", () => {
    const { pairs, remainder } = deriveBeforeAfter({
      before_phase: 2,
      after_phase: 3,
      unrelated: "x",
    });
    expect(pairs).toEqual([{ key: "phase", before: 2, after: 3 }]);
    expect(remainder).toEqual([{ key: "unrelated", value: "x" }]);
  });

  it("matches previous_/current_ pairs", () => {
    const { pairs } = deriveBeforeAfter({
      previous_status: "Draft",
      current_status: "Approved",
    });
    expect(pairs).toEqual([{ key: "status", before: "Draft", after: "Approved" }]);
  });

  it("matches from_/to_ pairs", () => {
    const { pairs } = deriveBeforeAfter({
      from_owner: "u1",
      to_owner: "u2",
    });
    expect(pairs).toEqual([{ key: "owner", before: "u1", after: "u2" }]);
  });

  it("converts a `fields` string-array into a single pair", () => {
    const { pairs, remainder } = deriveBeforeAfter({
      fields: ["name", "owner"],
      slug: "demo",
    });
    expect(pairs).toEqual([
      { key: "changed fields", before: null, after: "name, owner" },
    ]);
    expect(remainder).toEqual([{ key: "slug", value: "demo" }]);
  });

  it("skips a `fields` array that contains only non-strings", () => {
    const { pairs, remainder } = deriveBeforeAfter({
      fields: [1, 2],
      keep: "yes",
    });
    expect(pairs).toEqual([]);
    expect(remainder.find((r) => r.key === "fields")).toBeDefined();
    expect(remainder.find((r) => r.key === "keep")).toBeDefined();
  });

  it("leaves unrelated metadata in remainder", () => {
    const md = { gateId: "G3", decision: "approved" };
    const { pairs, remainder } = deriveBeforeAfter(md);
    expect(pairs).toEqual([]);
    expect(remainder).toEqual([
      { key: "gateId", value: "G3" },
      { key: "decision", value: "approved" },
    ]);
  });
});

describe("formatAuditReference", () => {
  it("preserves short ids", () => {
    expect(formatAuditReference("aud123")).toEqual({ short: "aud123", full: "aud123" });
  });
  it("ellipsizes long ids in the short form", () => {
    const id = "ck123456789012345678";
    const out = formatAuditReference(id);
    expect(out.full).toBe(id);
    expect(out.short).toMatch(/^ck123456…/);
    expect(out.short).toContain("…");
  });
});
