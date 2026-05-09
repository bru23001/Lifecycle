import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const requiredText = (fieldName: string, min = 3) =>
  z.string().trim().min(min, `${fieldName} is required.`);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

const rating = z.enum(["High", "Medium", "Low", "Unknown"]);
const candidateProduct = z.enum(["Yes", "No", "Unknown"]);
const yesNo = z.enum(["Yes", "No"]);

const feasibilityDecisionEnum = z.enum([
  "Feasible",
  "Feasible with conditions",
  "Pivot recommended",
  "Research required",
  "Not feasible now",
  "Not feasible",
]);

const feasibilityApprovalStatusEnum = z.enum([
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
  projectName: requiredText("Project Name", 2),
  ideaTitle: requiredText("Idea Title", 2),
  projectOwner: requiredText("Project Owner", 2),
  datePrepared: dateString,
  reviewers: requiredText("Reviewer(s)", 2),
  existingProductId: requiredText("Existing Product ID (or N/A)", 1),
  candidateNewProduct: candidateProduct,
  candidatePclCode: requiredText("Candidate PCL Code (or N/A)", 1),
  pclCriticalityRationale: requiredText("PCL Criticality Rationale (or N/A)", 1),
  domainTags: requiredText("Domain Tags", 2),
  functionDescriptors: requiredText("Function Descriptors (or N/A)", 1),
  workTypeTags: requiredText("Work Type Tag(s) (or N/A)", 1),

  sourceIdeaCapture: requiredText("Idea Capture Form reference", 2),
  sourceProblemDefinition: requiredText("Problem Definition Document reference", 2),
  sourceSelectionScorecard: requiredText(
    "Project Selection Scorecard / evaluation record",
    2,
  ),
  sourceBusinessFieldReport: requiredText(
    "Business Field Report (Template A-4)",
    2,
  ),
  sourceEarlyResearchNotes: requiredText("Early Research Notes (or N/A)", 1),
  sourceTechnicalNotes: requiredText("Technical Notes (or N/A)", 1),
  sourceStakeholderNotes: requiredText("Stakeholder Notes (or N/A)", 1),
  sourceOther: requiredText("Other sources (or None)", 1),

  overallFeasibilitySummary: requiredText("Overall Feasibility Summary", 10),

  techRequiredTechnologies: requiredText("Required technologies", 3),
  techKnownStack: requiredText("Known technology stack", 3),
  techNewToolsFrameworks: requiredText("New tools or frameworks required", 2),
  techArchitectureComplexity: requiredText("Architecture complexity", 2),
  techDataStorageNeeds: requiredText("Data storage needs", 2),
  techApiRequirements: requiredText("API requirements", 2),
  techPerformanceNeeds: requiredText("Performance needs", 2),
  techSecurityNeeds: requiredText("Security needs", 2),
  techPrototypeRequired: yesNo,
  techUnknowns: requiredText("Technical unknowns", 2),
  technicalFeasibilityRating: rating,

  resRequiredRoles: requiredText("Required roles", 2),
  resAvailableSkills: requiredText("Available skills", 2),
  resMissingSkills: requiredText("Missing skills", 2),
  resRequiredTools: requiredText("Required tools", 2),
  resRequiredLicenses: requiredText("Required licenses", 2),
  resRequiredVendors: requiredText("Required vendors", 2),
  resDevelopmentCapacity: requiredText("Development capacity", 2),
  resSupportCapacity: requiredText("Support capacity", 2),
  resourceFeasibilityRating: rating,

  schedDesiredStartDate: requiredText("Desired start date", 2),
  schedDesiredReleaseDate: requiredText("Desired release date", 2),
  schedEstimatedDuration: requiredText("Estimated duration", 2),
  schedMajorMilestones: requiredText("Major milestones", 2),
  schedTimeSensitiveDeadlines: requiredText("Time-sensitive deadlines", 2),
  schedScheduleRisks: requiredText("Schedule risks", 2),
  schedDependenciesTimeline: requiredText("Dependencies affecting timeline", 2),
  scheduleFeasibilityRating: rating,

  finEstimatedCost: requiredText("Estimated cost", 2),
  finExpectedSavings: requiredText("Expected savings", 2),
  finExpectedRevenue: requiredText("Expected revenue", 2),
  finExpectedEfficiencyGain: requiredText("Expected efficiency gain", 2),
  finExpectedCustomerValue: requiredText("Expected customer value", 2),
  finFundingAvailability: requiredText("Funding availability", 2),
  finReturnOnInvestment: requiredText("Return on investment", 2),
  finCostOfNotDoingProject: requiredText("Cost of not doing the project", 2),
  financialFeasibilityRating: rating,

  opsWhoWillUseIt: requiredText("Who will use it?", 2),
  opsWhoWillAdminister: requiredText("Who will administer it?", 2),
  opsWhoWillSupport: requiredText("Who will support it?", 2),
  opsWorkflowChange: requiredText("What workflow will change?", 2),
  opsTrainingNeeded: requiredText("Training needed?", 2),
  opsDocumentationNeeded: requiredText("Documentation needed?", 2),
  opsSupportLoadImpact: requiredText("Support load impact", 2),
  opsFitWithCurrentOperations: requiredText("Fit with current operations", 2),
  operationalFeasibilityRating: rating,

  secAuthzNeeds: requiredText("Authentication / authorization needs", 2),
  secSensitiveDataInvolved: requiredText(
    "Sensitive / personal / payment / health data involved",
    2,
  ),
  secAuditLogsNeeded: requiredText("Audit logs needed?", 2),
  secComplianceRequirements: requiredText("Compliance requirements", 2),
  secPrivacyReviewRequired: requiredText("Security / privacy review required?", 2),
  secKnownSecurityRisks: requiredText("Known security risks", 2),
  securityComplianceFeasibilityRating: rating,

  intExternalApis: requiredText("External APIs", 2),
  intInternalSystems: requiredText("Internal systems", 2),
  intThirdPartyServices: requiredText("Third-party services", 2),
  intVendorDependencies: requiredText("Vendor dependencies", 2),
  intOpenSourceDependencies: requiredText("Open-source dependencies", 2),
  intDataImportExport: requiredText("Data import/export", 2),
  intAuthPaymentCrmErp: requiredText(
    "Auth / payment / CRM / ERP / accounting",
    2,
  ),
  intDependencyRisks: requiredText("Dependency risks", 2),
  integrationFeasibilityRating: rating,

  mainExpectedOwner: requiredText("Expected maintenance owner", 2),
  mainSupportLevel: requiredText("Support level", 2),
  mainBugFixExpectations: requiredText("Bug fix expectations", 2),
  mainUpdateFrequency: requiredText("Update frequency", 2),
  mainDependencyUpdateBurden: requiredText("Dependency update burden", 2),
  mainMonitoringNeeds: requiredText("Monitoring needs", 2),
  mainDocumentationNeeds: requiredText("Documentation needs", 2),
  mainLongTermHostingCost: requiredText("Long-term hosting / operational cost", 2),
  maintenanceFeasibilityRating: rating,

  feasibilityRatingSummaryNotes: requiredText(
    "Feasibility rating summary (area | rating | notes)",
    5,
  ),

  majorRisks: requiredText("Major Risks", 3),
  riskMitigations: requiredText("Risk Mitigations", 3),
  blockingRisks: requiredText("Blocking Risks (or None)", 1),
  nonBlockingRisks: requiredText("Non-Blocking Risks (or None)", 1),

  assumptions: requiredText("Assumptions", 3),
  openQuestions: requiredText("Open Questions (or None)", 1),
  requiredResearch: requiredText("Required Research (or None)", 1),

  feasibilityDecision: feasibilityDecisionEnum,
  feasibilityDecisionDate: dateString,
  feasibilityDecisionMaker: requiredText("Decision Maker", 2),
  feasibilityDecisionRationale: requiredText("Decision Rationale", 10),
  requiredFollowUp: requiredText("Required Follow-Up (or None)", 1),
  nextLifecyclePhase: requiredText("Next Lifecycle Phase", 2),

  feasibilityApprovalStatus: feasibilityApprovalStatusEnum,
  feasibilityReviewer: requiredText("Reviewer", 2),
  feasibilityReviewDate: dateString,
  feasibilityReviewNotes: requiredText("Decision Notes", 3),
});

