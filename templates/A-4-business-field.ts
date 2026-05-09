import { z } from "zod";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const requiredText = (fieldName: string, min = 3) =>
  z.string().trim().min(min, `${fieldName} is required.`);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

const docStatus = z.enum(["Draft", "Submitted", "Approved", "Returned"]);

/** Appendix A: specialized variants reuse the same evidence standards. */
const reportVariantEnum = z.enum([
  "Standard",
  "MarketEntry",
  "EmergingTechnology",
  "CustomerSegmentation",
  "CompetitiveLandscape",
]);

export const businessFieldReportSchema = z
  .object({
    reportTitle: requiredText("Report title", 3),
    intendedAudience: requiredText("Intended audience", 3),
    preparedBy: requiredText("Prepared by", 2),
    datePrepared: dateString,
    relatedInitiativeReference: z.string().trim(),
    reportVariant: reportVariantEnum,
    variantSpecificNotes: z.string().trim(),
    executiveSummary: requiredText("Executive summary", 10),
    introduction: requiredText("Introduction", 10),
    sourcesAndCitations: requiredText("Sources and citations", 10),
    marketAnalysis: requiredText("Market analysis", 10),
    competitiveAnalysis: requiredText("Competitive analysis", 10),
    futureOutlook: requiredText("Future outlook", 5),
    swotAnalysis: requiredText("SWOT", 10),
    trendsAndChallenges: requiredText("Trends and challenges", 10),
    potentialGrowthAreas: requiredText("Potential growth areas", 5),
    recommendations: requiredText("Recommendations", 10),
    conclusion: requiredText("Conclusion", 5),
    financialAnalysisSubset: z
      .string()
      .trim()
      .min(
        1,
        "Financial analysis subset (or N/A if not applicable) is required.",
      ),
    documentStatus: docStatus,
  })
  .superRefine((data, ctx) => {
    if (data.reportVariant === "Standard") return;
    if (data.variantSpecificNotes.length >= 10) return;
    ctx.addIssue({
      code: "custom",
      message:
        "Describe how this report applies the specialized variant (scope, methods, key findings) — at least 10 characters.",
      path: ["variantSpecificNotes"],
    });
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
      title: "Report metadata",
      description:
        "Purpose: analyze a business field (market, industry, or opportunity space) for portfolio and funding decisions. Audience: tailor depth to executives, sponsors, product leadership, or portfolio reviewers.",
      fields: [
        { name: "reportTitle", label: "Report title", type: "text", required: true },
        {
          name: "intendedAudience",
          label: "Intended audience",
          type: "textarea",
          required: true,
          description:
            "Who will act on this report (role, team, or forum); drives tone and depth.",
        },
        { name: "preparedBy", label: "Prepared by", type: "text", required: true },
        {
          name: "datePrepared",
          label: "Date prepared",
          type: "date",
          required: true,
        },
        {
          name: "relatedInitiativeReference",
          label: "Related initiative / project / PRD (or N/A)",
          type: "text",
          required: false,
          placeholder: "e.g. PRD-042, IDEA-0007, or N/A",
        },
        {
          name: "reportVariant",
          label: "Report focus (Appendix A specialized variants)",
          type: "select",
          required: true,
          description:
            "Standard follows the core outline; specialized variants reuse the same evidence standards with added focus.",
          options: [
            { label: "Standard — core outline", value: "Standard" },
            {
              label: "Market entry analysis",
              value: "MarketEntry",
            },
            {
              label: "Emerging technology report",
              value: "EmergingTechnology",
            },
            {
              label: "Customer segmentation study",
              value: "CustomerSegmentation",
            },
            {
              label: "Competitive landscape analysis",
              value: "CompetitiveLandscape",
            },
          ],
        },
        {
          name: "variantSpecificNotes",
          label: "Variant-specific notes",
          type: "textarea",
          required: false,
          description:
            "Required when Report focus is not Standard: geography/segment, technology scope, segment definitions, or competitor set; methods used and key implications.",
        },
      ],
    },
    {
      id: "2",
      title: "Executive summary",
      description:
        "Findings, conclusions, and recommendations — standalone readable.",
      fields: [
        {
          name: "executiveSummary",
          label: "Executive summary",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "3",
      title: "Introduction",
      description:
        "Field definition, scope, and relevance to the organization (Appendix A core section).",
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
      title: "Sources and citations",
      description:
        "Quality bar: credible sources and clear citations (internal links, publication titles, dates, or appendix references).",
      fields: [
        {
          name: "sourcesAndCitations",
          label: "Sources and citations",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "5",
      title: "Market analysis",
      description:
        "Size, growth, segmentation, trends; demographics and customer profiles; behavior; primary vs secondary research methods.",
      fields: [
        {
          name: "marketAnalysis",
          label: "Market analysis",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "6",
      title: "Competitive analysis",
      description:
        "Major players, share, strategies; strengths/weaknesses; differentiation; financial view where data exists (see Financial analysis subset).",
      fields: [
        {
          name: "competitiveAnalysis",
          label: "Competitive analysis",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "7",
      title: "Future outlook",
      description: "Forecast trends; implications for players in the space.",
      fields: [
        {
          name: "futureOutlook",
          label: "Future outlook",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "8",
      title: "SWOT",
      description:
        "Strengths, weaknesses, opportunities, and threats for the industry or opportunity context; prioritize factors and tie to strategy.",
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
      id: "9",
      title: "Trends and challenges",
      description:
        "Drivers (technology, digital transformation, ESG, etc.) and pressures (economy, supply chain, cyber, talent, regulation, climate, geopolitical risk).",
      fields: [
        {
          name: "trendsAndChallenges",
          label: "Trends and challenges",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "10",
      title: "Potential growth areas",
      description:
        "Innovation, expansion, technology, operational excellence, CX, sustainability; techniques (research, SWOT, scenarios, workshops, customer feedback).",
      fields: [
        {
          name: "potentialGrowthAreas",
          label: "Potential growth areas",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "11",
      title: "Recommendations",
      description:
        "Aligned to goals; feasible; measurable; risk-aware; prioritized — product/service, markets, operations, CX, digital, sustainability as relevant.",
      fields: [
        {
          name: "recommendations",
          label: "Recommendations",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "12",
      title: "Conclusion",
      description: "Restate main conclusions and next decisions.",
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
      id: "13",
      title: "Financial analysis subset",
      description:
        "Within competitive or industry analysis: ratios, benchmarking, trends when public or internal financial data exists (Appendix A). State N/A if not used.",
      fields: [
        {
          name: "financialAnalysisSubset",
          label:
            "Financial analysis (statements, ratios, peers, trends) — or N/A",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "14",
      title: "Document status",
      fields: [
        {
          name: "documentStatus",
          label: "Document status",
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
