import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const moduleRowSchema = z.object({
  moduleName: z.string().min(1),
  directoryPath: z.string().min(1),
  primaryOwner: z.string().min(1),
  interfaceNotes: z.string().default(""),
  testPlacementNotes: z.string().default(""),
});

export const modulePlanSchema = z.object({
  planTitle: z.string().min(1),
  planIntroduction: z.string().min(10),
  namespaceNotes: z.string().min(5),
  moduleRows: z.array(moduleRowSchema).min(1),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type ModulePlanData = z.infer<typeof modulePlanSchema>;

export const modulePlanTemplate: LifecycleTemplate<typeof modulePlanSchema> = {
  templateId: "A-13",
  title: "Module and File Planning Document",
  phase: 9,
  gate: "G6",
  schema: modulePlanSchema,
  sections: [
    {
      id: "1",
      title: "Overview",
      fields: [
        { name: "planTitle", label: "Plan title", type: "text", required: true },
        {
          name: "planIntroduction",
          label: "Introduction",
          type: "textarea",
          required: true,
        },
        {
          name: "namespaceNotes",
          label: "Namespace M / naming conventions",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Modules",
      fields: [
        {
          type: "repeater",
          name: "moduleRows",
          label: "Modules / directories",
          required: true,
          minRows: 1,
          rowFields: [
            {
              name: "moduleName",
              label: "Module name",
              type: "text",
              required: true,
            },
            {
              name: "directoryPath",
              label: "Directory path",
              type: "text",
              required: true,
            },
            {
              name: "primaryOwner",
              label: "Owner",
              type: "text",
              required: true,
            },
            {
              name: "interfaceNotes",
              label: "Interfaces / exports",
              type: "textarea",
            },
            {
              name: "testPlacementNotes",
              label: "Test placement",
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
    const d = data as ModulePlanData;
    const rows = d.moduleRows
      .map(
        (r) =>
          `### ${r.moduleName}\n\n**Path:** ${r.directoryPath}\n\n**Owner:** ${r.primaryOwner}\n\n**Interfaces:** ${r.interfaceNotes}\n\n**Tests:** ${r.testPlacementNotes}`,
      )
      .join("\n\n---\n\n");
    return `# ${d.planTitle}\n\n${d.planIntroduction}\n\n## Namespace\n\n${d.namespaceNotes}\n\n---\n\n${rows}\n\n**Status:** ${d.documentStatus}`;
  },
};
