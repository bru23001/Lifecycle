import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const requiredText = (fieldName: string, min = 3) =>
  z.string().trim().min(min, `${fieldName} is required.`);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

const businessRecommendationEnum = z.enum([
  "Proceed to Requirements",
  "Proceed to Requirements with Conditions",
  "Pivot",
  "Defer",
  "Stop",
]);

export const businessCaseSchema = z.object({
  executiveSummary: requiredText("Executive Summary", 10),
  strategicAlignment: requiredText("Strategic Alignment", 10),
  expectedBenefits: requiredText("Expected Benefits", 10),
  expectedCostsInvestment: requiredText("Expected Costs / Investment", 10),
  roiPaybackScenarioSummary: requiredText(
    "ROI / Payback / Scenario Summary",
    5,
  ),
  forecastReferenceA5: requiredText(
    "Forecast Reference — Template A-5 if used (or N/A)",
    1,
  ),
  majorRisks: requiredText("Major Risks", 3),
  riskMitigations: requiredText("Risk Mitigations", 3),
  constraints: requiredText("Constraints", 3),
  dependencies: requiredText("Dependencies", 3),
  prcsExistingProductId: requiredText("Existing Product ID (or N/A)", 1),
  prcsCandidateApprovedProductId: requiredText(
    "Candidate / Approved Product ID (or N/A)",
    1,
  ),
  prcsPclCode: requiredText("Candidate PCL Code (or N/A)", 1),
  prcsCriticalityTier: requiredText("PCL Criticality Tier (or N/A)", 1),
  prcsDomainTags: requiredText("Domain Tags", 2),
  prcsFunctionDescriptors: requiredText("Function Descriptors (or N/A)", 1),
  prcsWorkTypeTags: requiredText("Work Type Tag(s) (or N/A)", 1),
  prcsNonApplicabilityRationale: requiredText(
    "PRCS Non-Applicability Rationale (or N/A)",
    1,
  ),
  prcsDownstreamStandardsTieringImpact: requiredText(
    "Downstream Standards Tiering Impact (or N/A)",
    1,
  ),
  businessRecommendation: businessRecommendationEnum,
  businessRecommendationRationale: requiredText(
    "Recommendation Rationale",
    10,
  ),
  conditionsIfAny: requiredText("Conditions (or None)", 1),
  conditionOwners: requiredText("Condition Owner(s) (or N/A)", 1),
  conditionDueDates: requiredText("Due Date(s) (or N/A)", 1),
  approvedBy: requiredText("Approved By", 2),
  approverRoleAuthority: requiredText("Role / Authority", 2),
  approvalDate: dateString,
  approvalDecisionNotes: requiredText("Decision Notes", 3),
});

export type BusinessCaseData = z.infer<typeof businessCaseSchema>;

export const businessCaseTemplate: LifecycleTemplate<
  typeof businessCaseSchema
> = {
  templateId: "A-3.3",
  title: "Business Case",
  phase: 4,
  gate: "G3",
  schema: businessCaseSchema,

  sections: [
    {
      id: "1",
      title: "Executive Summary",
      description:
        "State the funding recommendation in one paragraph (per Appendix A).",
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
      description:
        "How the initiative supports portfolio, product, customer, compliance, or operational priorities.",
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
      description:
        "Quantify where possible: revenue, savings, risk reduction, productivity, customer experience, compliance posture.",
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
      description:
        "Delivery effort, infrastructure, vendors, licenses, operational support, maintenance, and change-management costs where known.",
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
      description:
        "Use Template A-5 when economic viability depends on modeled revenue, expense, cash, or market assumptions.",
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
      description:
        "Align with the Feasibility Assessment; name owners when mitigation is required before proceeding.",
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
      ],
    },
    {
      id: "7",
      title: "Constraints and Dependencies",
      description:
        "Funding, capacity, vendor, security/privacy/compliance, integration, timeline, or operational constraints.",
      fields: [
        {
          name: "constraints",
          label: "Constraints",
          type: "textarea",
          required: true,
        },
        {
          name: "dependencies",
          label: "Dependencies",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "8",
      title: "PRCS Product Classification Summary",
      description:
        "Preserves the G3 PRCS candidate decision; final production registration is confirmed at G8.",
      fields: [
        {
          name: "prcsExistingProductId",
          label: "Existing Product ID (PRD-XXX), if any",
          type: "text",
          required: true,
          placeholder: "PRD-XXX or N/A",
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
      description:
        "Required when recommending conditional proceed; owners and due dates must be explicit.",
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
          description: "Free text or ISO dates per condition.",
        },
      ],
    },
    {
      id: "11",
      title: "Approval Record",
      fields: [
        {
          name: "approvedBy",
          label: "Approved By",
          type: "text",
          required: true,
        },
        {
          name: "approverRoleAuthority",
          label: "Role / Authority",
          type: "text",
          required: true,
        },
        {
          name: "approvalDate",
          label: "Date (YYYY-MM-DD)",
          type: "date",
          required: true,
        },
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
