import { describe, expect, it } from "vitest";

import { reportDetailPath, reportHubPath, REPORT_DETAIL_PATHS } from "@/lib/reports-detail-paths";

describe("reportDetailPath", () => {
  it("builds spec-aligned report URLs", () => {
    const id = "proj_abc";
    expect(reportHubPath(id)).toBe("/projects/proj_abc/reports");
    expect(reportDetailPath(id, "lifecycleStatus")).toBe(
      `/projects/${id}/reports/${REPORT_DETAIL_PATHS.lifecycleStatus}`,
    );
    expect(reportDetailPath(id, "gateDecisions")).toBe(
      `/projects/${id}/reports/${REPORT_DETAIL_PATHS.gateDecisions}`,
    );
    expect(reportDetailPath(id, "evidencePackage")).toBe(
      `/projects/${id}/reports/${REPORT_DETAIL_PATHS.evidencePackage}`,
    );
  });
});
