import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const nfrRowSchema = z.object({
  localId: z.string().optional(),
  dimension: z.string().min(1),
  title: z.string().min(1),
  body: z.string().default(""),
  verificationMethod: z.string().default(""),
});

export const nfrSchema = z.object({
  registerTitle: z.string().min(1),
  registerIntroduction: z.string().min(10),
  nfrRows: z.array(nfrRowSchema).min(1),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type NfrData = z.infer<typeof nfrSchema>;

export const nfrRegisterTemplate: LifecycleTemplate<typeof nfrSchema> = {
  templateId: "A-10",
  title: "Non-Functional Requirements Register",
  phase: 6,
  gate: "G4",
  schema: nfrSchema,
  sections: [
    {
      id: "1",
      title: "Framing",
      fields: [
        { name: "registerTitle", label: "Register title", type: "text", required: true },
        {
          name: "registerIntroduction",
          label: "Introduction",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "NFR records",
      fields: [
        {
          type: "repeater",
          name: "nfrRows",
          label: "NFR items",
          required: true,
          minRows: 1,
          rowFields: [
            { name: "localId", label: "ID override", type: "text" },
            {
              name: "dimension",
              label: "Quality dimension",
              type: "text",
              required: true,
            },
            { name: "title", label: "Title", type: "text", required: true },
            { name: "body", label: "Requirement text", type: "textarea" },
            {
              name: "verificationMethod",
              label: "Verification method",
              type: "textarea",
            },
          ],
        },
        {
          name: "documentStatus",
          label: "Document status",
          type: "select",
          required: true,
          options: [
            { label: "Draft", value: "Draft" },
            { label: "Approved", value: "Approved" },
          ],
        },
      ],
    },
  ],
  toMarkdown: (data) => {
    const d = data as NfrData;
    const body = d.nfrRows
      .map(
        (r, i) =>
          `### NFR-${String(i + 1).padStart(3, "0")} (${r.dimension})\n\n**${r.title}**\n\n${r.body}\n\n_Verification:_ ${r.verificationMethod || "—"}`,
      )
      .join("\n\n---\n\n");
    return `# ${d.registerTitle}\n\n${d.registerIntroduction}\n\n---\n\n${body}\n\n**Status:** ${d.documentStatus}`;
  },
};
