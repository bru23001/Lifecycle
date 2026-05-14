import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { buildTemplateWizardArtifactZip } from "@/lib/template-wizard-export-package";
import type { JsonEvidence, ValidationSummary } from "@/types/template-wizard.types";

function minimalJsonEvidence(): JsonEvidence {
  return {
    artifactId: "art-1",
    projectId: "proj-1",
    phaseId: "phase-1",
    phaseNumber: 2,
    templateId: "tpl-1",
    templateCode: "SRS",
    templateVersion: "1.0.0",
    artifactVersion: "0.0.1",
    status: "draft",
    generatedAt: "2026-05-13T12:00:00.000Z",
    generatedBy: "USR-TEST",
    sections: [],
    validation: {
      completionPercent: 50,
      exportReady: false,
      issues: [],
    },
    evidenceLinks: [{ evidenceId: "ev-1" }],
  };
}

function minimalValidationSummary(): ValidationSummary {
  return {
    completionPercent: 50,
    requiredFieldsTotal: 2,
    requiredFieldsComplete: 1,
    sectionsTotal: 3,
    sectionsComplete: 1,
    evidenceLinksRequired: 1,
    evidenceLinksComplete: 0,
    exportReady: false,
    issues: [{ id: "iss-1", severity: "error", message: "Missing required field" }],
    warningCount: 0,
    errorCount: 1,
  };
}

describe("buildTemplateWizardArtifactZip", () => {
  it("should include selected files when flags are enabled", async () => {
    const blob = await buildTemplateWizardArtifactZip({
      packageBasename: "My Package!.zip",
      markdown: "# Title\n",
      jsonEvidence: minimalJsonEvidence(),
      validationSummary: minimalValidationSummary(),
      manifestExtras: {
        templateCode: "SRS",
        templateName: "SRS Template",
        phaseNumber: 2,
        phaseName: "Design",
        artifactVersion: "0.0.1",
        templateVersion: "1.0.0",
        generatedAt: "2026-05-13T12:00:00.000Z",
        projectId: "proj-1",
      },
      options: {
        includeMarkdown: true,
        includeJsonEvidence: true,
        includeEvidenceManifest: true,
        includeLinkedEvidenceFiles: true,
        includeValidationReport: true,
        includeVersionMetadata: true,
      },
    });

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const names = Object.keys(zip.files).filter((n) => !zip.files[n]?.dir);
    const root = names.find((n) => n.endsWith("artifact.md"))?.split("/")[0];
    expect(root).toBeTruthy();
    expect(names).toContain(`${root}/artifact.md`);
    expect(names).toContain(`${root}/evidence.json`);
    expect(names).toContain(`${root}/manifest.json`);
    expect(names).toContain(`${root}/linked-evidence/links.json`);
    expect(names).toContain(`${root}/validation-report.md`);
    expect(names).toContain(`${root}/version-metadata.json`);
  });

  it("should omit markdown when includeMarkdown is false", async () => {
    const blob = await buildTemplateWizardArtifactZip({
      packageBasename: "pkg",
      markdown: "# x",
      jsonEvidence: minimalJsonEvidence(),
      validationSummary: minimalValidationSummary(),
      manifestExtras: {
        templateCode: "SRS",
        templateName: "SRS",
        phaseNumber: 1,
        phaseName: "P",
        artifactVersion: "1",
        templateVersion: "1",
        generatedAt: "2026-05-13T12:00:00.000Z",
        projectId: "p",
      },
      options: {
        includeMarkdown: false,
        includeJsonEvidence: true,
        includeEvidenceManifest: false,
        includeLinkedEvidenceFiles: false,
        includeValidationReport: false,
        includeVersionMetadata: false,
      },
    });
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const names = Object.keys(zip.files).filter((n) => !zip.files[n]?.dir);
    expect(names.some((n) => n.endsWith("artifact.md"))).toBe(false);
    expect(names.some((n) => n.endsWith("evidence.json"))).toBe(true);
  });
});
