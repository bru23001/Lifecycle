import type {
  JsonEvidence,
  MarkdownPreviewData,
  TemplateSection,
  TemplateSectionStatus,
  ValidationIssue,
  ValidationSummary,
  WizardHeaderData,
  WizardScoreMatrix,
} from "@/types/template-wizard.types";

const SCORE_MATRIX_KEY = "scoreMatrix";

function isNonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

function evidenceLinkFieldStats(
  sections: TemplateSection[],
  values: Record<string, unknown>,
): { required: number; complete: number } {
  let required = 0;
  let complete = 0;
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.type !== "evidence_link" || field.delegateToWorkspace) continue;
      if (!field.required) continue;
      required++;
      const v = values[field.name];
      if (isNonEmptyString(v) || (Array.isArray(v) && v.length > 0)) complete++;
    }
  }
  return { required, complete };
}

function scoreMatrixFromUnknown(v: unknown): WizardScoreMatrix | null {
  if (!v || typeof v !== "object") return null;
  const o = v as WizardScoreMatrix;
  if (!Array.isArray(o.criteria) || !Array.isArray(o.optionKeys)) return null;
  return o;
}

function totalWeight(matrix: WizardScoreMatrix): number {
  return matrix.criteria.reduce((acc, c) => acc + (Number.isFinite(c.weight) ? c.weight : 0), 0);
}

function matrixCompleteness(matrix: WizardScoreMatrix): {
  filledCells: number;
  totalCells: number;
  missingComments: number;
} {
  let filledCells = 0;
  let totalCells = 0;
  let missingComments = 0;

  for (const c of matrix.criteria) {
    totalCells += matrix.optionKeys.length;
    for (const ok of matrix.optionKeys) {
      const s = matrix.scores[c.id]?.[ok];
      if (typeof s === "number" && s >= 1 && s <= 5) filledCells++;
    }
    const comment = matrix.rowComments[c.id];
    if (!isNonEmptyString(comment)) missingComments++;
  }

  return { filledCells, totalCells, missingComments };
}

export function requiredFieldsStats(
  sections: TemplateSection[],
  values: Record<string, unknown>,
): { total: number; complete: number } {
  let total = 0;
  let complete = 0;

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.delegateToWorkspace) continue;
      if (!field.required) continue;
      total++;
      const v = values[field.name];
      if (field.type === "score_matrix") {
        const m = scoreMatrixFromUnknown(v);
        if (!m) continue;
        const w = totalWeight(m);
        const { filledCells, totalCells, missingComments } = matrixCompleteness(m);
        if (
          w >= 99 &&
          w <= 101 &&
          filledCells === totalCells &&
          missingComments === 0
        ) {
          complete++;
        }
      } else if (field.type === "evidence_link") {
        if (isNonEmptyString(v) || (Array.isArray(v) && v.length > 0)) complete++;
      } else if (field.type === "checkbox") {
        if (v === true) complete++;
      } else if (isNonEmptyString(v) || typeof v === "number") {
        complete++;
      }
    }
  }

  return { total, complete };
}

export function estimateSectionProgress(
  section: TemplateSection,
  values: Record<string, unknown>,
): number {
  if (sectionCompletion(section, values)) return 100;
  let weighted = 0;
  let weightSum = 0;
  for (const field of section.fields) {
    if (field.delegateToWorkspace) continue;
    if (!field.required) continue;
    weightSum += 1;
    const v = values[field.name];
    if (field.type === "score_matrix") {
      const m = scoreMatrixFromUnknown(v);
      if (!m) continue;
      const { filledCells, totalCells } = matrixCompleteness(m);
      if (totalCells > 0) weighted += filledCells / totalCells;
    } else if (field.type === "evidence_link") {
      if (isNonEmptyString(v) || (Array.isArray(v) && v.length > 0)) weighted += 1;
    } else if (field.type === "checkbox") {
      if (v === true) weighted += 1;
    } else if (isNonEmptyString(v) || typeof v === "number") {
      weighted += 1;
    }
  }
  return weightSum > 0 ? Math.round((weighted / weightSum) * 100) : 0;
}

