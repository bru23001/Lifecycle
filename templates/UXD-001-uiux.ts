import { z } from "zod";

import type { LifecycleTemplate } from "./types";

export const uxdSchema = z.object({
  designTitle: z.string().min(1),
  goals: z.string().min(10),
  informationArchitecture: z.string().min(10),
  keyJourneys: z.string().min(10),
  componentInventory: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

const sections = [
  {
    id: "1",
    title: "UX foundations",
    fields: [
      { name: "designTitle", label: "Design package title", type: "text" as const, required: true },
      { name: "goals", label: "Goals & principles", type: "textarea" as const, required: true },
      {
        name: "informationArchitecture",
        label: "Information architecture",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "2",
    title: "Experience surface",
    fields: [
      {
        name: "keyJourneys",
        label: "Key user journeys",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "componentInventory",
        label: "Component inventory",
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

export const uxdTemplate: LifecycleTemplate<typeof uxdSchema> = {
  templateId: "UXD-001",
  title: "UI/UX Design Document (light)",
  phase: 8,
  gate: "G5",
  applicabilityKey: "ui",
  schema: uxdSchema,
  sections: [...sections],
  toMarkdown: (data) =>
    renderUxdMarkdown(data as z.infer<typeof uxdSchema>),
};

function renderUxdMarkdown(data: z.infer<typeof uxdSchema>): string {
  return `# ${data.designTitle}

## Goals

${data.goals}

## Information architecture

${data.informationArchitecture}

## Key journeys

${data.keyJourneys}

## Components

${data.componentInventory}

**Status:** ${data.documentStatus}
`;
}
