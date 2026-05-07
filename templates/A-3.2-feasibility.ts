import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const rating = z.enum(["High", "Medium", "Low", "Unknown"]);
const candidateProduct = z.enum(["Yes", "No", "Unknown"]);
const feasibilityDecision = z.enum([
  "Feasible",
  "Feasible with conditions",
  "Pivot recommended",
  "Research required",
  "Not feasible now",
  "Not feasible",
]);
const feasibilityApprovalStatus = z.enum([
  "Draft",
  "Submitted",
  "Under Review",
  "Feasible — Proceed to Requirements",
  "Conditionally Feasible — Proceed to Requirements",
  "Pivot",
  "Deferred",
  "Stopped",
]);

export const feasibilityAssessmentSchema = z.object({
  projectName: z.string().min(2, "Project name is required."),
  ideaTitle: z.string().min(2, "Idea title is required."),
  projectOwner: z.string().min(2, "Project owner is required."),
  datePrepared: z.string().min(2, "Date prepared is required."),
  reviewers: z.string().min(2, "Reviewer(s) are required."),
  existingProductId: z.string().min(1, "Existing Product ID (or N/A) is required."),
  candidateNewProduct: candidateProduct,
  candidatePclCode: z.string().min(1, "Candidate PCL code (or N/A) is required."),
  pclCriticalityRationale: z.string().min(1, "PCL criticality rationale (or N/A) is required."),
  domainTags: z.string().min(1, "Domain tags are required."),
  functionDescriptors: z.string().min(1, "Function descriptors (or N/A) are required."),
  workTypeTags: z.string().min(1, "Work Type Tag(s) (or N/A) is required."),

  sourceIdeaCapture: z.string().min(2, "Idea Capture reference is required."),
  sourceProblemDefinition: z.string().min(2, "Problem Definition reference is required."),
  sourceSelectionScorecard: z.string().min(2, "Selection scorecard / evaluation record is required."),
  sourceBusinessFieldReport: z.string().min(2, "Business Field Report reference is required."),
  sourceEarlyResearchNotes: z.string().min(1, "Early research notes (or N/A) are required."),
  sourceTechnicalNotes: z.string().min(1, "Technical notes (or N/A) are required."),
  sourceStakeholderNotes: z.string().min(1, "Stakeholder notes (or N/A) are required."),
  sourceOther: z.string().min(1, "Other sources (or None) are required."),

  overallFeasibilitySummary: z.string().min(10, "Overall feasibility summary is required."),

  technicalFeasibilityDetail: z.string().min(10, "Technical feasibility detail is required."),
  technicalFeasibilityRating: rating,

  resourceFeasibilityDetail: z.string().min(10, "Resource feasibility detail is required."),
  resourceFeasibilityRating: rating,

  scheduleFeasibilityDetail: z.string().min(10, "Schedule feasibility detail is required."),
  scheduleFeasibilityRating: rating,

  financialFeasibilityDetail: z.string().min(10, "Financial / business feasibility detail is required."),
  financialFeasibilityRating: rating,

  operationalFeasibilityDetail: z.string().min(10, "Operational feasibility detail is required."),
  operationalFeasibilityRating: rating,

  securityPrivacyComplianceDetail: z
    .string()
    .min(10, "Security, privacy, and compliance feasibility detail is required."),
  securityComplianceFeasibilityRating: rating,

  integrationDependencyDetail: z.string().min(10, "Integration and dependency feasibility detail is required."),
  integrationFeasibilityRating: rating,

  maintenanceFeasibilityDetail: z.string().min(10, "Maintenance feasibility detail is required."),
  maintenanceFeasibilityRating: rating,

  feasibilityRatingSummaryNotes: z
    .string()
    .min(5, "Rating summary (table or notes per area) is required."),

  majorRisks: z.string().min(3, "Major risks are required."),
  riskMitigations: z.string().min(3, "Risk mitigations are required."),
  blockingRisks: z.string().min(1, "Blocking risks (or None) are required."),
  nonBlockingRisks: z.string().min(1, "Non-blocking risks (or None) are required."),

  assumptions: z.string().min(3, "Assumptions are required."),
  openQuestions: z.string().min(1, "Open questions (or None) are required."),
  requiredResearch: z.string().min(1, "Required research (or None) is required."),

  feasibilityDecision: feasibilityDecision,
  feasibilityDecisionDate: z.string().min(2, "Decision date is required."),
  feasibilityDecisionMaker: z.string().min(2, "Decision maker is required."),
  feasibilityDecisionRationale: z.string().min(10, "Decision rationale is required."),
  requiredFollowUp: z.string().min(1, "Required follow-up (or None) is required."),
  nextLifecyclePhase: z.string().min(2, "Next lifecycle phase is required."),

  feasibilityApprovalStatus: feasibilityApprovalStatus,
  feasibilityReviewer: z.string().min(2, "Reviewer is required."),
  feasibilityReviewDate: z.string().min(2, "Review date is required."),
  feasibilityReviewNotes: z.string().min(3, "Review notes are required."),
});

