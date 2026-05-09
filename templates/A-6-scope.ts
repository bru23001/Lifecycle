import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

export const scopeSchema = z.object({
  scopeTitle: z.string().min(1),
  inScopeSummary: z.string().min(10),
  outOfScopeSummary: z.string().min(5),
  deferrals: z.string().default(""),
  assumptions: z.string().min(5),
  constraints: z.string().min(5),
  dependencies: z.string().min(5),
  acceptanceBoundary: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

const sections = [
  {
    id: "1",
    title: "Boundaries",
    fields: [
      { name: "scopeTitle", label: "Scope title", type: "text" as const, required: true },
      {
        name: "inScopeSummary",
        label: "In scope",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "outOfScopeSummary",
        label: "Out of scope",
        type: "textarea" as const,
        required: true,
      },
      { name: "deferrals", label: "Deferrals / parking lot", type: "textarea" as const },
    ],
  },
  {
    id: "2",
    title: "Assumptions & constraints",
    fields: [
      {
        name: "assumptions",
        label: "Assumptions",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "constraints",
        label: "Constraints",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "dependencies",
        label: "Dependencies",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "acceptanceBoundary",
        label: "Acceptance boundary",
        type: "textarea" as const,
        required: true,
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

export const scopeTemplate: LifecycleTemplate<typeof scopeSchema> = {
  templateId: "A-6",
  title: "Scope Document",
  phase: 7,
  schema: scopeSchema,
  sections: [...sections],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-6",
      title: "Scope Document",
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};
