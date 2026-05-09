import { z } from "zod";

import type { LifecycleTemplate } from "./types";

const apiRowSchema = z.object({
  operationId: z.string().min(1),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z.string().min(1),
  requestSchema: z.string().default(""),
  responseSchema: z.string().default(""),
  authNotes: z.string().default(""),
  errors: z.string().default(""),
});

export const apiContractSchema = z.object({
  contractTitle: z.string().min(1),
  contractIntro: z.string().min(10),
  apiRows: z.array(apiRowSchema).min(1),
  versioningNotes: z.string().min(5),
  documentStatus: z.enum(["Draft", "Approved"]),
});

export type ApiContractData = z.infer<typeof apiContractSchema>;

export const apiContractTemplate: LifecycleTemplate<typeof apiContractSchema> = {
  templateId: "A-12",
  title: "API and Integration Contract",
  phase: 8,
  gate: "G5",
  applicabilityKey: "apis",
  schema: apiContractSchema,
  sections: [
    {
      id: "1",
      title: "Overview",
      fields: [
        {
          name: "contractTitle",
          label: "Contract title",
          type: "text",
          required: true,
        },
        {
          name: "contractIntro",
          label: "Introduction",
          type: "textarea",
          required: true,
        },
        {
          name: "versioningNotes",
          label: "Versioning strategy",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "2",
      title: "Operations",
      fields: [
        {
          type: "repeater",
          name: "apiRows",
          label: "API operations",
          required: true,
          minRows: 1,
          rowFields: [
            {
              name: "operationId",
              label: "Operation ID",
              type: "text",
              required: true,
            },
            {
              name: "method",
              label: "HTTP method",
              type: "select",
              required: true,
              options: [
                { label: "GET", value: "GET" },
                { label: "POST", value: "POST" },
                { label: "PUT", value: "PUT" },
                { label: "PATCH", value: "PATCH" },
                { label: "DELETE", value: "DELETE" },
              ],
            },
            { name: "path", label: "Path", type: "text", required: true },
            {
              name: "requestSchema",
              label: "Request schema / body",
              type: "textarea",
            },
            {
              name: "responseSchema",
              label: "Response schema",
              type: "textarea",
            },
            {
              name: "authNotes",
              label: "Auth / scopes",
              type: "textarea",
            },
            {
              name: "errors",
              label: "Error model",
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
    const d = data as ApiContractData;
    const rows = d.apiRows
      .map(
        (r) =>
          `### ${r.operationId} · ${r.method} ${r.path}\n\n**Request:** ${r.requestSchema}\n\n**Response:** ${r.responseSchema}\n\n**Auth:** ${r.authNotes}\n\n**Errors:** ${r.errors}`,
      )
      .join("\n\n---\n\n");
    return `# ${d.contractTitle}\n\n${d.contractIntro}\n\n**Versioning:** ${d.versioningNotes}\n\n---\n\n${rows}\n\n**Status:** ${d.documentStatus}`;
  },
};
