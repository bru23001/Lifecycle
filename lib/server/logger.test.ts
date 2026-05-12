import { describe, expect, it } from "vitest";

import { logError, logInfo, logWarn, logger } from "@/lib/server/logger";

describe("logger", () => {
  it("logs without throwing", () => {
    expect(() =>
      logInfo({ message: "test.event", detail: "vitest" }),
    ).not.toThrow();
    expect(() => logWarn({ message: "test.warn" })).not.toThrow();
    expect(() => logError({ message: "test.err", err: new Error("x") })).not.toThrow();
    expect(logger).toBeTruthy();
  });
});
