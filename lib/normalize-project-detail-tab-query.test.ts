import { describe, expect, it } from "vitest";

import { normalizeProjectDetailTabQueryParam } from "@/lib/normalize-project-detail-tab-query";

describe("normalizeProjectDetailTabQueryParam", () => {
  it("maps spec audit_trail alias to audit-trail tab id", () => {
    expect(normalizeProjectDetailTabQueryParam("audit_trail")).toBe("audit-trail");
  });

  it("passes through canonical tab ids", () => {
    expect(normalizeProjectDetailTabQueryParam("gates")).toBe("gates");
    expect(normalizeProjectDetailTabQueryParam("audit-trail")).toBe("audit-trail");
  });

  it("returns undefined for undefined input", () => {
    expect(normalizeProjectDetailTabQueryParam(undefined)).toBeUndefined();
  });
});
