import { z } from "zod";

import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

export const reqPackageSchema = z.object({
  packageTitle: z.string().min(1),
  packageOverview: z.string().min(20),
  crsReferenceNotes: z.string().min(5),
  srsReferenceNotes: z.string().min(5),
  nfrReferenceNotes: z.string().min(5),
  stakeholderReferenceNotes: z.string().min(5),
  traceabilitySeedNotes: z.string().min(10),
  approvalRecord: z.string().min(5),
  documentStatus: z.enum(["Draft", "Approved"]),
});

const sections = [
  {
    id: "1",
    title: "Package overview",
    fields: [
      { name: "packageTitle", label: "Package title", type: "text" as const, required: true },
      {
        name: "packageOverview",
        label: "Executive overview",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "2",
    title: "Referenced artifacts",
    fields: [
      {
        name: "crsReferenceNotes",
        label: "CRS package reference / pointer",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "srsReferenceNotes",
        label: "SRS reference / pointer",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "nfrReferenceNotes",
        label: "NFR register reference / pointer",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "stakeholderReferenceNotes",
        label: "Stakeholder profile reference",
        type: "textarea" as const,
        required: true,
      },
    ],
  },
  {
    id: "3",
    title: "Traceability & approval",
    fields: [
      {
        name: "traceabilitySeedNotes",
        label: "Traceability seed (CRS ↔ SRS ↔ Features)",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "approvalRecord",
        label: "Approval record summary",
        type: "textarea" as const,
        required: true,
      },
      {
        name: "documentStatus",
        label: "Package status",
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

export const requirementsPackageTemplate: LifecycleTemplate<
  typeof reqPackageSchema
> = {
  templateId: "A-8",
  title: "Requirements Specification Package",
  phase: 6,
  gate: "G4",
  schema: reqPackageSchema,
  sections: [...sections],
  toMarkdown: (data) =>
    renderTemplateMarkdown({
      templateId: "A-8",
      title: "Requirements Specification Package",
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
      })),
      data: data as Record<string, unknown>,
    }),
};
