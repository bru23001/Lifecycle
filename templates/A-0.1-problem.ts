import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const requiredText = (fieldName: string, min = 3) =>
  z.string().trim().min(min, `${fieldName} is required.`);

const optionalText = z.string().trim().optional().or(z.literal(""));

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

export const problemDefinitionSchema = z.object({
  problemTitle: requiredText("Problem Title", 3),

  relatedIdeaId: requiredText("Related Idea ID", 2),
  sourceIdeaTitle: requiredText("Source Idea Title", 3),

  preparedBy: requiredText("Prepared By", 2),
  preparedDate: dateString,

  problemStatement: requiredText("Problem Statement", 10),

  affectedUsers: requiredText("Affected Users", 5),

  userPainPoints: requiredText("User Pain Points", 10),

  frequencyOfProblem: requiredText("Frequency of Problem", 3),

  severityLevel: z.enum(["Low", "Medium", "High", "Critical"]),

  severityRationale: requiredText("Severity Rationale", 5),

  currentSolutionOrWorkaround: requiredText(
    "Current Solution or Workaround",
    5,
  ),

  whyCurrentSolutionIsInsufficient: requiredText(
    "Why Current Solution Is Insufficient",
    10,
  ),

  businessImpact: requiredText("Business Impact", 10),

  operationalImpact: requiredText("Operational Impact", 10),

  complianceOrRiskImpact: requiredText("Compliance or Risk Impact", 5),

  expectedImprovement: requiredText("Expected Improvement", 10),

  validationSourceType: z.enum([
    "User Interview",
    "Customer Request",
    "Market Research",
    "Operational Data",
    "Support Ticket",
    "Stakeholder Review",
    "External Benchmark",
    "Other",
  ]),

  independentValidationSource: requiredText(
    "Independent Validation Source",
    5,
  ),

  validationSummary: requiredText("Validation Summary", 10),

  supportingEvidence: requiredText("Supporting Evidence", 5),

  assumptions: requiredText("Assumptions", 5),

  exclusionsOrNonGoals: requiredText("Exclusions or Non-Goals", 5),

  recommendedNextAction: z.enum([
    "Proceed to Evaluation and Selection",
    "Research More",
    "Return to Idea Capture",
    "Defer",
    "Reject",
  ]),

  recommendationRationale: requiredText("Recommendation Rationale", 5),

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

  additionalNotes: optionalText,
});

export type ProblemDefinitionData = z.infer<typeof problemDefinitionSchema>;

export const problemDefinitionTemplate: LifecycleTemplate<
  typeof problemDefinitionSchema
