import { describe, expect, it } from "vitest";

import {
  buildJsonEvidenceExportObject,
  jsonPathForValidationIssue,
  runJsonEvidenceSchemaValidation,
} from "@/lib/template-wizard-json-evidence";
import type { JsonEvidence, ValidationIssue } from "@/types/template-wizard.types";

const baseEvidence = (): JsonEvidence => ({
  artifactId: "art-1",
  projectId: "proj-1",
  phaseId: "phase-1",
  phaseNumber: 1,
  templateId: "A-0",
  templateCode: "A-0",
  templateVersion: "v1",
  artifactVersion: "v1",
  status: "draft",
  generatedAt: "2026-01-01T00:00:00.000Z",
  generatedBy: "Tester",
  sections: [],
  validation: {
    completionPercent: 50,
    exportReady: false,
    issues: [],
  },
  evidenceLinks: [{ evidenceId: "ev-1" }],
});

describe("runJsonEvidenceSchemaValidation", () => {
  it("fails on invalid JSON text", () => {
    const data = baseEvidence();
    const run = runJsonEvidenceSchemaValidation(data, "{");
    expect(run.pass).toBe(false);
    expect(run.parseOk).toBe(false);
  });

  it("passes when shape and wizard errors are clear", () => {
    const data = baseEvidence();
    const text = JSON.stringify(data, null, 2);
    const run = runJsonEvidenceSchemaValidation(data, text);
    expect(run.pass).toBe(true);
    expect(run.shapeOk).toBe(true);
  });

  it("fails when wizard reports error-severity issues", () => {
    const data = baseEvidence();
    data.validation.issues = [
      { id: "i1", severity: "error", message: "Required field missing", sectionId: "s1", fieldName: "f1" },
    ];
    const text = JSON.stringify(data, null, 2);
    const run = runJsonEvidenceSchemaValidation(data, text);
    expect(run.pass).toBe(false);
    expect(run.issueErrors.length).toBe(1);
  });
});

describe("jsonPathForValidationIssue", () => {
  it("builds field path when section and field are set", () => {
    const issue: ValidationIssue = {
      id: "x",
      severity: "warning",
      sectionId: "sec-a",
      fieldName: "title",
      message: "m",
    };
    expect(jsonPathForValidationIssue(issue)).toBe("/sections/sec-a/values/title");
  });
});

describe("buildJsonEvidenceExportObject", () => {
  it("omits validation when summary disabled", () => {
    const data = baseEvidence();
    const out = buildJsonEvidenceExportObject(data, {
      includeValidationSummary: false,
      includeEvidenceLinks: true,
    });
    expect("validation" in out).toBe(false);
    expect(out.evidenceLinks).toEqual(data.evidenceLinks);
  });

  it("clears evidence links when disabled", () => {
    const data = baseEvidence();
    const out = buildJsonEvidenceExportObject(data, {
      includeValidationSummary: true,
      includeEvidenceLinks: false,
    });
    expect(out.evidenceLinks).toEqual([]);
    expect(out.validation).toEqual(data.validation);
  });
});
