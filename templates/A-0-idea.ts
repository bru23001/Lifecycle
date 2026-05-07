import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const requiredText = (fieldName: string, min = 3) =>
  z.string().trim().min(min, `${fieldName} is required.`);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

export const ideaCaptureSchema = z.object({
  ideaTitle: requiredText("Idea Title", 3),

  ideaSponsor: requiredText("Idea Sponsor", 2),
  dateSubmitted: dateString,

  shortIdeaSummary: requiredText("Short Idea Summary", 10),

  problemOrOpportunity: requiredText("Problem or Opportunity", 10),

  targetUsersOrBeneficiaries: requiredText(
    "Target Users or Beneficiaries",
    5,
  ),

  currentSituation: requiredText("Current Situation", 10),

  expectedBenefit: requiredText("Expected Benefit", 10),

  possibleSoftwareSolution: requiredText(
    "Possible Software Solution",
    10,
  ),

  urgencyOrTiming: z.enum([
    "Low",
    "Medium",
    "High",
    "Time-Critical",
    "Unknown",
  ]),

  urgencyOrTimingRationale: requiredText(
    "Urgency or Timing Rationale",
    5,
  ),

  knownConstraints: requiredText("Known Constraints", 3),

  knownRisksOrConcerns: requiredText("Known Risks or Concerns", 3),

  similarExistingSolutions: requiredText(
    "Similar Existing Solutions",
    3,
  ),

  initialComplexityEstimate: z.enum([
    "Low",
    "Medium",
    "High",
    "Enterprise",
    "Unknown",
  ]),

  initialComplexityRationale: requiredText(
    "Initial Complexity Rationale",
    5,
  ),

  recommendation: z.enum([
    "Accept for Problem Definition",
    "Research More",
    "Park",
    "Reject",
  ]),

  recommendationRationale: requiredText(
    "Recommendation Rationale",
    5,
  ),

  approvalStatus: z.enum([
    "Draft",
    "Submitted",
    "Approved",
    "Returned",
    "Deferred",
    "Rejected",
  ]),

  approvalNotes: requiredText("Approval Notes", 3),

  reviewerName: requiredText("Reviewer Name", 2),
  reviewerRole: requiredText("Reviewer Role", 2),
  reviewDate: dateString,
});

export type IdeaCaptureData = z.infer<typeof ideaCaptureSchema>;

export const ideaCaptureTemplate: LifecycleTemplate<
  typeof ideaCaptureSchema
