import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const requiredText = (fieldName: string, min = 3) =>
  z.string().trim().min(min, `${fieldName} is required.`);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

const scoreOneToFive = z.coerce.number().int().min(1).max(5);

const docStatus = z.enum(["Draft", "Submitted", "Approved", "Returned"]);
const candidateProduct = z.enum(["Yes", "No", "Unknown"]);
const recommendationEnum = z.enum([
  "Proceed to Feasibility",
  "Pivot",
  "Defer",
  "Stop",
]);

export const projectSelectionScorecardSchema = z.object({
  scorecardName: requiredText("Scorecard Name", 2),
  candidateInitiative: requiredText("Candidate / Initiative", 2),
  owner: requiredText("Owner", 2),
  preparedBy: requiredText("Prepared By", 2),
  reviewDate: dateString,
  decisionBodyReviewer: requiredText("Decision Body / Reviewer", 2),
  relatedProblemDefinition: requiredText("Related Problem Definition", 2),
  relatedBusinessFieldReport: requiredText(
    "Related Business Field Report or waiver note",
    2,
  ),
  existingProductId: requiredText("Existing Product ID (or N/A)", 1),
  candidateNewProduct: candidateProduct,
  candidatePclCode: requiredText("Candidate PCL code (or N/A)", 1),
  likelyDomainTags: requiredText("Likely domain tags", 2),
  workTypeTags: requiredText("Work Type Tag(s) (or N/A)", 1),

  strategicAlignmentWeight: requiredText("Strategic alignment — Weight", 1),
  strategicAlignmentScore: scoreOneToFive,
  strategicAlignmentWeightedScore: requiredText(
    "Strategic alignment — Weighted score",
    1,
  ),
  strategicAlignmentEvidence: requiredText(
    "Strategic alignment — Evidence / rationale",
    3,
  ),

  customerUserValueWeight: requiredText("Customer / user value — Weight", 1),
  customerUserValueScore: scoreOneToFive,
  customerUserValueWeightedScore: requiredText(
    "Customer / user value — Weighted score",
    1,
  ),
  customerUserValueEvidence: requiredText(
    "Customer / user value — Evidence / rationale",
    3,
  ),

  businessValueWeight: requiredText("Business value — Weight", 1),
  businessValueScore: scoreOneToFive,
  businessValueWeightedScore: requiredText("Business value — Weighted score", 1),
  businessValueEvidence: requiredText("Business value — Evidence / rationale", 3),

  marketOpportunityStrengthWeight: requiredText(
    "Market / opportunity strength — Weight",
    1,
  ),
  marketOpportunityStrengthScore: scoreOneToFive,
  marketOpportunityStrengthWeightedScore: requiredText(
    "Market / opportunity strength — Weighted score",
    1,
  ),
  marketOpportunityStrengthEvidence: requiredText(
    "Market / opportunity strength — Evidence / rationale",
    3,
  ),

  feasibilitySignalWeight: requiredText("Feasibility signal — Weight", 1),
  feasibilitySignalScore: scoreOneToFive,
  feasibilitySignalWeightedScore: requiredText(
    "Feasibility signal — Weighted score",
    1,
  ),
  feasibilitySignalEvidence: requiredText(
    "Feasibility signal — Evidence / rationale",
    3,
  ),

  riskUncertaintyWeight: requiredText("Risk / uncertainty — Weight", 1),
  riskUncertaintyScore: scoreOneToFive,
  riskUncertaintyWeightedScore: requiredText(
    "Risk / uncertainty — Weighted score",
    1,
  ),
  riskUncertaintyEvidence: requiredText(
    "Risk / uncertainty — Evidence / rationale",
    3,
  ),

  costCapacityFitWeight: requiredText("Cost / capacity fit — Weight", 1),
  costCapacityFitScore: scoreOneToFive,
  costCapacityFitWeightedScore: requiredText(
    "Cost / capacity fit — Weighted score",
    1,
  ),
  costCapacityFitEvidence: requiredText(
    "Cost / capacity fit — Evidence / rationale",
    3,
  ),

  complianceSecurityExposureWeight: requiredText(
    "Compliance / security exposure — Weight",
    1,
  ),
  complianceSecurityExposureScore: scoreOneToFive,
  complianceSecurityExposureWeightedScore: requiredText(
    "Compliance / security exposure — Weighted score",
    1,
  ),
  complianceSecurityExposureEvidence: requiredText(
    "Compliance / security exposure — Evidence / rationale",
    3,
  ),

  candidateComparisonTable: requiredText(
    "Candidate comparison (or N/A if single candidate)",
    5,
  ),

  selectionRecommendation: recommendationEnum,
  selectionRecommendationRationale: requiredText("Recommendation rationale", 10),
  dependenciesAssumptions: requiredText("Dependencies / assumptions", 3),
  knownEvidenceGaps: requiredText("Known evidence gaps (or None)", 1),
  waiversIfAny: requiredText("Waiver(s) (or None)", 1),

  selectionDecision: requiredText(
    "Selection Decision (formal record; may align with Recommendation above)",
    3,
  ),
  selectionReviewerAuthority: requiredText("Reviewer / Authority", 2),
  selectionDecisionDate: dateString,
  selectionDecisionNotes: requiredText("Decision Notes", 3),
  selectionNextAction: requiredText("Next Action", 3),

  documentStatus: docStatus,
});

