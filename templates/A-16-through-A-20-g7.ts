import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

/** G7 evidence — Test Strategy execution results (Master Lifecycle §5 G7). */
const a16Schema = z.object({
  executionSummary: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});
const a16Sections = [
  {
    id: "1",
    title: "Results",
    fields: [
      {
        name: "executionSummary",
        label: "Test strategy execution summary",
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

export const a16TestStrategyTemplate: LifecycleTemplate<typeof a16Schema> = {
  templateId: "A-16",
  title: "Test Strategy Execution Results",
  phase: 12,
  gate: "G7",
  schema: a16Schema,
  sections: a16Sections,
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-16",
      title: "Test Strategy Execution Results",
      sections: a16Sections.map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};

const a17Schema = z.object({
  scenariosOutcome: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export const a17AcceptanceScenariosTemplate: LifecycleTemplate<typeof a17Schema> = {
  templateId: "A-17",
  title: "Acceptance Test Scenarios Outcomes",
  phase: 12,
  gate: "G7",
  schema: a17Schema,
  sections: [
    {
      id: "1",
      title: "Outcomes",
      fields: [
        {
          name: "scenariosOutcome",
          label: "Scenario outcomes",
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
  ],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-17",
      title: "Acceptance Test Scenarios Outcomes",
      sections: [{ id: "1", title: "Outcomes", fields: [{ name: "scenariosOutcome", label: "Scenario outcomes" }] }],
      data: data as Record<string, unknown>,
    }),
};

const a18Schema = z.object({
  qaSummary: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export const a18QaResultsTemplate: LifecycleTemplate<typeof a18Schema> = {
  templateId: "A-18",
  title: "QA Results",
  phase: 12,
  gate: "G7",
  schema: a18Schema,
  sections: [
    {
      id: "1",
      title: "QA",
      fields: [
        {
          name: "qaSummary",
          label: "QA summary",
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
  ],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-18",
      title: "QA Results",
      sections: [{ id: "1", title: "QA", fields: [{ name: "qaSummary", label: "QA summary" }] }],
      data: data as Record<string, unknown>,
    }),
};

const a19Schema = z.object({
  bugDispositionSummary: z.string().min(5),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export const a19BugReportsTemplate: LifecycleTemplate<typeof a19Schema> = {
  templateId: "A-19",
  title: "Bug Reports & disposition",
  phase: 12,
  gate: "G7",
  schema: a19Schema,
  sections: [
    {
      id: "1",
      title: "Defects",
      fields: [
        {
          name: "bugDispositionSummary",
          label: "Bug reports / disposition (use \"None\" if no defects)",
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
  ],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-19",
      title: "Bug Reports",
      sections: [{ id: "1", title: "Defects", fields: [{ name: "bugDispositionSummary", label: "Summary" }] }],
      data: data as Record<string, unknown>,
    }),
};

const a20Schema = z.object({
  signOffNotes: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export const a20ValidationSignoffTemplate: LifecycleTemplate<typeof a20Schema> = {
  templateId: "A-20",
  title: "Validation Sign-Off",
  phase: 12,
  gate: "G7",
  schema: a20Schema,
  sections: [
    {
      id: "1",
      title: "Sign-off",
      fields: [
        {
          name: "signOffNotes",
          label: "Validation sign-off",
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
  ],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-20",
      title: "Validation Sign-Off",
      sections: [{ id: "1", title: "Sign-off", fields: [{ name: "signOffNotes", label: "Notes" }] }],
      data: data as Record<string, unknown>,
    }),
};
