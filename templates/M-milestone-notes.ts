import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

const milestoneNotesSchema = z.object({
  milestoneNotes: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

function sectionsFor(title: string) {
  return [
    {
      id: "1",
      title,
      fields: [
        {
          name: "milestoneNotes",
          label: "Milestone notes",
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
}

export const milestoneNotesPhase10: LifecycleTemplate<typeof milestoneNotesSchema> = {
  templateId: "M-10",
  title: "Build planning milestone notes",
  phase: 10,
  schema: milestoneNotesSchema,
  sections: sectionsFor("Build planning"),
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "M-10",
      title: "Build planning milestone notes",
      sections: sectionsFor("Build planning").map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};

export const milestoneNotesPhase11: LifecycleTemplate<typeof milestoneNotesSchema> = {
  templateId: "M-11",
  title: "Implementation readiness milestone notes",
  phase: 11,
  schema: milestoneNotesSchema,
  sections: sectionsFor("Implementation readiness"),
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "M-11",
      title: "Implementation readiness milestone notes",
      sections: sectionsFor("Implementation readiness").map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};

export const milestoneNotesPhase12: LifecycleTemplate<typeof milestoneNotesSchema> = {
  templateId: "M-12",
  title: "Build & integrate milestone notes",
  phase: 12,
  schema: milestoneNotesSchema,
  sections: sectionsFor("Build & integrate"),
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "M-12",
      title: "Build & integrate milestone notes",
      sections: sectionsFor("Build & integrate").map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};
