import { describe, expect, it } from "vitest";

import {
  formatDateTimeRelative,
  formatTimeAgoFragment,
  parseFlexibleTimestampLabelMs,
} from "@/lib/datetime-format";

describe("formatDateTimeRelative", () => {
  const now = new Date("2026-05-13T15:00:00.000Z").getTime();

  it("returns Just now inside 45s window", () => {
    expect(formatDateTimeRelative(new Date("2026-05-13T14:59:30.000Z"), now)).toBe("Just now");
  });

  it("uses minutes under one hour", () => {
    expect(formatDateTimeRelative(new Date("2026-05-13T14:30:00.000Z"), now)).toBe("30m ago");
  });

  it("uses hours under one day", () => {
    expect(formatDateTimeRelative(new Date("2026-05-13T14:00:00.000Z"), now)).toBe("1h ago");
  });

  it("uses days under cap then absolute", () => {
    expect(formatDateTimeRelative(new Date("2026-05-12T15:00:00.000Z"), now)).toBe("1d ago");
    const old = new Date("2026-04-01T12:00:00.000Z");
    const label = formatDateTimeRelative(old, now);
    expect(label).not.toMatch(/ago$/);
    expect(label.length).toBeGreaterThan(6);
  });
});

describe("formatTimeAgoFragment", () => {
  const now = new Date("2026-05-13T15:00:00.000Z").getTime();

  it("lowercases just now for mid-sentence use", () => {
    expect(formatTimeAgoFragment(new Date("2026-05-13T14:59:50.000Z"), now)).toBe("just now");
    expect(formatTimeAgoFragment(new Date("2026-05-13T14:00:00.000Z"), now)).toBe("1h ago");
  });
});

describe("parseFlexibleTimestampLabelMs", () => {
  const now = new Date("2026-05-13T15:00:00.000Z").getTime();

  it("parses relative fragments", () => {
    expect(parseFlexibleTimestampLabelMs("Just now", now)).toBe(now);
    expect(parseFlexibleTimestampLabelMs("30m ago", now)).toBe(now - 30 * 60_000);
    expect(parseFlexibleTimestampLabelMs("2h ago", now)).toBe(now - 2 * 60 * 60_000);
    expect(parseFlexibleTimestampLabelMs("3d ago", now)).toBe(now - 3 * 24 * 60 * 60_000);
  });
});
