import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const docStatus = z.enum(["Draft", "Submitted", "Approved", "Returned"]);

export const businessFieldReportSchema = z.object({
  reportTitle: z.string().min(3, "Report title is required."),
  intendedAudience: z.string().min(3, "Intended audience is required."),
  preparedBy: z.string().min(2, "Prepared by is required."),
  datePrepared: z.string().min(2, "Date prepared is required."),
  businessFieldScope: z.string().min(10, "Field definition and scope is required."),
  executiveSummary: z.string().min(10, "Executive summary is required."),
  introduction: z.string().min(10, "Introduction is required."),
  marketAnalysis: z.string().min(10, "Market analysis is required."),
  competitiveAnalysis: z.string().min(10, "Competitive analysis is required."),
  futureOutlook: z.string().min(5, "Future outlook is required."),
  swotAnalysis: z.string().min(10, "SWOT is required."),
  trendsAndChallenges: z.string().min(10, "Trends and challenges are required."),
  potentialGrowthAreas: z.string().min(5, "Potential growth areas are required."),
  recommendations: z.string().min(10, "Recommendations are required."),
  conclusion: z.string().min(5, "Conclusion is required."),
  financialAnalysisSubset: z
    .string()
    .min(1, "Financial analysis subset (or N/A if not applicable) is required."),
  documentStatus: docStatus,
});

export type BusinessFieldReportData = z.infer<typeof businessFieldReportSchema>;

export const businessFieldReportTemplate: LifecycleTemplate<
  typeof businessFieldReportSchema
> = {
  templateId: "A-4",
  title: "Business Field Report",
  phase: 3,
  gate: "G3",
  schema: businessFieldReportSchema,

  sections: [
    {
      id: "1",
      title: "Report Metadata",
      fields: [
        { name: "reportTitle", label: "Report Title", type: "text", required: true },
        {
          name: "intendedAudience",
          label: "Intended Audience",
          type: "textarea",
          required: true,
        },
        { name: "preparedBy", label: "Prepared By", type: "text", required: true },
        { name: "datePrepared", label: "Date Prepared", type: "text", required: true },
        {
          name: "businessFieldScope",
          label: "Field Definition, Scope, and Relevance",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Executive Summary",
      fields: [
        {
          name: "executiveSummary",
          label: "Executive Summary",
          type: "textarea",
          required: true,
          description: "Findings, conclusions, and recommendations (standalone readable).",
        },
      ],
    },
    {
      id: "3",
      title: "Introduction",
      fields: [
        {
          name: "introduction",
          label: "Introduction",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "4",
      title: "Market Analysis",
      fields: [
        {
          name: "marketAnalysis",
          label: "Market Analysis",
          type: "textarea",
          required: true,
          description:
            "Size, growth, segmentation, trends; customer profiles and behavior; research methods.",
        },
      ],
    },
    {
      id: "5",
      title: "Competitive Analysis",
      fields: [
        {
          name: "competitiveAnalysis",
          label: "Competitive Analysis",
          type: "textarea",
          required: true,
          description:
            "Major players, strategies, differentiation; financial view where data exists.",
        },
      ],
    },
    {
      id: "6",
      title: "Future Outlook",
      fields: [
        {
          name: "futureOutlook",
          label: "Future Outlook",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "7",
      title: "SWOT",
      fields: [
        {
          name: "swotAnalysis",
          label: "SWOT (industry or opportunity context)",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "8",
      title: "Trends and Challenges",
      fields: [
        {
          name: "trendsAndChallenges",
          label: "Trends and Challenges",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "9",
      title: "Potential Growth Areas",
      fields: [
        {
          name: "potentialGrowthAreas",
          label: "Potential Growth Areas",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "10",
      title: "Recommendations",
      fields: [
        {
          name: "recommendations",
          label: "Recommendations",
          type: "textarea",
          required: true,
          description: "Aligned to goals; feasible; measurable; risk-aware; prioritized.",
        },
      ],
    },
    {
      id: "11",
      title: "Conclusion",
      fields: [
        {
          name: "conclusion",
          label: "Conclusion",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "12",
      title: "Financial Analysis Subset (optional)",
      fields: [
        {
          name: "financialAnalysisSubset",
          label:
            "Financial analysis (ratios, benchmarking, trends) — or state N/A",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "13",
      title: "Document Status",
      fields: [
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
