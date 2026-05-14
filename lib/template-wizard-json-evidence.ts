import type { JsonEvidence, ValidationIssue } from "@/types/template-wizard.types";

export const TEMPLATE_WIZARD_JSON_SCHEMA_NAME = "CYBERCUBE Template Wizard JSON Evidence";

const REQUIRED_TOP_LEVEL: (keyof JsonEvidence)[] = [
  "artifactId",
  "projectId",
  "phaseId",
  "phaseNumber",
  "templateId",
  "templateCode",
  "templateVersion",
  "artifactVersion",
  "status",
  "generatedAt",
  "generatedBy",
  "sections",
  "validation",
  "evidenceLinks",
];

export type JsonPathRow = {
  path: string;
  message: string;
};

export type JsonEvidenceSchemaRun = {
  parseOk: boolean;
  parseError: string | null;
  shapeOk: boolean;
  shapeErrors: JsonPathRow[];
  issueErrors: JsonPathRow[];
  issueWarnings: JsonPathRow[];
  pass: boolean;
};

export function jsonPathForValidationIssue(issue: ValidationIssue): string {
  if (issue.fieldName && issue.sectionId) {
    return `/sections/${issue.sectionId}/values/${issue.fieldName}`;
  }
  if (issue.sectionId) {
    return `/sections/${issue.sectionId}`;
  }
  return `/validation/issues/${issue.id}`;
}

export function runJsonEvidenceSchemaValidation(
  data: JsonEvidence,
  serialized: string,
): JsonEvidenceSchemaRun {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (e) {
    return {
      parseOk: false,
      parseError: e instanceof Error ? e.message : "Invalid JSON",
      shapeOk: false,
      shapeErrors: [{ path: "/", message: "Document is not valid JSON." }],
      issueErrors: [],
      issueWarnings: [],
      pass: false,
    };
  }

  const shapeErrors: JsonPathRow[] = [];
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    shapeErrors.push({ path: "/", message: "Root value must be a JSON object." });
  } else {
    const obj = parsed as Record<string, unknown>;
    for (const key of REQUIRED_TOP_LEVEL) {
      if (!(key in obj)) {
        shapeErrors.push({ path: `/${String(key)}`, message: `Missing required property "${String(key)}".` });
      }
    }
  }

  const shapeOk = shapeErrors.length === 0;
  const issueErrors: JsonPathRow[] = [];
  const issueWarnings: JsonPathRow[] = [];
  for (const issue of data.validation.issues) {
    const row = { path: jsonPathForValidationIssue(issue), message: issue.message };
    if (issue.severity === "error") issueErrors.push(row);
    else if (issue.severity === "warning") issueWarnings.push(row);
    else issueWarnings.push(row);
  }

  const parseOk = true;
  const pass = parseOk && shapeOk && issueErrors.length === 0;

  return {
    parseOk,
    parseError: null,
    shapeOk,
    shapeErrors,
    issueErrors,
    issueWarnings,
    pass,
  };
}

export function buildJsonEvidenceExportObject(
  data: JsonEvidence,
  options: { includeValidationSummary: boolean; includeEvidenceLinks: boolean },
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    artifactId: data.artifactId,
    projectId: data.projectId,
    phaseId: data.phaseId,
    phaseNumber: data.phaseNumber,
    templateId: data.templateId,
    templateCode: data.templateCode,
    templateVersion: data.templateVersion,
    artifactVersion: data.artifactVersion,
    status: data.status,
    generatedAt: data.generatedAt,
    generatedBy: data.generatedBy,
    sections: data.sections,
  };
  if (options.includeValidationSummary) {
    base.validation = data.validation;
  }
  if (options.includeEvidenceLinks) {
    base.evidenceLinks = data.evidenceLinks;
  } else {
    base.evidenceLinks = [];
  }
  return base;
}

export function defaultJsonEvidenceFilename(data: JsonEvidence): string {
  const safe = data.templateCode.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "evidence";
  return `${safe}-evidence.json`;
}
