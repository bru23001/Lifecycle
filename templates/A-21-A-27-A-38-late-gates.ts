import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

/** G8 scaffold — Release Readiness Checklist (full G8 suite deferred). */
const a21Schema = z.object({
  readinessSummary: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});
const a21Sections = [
  {
    id: "1",
    title: "Release readiness",
    fields: [
      {
        name: "readinessSummary",
        label: "Release readiness summary",
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

export const a21ReleaseReadinessTemplate: LifecycleTemplate<typeof a21Schema> = {
  templateId: "A-21",
  title: "Release Readiness Checklist",
  phase: 13,
  gate: "G8",
  schema: a21Schema,
  sections: a21Sections,
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-21",
      title: "Release Readiness Checklist",
      sections: a21Sections.map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};

/** G9 scaffold — Deployment Checklist. */
const a27Schema = z.object({
  deploymentSummary: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export const a27DeploymentChecklistTemplate: LifecycleTemplate<typeof a27Schema> = {
  templateId: "A-27",
  title: "Deployment Checklist",
  phase: 14,
  gate: "G9",
  schema: a27Schema,
  sections: [
    {
      id: "1",
      title: "Deployment",
      fields: [
        {
          name: "deploymentSummary",
          label: "Deployment checklist summary",
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
      templateId: "A-27",
      title: "Deployment Checklist",
      sections: [{ id: "1", title: "Deployment", fields: [{ name: "deploymentSummary", label: "Summary" }] }],
      data: data as Record<string, unknown>,
    }),
};

/** G10 scaffold — Post-Release Review. */
const a38Schema = z.object({
  reviewSummary: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export const a38PostReleaseReviewTemplate: LifecycleTemplate<typeof a38Schema> = {
  templateId: "A-38",
  title: "Post-Release Review",
  phase: 14,
  gate: "G10",
  schema: a38Schema,
  sections: [
    {
      id: "1",
      title: "Review",
      fields: [
        {
          name: "reviewSummary",
          label: "Post-release review summary",
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
      templateId: "A-38",
      title: "Post-Release Review",
      sections: [{ id: "1", title: "Review", fields: [{ name: "reviewSummary", label: "Summary" }] }],
      data: data as Record<string, unknown>,
    }),
};
