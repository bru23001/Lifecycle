import { describe, expect, it } from "vitest";

import { buildAuditTrailExportUrl } from "@/lib/audit-trail-export-url";

describe("buildAuditTrailExportUrl", () => {
  it("emits the minimal URL when only projectId + format are set", () => {
    expect(buildAuditTrailExportUrl({ projectId: "proj_1", format: "json" })).toBe(
      "/api/projects/proj_1/audit/export?format=json",
    );
  });

  it("encodes date and CSV-list filters", () => {
    const url = buildAuditTrailExportUrl({
      projectId: "proj_1",
      from: "2026-01-01",
      to: "2026-03-31",
      actions: ["gate_review.recorded", "audit_trail.exported"],
      actorIds: ["u1", "u2"],
      format: "csv",
    });
    expect(url).toContain("format=csv");
    expect(url).toContain("from=2026-01-01");
    expect(url).toContain("to=2026-03-31");
    expect(url).toContain("actions=gate_review.recorded%2Caudit_trail.exported");
    expect(url).toContain("actorIds=u1%2Cu2");
  });

  it("drops empty filter values", () => {
    const url = buildAuditTrailExportUrl({
      projectId: "proj_1",
      from: "   ",
      to: "",
      actions: [],
      actorIds: null,
      format: "pdf",
    });
    expect(url).toBe("/api/projects/proj_1/audit/export?format=pdf");
  });

  it("dedupes and trims inputs in CSV lists", () => {
    const url = buildAuditTrailExportUrl({
      projectId: "proj_1",
      actions: ["a", "a", " b ", ""],
      actorIds: ["u1", "u1"],
      format: "json",
    });
    expect(url).toContain("actions=a%2Cb");
    expect(url).toContain("actorIds=u1");
  });

  it("URL-encodes the projectId path segment", () => {
    const url = buildAuditTrailExportUrl({ projectId: "proj/1?", format: "json" });
    expect(url.startsWith("/api/projects/proj%2F1%3F/audit/export")).toBe(true);
  });
});
