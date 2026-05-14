import { describe, expect, it } from "vitest";

import {
  buildProjectPackageConfigureUrl,
  PROJECT_PACKAGE_EXPORT_FORMATS,
} from "@/lib/project-package-export-url";
import {
  EVIDENCE_PACKAGE_SCOPE_KEYS,
  EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS,
  type EvidencePackageScopes,
} from "@/lib/evidence-package-scopes";

const allFalse: EvidencePackageScopes = {
  artifacts: false,
  evidence: false,
  gateDecisions: false,
  traceability: false,
  approvals: false,
  auditManifest: false,
};

const allTrue: EvidencePackageScopes = {
  artifacts: true,
  evidence: true,
  gateDecisions: true,
  traceability: true,
  approvals: true,
  auditManifest: true,
};

describe("buildProjectPackageConfigureUrl", () => {
  it("emits 0 for every scope when all toggles are off", () => {
    const href = buildProjectPackageConfigureUrl({ projectId: "proj_1", scopes: allFalse });
    for (const key of EVIDENCE_PACKAGE_SCOPE_KEYS) {
      expect(href).toContain(`${EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS[key]}=0`);
    }
  });

  it("emits 1 for every scope when all toggles are on", () => {
    const href = buildProjectPackageConfigureUrl({ projectId: "proj_1", scopes: allTrue });
    for (const key of EVIDENCE_PACKAGE_SCOPE_KEYS) {
      expect(href).toContain(`${EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS[key]}=1`);
    }
  });

  it("targets the configure screen", () => {
    const href = buildProjectPackageConfigureUrl({ projectId: "proj_1", scopes: allFalse });
    expect(href.startsWith("/projects/proj_1/reports/evidence-package/configure?")).toBe(true);
  });

  it("propagates the format query when provided", () => {
    const href = buildProjectPackageConfigureUrl({
      projectId: "proj_1",
      scopes: allFalse,
      format: "zip",
    });
    expect(href).toContain("format=zip");
  });

  it("omits format when not provided", () => {
    const href = buildProjectPackageConfigureUrl({ projectId: "proj_1", scopes: allFalse });
    expect(href).not.toContain("format=");
  });

  it("URL-encodes the projectId path segment", () => {
    const href = buildProjectPackageConfigureUrl({
      projectId: "proj/1?",
      scopes: allFalse,
    });
    expect(href.startsWith("/projects/proj%2F1%3F/reports/evidence-package/configure?")).toBe(true);
  });
});

describe("PROJECT_PACKAGE_EXPORT_FORMATS", () => {
  it("contains exactly the supported formats", () => {
    expect(PROJECT_PACKAGE_EXPORT_FORMATS).toEqual(["zip"]);
  });
});
