import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const featureRowSchema = z.object({
  localId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().default(""),
  priority: z.enum(["Must", "Should", "Could", "Wont"]).default("Should"),
  /** Comma-separated REQ local IDs */
  linkedRequirementIds: z.string().default(""),
});

export const featureInventorySchema = z.object({
  inventoryTitle: z.string().min(1),
  inventoryIntro: z.string().min(10),
  featureRows: z.array(featureRowSchema).min(1),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type FeatureInventoryData = z.infer<typeof featureInventorySchema>;

export const featureInventoryTemplate: LifecycleTemplate<
  typeof featureInventorySchema
> = {
  templateId: "A-9",
  title: "Feature Inventory Document",
  phase: 6,
  gate: "G4",
  schema: featureInventorySchema,
  sections: [
    {
      id: "1",
      title: "Framing",
      fields: [
        {
          name: "inventoryTitle",
          label: "Inventory title",
          type: "text",
          required: true,
        },
        {
          name: "inventoryIntro",
          label: "Introduction",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Features",
      fields: [
        {
          type: "repeater",
          name: "featureRows",
          label: "Features",
          required: true,
          minRows: 1,
          rowFields: [
            { name: "localId", label: "FEAT ID override", type: "text" },
            { name: "title", label: "Feature title", type: "text", required: true },
            {
              name: "description",
              label: "Description",
              type: "textarea",
            },
            {
              name: "priority",
              label: "Priority",
              type: "select",
              required: true,
              options: [
                { label: "Must", value: "Must" },
                { label: "Should", value: "Should" },
                { label: "Could", value: "Could" },
                { label: "Wont", value: "Wont" },
              ],
            },
            {
              name: "linkedRequirementIds",
              label: "Linked requirement local IDs (comma-separated)",
              type: "textarea",
              description: "CRS/SRS/NFR local IDs.",
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
    const d = data as FeatureInventoryData;
    const rows = d.featureRows
      .map(
        (r) =>
          `### ${r.title}\n\n${r.description}\n\n_Priority:_ ${r.priority}\n_Links:_ ${r.linkedRequirementIds?.trim() || "—"}`,
      )
      .join("\n\n---\n\n");
    return `# ${d.inventoryTitle}\n\n${d.inventoryIntro}\n\n---\n\n${rows}\n\n**Status:** ${d.documentStatus}`;
  },
};