export type FeasibilityAssessmentData = z.infer<
  typeof feasibilityAssessmentSchema
>;

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
      description:
        "Lifecycle phase: Phase 4 — Feasibility and Business Case.",
      fields: [
        { name: "projectName", label: "Project Name", type: "text", required: true },
        { name: "ideaTitle", label: "Idea Title", type: "text", required: true },
        {
          name: "projectOwner",
          label: "Project Owner",
          type: "text",
          required: true,
        },
        {
          name: "datePrepared",
          label: "Date Prepared (YYYY-MM-DD)",
          type: "date",
          required: true,
        },
        {
          name: "reviewers",
          label: "Reviewer(s)",
          type: "textarea",
          required: true,
        },
        {
          name: "existingProductId",
          label: "Existing Product ID (PRD-XXX), if any",
          type: "text",
          required: true,
          placeholder: "PRD-XXX or N/A",
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
        {
          name: "domainTags",
          label: "Domain Tags",
          type: "textarea",
          required: true,
        },
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
        "Reference Idea Capture, Problem Definition, Phase 3 selection evidence (Scorecard and/or Business Field Report per program rules), and notes.",
      fields: [
        {
          name: "sourceIdeaCapture",
          label: "Idea Capture Form",
          type: "textarea",
          required: true,
        },
        {
          name: "sourceProblemDefinition",
          label: "Problem Definition Document",
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
      description:
        "Does the project appear realistic? What helps or hurts feasibility? What must be clarified before proceeding?",
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
      fields: [
        {
          name: "techRequiredTechnologies",
          label: "Required technologies",
          type: "textarea",
          required: true,
        },
        {
          name: "techKnownStack",
          label: "Known technology stack",
          type: "textarea",
          required: true,
        },
        {
          name: "techNewToolsFrameworks",
          label: "New tools or frameworks required",
          type: "textarea",
          required: true,
        },
        {
          name: "techArchitectureComplexity",
          label: "Architecture complexity",
          type: "textarea",
          required: true,
        },
        {
          name: "techDataStorageNeeds",
          label: "Data storage needs",
          type: "textarea",
          required: true,
        },
        {
          name: "techApiRequirements",
          label: "API requirements",
          type: "textarea",
          required: true,
        },
        {
          name: "techPerformanceNeeds",
          label: "Performance needs",
          type: "textarea",
          required: true,
        },
        {
          name: "techSecurityNeeds",
          label: "Security needs",
          type: "textarea",
          required: true,
        },
        {
          name: "techPrototypeRequired",
          label: "Prototype required?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ],
        },
        {
          name: "techUnknowns",
          label: "Technical unknowns",
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
          name: "resRequiredRoles",
          label: "Required roles",
          type: "textarea",
          required: true,
        },
        {
          name: "resAvailableSkills",
          label: "Available skills",
          type: "textarea",
          required: true,
        },
        {
          name: "resMissingSkills",
          label: "Missing skills",
          type: "textarea",
          required: true,
        },
        {
          name: "resRequiredTools",
          label: "Required tools",
          type: "textarea",
          required: true,
        },
        {
          name: "resRequiredLicenses",
          label: "Required licenses",
          type: "textarea",
          required: true,
        },
        {
          name: "resRequiredVendors",
          label: "Required vendors",
          type: "textarea",
          required: true,
        },
        {
          name: "resDevelopmentCapacity",
          label: "Development capacity",
          type: "textarea",
          required: true,
        },
        {
          name: "resSupportCapacity",
          label: "Support capacity",
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
          name: "schedDesiredStartDate",
          label: "Desired start date",
          type: "textarea",
          required: true,
          description: "Free text or ISO date range.",
        },
        {
          name: "schedDesiredReleaseDate",
          label: "Desired release date",
          type: "textarea",
          required: true,
        },
        {
          name: "schedEstimatedDuration",
          label: "Estimated duration",
          type: "textarea",
          required: true,
        },
        {
          name: "schedMajorMilestones",
          label: "Major milestones",
          type: "textarea",
          required: true,
        },
        {
          name: "schedTimeSensitiveDeadlines",
          label: "Time-sensitive deadlines",
          type: "textarea",
          required: true,
        },
        {
          name: "schedScheduleRisks",
          label: "Schedule risks",
          type: "textarea",
          required: true,
        },
        {
          name: "schedDependenciesTimeline",
          label: "Dependencies affecting timeline",
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
          name: "finEstimatedCost",
          label: "Estimated cost",
          type: "textarea",
          required: true,
        },
        {
          name: "finExpectedSavings",
          label: "Expected savings",
          type: "textarea",
          required: true,
        },
        {
          name: "finExpectedRevenue",
          label: "Expected revenue",
          type: "textarea",
          required: true,
        },
        {
          name: "finExpectedEfficiencyGain",
          label: "Expected efficiency gain",
          type: "textarea",
          required: true,
        },
        {
          name: "finExpectedCustomerValue",
          label: "Expected customer value",
          type: "textarea",
          required: true,
        },
        {
          name: "finFundingAvailability",
          label: "Funding availability",
          type: "textarea",
          required: true,
        },
        {
          name: "finReturnOnInvestment",
          label: "Return on investment",
          type: "textarea",
          required: true,
        },
        {
          name: "finCostOfNotDoingProject",
          label: "Cost of not doing the project",
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
          name: "opsWhoWillUseIt",
          label: "Who will use it?",
          type: "textarea",
          required: true,
        },
        {
          name: "opsWhoWillAdminister",
          label: "Who will administer it?",
          type: "textarea",
          required: true,
        },
        {
          name: "opsWhoWillSupport",
          label: "Who will support it?",
          type: "textarea",
          required: true,
        },
        {
          name: "opsWorkflowChange",
          label: "What workflow will change?",
          type: "textarea",
          required: true,
        },
        {
          name: "opsTrainingNeeded",
          label: "Training needed?",
          type: "textarea",
          required: true,
        },
        {
          name: "opsDocumentationNeeded",
          label: "Documentation needed?",
          type: "textarea",
          required: true,
        },
        {
          name: "opsSupportLoadImpact",
          label: "Support load impact",
          type: "textarea",
          required: true,
        },
        {
          name: "opsFitWithCurrentOperations",
          label: "Fit with current operations",
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
          name: "secAuthzNeeds",
          label: "Authentication / authorization needs",
          type: "textarea",
          required: true,
        },
        {
          name: "secSensitiveDataInvolved",
          label:
            "Sensitive / personal / payment / health data involved",
          type: "textarea",
          required: true,
        },
        {
          name: "secAuditLogsNeeded",
          label: "Audit logs needed?",
          type: "textarea",
          required: true,
        },
        {
          name: "secComplianceRequirements",
          label: "Compliance requirements",
          type: "textarea",
          required: true,
        },
        {
          name: "secPrivacyReviewRequired",
          label: "Security / privacy review required?",
          type: "textarea",
          required: true,
        },
        {
          name: "secKnownSecurityRisks",
          label: "Known security risks",
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
          name: "intExternalApis",
          label: "External APIs",
          type: "textarea",
          required: true,
        },
        {
          name: "intInternalSystems",
          label: "Internal systems",
          type: "textarea",
          required: true,
        },
        {
          name: "intThirdPartyServices",
          label: "Third-party services",
          type: "textarea",
          required: true,
        },
        {
          name: "intVendorDependencies",
          label: "Vendor dependencies",
          type: "textarea",
          required: true,
        },
        {
          name: "intOpenSourceDependencies",
          label: "Open-source dependencies",
          type: "textarea",
          required: true,
        },
        {
          name: "intDataImportExport",
          label: "Data import/export",
          type: "textarea",
          required: true,
        },
        {
          name: "intAuthPaymentCrmErp",
          label: "Auth / payment / CRM / ERP / accounting",
          type: "textarea",
          required: true,
        },
        {
          name: "intDependencyRisks",
          label: "Dependency risks",
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
          name: "mainExpectedOwner",
          label: "Expected maintenance owner",
          type: "textarea",
          required: true,
        },
        {
          name: "mainSupportLevel",
          label: "Support level",
          type: "textarea",
          required: true,
        },
        {
          name: "mainBugFixExpectations",
          label: "Bug fix expectations",
          type: "textarea",
          required: true,
        },
        {
          name: "mainUpdateFrequency",
          label: "Update frequency",
          type: "textarea",
          required: true,
        },
        {
          name: "mainDependencyUpdateBurden",
          label: "Dependency update burden",
          type: "textarea",
          required: true,
        },
        {
          name: "mainMonitoringNeeds",
          label: "Monitoring needs",
          type: "textarea",
          required: true,
        },
        {
          name: "mainDocumentationNeeds",
          label: "Documentation needs",
          type: "textarea",
          required: true,
        },
        {
          name: "mainLongTermHostingCost",
          label: "Long-term hosting / operational cost",
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
      description:
        "Summarize each area with rating and notes (template table in Appendix A).",
      fields: [
        {
          name: "feasibilityRatingSummaryNotes",
          label: "Rating summary (Technical, Resource, Schedule, …)",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "13",
      title: "Risk Summary",
      fields: [
        {
          name: "majorRisks",
          label: "Major Risks",
          type: "textarea",
          required: true,
        },
        {
          name: "riskMitigations",
          label: "Risk Mitigations",
          type: "textarea",
          required: true,
        },
        {
          name: "blockingRisks",
          label: "Blocking Risks",
          type: "textarea",
          required: true,
        },
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
        {
          name: "assumptions",
          label: "Assumptions",
          type: "textarea",
          required: true,
        },
        {
          name: "openQuestions",
          label: "Open Questions",
          type: "textarea",
          required: true,
        },
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
            {
              label: "Feasible with conditions",
              value: "Feasible with conditions",
            },
            { label: "Pivot recommended", value: "Pivot recommended" },
            { label: "Research required", value: "Research required" },
            { label: "Not feasible now", value: "Not feasible now" },
            { label: "Not feasible", value: "Not feasible" },
          ],
        },
        {
          name: "feasibilityDecisionDate",
          label: "Decision Date (YYYY-MM-DD)",
          type: "date",
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
          label: "Review Date (YYYY-MM-DD)",
          type: "date",
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
