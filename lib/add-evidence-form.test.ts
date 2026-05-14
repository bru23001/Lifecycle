import { describe, expect, it } from "vitest";

import {
  buildAddEvidenceInput,
  classificationLabel,
  emptyAddEvidenceFormState,
  EVIDENCE_CLASSIFICATIONS,
} from "@/lib/add-evidence-form";

function withFields(overrides: Partial<ReturnType<typeof emptyAddEvidenceFormState>>) {
  return { ...emptyAddEvidenceFormState(), ...overrides };
}

describe("buildAddEvidenceInput", () => {
  it("requires a projectId", () => {
    const result = buildAddEvidenceInput(withFields({ name: "Test" }), "");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("projectId");
  });

  it("rejects names shorter than 2 chars (post-trim)", () => {
    const result = buildAddEvidenceInput(withFields({ name: "  a  " }), "proj");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("name");
  });

  it("rejects names over 200 chars", () => {
    const long = "a".repeat(201);
    const result = buildAddEvidenceInput(withFields({ name: long }), "proj");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("name");
  });

  it("rejects an out-of-range phase", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Test", phaseNumber: "15" }),
      "proj",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("phaseNumber");
  });

  it("rejects non-integer phases like '3.5'", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Test", phaseNumber: "3.5" }),
      "proj",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("phaseNumber");
  });

  it("normalizes lowercase gate codes (g3 → G3)", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Test", gateCode: "  g3 " }),
      "proj",
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.gateCode).toBe("G3");
  });

  it("treats '—' as no gate (emitted as null to match the server schema)", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Test", gateCode: "—" }),
      "proj",
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.gateCode).toBeNull();
  });

  it("emits gateCode: null when the form field is blank", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Test" }),
      "proj",
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.gateCode).toBeNull();
  });

  it("rejects malformed gate codes", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Test", gateCode: "X1" }),
      "proj",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("gateCode");
  });

  it("requires a URL when evidenceType=link", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Test", evidenceType: "link", sourceUrl: "  " }),
      "proj",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("sourceUrl");
  });

  it("rejects link URLs that aren't http/https", () => {
    const result = buildAddEvidenceInput(
      withFields({
        name: "Test",
        evidenceType: "link",
        sourceUrl: "ftp://example.com",
      }),
      "proj",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("sourceUrl");
  });

  it("accepts a fully-formed link evidence record", () => {
    const result = buildAddEvidenceInput(
      withFields({
        name: "Quarterly Audit Report",
        description: "Linked from external audit portal",
        evidenceType: "link",
        classification: "confidential",
        phaseNumber: "5",
        gateCode: "g3",
        sourceUrl: "https://audit.example.com/Q1",
        notes: "Approved by AppSec",
        linkedArtifactId: "art_123",
      }),
      "proj_1",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        projectId: "proj_1",
        name: "Quarterly Audit Report",
        description: "Linked from external audit portal",
        evidenceType: "link",
        classification: "confidential",
        phaseNumber: 5,
        gateCode: "G3",
        sourceUrl: "https://audit.example.com/Q1",
        notes: "Approved by AppSec",
        linkedArtifactId: "art_123",
      });
    }
  });

  it("omits optional fields that are empty/blank in the form state", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "Doc", evidenceType: "document" }),
      "proj_1",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        projectId: "proj_1",
        name: "Doc",
        evidenceType: "document",
        classification: "internal",
        gateCode: null,
      });
    }
  });

  it("rejects descriptions over 8000 characters", () => {
    const result = buildAddEvidenceInput(
      withFields({ name: "T", description: "x".repeat(8001) }),
      "proj",
    );
    // name will fail first - bump it
    const result2 = buildAddEvidenceInput(
      withFields({ name: "Test", description: "x".repeat(8001) }),
      "proj",
    );
    expect(result.ok || result2.ok).toBe(false);
    if (!result2.ok) expect(result2.error.field).toBe("description");
  });
});

describe("classificationLabel", () => {
  it("returns a stable label per level", () => {
    expect(classificationLabel("public")).toBe("Public (PUB)");
    expect(classificationLabel("internal")).toBe("Internal (INT)");
    expect(classificationLabel("confidential")).toBe("Confidential (CON)");
    expect(classificationLabel("restricted")).toBe("Restricted (RST)");
  });

  it("covers every defined classification", () => {
    for (const c of EVIDENCE_CLASSIFICATIONS) {
      expect(classificationLabel(c).length).toBeGreaterThan(0);
    }
  });
});
