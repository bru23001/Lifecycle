import { describe, expect, it } from "vitest";

import {
  applyEvidencePackageScopesToReport,
  clampEvidencePackageScopesToAvailability,
  defaultEvidencePackageScopes,
  hasAnyEvidencePackageScope,
  parseEvidencePackageScopesFromSearchParams,
} from "@/lib/evidence-package-scopes";
import type { FullProjectEvidencePackageSummary } from "@/types/reports.types";

function sampleSummary(
  overrides?: Partial<FullProjectEvidencePackageSummary>,
): FullProjectEvidencePackageSummary {
  return {
    reportId: "report-full-evidence-package",
    includesArtifacts: true,
    includesEvidenceFiles: false,
    includesGateDecisions: true,
    includesTraceabilityLinks: true,
    includesApprovalRecords: true,
    includesAuditManifest: true,
    sectionCounts: {
      artifacts: 3,
      evidenceFiles: 0,
      gateDecisions: 2,
      traceabilityLinks: 5,
      approvalRecords: 2,
      auditEntries: 4,
    },
    estimatedSizeLabel: "12 KB (est.)",
    estimatedFileCount: 10,
    lastGeneratedLabel: "now",
    viewHref: "/projects/p1/reports/evidence-package",
    configureHref: "/projects/p1/reports/evidence-package/configure",
    exportHref: "/api/projects/p1/reports/export?key=fullProjectEvidencePackage&format=zip",
    ...overrides,
  };
}

describe("evidence-package-scopes", () => {
  it("defaultEvidencePackageScopes mirrors includes* flags", () => {
    const s = sampleSummary();
    expect(defaultEvidencePackageScopes(s)).toEqual({
      artifacts: true,
      evidence: false,
      gateDecisions: true,
      traceability: true,
      approvals: true,
      auditManifest: true,
    });
  });

  it("parseEvidencePackageScopesFromSearchParams respects explicit pkg_* values", () => {
    const s = sampleSummary({ includesEvidenceFiles: true });
    const sp = {
      pkg_art: "0",
      pkg_evd: "1",
      pkg_gate: "1",
      pkg_trc: "0",
      pkg_apr: "1",
      pkg_aud: "0",
    };
    const parsed = parseEvidencePackageScopesFromSearchParams(sp, s);
    expect(parsed.artifacts).toBe(false);
    expect(parsed.evidence).toBe(true);
    expect(parsed.traceability).toBe(false);
    expect(parsed.auditManifest).toBe(false);
  });

  it("clampEvidencePackageScopesToAvailability drops sections with no data", () => {
    const s = sampleSummary();
    const allOn = {
      artifacts: true,
      evidence: true,
      gateDecisions: true,
      traceability: true,
      approvals: true,
      auditManifest: true,
    };
    expect(clampEvidencePackageScopesToAvailability(allOn, s).evidence).toBe(false);
  });

  it("hasAnyEvidencePackageScope is false when all scopes false", () => {
    expect(
      hasAnyEvidencePackageScope({
        artifacts: false,
        evidence: false,
        gateDecisions: false,
        traceability: false,
        approvals: false,
        auditManifest: false,
      }),
    ).toBe(false);
  });

  it("applyEvidencePackageScopesToReport zeroes excluded section counts", () => {
    const s = sampleSummary();
    const out = applyEvidencePackageScopesToReport(s, {
      artifacts: true,
      evidence: false,
      gateDecisions: false,
      traceability: true,
      approvals: false,
      auditManifest: false,
    });
    expect(out.sectionCounts.artifacts).toBe(3);
    expect(out.sectionCounts.gateDecisions).toBe(0);
    expect(out.sectionCounts.traceabilityLinks).toBe(5);
    expect(out.includesGateDecisions).toBe(false);
    expect(out.estimatedFileCount).toBe(3 + 5);
  });
});