export function deriveSectionStatus(
  section: TemplateSection,
  values: Record<string, unknown>,
): TemplateSectionStatus {
  if (sectionCompletion(section, values)) return "complete";
  return estimateSectionProgress(section, values) > 0 ? "in_progress" : "not_started";
}

export function sectionCompletion(
  section: TemplateSection,
  values: Record<string, unknown>,
): boolean {
  for (const field of section.fields) {
    if (field.delegateToWorkspace) continue;
    if (!field.required) continue;
    const v = values[field.name];
    if (field.type === "score_matrix") {
      const m = scoreMatrixFromUnknown(v);
      if (!m) return false;
      const w = totalWeight(m);
      const { filledCells, totalCells, missingComments } = matrixCompleteness(m);
      if (w < 99 || w > 101 || filledCells !== totalCells || missingComments > 0) return false;
    } else if (field.type === "evidence_link") {
      if (!isNonEmptyString(v) && !(Array.isArray(v) && v.length > 0)) return false;
    } else if (field.type === "checkbox") {
      if (v !== true) return false;
    } else if (!isNonEmptyString(v) && typeof v !== "number") {
      return false;
    }
  }
  return true;
}

export function buildValidationIssues(
  sections: TemplateSection[],
  values: Record<string, unknown>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.delegateToWorkspace) continue;
      if (!field.required) continue;
      const v = values[field.name];
      if (field.type === "score_matrix") {
        const m = scoreMatrixFromUnknown(v);
        if (!m) {
          issues.push({
            id: `err-${section.id}-${field.name}`,
            severity: "error",
            sectionId: section.id,
            fieldName: field.name,
            message: "Complete the scoring matrix.",
            ruleId: "score-matrix.required",
            requiredFix: "Open the scoring matrix and complete all criteria, weights, scores, and justifications.",
            suggestedValue: "Weights total 100%; every option has a 1-5 score and justification.",
          });
          continue;
        }
        const w = totalWeight(m);
        if (w < 99 || w > 101) {
          issues.push({
            id: `warn-weight-${section.id}`,
            severity: "warning",
            sectionId: section.id,
            fieldName: field.name,
            message: `Criteria weights must total 100% (currently ${w}%).`,
            ruleId: "score-matrix.weight-total",
            requiredFix: "Adjust criteria weights until the total equals 100%.",
            suggestedValue: "Example: 30 + 25 + 20 + 15 + 10 = 100.",
          });
        }
        const { filledCells, totalCells, missingComments } = matrixCompleteness(m);
        if (filledCells < totalCells) {
          issues.push({
            id: `warn-scores-${section.id}`,
            severity: "warning",
            sectionId: section.id,
            fieldName: field.name,
            message: "At least one score is missing in the scoring matrix.",
            ruleId: "score-matrix.scores-complete",
            requiredFix: "Fill every score cell with a value between 1 and 5.",
            suggestedValue: "Use 1 for weak fit and 5 for strong fit.",
          });
        }
        if (missingComments > 0) {
          issues.push({
            id: `warn-justify-${section.id}`,
            severity: "warning",
            sectionId: section.id,
            fieldName: field.name,
            message: "At least one scoring justification is missing in Section 2.",
            ruleId: "score-matrix.justifications-complete",
            requiredFix: "Add a short justification for every scoring criterion.",
            suggestedValue: "Example: Strong OIDC support, but migration effort remains moderate.",
          });
        }
      } else if (field.type === "evidence_link") {
        if (!isNonEmptyString(v) && !(Array.isArray(v) && v.length > 0)) {
          issues.push({
            id: `req-${section.id}-${field.name}`,
            severity: "error",
            sectionId: section.id,
            fieldName: field.name,
            message: `${field.label}: link or enter at least one evidence id.`,
            ruleId: "evidence.required",
            requiredFix: "Link or upload at least one supporting evidence item for this field.",
            suggestedValue: "Attach the latest approved report, decision log, screenshot, or control evidence.",
          });
        }
      } else if (field.type === "checkbox") {
        if (v !== true) {
          issues.push({
            id: `req-${section.id}-${field.name}`,
            severity: "error",
            sectionId: section.id,
            fieldName: field.name,
            message: `${field.label} must be checked.`,
            ruleId: "field.checkbox-required",
            requiredFix: "Check the box to acknowledge or confirm this requirement.",
            suggestedValue: "Checked",
          });
        }
      } else if (!isNonEmptyString(v) && typeof v !== "number") {
        const severity: ValidationIssue["severity"] =
          field.type === "select" && field.required ? "error" : "warning";
        issues.push({
          id: `req-${section.id}-${field.name}`,
          severity,
          sectionId: section.id,
          fieldName: field.name,
          message: `${field.label} is required.`,
          ruleId: severity === "error" ? "field.required" : "field.recommended",
          requiredFix: `Provide a value for ${field.label}.`,
          suggestedValue:
            field.helpPopover?.exampleValue ??
            field.placeholder ??
            field.helpPopover?.expectedInput ??
            "Enter the requested artifact detail.",
        });
      }
    }
  }

  return issues;
}

