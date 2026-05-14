import { describe, expect, it } from "vitest";

import { projectAuditTrailListHref, projectOverviewHref, projectReportsHubHref } from "@/lib/projects-url";

describe("projectAuditTrailListHref", () => {
  it("returns the canonical audit-trail tab URL for a project", () => {
    expect(projectAuditTrailListHref("proj_1")).toBe(
      "/projects?selected=proj_1&tab=audit-trail",
    );
  });

  it("appends `openAuditEvent` when provided so the drawer auto-opens on load", () => {
    expect(
      projectAuditTrailListHref("proj_1", { openAuditEventId: "aud_abc" }),
    ).toBe("/projects?selected=proj_1&tab=audit-trail&openAuditEvent=aud_abc");
  });

  it("URL-encodes the event id when it contains reserved chars", () => {
    const href = projectAuditTrailListHref("proj_1", {
      openAuditEventId: "aud abc&xyz",
    });
    // URLSearchParams encodes the value
    expect(href).toContain("openAuditEvent=aud+abc%26xyz");
  });
});

describe("projectOverviewHref", () => {
  it("returns the project overview path", () => {
    expect(projectOverviewHref("proj_1")).toBe("/projects/proj_1");
  });
});

describe("projectReportsHubHref", () => {
  it("returns the reports hub path without query when phase is omitted", () => {
    expect(projectReportsHubHref("proj_1")).toBe("/projects/proj_1/reports");
  });

  it("appends phase when a valid workspace phase index is provided", () => {
    expect(projectReportsHubHref("proj_1", 3)).toBe("/projects/proj_1/reports?phase=3");
  });
});
