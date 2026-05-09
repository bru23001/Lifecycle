import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const adrRowSchema = z.object({
  title: z.string().min(1),
  decision: z.string().min(5),
  status: z.enum(["Proposed", "Accepted", "Superseded"]).default("Proposed"),
});

export const ardSchema = z.object({
  documentTitle: z.string().min(1),
  executiveSummary: z.string().min(10),
  contextDiagramMermaid: z.string().min(20),
  containerDiagramMermaid: z.string().min(20),
  componentOverview: z.string().min(10),
  dataFlowNotes: z.string().min(10),
  adrRows: z.array(adrRowSchema).default([]),
  deviationsNotes: z.string().default(""),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type ArdData = z.infer<typeof ardSchema>;

export const ardTemplate: LifecycleTemplate<typeof ardSchema> = {
  templateId: "ARD-001",
  title: "Architecture Design Document",
  phase: 8,
  gate: "G5",
  schema: ardSchema,
  sections: [
    {
      id: "1",
      title: "Summary",
      fields: [
        {
          name: "documentTitle",
          label: "Document title",
          type: "text",
          required: true,
        },
        {
          name: "executiveSummary",
          label: "Executive summary",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Diagrams (Mermaid)",
      fields: [
        {
          name: "contextDiagramMermaid",
          label: "Context diagram (Mermaid)",
          type: "textarea",
          required: true,
        },
        {
          name: "containerDiagramMermaid",
          label: "Container diagram (Mermaid)",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "3",
      title: "Architecture narrative",
      fields: [
        {
          name: "componentOverview",
          label: "Components / modules overview",
          type: "textarea",
          required: true,
        },
        {
          name: "dataFlowNotes",
          label: "Data flow / integration notes",
          type: "textarea",
          required: true,
        },
        {
          type: "repeater",
          name: "adrRows",
          label: "Architecture Decision Records (embedded)",
          rowFields: [
            { name: "title", label: "ADR title", type: "text", required: true },
            {
              name: "decision",
              label: "Decision text",
              type: "textarea",
              required: true,
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { label: "Proposed", value: "Proposed" },
                { label: "Accepted", value: "Accepted" },
                { label: "Superseded", value: "Superseded" },
              ],
            },
          ],
        },
        {
          name: "deviationsNotes",
          label: "Deviations / risks",
          type: "textarea",
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
    const d = data as ArdData;
    const adrs =
      d.adrRows?.length ?
        d.adrRows
          .map(
            (a, i) =>
              `### ADR ${i + 1}: ${a.title}\n\n${a.decision}\n\n_Status:_ ${a.status}`,
          )
          .join("\n\n")
      : "_No embedded ADRs._";
    return `# ${d.documentTitle}\n\n## Summary\n\n${d.executiveSummary}\n\n## Context diagram\n\n\`\`\`mermaid\n${d.contextDiagramMermaid}\n\`\`\`\n\n## Container diagram\n\n\`\`\`mermaid\n${d.containerDiagramMermaid}\n\`\`\`\n\n## Components\n\n${d.componentOverview}\n\n## Data flow\n\n${d.dataFlowNotes}\n\n## ADRs\n\n${adrs}\n\n## Deviations\n\n${d.deviationsNotes || "—"}\n\n**Status:** ${d.documentStatus}\n`;
  },
};