export function computeValidationSummary(
  wizardHeader: WizardHeaderData,
  sections: TemplateSection[],
  values: Record<string, unknown>,
): ValidationSummary {
  const issues = buildValidationIssues(sections, values);
  const rf = requiredFieldsStats(sections, values);
  const sectionsComplete = sections.filter((s) => sectionCompletion(s, values)).length;
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const completionPercent =
    sections.length > 0
      ? Math.round((sectionsComplete / sections.length) * 100)
      : wizardHeader.completionPercent;

  const evLinks = evidenceLinkFieldStats(sections, values);

  return {
    completionPercent,
    requiredFieldsTotal: rf.total,
    requiredFieldsComplete: rf.complete,
    sectionsTotal: sections.length,
    sectionsComplete,
    evidenceLinksRequired: evLinks.required,
    evidenceLinksComplete: evLinks.complete,
    exportReady: errorCount === 0 && warningCount === 0,
    issues,
    warningCount,
    errorCount,
  };
}

export function buildMarkdownPreview(
  wizardHeader: WizardHeaderData,
  sections: TemplateSection[],
  values: Record<string, unknown>,
  generatedAtLabel: string,
): MarkdownPreviewData {
  const lines: string[] = [];
  lines.push(`# ${wizardHeader.templateCode} ${wizardHeader.templateName}`);
  lines.push("");
  lines.push(`**Project:** ${wizardHeader.projectName} (${wizardHeader.projectId})`);
  lines.push(`**Phase:** ${wizardHeader.phaseNumber}. ${wizardHeader.phaseName}`);
  lines.push(`**Status:** ${wizardHeader.status.replace(/_/g, " ")}`);
  lines.push(`**Generated:** ${generatedAtLabel}`);
  lines.push("");

  const matrix = scoreMatrixFromUnknown(values[SCORE_MATRIX_KEY]);
  if (matrix && matrix.criteria.length > 0) {
    lines.push("## Scoring Matrix");
    lines.push("");
    const headers = [
      "Criteria",
      "Weight",
      ...matrix.optionKeys.map((k) => matrix.optionLabels[k] ?? k),
    ];
    lines.push(`| ${headers.join(" | ")} |`);
    lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
    for (const c of matrix.criteria) {
      const cells = matrix.optionKeys.map((ok) => String(matrix.scores[c.id]?.[ok] ?? "—"));
      lines.push(`| ${c.name} | ${c.weight}% | ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  for (const section of sections) {
    if (section.fields.some((f) => f.type === "score_matrix")) continue;
    lines.push(`## ${section.order}. ${section.title}`);
    lines.push("");
    for (const field of section.fields) {
      const v = values[field.name];
      let text: string;
      if (field.type === "checkbox") {
        text = v === true ? "Yes" : v === false ? "No" : "";
      } else {
        text =
          typeof v === "string"
            ? v.trim()
            : v === undefined || v === null
              ? ""
              : JSON.stringify(v);
      }
      if (!text) {
        lines.push(`- **${field.label}:** _[required]_`);
      } else {
        lines.push(`- **${field.label}:** ${text}`);
      }
    }
    lines.push("");
  }

  const hasMissing = lines.some((l) => l.includes("_[required]_"));

  return {
    artifactTitle: `${wizardHeader.templateCode} ${wizardHeader.templateName}`,
    markdown: lines.join("\n"),
    generatedAtLabel,
    hasMissingPlaceholders: hasMissing,
  };
}

export function buildJsonEvidence(
  wizardHeader: WizardHeaderData,
  selectedTemplate: { id: string; code: string; version: string },
  projectId: string,
  generatedBy: string,
  sections: TemplateSection[],
  values: Record<string, unknown>,
  validation: ValidationSummary,
  options?: {
    persistedArtifactId?: string | null;
    evidenceLinks?: JsonEvidence["evidenceLinks"];
    generatedAt?: string;
  },
): JsonEvidence {
  const now = options?.generatedAt ?? new Date().toISOString();
  const artifactId =
    options?.persistedArtifactId?.trim() || `draft-${selectedTemplate.id}`;

  return {
    artifactId,
    projectId,
    phaseId: `phase-${wizardHeader.phaseNumber}`,
    phaseNumber: wizardHeader.phaseNumber,
    templateId: selectedTemplate.id,
    templateCode: selectedTemplate.code,
    templateVersion: selectedTemplate.version,
    artifactVersion: wizardHeader.artifactVersion,
    status: wizardHeader.status,
    generatedAt: now,
    generatedBy,
    sections: sections.map((s) => ({
      sectionId: s.id,
      title: s.title,
      status: s.status,
      values: Object.fromEntries(
        s.fields.map((f) => [f.name, values[f.name] ?? null]),
      ),
    })),
    validation: {
      completionPercent: validation.completionPercent,
      exportReady: validation.exportReady,
      issues: validation.issues,
    },
    evidenceLinks: options?.evidenceLinks ?? [],
  };
}

export function initialScoreMatrix(): WizardScoreMatrix {
  const optionKeys = ["opt-a", "opt-b", "opt-c"];
  return {
    criteria: [
      {
        id: "c1",
        name: "Functional Fit",
        description: "Fit to required capabilities",
        weight: 30,
      },
      {
        id: "c2",
        name: "Technical Feasibility",
        description: "Implementation risk",
        weight: 25,
      },
      { id: "c3", name: "Cost", description: "TCO vs budget", weight: 20 },
      {
        id: "c4",
        name: "Vendor Capability",
        description: "Roadmap & support",
        weight: 15,
      },
      { id: "c5", name: "Scalability", description: "Growth headroom", weight: 10 },
    ],
    optionKeys,
    optionLabels: {
      "opt-a": "Option A — Okta IAM",
      "opt-b": "Option B — Azure AD",
      "opt-c": "Option C — Ping Identity",
    },
    scores: {
      c1: { "opt-a": 5, "opt-b": 4, "opt-c": 4 },
      c2: { "opt-a": 4, "opt-b": 5, "opt-c": 3 },
      c3: { "opt-a": 3, "opt-b": 4, "opt-c": 3 },
      c4: { "opt-a": 4, "opt-b": 4, "opt-c": 4 },
      c5: { "opt-a": 5, "opt-b": 4, "opt-c": 4 },
    },
    rowComments: {
      c1: "Strong SAML/OIDC coverage for our apps.",
      c2: "",
      c3: "",
      c4: "",
      c5: "",
    },
  };
}