> = {
  templateId: "A-0.1",
  title: "Problem Definition Document",
  phase: 2,
  gate: "G2",
  schema: problemDefinitionSchema,

  sections: [
    {
      id: "1",
      title: "Problem Identification",
      description:
        "Identify the problem being evaluated after the idea has passed G1.",
      fields: [
        {
          name: "problemTitle",
          label: "Problem Title",
          type: "text",
          required: true,
          placeholder: "Example: Manual lifecycle governance causes document drift",
        },
      ],
    },
    {
      id: "2",
      title: "Source Idea Reference",
      description:
        "Connect this problem definition back to the approved A-0 Idea Capture Form.",
      fields: [
        {
          name: "relatedIdeaId",
          label: "Related Idea ID",
          type: "text",
          required: true,
          placeholder: "Example: IDEA-0001 or A-0 artifact local ID",
        },
        {
          name: "sourceIdeaTitle",
          label: "Source Idea Title",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "3",
      title: "Prepared By",
      description:
        "Record who prepared this problem definition and when it was prepared.",
      fields: [
        {
          name: "preparedBy",
          label: "Prepared By",
          type: "text",
          required: true,
        },
        {
          name: "preparedDate",
          label: "Prepared Date",
          type: "date",
          required: true,
        },
      ],
    },
    {
      id: "4",
      title: "Problem Statement",
      description:
        "State the problem clearly, without describing the solution yet.",
      fields: [
        {
          name: "problemStatement",
          label: "Problem Statement",
          type: "textarea",
          required: true,
          placeholder:
            "Describe the real problem, who experiences it, and why it matters.",
        },
      ],
    },
    {
      id: "5",
      title: "Affected Users",
      description:
        "Identify users, customers, teams, or stakeholders affected by the problem.",
      fields: [
        {
          name: "affectedUsers",
          label: "Affected Users",
          type: "textarea",
          required: true,
          placeholder:
            "List the groups affected by this problem and how they are affected.",
        },
      ],
    },
    {
      id: "6",
      title: "User Pain Points",
      description:
        "Describe the pain, friction, delay, confusion, cost, or risk users experience.",
      fields: [
        {
          name: "userPainPoints",
          label: "User Pain Points",
          type: "textarea",
          required: true,
          placeholder:
            "Describe the symptoms users feel in their daily workflow.",
        },
      ],
    },
    {
      id: "7",
      title: "Frequency and Severity",
      description:
        "Capture how often the problem occurs and how serious its impact is.",
      fields: [
        {
          name: "frequencyOfProblem",
          label: "Frequency of Problem",
          type: "text",
          required: true,
          placeholder: "Example: Daily, weekly, every project, every release",
        },
        {
          name: "severityLevel",
          label: "Severity Level",
          type: "select",
          required: true,
          options: [
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
            { label: "Critical", value: "Critical" },
          ],
        },
        {
          name: "severityRationale",
          label: "Severity Rationale",
          type: "textarea",
          required: true,
          placeholder:
            "Explain why this severity level is appropriate.",
        },
      ],
    },
    {
      id: "8",
      title: "Current Solution or Workaround",
      description:
        "Document how the problem is currently handled before proposing a new solution.",
      fields: [
        {
          name: "currentSolutionOrWorkaround",
          label: "Current Solution or Workaround",
          type: "textarea",
          required: true,
          placeholder:
            "Describe current tools, spreadsheets, manual steps, meetings, or informal processes.",
        },
      ],
    },
    {
      id: "9",
      title: "Why Current Solution Is Insufficient",
      description:
        "Explain why the existing process, tool, or workaround does not solve the problem well enough.",
      fields: [
        {
          name: "whyCurrentSolutionIsInsufficient",
          label: "Why Current Solution Is Insufficient",
          type: "textarea",
          required: true,
          placeholder:
            "Describe gaps, repeated failures, inefficiencies, cost, delays, missing evidence, or risk exposure.",
        },
      ],
    },
    {
      id: "10",
      title: "Business Impact",
      description:
        "Explain the effect of the problem on business value, cost, customers, revenue, or decision-making.",
      fields: [
        {
          name: "businessImpact",
          label: "Business Impact",
          type: "textarea",
          required: true,
          placeholder:
            "Describe financial, strategic, customer, delivery, or portfolio impact.",
        },
      ],
    },
    {
      id: "11",
      title: "Operational Impact",
      description:
        "Explain the effect of the problem on day-to-day work and delivery operations.",
      fields: [
        {
          name: "operationalImpact",
          label: "Operational Impact",
          type: "textarea",
          required: true,
          placeholder:
            "Describe wasted time, duplicated effort, bottlenecks, manual rework, or coordination issues.",
        },
      ],
    },
    {
      id: "12",
      title: "Compliance or Risk Impact",
      description:
        "Capture governance, security, audit, quality, traceability, or compliance concerns.",
      fields: [
        {
          name: "complianceOrRiskImpact",
          label: "Compliance or Risk Impact",
          type: "textarea",
          required: true,
          placeholder:
            "Describe any audit, evidence, lifecycle, traceability, privacy, security, or regulatory risk.",
        },
      ],
    },
    {
      id: "13",
      title: "Expected Improvement",
      description:
        "Define the improvement expected if the problem is solved.",
      fields: [
        {
          name: "expectedImprovement",
          label: "Expected Improvement",
          type: "textarea",
          required: true,
          placeholder:
            "Describe the desired future state, measurable improvement, or success signal.",
        },
      ],
    },
    {
      id: "14",
      title: "Independent Validation Source",
      description:
        "Record at least one independent validation source. This is required for G2.",
      fields: [
        {
          name: "validationSourceType",
          label: "Validation Source Type",
          type: "select",
          required: true,
          options: [
            { label: "User Interview", value: "User Interview" },
            { label: "Customer Request", value: "Customer Request" },
            { label: "Market Research", value: "Market Research" },
            { label: "Operational Data", value: "Operational Data" },
            { label: "Support Ticket", value: "Support Ticket" },
            { label: "Stakeholder Review", value: "Stakeholder Review" },
            { label: "External Benchmark", value: "External Benchmark" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          name: "independentValidationSource",
          label: "Independent Validation Source",
          type: "textarea",
          required: true,
          placeholder:
            "Name the source: person, report, ticket, dataset, customer, benchmark, research item, or interview.",
        },
        {
          name: "validationSummary",
          label: "Validation Summary",
          type: "textarea",
          required: true,
          placeholder:
            "Summarize what the independent source confirmed.",
        },
      ],
    },
    {
      id: "15",
      title: "Supporting Evidence",
      description:
        "List any evidence that supports the problem definition.",
      fields: [
        {
          name: "supportingEvidence",
          label: "Supporting Evidence",
          type: "textarea",
          required: true,
          placeholder:
            "Examples: screenshots, notes, logs, customer quotes, metrics, reports, tickets, observations.",
        },
      ],
    },
    {
      id: "16",
      title: "Assumptions",
      description:
        "Record assumptions that still need confirmation in later phases.",
      fields: [
        {
          name: "assumptions",
          label: "Assumptions",
          type: "textarea",
          required: true,
          placeholder:
            "List assumptions about users, business value, technical feasibility, timing, or data availability.",
        },
      ],
    },
    {
      id: "17",
      title: "Exclusions or Non-Goals",
      description:
        "Clarify what this problem definition does not include.",
      fields: [
        {
          name: "exclusionsOrNonGoals",
          label: "Exclusions or Non-Goals",
          type: "textarea",
          required: true,
          placeholder:
            "List related problems, solutions, features, or scope items that are intentionally excluded for now.",
        },
      ],
    },
    {
      id: "18",
      title: "Recommended Next Action",
      description:
        "Record the recommended lifecycle action before G2 decision.",
      fields: [
        {
          name: "recommendedNextAction",
          label: "Recommended Next Action",
          type: "select",
          required: true,
          options: [
            {
              label: "Proceed to Evaluation and Selection",
              value: "Proceed to Evaluation and Selection",
            },
            { label: "Research More", value: "Research More" },
            {
              label: "Return to Idea Capture",
              value: "Return to Idea Capture",
            },
            { label: "Defer", value: "Defer" },
            { label: "Reject", value: "Reject" },
          ],
        },
        {
          name: "recommendationRationale",
          label: "Recommendation Rationale",
          type: "textarea",
          required: true,
          placeholder:
            "Explain why this next action is appropriate.",
        },
      ],
    },
    {
      id: "19",
      title: "Approval Status",
      description:
        "Record the current approval state for this problem definition artifact.",
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
      id: "20",
      title: "Review Record",
      description:
        "Record reviewer evidence for lifecycle governance and gate review.",
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
    {
      id: "21",
      title: "Additional Notes",
      description:
        "Optional notes that help reviewers understand context, uncertainty, or open questions.",
      fields: [
        {
          name: "additionalNotes",
          label: "Additional Notes",
          type: "textarea",
          required: false,
          placeholder:
            "Optional: add context, open questions, links, or observations.",
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