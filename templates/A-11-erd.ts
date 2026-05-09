import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const erdRowSchema = z.object({
  entityName: z.string().min(1),
  attributes: z.string().min(1),
  relationships: z.string().default(""),
  keysConstraints: z.string().default(""),
  classificationNotes: z.string().default(""),
});

export const erdSchema = z.object({
  erdTitle: z.string().min(1),
  erdIntroduction: z.string().min(10),
  erdRows: z.array(erdRowSchema).min(1),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type ErdData = z.infer<typeof erdSchema>;

export const erdTemplate: LifecycleTemplate<typeof erdSchema> = {
  templateId: "A-11",
  title: "Data Model / ERD Document",
  phase: 8,
  gate: "G5",
  applicabilityKey: "data",
  schema: erdSchema,
  sections: [
    {
      id: "1",
      title: "Overview",
      fields: [
        { name: "erdTitle", label: "Document title", type: "text", required: true },
        {
          name: "erdIntroduction",
          label: "Introduction",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Entities",
      fields: [
        {
          type: "repeater",
          name: "erdRows",
          label: "Entities",
          required: true,
          minRows: 1,
          rowFields: [
            {
              name: "entityName",
              label: "Entity / table",
              type: "text",
              required: true,
            },
            {
              name: "attributes",
              label: "Attributes",
              type: "textarea",
              required: true,
            },
            {
              name: "relationships",
              label: "Relationships",
              type: "textarea",
            },
            {
              name: "keysConstraints",
              label: "Keys / constraints",
              type: "textarea",
            },
            {
              name: "classificationNotes",
              label: "Classification / retention notes",
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
    const d = data as ErdData;
    const rows = d.erdRows
      .map(
        (r) =>
          `### ${r.entityName}\n\n**Attributes:** ${r.attributes}\n\n**Relationships:** ${r.relationships}\n\n**Keys:** ${r.keysConstraints}\n\n**Classification:** ${r.classificationNotes}`,
      )
      .join("\n\n---\n\n");
    return `# ${d.erdTitle}\n\n${d.erdIntroduction}\n\n---\n\n${rows}\n\n**Status:** ${d.documentStatus}`;
  },
};