> = {
  templateId: "A-0",
  title: "Idea Capture Form",
  phase: 1,
  gate: "G1",
  schema: ideaCaptureSchema,

  sections: [
    {
      id: "1",
      title: "Idea Title",
      description:
        "Provide a clear, short title that identifies the proposed idea.",
      fields: [
        {
          name: "ideaTitle",
          label: "Idea Title",
          type: "text",
          required: true,
          placeholder: "Example: Local Lifecycle Platform",
        },
      ],
    },
    {
      id: "2",
      title: "Idea Sponsor and Date Submitted",
      description:
        "Identify who owns the idea and when it entered the lifecycle.",
      fields: [
        {
          name: "ideaSponsor",
          label: "Idea Sponsor",
          type: "text",
          required: true,
          placeholder: "Example: Victor / Product Owner / Internal Sponsor",
        },
        {
          name: "dateSubmitted",
          label: "Date Submitted",
          type: "date",
          required: true,
        },
      ],
    },
    {
      id: "3",
      title: "Short Idea Summary",
      description:
        "Summarize the idea in plain language before detailed analysis begins.",
      fields: [
        {
          name: "shortIdeaSummary",
          label: "Short Idea Summary",
          type: "textarea",
          required: true,
          placeholder:
            "Describe the idea in 2–5 sentences. Keep it simple and concrete.",
        },
      ],
    },
    {
      id: "4",
      title: "Problem or Opportunity",
      description:
        "Explain the pain, gap, inefficiency, opportunity, or unmet need.",
      fields: [
        {
          name: "problemOrOpportunity",
          label: "Problem or Opportunity",
          type: "textarea",
          required: true,
          placeholder:
            "What problem does this solve, or what opportunity does it create?",
        },
      ],
    },
    {
      id: "5",
      title: "Target Users or Beneficiaries",
      description:
        "Identify who would use, benefit from, or be affected by the idea.",
      fields: [
        {
          name: "targetUsersOrBeneficiaries",
          label: "Target Users or Beneficiaries",
          type: "textarea",
          required: true,
          placeholder:
            "List users, customers, internal teams, stakeholders, or beneficiaries.",
        },
      ],
    },
    {
      id: "6",
      title: "Current Situation",
      description:
        "Describe how the work, problem, or opportunity is currently handled.",
      fields: [
        {
          name: "currentSituation",
          label: "Current Situation",
          type: "textarea",
          required: true,
          placeholder:
            "Describe the current workflow, tool, workaround, manual process, or gap.",
        },
      ],
    },
    {
      id: "7",
      title: "Expected Benefit",
      description:
        "State the expected value if this idea becomes a real project.",
      fields: [
        {
          name: "expectedBenefit",
          label: "Expected Benefit",
          type: "textarea",
          required: true,
          placeholder:
            "Examples: saves time, reduces errors, creates revenue, improves compliance, improves user experience.",
        },
      ],
    },
    {
      id: "8",
      title: "Possible Software Solution",
      description:
        "Describe the possible software response without over-designing it.",
      fields: [
        {
          name: "possibleSoftwareSolution",
          label: "Possible Software Solution",
          type: "textarea",
          required: true,
          placeholder:
            "Describe a possible app, module, automation, dashboard, workflow, or integration.",
        },
      ],
    },
    {
      id: "9",
      title: "Urgency or Timing",
      description:
        "Record how urgent the idea is and why the timing matters.",
      fields: [
        {
          name: "urgencyOrTiming",
          label: "Urgency or Timing",
          type: "select",
          required: true,
          options: [
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
            { label: "Time-Critical", value: "Time-Critical" },
            { label: "Unknown", value: "Unknown" },
          ],
        },
        {
          name: "urgencyOrTimingRationale",
          label: "Urgency or Timing Rationale",
          type: "textarea",
          required: true,
          placeholder:
            "Explain any deadline, market timing, customer pressure, compliance need, or reason urgency is unknown.",
        },
      ],
    },
    {
      id: "10",
      title: "Known Constraints",
      description:
        "List known limits that may affect analysis, approval, or implementation.",
      fields: [
        {
          name: "knownConstraints",
          label: "Known Constraints",
          type: "textarea",
          required: true,
          placeholder:
            "Examples: budget, time, skills, data availability, compliance, integrations, technical limitations.",
        },
      ],
    },
    {
      id: "11",
      title: "Known Risks or Concerns",
      description:
        "List known risks, uncertainties, objections, or concerns.",
      fields: [
        {
          name: "knownRisksOrConcerns",
          label: "Known Risks or Concerns",
          type: "textarea",
          required: true,
          placeholder:
            "Examples: unclear demand, technical risk, cost risk, adoption risk, legal risk, security risk.",
        },
      ],
    },
    {
      id: "12",
      title: "Similar Existing Solutions",
      description:
        "Record known alternatives, competitors, manual tools, or comparable systems.",
      fields: [
        {
          name: "similarExistingSolutions",
          label: "Similar Existing Solutions",
          type: "textarea",
          required: true,
          placeholder:
            "List existing products, internal tools, spreadsheets, manual processes, or competitor solutions.",
        },
      ],
    },
    {
      id: "13",
      title: "Initial Complexity Estimate",
      description:
        "Provide an early complexity estimate. This can be revised in later phases.",
      fields: [
        {
          name: "initialComplexityEstimate",
          label: "Initial Complexity Estimate",
          type: "select",
          required: true,
          options: [
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
            { label: "Enterprise", value: "Enterprise" },
            { label: "Unknown", value: "Unknown" },
          ],
        },
        {
          name: "initialComplexityRationale",
          label: "Initial Complexity Rationale",
          type: "textarea",
          required: true,
          placeholder:
            "Explain why this idea appears low, medium, high, enterprise, or unknown complexity.",
        },
      ],
    },
    {
      id: "14",
      title: "Recommendation",
      description:
        "Record the recommended next lifecycle action before gate review.",
      fields: [
        {
          name: "recommendation",
          label: "Recommendation",
          type: "select",
          required: true,
          options: [
            {
              label: "Accept for Problem Definition",
              value: "Accept for Problem Definition",
            },
            { label: "Research More", value: "Research More" },
            { label: "Park", value: "Park" },
            { label: "Reject", value: "Reject" },
          ],
        },
        {
          name: "recommendationRationale",
          label: "Recommendation Rationale",
          type: "textarea",
          required: true,
          placeholder:
            "Explain why this recommendation is appropriate at this stage.",
        },
      ],
    },
    {
      id: "15",
      title: "Approval Status",
      description:
        "Record the current approval state for the idea capture artifact.",
      fields: [
        {
          name: "approvalStatus",
          label: "Approval Status",
          type: "select",
          required: true,
          options: [
            { label: "Draft", value: "Draft" },
            { label: "Submitted", value: "Submitted" },
            { label: "Approved", value: "Approved" },
            { label: "Returned", value: "Returned" },
            { label: "Deferred", value: "Deferred" },
            { label: "Rejected", value: "Rejected" },
          ],
        },
        {
          name: "approvalNotes",
          label: "Approval Notes",
          type: "textarea",
          required: true,
          placeholder:
            "Record approval rationale, return reason, deferral reason, or rejection rationale.",
        },
      ],
    },
    {
      id: "16",
      title: "Review Record",
      description:
        "Records the named reviewer and review date required for Phase 1 completion.",
      fields: [
        {
          name: "reviewerName",
          label: "Reviewer Name",
          type: "text",
          required: true,
        },
        {
          name: "reviewerRole",
          label: "Reviewer Role",
          type: "text",
          required: true,
        },
        {
          name: "reviewDate",
          label: "Review Date",
          type: "date",
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