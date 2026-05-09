import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const crsRowSchema = z.object({
  localId: z.string().optional(),
  title: z.string().min(1, "CRS title required."),
  description: z.string().default(""),
});

export const crsSchema = z.object({
  packageTitle: z.string().min(1),
  crsIntroduction: z.string().min(10),
  crsRows: z.array(crsRowSchema).min(1, "At least one CRS statement."),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type CrsData = z.infer<typeof crsSchema>;

export const crsTemplate: LifecycleTemplate<typeof crsSchema> = {
  templateId: "A-1",
  title: "Customer Requirements Specification (CRS)",
  phase: 6,
  gate: "G4",
  schema: crsSchema,
  sections: [
    {
      id: "1",
      title: "Package framing",
      fields: [
        {
          name: "packageTitle",
          label: "Package title",
          type: "text",
          required: true,
        },
        {
          name: "crsIntroduction",
          label: "Introduction / context",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "CRS statements",
      fields: [
        {
          type: "repeater",
          name: "crsRows",
          label: "Stakeholder requirements (CRS)",
          required: true,
          minRows: 1,
          rowFields: [
            {
              name: "localId",
              label: "Stable ID (optional override)",
              type: "text",
            },
            {
              name: "title",
              label: "Title",
              type: "text",
              required: true,
            },
            {
              name: "description",
              label: "Statement",
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
    const d = data as CrsData;
    const rows =
      d.crsRows?.map(
        (r, i) =>
          `### CRS row ${i + 1}${r.localId ? ` (${r.localId})` : ""}\n\n**${r.title}**\n\n${r.description || "_—_"}`,
      ).join("\n\n---\n\n") ?? "";
    return `# ${d.packageTitle}\n\n## CRS — Customer Requirements Specification\n\n### Introduction\n\n${d.crsIntroduction}\n\n---\n\n## CRS statements\n\n${rows}\n\n**Status:** ${d.documentStatus}\n`;
  },
};
