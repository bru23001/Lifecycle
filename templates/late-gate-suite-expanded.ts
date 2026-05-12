import { z } from "zod";

import type { LifecycleGateId } from "./types";
import type { LifecycleTemplate } from "./types";
import { renderTemplateMarkdown } from "./markdown";

/** Shared minimal schema for deferred late-gate artifacts (expand sections later). */
const docSchema = z.object({
  documentSummary: z.string().min(10),
  documentStatus: z.enum(["Draft", "Approved"]),
});

type DocSchema = typeof docSchema;

function mkLateGateTemplate(
  templateId: string,
  title: string,
  phase: number,
  gate: LifecycleGateId,
): LifecycleTemplate<DocSchema> {
  const sections = [
    {
      id: "1",
      title: "Summary",
      fields: [
        {
          name: "documentSummary",
          label: "Document summary",
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

  return {
    templateId,
    title,
    phase,
    gate,
    maturity: "scaffold",
    schema: docSchema,
    sections,
    toMarkdown: (data) =>
      renderTemplateMarkdown({
        templateId,
        title,
        sections: sections.map((s) => ({
          id: s.id,
          title: s.title,
          fields: s.fields.map((f) => ({ name: f.name, label: f.label })),
        })),
        data: data as Record<string, unknown>,
      }),
  };
}

/** G8 — release preparation family */
export const a22ReleaseNotesTemplate = mkLateGateTemplate(
  "A-22",
  "Release Notes",
  13,
  "G8",
);
export const a23RollbackPlanTemplate = mkLateGateTemplate(
  "A-23",
  "Rollback Plan",
  13,
  "G8",
);
export const a24CommunicationsPlanTemplate = mkLateGateTemplate(
  "A-24",
  "Release Communications Plan",
  13,
  "G8",
);
export const a25OperationalReadinessTemplate = mkLateGateTemplate(
  "A-25",
  "Operational Readiness Review",
  13,
  "G8",
);
export const a26SignoffRecordTemplate = mkLateGateTemplate(
  "A-26",
  "Release Sign-off Record",
  13,
  "G8",
);

/** G9 — deployment family */
export const a28DeploymentRunbookTemplate = mkLateGateTemplate(
  "A-28",
  "Deployment Runbook",
  14,
  "G9",
);
export const a29SmokeTestResultsTemplate = mkLateGateTemplate(
  "A-29",
  "Post-Deploy Smoke Test Results",
  14,
  "G9",
);
export const a30MonitoringCutoverTemplate = mkLateGateTemplate(
  "A-30",
  "Monitoring & Alerting Cutover",
  14,
  "G9",
);
export const a31HypercarePlanTemplate = mkLateGateTemplate(
  "A-31",
  "Hypercare / Support Plan",
  14,
  "G9",
);

/** G10 — post-release / operations family */
export const a35IncidentReviewTemplate = mkLateGateTemplate(
  "A-35",
  "Incident Review Summary",
  14,
  "G10",
);
export const a39KbUpdateTemplate = mkLateGateTemplate(
  "A-39",
  "Knowledge Base Update",
  14,
  "G10",
);
export const a40CapacityReportTemplate = mkLateGateTemplate(
  "A-40",
  "Capacity / Performance Report",
  14,
  "G10",
);
export const a41ImprovementBacklogTemplate = mkLateGateTemplate(
  "A-41",
  "Improvement Backlog",
  14,
  "G10",
);
