import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

export const envStrategySchema = z.object({
  strategyTitle: z.string().min(1),
  environmentsOverview: z.string().min(10),
  branchingModel: z.string().min(5),
  secretsManagement: z.string().min(5),
  cicdOverview: z.string().min(10),
  deploymentRollback: z.string().min(10),
  observabilityHooks: z.string().min(5),
  accessModelNotes: z.string().default(""),
  documentStatus: z.enum(["Draft", "Approved"]),
});

const sections = [
  {
    id: "1",
    title: "Environments",
    fields: [
      {
        name: "strategyTitle",
        label: "Strategy title",
        type: "text" as const,
        required: true,
      },
      {
        name: "environmentsOverview",
        label: "Environments (dev/stage/prod)",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "branchingModel",
        label: "Branching model",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "2",
    title: "Delivery pipeline",
    fields: [
      {
        name: "secretsManagement",
        label: "Secrets / configuration",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "cicdOverview",
        label: "CI/CD overview",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "deploymentRollback",
        label: "Deployment & rollback",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "observabilityHooks",
        label: "Observability hooks",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "accessModelNotes",
        label: "Access model",
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

export const envStrategyTemplate: LifecycleTemplate<typeof envStrategySchema> = {
  templateId: "A-14",
  title: "Environment and Delivery Strategy",
  phase: 9,
  gate: "G6",
  schema: envStrategySchema,
  sections: [...sections],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-14",
      title: "Environment and Delivery Strategy",
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};