export type FeasibilityAssessmentData = z.infer<typeof feasibilityAssessmentSchema>;

const ratingOptions = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
  { label: "Unknown", value: "Unknown" },
];

export const feasibilityAssessmentTemplate: LifecycleTemplate<
  typeof feasibilityAssessmentSchema
> = {
  templateId: "A-3.2",
  title: "Feasibility Assessment",
  phase: 4,
  gate: "G3",
  schema: feasibilityAssessmentSchema,

  sections: [
    {
      id: "1",
      title: "Project Identification",
      fields: [
        { name: "projectName", label: "Project Name", type: "text", required: true },
        { name: "ideaTitle", label: "Idea Title", type: "text", required: true },
        { name: "projectOwner", label: "Project Owner", type: "text", required: true },
        { name: "datePrepared", label: "Date Prepared", type: "text", required: true },
        { name: "reviewers", label: "Reviewer(s)", type: "textarea", required: true },
        {
          name: "existingProductId",
          label: "Existing Product ID (PRD-XXX), if any",
          type: "text",
          required: true,
        },
        {
          name: "candidateNewProduct",
          label: "Candidate New Product?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
            { label: "Unknown", value: "Unknown" },
          ],
        },
        {
          name: "candidatePclCode",
          label: "Candidate PCL Code (PCL-L.D.E.C)",
          type: "text",
          required: true,
        },
        {
          name: "pclCriticalityRationale",
          label: "PCL Criticality Rationale",
          type: "textarea",
          required: true,
        },
        { name: "domainTags", label: "Domain Tags", type: "textarea", required: true },
        {
          name: "functionDescriptors",
          label: "Function Descriptors",
          type: "textarea",
          required: true,
        },
        {
          name: "workTypeTags",
          label: "Work Type Tag(s), if pre-product or cross-cutting",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Source Documents",
      description:
        "List references used for this assessment (Idea Capture, Problem Definition, Phase 3 evidence, Business Field Report, notes).",
      fields: [
        {
          name: "sourceIdeaCapture",
          label: "Idea Capture Form reference",
          type: "textarea",
          required: true,
        },
        {
          name: "sourceProblemDefinition",
          label: "Problem Definition Document reference",
          type: "textarea",
          required: true,
        },
        {
          name: "sourceSelectionScorecard",
          label: "Project Selection Scorecard / evaluation record",
          type: "textarea",
          required: true,
        },
        {
          name: "sourceBusinessFieldReport",
          label: "Business Field Report (Template A-4)",
          type: "textarea",
          required: true,
        },
        {
          name: "sourceEarlyResearchNotes",
          label: "Early Research Notes",
          type: "textarea",
          required: true,
        },
        {
          name: "sourceTechnicalNotes",
          label: "Technical Notes",
          type: "textarea",
          required: true,
        },
        {
          name: "sourceStakeholderNotes",
          label: "Stakeholder Notes",
          type: "textarea",
          required: true,
        },
        { name: "sourceOther", label: "Other", type: "textarea", required: true },
      ],
    },
    {
      id: "3",
      title: "Feasibility Summary",
      fields: [
        {
          name: "overallFeasibilitySummary",
          label: "Overall Feasibility Summary",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "4",
      title: "Technical Feasibility",
      description:
        "Cover required technologies, stack, architecture complexity, data, APIs, performance, security, prototype needs, unknowns.",
      fields: [
        {
          name: "technicalFeasibilityDetail",
          label: "Technical Feasibility",
          type: "textarea",
          required: true,
        },
        {
          name: "technicalFeasibilityRating",
          label: "Technical Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "5",
      title: "Resource Feasibility",
      fields: [
        {
          name: "resourceFeasibilityDetail",
          label: "Resource Feasibility",
          type: "textarea",
          required: true,
        },
        {
          name: "resourceFeasibilityRating",
          label: "Resource Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "6",
      title: "Schedule Feasibility",
      fields: [
        {
          name: "scheduleFeasibilityDetail",
          label: "Schedule Feasibility",
          type: "textarea",
          required: true,
        },
        {
          name: "scheduleFeasibilityRating",
          label: "Schedule Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "7",
      title: "Financial / Business Feasibility",
      description: "Use Template A-5 for structured forecasts when appropriate.",
      fields: [
        {
          name: "financialFeasibilityDetail",
          label: "Financial / Business Feasibility",
          type: "textarea",
          required: true,
        },
        {
          name: "financialFeasibilityRating",
          label: "Financial / Business Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "8",
      title: "Operational Feasibility",
      fields: [
        {
          name: "operationalFeasibilityDetail",
          label: "Operational Feasibility",
          type: "textarea",
          required: true,
        },
        {
          name: "operationalFeasibilityRating",
          label: "Operational Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "9",
      title: "Security, Privacy, and Compliance Feasibility",
      fields: [
        {
          name: "securityPrivacyComplianceDetail",
          label: "Security / Privacy / Compliance",
          type: "textarea",
          required: true,
        },
        {
          name: "securityComplianceFeasibilityRating",
          label: "Security / Compliance Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "10",
      title: "Integration and Dependency Feasibility",
      fields: [
        {
          name: "integrationDependencyDetail",
          label: "Integration / Dependencies",
          type: "textarea",
          required: true,
        },
        {
          name: "integrationFeasibilityRating",
          label: "Integration Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "11",
      title: "Maintenance Feasibility",
      fields: [
        {
          name: "maintenanceFeasibilityDetail",
          label: "Maintenance Feasibility",
          type: "textarea",
          required: true,
        },
        {
          name: "maintenanceFeasibilityRating",
          label: "Maintenance Feasibility Rating",
          type: "select",
          required: true,
          options: ratingOptions,
        },
      ],
    },
    {
      id: "12",
      title: "Feasibility Rating Summary",
      fields: [
        {
          name: "feasibilityRatingSummaryNotes",
          label: "Rating summary (area | rating | notes)",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "13",
      title: "Risk Summary",
      fields: [
        { name: "majorRisks", label: "Major Risks", type: "textarea", required: true },
        { name: "riskMitigations", label: "Risk Mitigations", type: "textarea", required: true },
        { name: "blockingRisks", label: "Blocking Risks", type: "textarea", required: true },
        {
          name: "nonBlockingRisks",
          label: "Non-Blocking Risks",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "14",
      title: "Assumptions and Open Questions",
      fields: [
        { name: "assumptions", label: "Assumptions", type: "textarea", required: true },
        { name: "openQuestions", label: "Open Questions", type: "textarea", required: true },
        {
          name: "requiredResearch",
          label: "Required Research",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "15",
      title: "Feasibility Decision",
      fields: [
        {
          name: "feasibilityDecision",
          label: "Feasibility Decision",
          type: "select",
          required: true,
          options: [
            { label: "Feasible", value: "Feasible" },
            { label: "Feasible with conditions", value: "Feasible with conditions" },
            { label: "Pivot recommended", value: "Pivot recommended" },
            { label: "Research required", value: "Research required" },
            { label: "Not feasible now", value: "Not feasible now" },
            { label: "Not feasible", value: "Not feasible" },
          ],
        },
        {
          name: "feasibilityDecisionDate",
          label: "Decision Date",
          type: "text",
          required: true,
        },
        {
          name: "feasibilityDecisionMaker",
          label: "Decision Maker",
          type: "text",
          required: true,
        },
        {
          name: "feasibilityDecisionRationale",
          label: "Decision Rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "requiredFollowUp",
          label: "Required Follow-Up",
          type: "textarea",
          required: true,
        },
        {
          name: "nextLifecyclePhase",
          label: "Next Lifecycle Phase",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "16",
      title: "Approval Status",
      fields: [
        {
          name: "feasibilityApprovalStatus",
          label: "Approval Status",
          type: "select",
          required: true,
          options: [
            { label: "Draft", value: "Draft" },
            { label: "Submitted", value: "Submitted" },
            { label: "Under Review", value: "Under Review" },
            {
              label: "Feasible — Proceed to Requirements",
              value: "Feasible — Proceed to Requirements",
            },
            {
              label: "Conditionally Feasible — Proceed to Requirements",
              value: "Conditionally Feasible — Proceed to Requirements",
            },
            { label: "Pivot", value: "Pivot" },
            { label: "Deferred", value: "Deferred" },
            { label: "Stopped", value: "Stopped" },
          ],
        },
        {
          name: "feasibilityReviewer",
          label: "Reviewer",
          type: "text",
          required: true,
        },
        {
          name: "feasibilityReviewDate",
          label: "Review Date",
          type: "text",
          required: true,
        },
        {
          name: "feasibilityReviewNotes",
          label: "Decision Notes",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],

  toMarkdown(data) {
    return renderTemplateMarkdown({
      templateId: this.templateId,
      title: this.title,
      sections: this.sections,
      data,
    });
  },
};
