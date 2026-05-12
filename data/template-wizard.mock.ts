import {
  computeValidationSummary,
  initialScoreMatrix,
} from "@/lib/template-wizard-computed";
import { toJsonEvidence } from "@/templates/renderJsonEvidence";
import { toMarkdown } from "@/templates/renderMarkdown";
import type { TemplateWizardData } from "@/types/template-wizard.types";

export type DemoTemplateRouteId = "a-3-1" | "a-3-2" | "a-3-3";

export function normalizeTemplateRouteId(raw: string): DemoTemplateRouteId {
  const s = decodeURIComponent(raw).trim().toLowerCase();
  if (s === "a-3-1" || s === "a-3.1" || s === "a31") return "a-3-1";
  if (s === "a-3-3" || s === "a-3.3" || s === "a33") return "a-3-3";
  return "a-3-2";
}

const SECTIONS = [
  {
    id: "section-1",
    order: 1,
    title: "Evaluation Criteria",
    description: "Define the criteria used to compare solution options.",
    required: true,
    status: "complete" as const,
    fields: [
      {
        id: "criteria-summary",
        name: "criteriaSummary",
        label: "Criteria Summary",
        type: "textarea" as const,
        required: true,
        placeholder: "Describe the evaluation criteria...",
      },
    ],
  },
  {
    id: "section-2",
    order: 2,
    title: "Scoring Matrix",
    description: "Score each option against the weighted criteria.",
    required: true,
    status: "in_progress" as const,
    fields: [
      {
        id: "score-matrix",
        name: "scoreMatrix",
        label: "Weighted Scoring Matrix",
        type: "score_matrix" as const,
        required: true,
      },
    ],
  },
  {
    id: "section-3",
    order: 3,
    title: "Option Analysis",
    description: "Summarize qualitative analysis for each option.",
    required: true,
    status: "in_progress" as const,
    fields: [
      {
        id: "option-analysis",
        name: "optionAnalysis",
        label: "Option Analysis",
        type: "textarea" as const,
        required: true,
        placeholder: "Compare strengths and weaknesses...",
      },
    ],
  },
  {
    id: "section-4",
    order: 4,
    title: "Risk Assessment",
    description: "Identify implementation and operational risks.",
    required: true,
    status: "not_started" as const,
    fields: [
      {
        id: "risk-assessment",
        name: "riskAssessment",
        label: "Key Risks",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "section-5",
    order: 5,
    title: "Cost & Benefit Summary",
    description: "Summarize costs and expected benefits.",
    required: true,
    status: "not_started" as const,
    fields: [
      {
        id: "cost-benefit",
        name: "costBenefit",
        label: "Cost & Benefit Summary",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "section-6",
    order: 6,
    title: "Recommended Option",
    description: "State the recommended solution and rationale.",
    required: true,
    status: "not_started" as const,
    fields: [
      {
        id: "recommended-option",
        name: "recommendedOption",
        label: "Recommended Option",
        type: "select" as const,
        required: true,
        options: [
          { label: "Option A — Okta IAM", value: "opt-a" },
          { label: "Option B — Azure AD", value: "opt-b" },
          { label: "Option C — Ping Identity", value: "opt-c" },
        ],
      },
    ],
  },
  {
    id: "section-7",
    order: 7,
    title: "Assumptions & Constraints",
    description: "Document assumptions, constraints, and dependencies.",
    required: true,
    status: "not_started" as const,
    fields: [
      {
        id: "assumptions",
        name: "assumptions",
        label: "Assumptions & Constraints",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
];

export function buildTemplateWizardSeed(args: {
  projectId: string;
  projectName: string;
  projectCode: string;
  templateSlug: string;
}): TemplateWizardData {
  const templateId = normalizeTemplateRouteId(args.templateSlug);

  const tmplMeta: Record<
    DemoTemplateRouteId,
    { code: string; name: string; version: string }
  > = {
    "a-3-1": { code: "A-3.1", name: "Solution Options Analysis", version: "v1.0" },
    "a-3-2": { code: "A-3.2", name: "Evaluation & Scoring Matrix", version: "v1.0" },
    "a-3-3": { code: "A-3.3", name: "Recommended Solution", version: "v1.0" },
  };

  const formValues: Record<string, unknown> = {
    criteriaSummary:
      "Weighted criteria emphasize functional fit and feasibility while balancing cost and vendor maturity.",
    scoreMatrix: initialScoreMatrix(),
    optionAnalysis:
      "Initial comparison suggests trade-offs between ecosystem breadth (Azure AD), depth of IAM features (Okta), and Ping's specialization.",
  };

  const wizardHeader = {
    projectId: args.projectCode,
    projectName: args.projectName,
    templateId,
    templateCode: tmplMeta[templateId].code,
    templateName: tmplMeta[templateId].name,
    phaseNumber: 3,
    phaseName: "Evaluation & Selection",
    status: "in_progress" as const,
    purpose:
      "Score and compare solution options using weighted evaluation criteria, evidence, assumptions, and decision rationale.",
    ownerName: "Alex Developer",
    templateVersion: tmplMeta[templateId].version,
    artifactVersion: "v0.3 (Draft)",
    lastSavedLabel: "Autosaved 2m ago",
    completionPercent: 60,
  };

  const templateSelections = [
    {
      id: "a-3-1",
      templateCode: "A-3.1",
      name: "Solution Options Analysis",
      required: true,
      status: "complete" as const,
      completionPercent: 100,
      href: `/projects/${args.projectId}/templates/a-3-1`,
    },
    {
      id: "a-3-2",
      templateCode: "A-3.2",
      name: "Evaluation & Scoring Matrix",
      required: true,
      status: "in_progress" as const,
      completionPercent: 60,
      href: `/projects/${args.projectId}/templates/a-3-2`,
    },
    {
      id: "a-3-3",
      templateCode: "A-3.3",
      name: "Recommended Solution",
      required: true,
      status: "not_started" as const,
      completionPercent: 0,
      href: `/projects/${args.projectId}/templates/a-3-3`,
    },
  ];

  const selectedTemplate = {
    id: templateId,
    code: tmplMeta[templateId].code,
    name: tmplMeta[templateId].name,
    version: tmplMeta[templateId].version,
    sections: SECTIONS.map((s) => ({ ...s })),
  };

  const validationSummary = computeValidationSummary(
    wizardHeader,
    selectedTemplate.sections,
    formValues,
  );

  const generatedAtLabel = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const markdownPreview = toMarkdown({
    wizardHeader,
    sections: selectedTemplate.sections,
    formValues,
    generatedAtLabel,
  });

  const jsonEvidence = toJsonEvidence({
    wizardHeader,
    selectedTemplate,
    projectId: args.projectId,
    generatedBy: "Alex Developer",
    sections: selectedTemplate.sections,
    formValues,
    validationSummary,
  });

  const artifactSaveState = {
    artifactId: "artifact-a-3-2",
    templateId,
    projectId: args.projectId,
    phaseId: "phase-3",
    status: "in_progress" as const,
    canSave: true,
    canExportMarkdown: true,
    canExportJson: true,
    canMarkComplete: validationSummary.exportReady,
    blockers: validationSummary.issues
      .filter((i) => i.severity === "error")
      .map((i) => i.message),
  };

  return {
    user: {
      name: "Alex Developer",
      role: "Solution Architect",
      initials: "AD",
    },
    project: {
      id: args.projectId,
      code: args.projectCode,
      name: args.projectName,
    },
    wizardHeader,
    templateSelections,
    selectedTemplate,
    activeSectionId: "section-2",
    formValues,
    validationSummary,
    markdownPreview,
    jsonEvidence,
    artifactSaveState,
  };
}
