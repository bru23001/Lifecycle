import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const requiredText = (label: string, min = 2) =>
  z.string().trim().min(min, `${label} is required.`);

export const stakeholderSchema = z.object({
  inventoryTitle: requiredText("Inventory title", 3),
  stakeholdersSummary: requiredText("Stakeholder summary", 10),
  primaryPersonas: requiredText("Primary personas", 10),
  secondaryUsers: z.string().trim().default(""),
  decisionMakers: requiredText("Decision makers", 5),
  communicationNotes: requiredText("Communication approach", 5),
  authorityMatrix: requiredText("Authority / RACI notes", 5),
  supportModelNotes: z.string().trim().default(""),
  documentStatus: z.enum(["Draft", "Approved"]),
});

const stakeholderSections = [
  {
    id: "1",
    title: "Inventory",
    fields: [
      {
        name: "inventoryTitle",
        label: "Inventory title",
        type: "text" as const,
        required: true,
      },
      {
        name: "stakeholdersSummary",
        label: "Stakeholder summary",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "2",
    title: "Personas & users",
    fields: [
      {
        name: "primaryPersonas",
        label: "Primary personas / users",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "secondaryUsers",
        label: "Secondary users",
        type: "textarea" as const,
      },
      {
        name: "decisionMakers",
        label: "Decision makers",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "3",
    title: "Communication & authority",
    fields: [
      {
        name: "communicationNotes",
        label: "Communication approach",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "authorityMatrix",
        label: "Authority / RACI notes",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "supportModelNotes",
        label: "Support model notes",
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

export const stakeholderTemplate: LifecycleTemplate<typeof stakeholderSchema> = {
  templateId: "A-7",
  title: "Stakeholder and User Profile",
  phase: 6,
  gate: "G4",
  schema: stakeholderSchema,
  sections: [...stakeholderSections],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-7",
      title: "Stakeholder and User Profile",
      sections: stakeholderSections.map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};
