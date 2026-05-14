import { describe, expect, it } from "vitest";

import {
  buildReportSelectionTarget,
  REPORT_SELECTION_FORMATS,
  REPORT_SELECTION_KEYS,
  reportSelectionLabel,
} from "@/lib/report-selection-url";

describe("buildReportSelectionTarget", () => {
  it("returns the per-report detail path for `view` format with no range", () => {
    const t = buildReportSelectionTarget({
      projectId: "proj_1",
      reportKey: "lifecycleStatus",
      format: "view",
    });
    expect(t.mode).toBe("navigate");
    expect(t.href).toBe("/projects/proj_1/reports/lifecycle-status");
  });

  it("attaches a `custom` date range when start/end are provided", () => {
    const t = buildReportSelectionTarget({
      projectId: "proj_1",
      reportKey: "traceability",
      format: "view",
      startDate: "2026-01-01",
      endDate: "2026-03-31",
    });
    expect(t.mode).toBe("navigate");
    expect(t.href).toContain("/projects/proj_1/reports/traceability");
    expect(t.href).toContain("dateRange=custom");
    expect(t.href).toContain("startDate=2026-01-01");
    expect(t.href).toContain("endDate=2026-03-31");
  });

  it("returns an export-route URL for csv/json/pdf formats", () => {
    for (const format of ["csv", "json", "pdf"] as const) {
      const t = buildReportSelectionTarget({
        projectId: "proj_1",
        reportKey: "gateDecision",
        format,
      });
      expect(t.mode).toBe("download");
      expect(t.href).toBe(
        `/api/projects/proj_1/reports/export?key=gateDecision&format=${format}`,
      );
    }
  });

  it("propagates date range to the export URL", () => {
    const t = buildReportSelectionTarget({
      projectId: "proj_1",
      reportKey: "missingEvidence",
      format: "csv",
      startDate: "2026-04-01",
      endDate: "2026-06-30",
    });
    expect(t.mode).toBe("download");
    expect(t.href).toContain("key=missingEvidence");
    expect(t.href).toContain("format=csv");
    expect(t.href).toContain("dateRange=custom");
    expect(t.href).toContain("startDate=2026-04-01");
    expect(t.href).toContain("endDate=2026-06-30");
  });

  it("maps the evidence-package key to the correct detail segment", () => {
    const t = buildReportSelectionTarget({
      projectId: "proj_1",
      reportKey: "fullProjectEvidencePackage",
      format: "view",
    });
    expect(t.href).toBe("/projects/proj_1/reports/evidence-package");
  });

  it("URL-encodes the projectId in the export path", () => {
    const t = buildReportSelectionTarget({
      projectId: "proj/1?",
      reportKey: "approvalHistory",
      format: "json",
    });
    expect(t.href.startsWith("/api/projects/proj%2F1%3F/reports/export"));
  });

  it("treats blank-only start/end as no range", () => {
    const t = buildReportSelectionTarget({
      projectId: "proj_1",
      reportKey: "lifecycleStatus",
      format: "view",
      startDate: "   ",
      endDate: "",
    });
    expect(t.href).toBe("/projects/proj_1/reports/lifecycle-status");
  });
});

describe("reportSelectionLabel", () => {
  it("returns a non-empty label for every defined key", () => {
    for (const key of REPORT_SELECTION_KEYS) {
      expect(reportSelectionLabel(key).length).toBeGreaterThan(0);
    }
  });
  it("covers every defined format constant", () => {
    expect(REPORT_SELECTION_FORMATS).toContain("view");
    expect(REPORT_SELECTION_FORMATS).toContain("csv");
    expect(REPORT_SELECTION_FORMATS).toContain("json");
    expect(REPORT_SELECTION_FORMATS).toContain("pdf");
  });
});
