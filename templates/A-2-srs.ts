import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const srsRowSchema = z.object({
  localId: z.string().optional(),
  kind: z.enum(["SRS_FR", "SRS_NFR"]),
  title: z.string().min(1),
  body: z.string().default(""),
  verificationMethod: z.string().default(""),
  /** Comma-separated CRS local IDs (e.g. CRS-001, CRS-002) */
  parentCrsIds: z.string().default(""),
});

export const srsSchema = z.object({
  srsTitle: z.string().min(1),
  srsIntroduction: z.string().min(10),
  srsRows: z.array(srsRowSchema).min(1),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type SrsData = z.infer<typeof srsSchema>;

export const srsTemplate: LifecycleTemplate<typeof srsSchema> = {
  templateId: "A-2",
  title: "Software Requirements Specification (SRS)",
  phase: 6,
  gate: "G4",
  schema: srsSchema,
  sections: [
    {
      id: "1",
      title: "Framing",
      fields: [
        { name: "srsTitle", label: "SRS title", type: "text", required: true },
        {
          name: "srsIntroduction",
          label: "Introduction",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Engineering requirements",
      fields: [
        {
          type: "repeater",
          name: "srsRows",
          label: "SRS records",
          required: true,
          minRows: 1,
          rowFields: [
            { name: "localId", label: "ID override", type: "text" },
            {
              name: "kind",
              label: "Kind",
              type: "select",
              required: true,
              options: [
                { label: "Functional (SRS-FR)", value: "SRS_FR" },
                { label: "Non-functional (SRS-NFR)", value: "SRS_NFR" },
              ],
            },
            { name: "title", label: "Title / ID text", type: "text", required: true },
            { name: "body", label: "Requirement text", type: "textarea" },
            {
              name: "verificationMethod",
              label: "Verification method",
              type: "textarea",
            },
            {
              name: "parentCrsIds",
              label: "Parent CRS local IDs (comma-separated)",
              type: "textarea",
              description: "e.g. CRS-001, CRS-002",
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
    const d = data as SrsData;
    const rows = d.srsRows
      .map(
        (r, i) =>
          `### ${r.kind} ${i + 1}\n\n**${r.title}**\n\n${r.body}\n\nParents: ${r.parentCrsIds?.trim() || "—"}`,
      )
      .join("\n\n---\n\n");
    return `# ${d.srsTitle}\n\n${d.srsIntroduction}\n\n---\n\n${rows}\n\n**Status:** ${d.documentStatus}`;
  },
};
