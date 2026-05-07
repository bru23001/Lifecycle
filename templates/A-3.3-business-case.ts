import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const businessRecommendation = z.enum([
  "Proceed to Requirements",
  "Proceed to Requirements with Conditions",
  "Pivot",
  "Defer",
  "Stop",
]);

export const businessCaseSchema = z.object({
  executiveSummary: z.string().min(10, "Executive summary is required."),
  strategicAlignment: z.string().min(10, "Strategic alignment is required."),
  expectedBenefits: z.string().min(10, "Expected benefits are required."),
  expectedCostsInvestment: z.string().min(10, "Expected costs / investment are required."),
  roiPaybackScenarioSummary: z.string().min(5, "ROI / payback / scenario summary is required."),
  forecastReferenceA5: z.string().min(1, "Forecast reference — Template A-5 if used (or N/A) is required."),
  majorRisks: z.string().min(3, "Major risks are required."),
  riskMitigations: z.string().min(3, "Risk mitigations are required."),
  constraints: z.string().min(3, "Constraints are required."),
  dependencies: z.string().min(3, "Dependencies are required."),
  prcsExistingProductId: z.string().min(1, "Existing Product ID (or N/A) is required."),
  prcsCandidateApprovedProductId: z.string().min(1, "Candidate / Approved Product ID (or N/A) is required."),
  prcsPclCode: z.string().min(1, "Candidate PCL Code (or N/A) is required."),
  prcsCriticalityTier: z.string().min(1, "PCL criticality tier (or N/A) is required."),
  prcsDomainTags: z.string().min(1, "Domain tags are required."),
  prcsFunctionDescriptors: z.string().min(1, "Function descriptors (or N/A) are required."),
  prcsWorkTypeTags: z.string().min(1, "Work Type Tag(s) (or N/A) are required."),
  prcsNonApplicabilityRationale: z.string().min(1, "PRCS non-applicability rationale (or N/A) is required."),
  prcsDownstreamStandardsTieringImpact: z
    .string()
    .min(1, "Downstream standards tiering impact (or N/A) is required."),
  businessRecommendation: businessRecommendation,
  businessRecommendationRationale: z.string().min(10, "Recommendation rationale is required."),
  conditionsIfAny: z.string().min(1, "Conditions (or None) are required."),
  conditionOwners: z.string().min(1, "Condition owner(s) (or N/A) are required."),
  conditionDueDates: z.string().min(1, "Due date(s) (or N/A) are required."),
  approvedBy: z.string().min(2, "Approved by is required."),
  approverRoleAuthority: z.string().min(2, "Role / authority is required."),
  approvalDate: z.string().min(2, "Approval date is required."),
  approvalDecisionNotes: z.string().min(3, "Decision notes are required."),
});

export type BusinessCaseData = z.infer<typeof businessCaseSchema>;

export const businessCaseTemplate: LifecycleTemplate<typeof businessCaseSchema> = {
  templateId: "A-3.3",
  title: "Business Case",
  phase: 4,
  gate: "G3",
  schema: businessCaseSchema,

  sections: [
    {
      id: "1",
      title: "Executive Summary",
      fields: [
        {
          name: "executiveSummary",
          label: "Executive Summary",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Strategic Alignment",
      fields: [
        {
          name: "strategicAlignment",
          label: "Strategic Alignment",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "3",
      title: "Expected Benefits",
      fields: [
        {
          name: "expectedBenefits",
          label: "Expected Benefits",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "4",
      title: "Expected Costs / Investment",
      fields: [
        {
          name: "expectedCostsInvestment",
          label: "Expected Costs / Investment",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "5",
      title: "ROI, Payback, or Scenario Summary",
      fields: [
        {
          name: "roiPaybackScenarioSummary",
          label: "ROI / Payback / Scenario Summary",
          type: "textarea",
          required: true,
        },
        {
          name: "forecastReferenceA5",
          label: "Forecast Reference (Template A-5, if used)",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "6",
      title: "Major Risks and Mitigations",
      fields: [
        { name: "majorRisks", label: "Major Risks", type: "textarea", required: true },
        { name: "riskMitigations", label: "Risk Mitigations", type: "textarea", required: true },
      ],
    },
    {
      id: "7",
      title: "Constraints and Dependencies",
      fields: [
        { name: "constraints", label: "Constraints", type: "textarea", required: true },
        { name: "dependencies", label: "Dependencies", type: "textarea", required: true },
      ],
    },
    {
      id: "8",
      title: "PRCS Product Classification Summary",
      fields: [
        {
          name: "prcsExistingProductId",
          label: "Existing Product ID (PRD-XXX), if any",
          type: "text",
          required: true,
        },
        {
          name: "prcsCandidateApprovedProductId",
          label: "Candidate / Approved Product ID",
          type: "text",
          required: true,
        },
        {
          name: "prcsPclCode",
          label: "Candidate PCL Code (PCL-L.D.E.C)",
          type: "text",
          required: true,
        },
        {
          name: "prcsCriticalityTier",
          label: "PCL Criticality Tier",
          type: "text",
          required: true,
        },
        {
          name: "prcsDomainTags",
          label: "Domain Tags",
          type: "textarea",
          required: true,
        },
        {
          name: "prcsFunctionDescriptors",
          label: "Function Descriptors",
          type: "textarea",
          required: true,
        },
        {
          name: "prcsWorkTypeTags",
          label: "Work Type Tag(s), if pre-product or cross-cutting",
          type: "textarea",
          required: true,
        },
        {
          name: "prcsNonApplicabilityRationale",
          label: "PRCS Non-Applicability Rationale, if any",
          type: "textarea",
          required: true,
        },
        {
          name: "prcsDownstreamStandardsTieringImpact",
          label: "Downstream Standards Tiering Impact",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "9",
      title: "Recommendation",
      fields: [
        {
          name: "businessRecommendation",
          label: "Recommendation",
          type: "select",
          required: true,
          options: [
            {
              label: "Proceed to Requirements",
              value: "Proceed to Requirements",
            },
            {
              label: "Proceed to Requirements with Conditions",
              value: "Proceed to Requirements with Conditions",
            },
            { label: "Pivot", value: "Pivot" },
            { label: "Defer", value: "Defer" },
            { label: "Stop", value: "Stop" },
          ],
        },
        {
          name: "businessRecommendationRationale",
          label: "Recommendation Rationale",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "10",
      title: "Conditions",
      fields: [
        {
          name: "conditionsIfAny",
          label: "Conditions (if any)",
          type: "textarea",
          required: true,
        },
        {
          name: "conditionOwners",
          label: "Condition Owner(s)",
          type: "textarea",
          required: true,
        },
        {
          name: "conditionDueDates",
          label: "Due Date(s)",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "11",
      title: "Approval Record",
      fields: [
        { name: "approvedBy", label: "Approved By", type: "text", required: true },
        {
          name: "approverRoleAuthority",
          label: "Role / Authority",
          type: "text",
          required: true,
        },
        { name: "approvalDate", label: "Date", type: "text", required: true },
        {
          name: "approvalDecisionNotes",
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