export type ProjectSelectionScorecardData = z.infer<
  typeof projectSelectionScorecardSchema
>;

export const projectSelectionScorecardTemplate: LifecycleTemplate<
  typeof projectSelectionScorecardSchema
> = {
  templateId: "A-3.1",
  title: "Project Selection Scorecard",
  phase: 3,
  gate: "G3",
  schema: projectSelectionScorecardSchema,

  sections: [
    {
      id: "1",
      title: "Metadata",
      fields: [
        { name: "scorecardName", label: "Scorecard Name", type: "text", required: true },
        {
          name: "candidateInitiative",
          label: "Candidate / Initiative",
          type: "text",
          required: true,
        },
        { name: "owner", label: "Owner", type: "text", required: true },
        { name: "preparedBy", label: "Prepared By", type: "text", required: true },
        {
          name: "reviewDate",
          label: "Review Date (YYYY-MM-DD)",
          type: "date",
          required: true,
        },
        {
          name: "decisionBodyReviewer",
          label: "Decision Body / Reviewer",
          type: "text",
          required: true,
        },
        {
          name: "relatedProblemDefinition",
          label: "Related Problem Definition",
          type: "textarea",
          required: true,
        },
        {
          name: "relatedBusinessFieldReport",
          label: "Related Business Field Report (or waiver reference)",
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
          label: "Candidate PCL Code (PCL-L.D.E.C), if known",
          type: "text",
          required: true,
        },
        {
          name: "likelyDomainTags",
          label: "Likely Domain Tags",
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
      title: "Selection Criteria (weighted scoring)",
      description:
        "Define weights before scoring. Use a 1–5 score per criterion unless your program defines another method.",
      fields: [
        {
          name: "strategicAlignmentWeight",
          label: "Strategic alignment — Weight",
          type: "text",
          required: true,
        },
        {
          name: "strategicAlignmentScore",
          label: "Strategic alignment — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "strategicAlignmentWeightedScore",
          label: "Strategic alignment — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "strategicAlignmentEvidence",
          label: "Strategic alignment — Evidence / rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "customerUserValueWeight",
          label: "Customer / user value — Weight",
          type: "text",
          required: true,
        },
        {
          name: "customerUserValueScore",
          label: "Customer / user value — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "customerUserValueWeightedScore",
          label: "Customer / user value — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "customerUserValueEvidence",
          label: "Customer / user value — Evidence / rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "businessValueWeight",
          label: "Business value — Weight",
          type: "text",
          required: true,
        },
        {
          name: "businessValueScore",
          label: "Business value — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "businessValueWeightedScore",
          label: "Business value — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "businessValueEvidence",
          label: "Business value — Evidence / rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "marketOpportunityStrengthWeight",
          label: "Market / opportunity strength — Weight",
          type: "text",
          required: true,
        },
        {
          name: "marketOpportunityStrengthScore",
          label: "Market / opportunity strength — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "marketOpportunityStrengthWeightedScore",
          label: "Market / opportunity strength — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "marketOpportunityStrengthEvidence",
          label: "Market / opportunity strength — Evidence / rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "feasibilitySignalWeight",
          label: "Feasibility signal — Weight",
          type: "text",
          required: true,
        },
        {
          name: "feasibilitySignalScore",
          label: "Feasibility signal — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "feasibilitySignalWeightedScore",
          label: "Feasibility signal — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "feasibilitySignalEvidence",
          label: "Feasibility signal — Evidence / rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "riskUncertaintyWeight",
          label: "Risk / uncertainty — Weight",
          type: "text",
          required: true,
        },
        {
          name: "riskUncertaintyScore",
          label: "Risk / uncertainty — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "riskUncertaintyWeightedScore",
          label: "Risk / uncertainty — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "riskUncertaintyEvidence",
          label: "Risk / uncertainty — Evidence / rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "costCapacityFitWeight",
          label: "Cost / capacity fit — Weight",
          type: "text",
          required: true,
        },
        {
          name: "costCapacityFitScore",
          label: "Cost / capacity fit — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "costCapacityFitWeightedScore",
          label: "Cost / capacity fit — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "costCapacityFitEvidence",
          label: "Cost / capacity fit — Evidence / rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "complianceSecurityExposureWeight",
          label: "Compliance / security exposure — Weight",
          type: "text",
          required: true,
        },
        {
          name: "complianceSecurityExposureScore",
          label: "Compliance / security exposure — Score (1–5)",
          type: "number",
          required: true,
        },
        {
          name: "complianceSecurityExposureWeightedScore",
          label: "Compliance / security exposure — Weighted score",
          type: "text",
          required: true,
        },
        {
          name: "complianceSecurityExposureEvidence",
          label: "Compliance / security exposure — Evidence / rationale",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "3",
      title: "Candidate Comparison",
      description:
        "Use when multiple initiatives or solution directions are compared.",
      fields: [
        {
          name: "candidateComparisonTable",
          label:
            "Candidates — Total score, rank, recommendation, key reason (table or narrative)",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "4",
      title: "Recommendation",
      fields: [
        {
          name: "selectionRecommendation",
          label: "Recommendation",
          type: "select",
          required: true,
          options: [
            { label: "Proceed to Feasibility", value: "Proceed to Feasibility" },
            { label: "Pivot", value: "Pivot" },
            { label: "Defer", value: "Defer" },
            { label: "Stop", value: "Stop" },
          ],
        },
        {
          name: "selectionRecommendationRationale",
          label: "Recommendation Rationale",
          type: "textarea",
          required: true,
        },
        {
          name: "dependenciesAssumptions",
          label: "Dependencies / Assumptions",
          type: "textarea",
          required: true,
        },
        {
          name: "knownEvidenceGaps",
          label: "Known Evidence Gaps",
          type: "textarea",
          required: true,
        },
        {
          name: "waiversIfAny",
          label: "Waiver(s), if any",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "5",
      title: "Approval Record",
      fields: [
        {
          name: "selectionDecision",
          label: "Selection Decision",
          type: "textarea",
          required: true,
          description:
            "Formal recorded decision (may mirror Recommendation after governance review).",
        },
        {
          name: "selectionReviewerAuthority",
          label: "Reviewer / Authority",
          type: "text",
          required: true,
        },
        {
          name: "selectionDecisionDate",
          label: "Decision Date (YYYY-MM-DD)",
          type: "date",
          required: true,
        },
        {
          name: "selectionDecisionNotes",
          label: "Decision Notes",
          type: "textarea",
          required: true,
        },
        {
          name: "selectionNextAction",
          label: "Next Action",
          type: "textarea",
          required: true,
        },
        {
          name: "documentStatus",
          label: "Document Status",
          type: "select",
          required: true,
          options: [
            { label: "Draft", value: "Draft" },
            { label: "Submitted", value: "Submitted" },
            { label: "Approved", value: "Approved" },
            { label: "Returned", value: "Returned" },
          ],
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
