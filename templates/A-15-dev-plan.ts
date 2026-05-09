import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

export const devPlanSchema = z.object({
  planTitle: z.string().min(1),
  deliveryApproach: z.string().min(10),
  milestones: z.string().min(10),
  workBreakdownSummary: z.string().min(10),
  risksBlockers: z.string().min(5),
  definitionOfDone: z.string().min(10),
  executionModelNotes: z.string().default(""),
  documentStatus: z.enum(["Draft", "Approved"]),
});

const sections = [
  {
    id: "1",
    title: "Delivery",
    fields: [
      { name: "planTitle", label: "Plan title", type: "text" as const, required: true },
      {
        name: "deliveryApproach",
        label: "Delivery approach",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "milestones",
        label: "Milestones",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "workBreakdownSummary",
        label: "Work breakdown summary",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "2",
    title: "Quality & execution",
    fields: [
      {
        name: "risksBlockers",
        label: "Risks / blockers",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "definitionOfDone",
        label: "Definition of done",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "executionModelNotes",
        label: "TD-001 / HG-001 / execution model notes",
        type: "textarea" as const,
      },
      {
        name: "documentStatus",
        label: "Document status",
        type: "select" as const,
        required: true,
        options: [
          { label: "Draft", value: "Draft" },
          { label: "Approved", value: "Approved" },
        ],
      },
    ],
  },
];

export const developmentPlanTemplate: LifecycleTemplate<typeof devPlanSchema> = {
  templateId: "A-15",
  title: "Development Plan",
  phase: 9,
  gate: "G6",
  schema: devPlanSchema,
  sections: [...sections],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-15",
      title: "Development Plan",
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};
