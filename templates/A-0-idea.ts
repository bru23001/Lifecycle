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
          placeholder:
            "Type a short, specific name for the idea (3+ characters) — e.g. Heavy equipment rental billing portal",
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
          placeholder:
            "Who owns this idea? Name and role — e.g. Jamie Nguyen, Product Owner (North region)",
        },
        {
          name: "dateSubmitted",
          label: "Date Submitted",
          type: "date",
          required: true,
          description:
            "Pick the date you submitted this form. Use the picker or type YYYY-MM-DD (example: 2026-05-15).",
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
            "Write 2–5 sentences: what you want to build or change, who it is for, and the outcome you expect.",
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
            "State the pain or opportunity in plain language: what is wrong today, who feels it, and what happens if nothing changes?",
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
            "List everyone who uses, pays for, supports, or is affected by the change — e.g. dispatchers, fleet managers, AR clerks, customers.",
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
            "Describe how work is done today: tools (ERP, spreadsheets, email), steps, handoffs, and where time or errors pile up.",
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
            "List concrete benefits you expect — e.g. cut invoice cycle from 10 days to 2, fewer billing disputes, faster month-end close.",
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
            "High-level only: what software could do (portal, mobile app, batch job, integration). Avoid detailed design — just the direction.",
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
          description:
            "Choose the urgency level, then explain your choice in the box below. Use Time-Critical only for hard deadlines (regulatory, contract, launch).",
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
            "Explain why you picked that urgency: cite dates, drivers, or say clearly why timing is still unknown.",
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
            "List real limits you already know — budget cap, fixed go-live date, must use existing ERP, no mobile app, data only in legacy DB, etc.",
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
            "List worries or unknowns — e.g. adoption risk, integration unknowns, compliance grey areas, staffing, vendor dependency.",
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
            "What exists today? Internal tools, vendor products, spreadsheets, or competitor apps — and why they are not enough.",
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
          description:
            "Pick the best match for size and risk. Use Unknown if you genuinely cannot estimate yet — then explain in the rationale box.",
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
            "Justify your estimate: teams touched, integrations, data sensitivity, regulation, geography, or unknowns that could grow scope.",
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
          description:
            "Choose the next lifecycle step. Accept only if the idea is clear enough to start structured problem definition (A-0.1).",
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
            "Say why that recommendation fits now — what is proven vs missing, and what you would do next if accepted.",
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
          description:
            "Pick the real status of this document. Draft = still writing; Submitted = ready for review; Approved = reviewer accepted for G1.",
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
            "For the status you chose: add reviewer notes — what was approved, what must change (if Returned), or why Deferred/Rejected.",
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
          placeholder: "Full name of the person who reviewed — e.g. Jordan Okonkwo",
        },
        {
          name: "reviewerRole",
          label: "Reviewer Role",
          type: "text",
          required: true,
          placeholder:
            "Their role in the decision — e.g. Portfolio Owner, Engineering Manager, Governance reviewer",
        },
        {
          name: "reviewDate",
          label: "Review Date",
          type: "date",
          required: true,
          description:
            "Date the reviewer recorded the decision above. Use YYYY-MM-DD (example: 2026-05-22).",
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