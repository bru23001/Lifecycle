import { getTemplate, templateRegistry } from "@/templates/registry";

import { buildTemplatePayload } from "./zod-fill";

/** Template ids required across G1–G10 evaluation. */
export const LIFECYCLE_GATE_TEMPLATE_IDS = [
  "A-0",
  "A-0.1",
  "A-3.1",
  "A-3.2",
  "A-3.3",
  "A-4",
  "A-8",
  "A-1",
  "A-2",
  "A-10",
  "ARD-001",
  "A-11",
  "A-12",
  "UXD-001",
  "A-14",
  "A-13",
  "A-15",
  "A-16",
  "A-17",
  "A-18",
  "A-19",
  "A-20",
  "A-21",
  "A-22",
  "A-23",
  "A-24",
  "A-25",
  "A-26",
  "A-27",
  "A-28",
  "A-29",
  "A-30",
  "A-31",
  "A-38",
  "A-35",
  "A-39",
  "A-40",
  "A-41",
] as const;

const TEMPLATE_OVERRIDES: Partial<Record<string, Record<string, unknown>>> = {
  "A-0": { approvalStatus: "Approved" },
  "A-0.1": { approvalStatus: "Approved", independentValidationSource: "E2E stakeholder validation workshop" },
  "A-3.1": { documentStatus: "Approved" },
  "A-3.2": {
    feasibilityApprovalStatus: "Feasible — Proceed to Requirements",
    technicalFeasibilityRating: "Medium",
    resourceFeasibilityRating: "Medium",
    scheduleFeasibilityRating: "Medium",
    financialFeasibilityRating: "Medium",
    operationalFeasibilityRating: "Medium",
    securityComplianceFeasibilityRating: "Medium",
    integrationFeasibilityRating: "Medium",
    maintenanceFeasibilityRating: "Medium",
  },
  "A-3.3": {
    businessRecommendation: "Proceed to Requirements",
    prcsDomainTags: "Operations, Developer Tools",
    prcsFunctionDescriptors: "Lifecycle governance automation",
    prcsWorkTypeTags: "WA-SS",
    prcsPclCode: "PCL-3.1.1.2",
    prcsCandidateApprovedProductId: "PRD-E2E-001",
  },
  "A-4": { documentStatus: "Approved" },
  "A-1": { documentStatus: "Approved", crsRows: [{ localId: "CRS-001", title: "E2E CRS", description: "E2E" }] },
  "A-2": { documentStatus: "Approved" },
  "A-8": { documentStatus: "Approved" },
  "A-10": { documentStatus: "Approved" },
  "ARD-001": {
    documentStatus: "Approved",
    deviationsNotes: "",
    adrRows: [],
    contextDiagramMermaid: "flowchart LR\n  Client --> API\n  API --> DB",
    containerDiagramMermaid: "flowchart LR\n  Web --> Service\n  Service --> DB",
  },
  "A-11": { documentStatus: "Approved" },
  "A-12": { documentStatus: "Approved" },
  "UXD-001": { documentStatus: "Approved" },
  "A-13": { documentStatus: "Approved" },
  "A-14": { documentStatus: "Approved" },
  "A-15": { documentStatus: "Approved" },
};

export function buildArtifactDataForTemplate(templateId: string): Record<string, unknown> {
  if (!(templateId in templateRegistry)) {
    throw new Error(`Unknown template for E2E seed: ${templateId}`);
  }
  const template = getTemplate(templateId);
  const overrides =
    TEMPLATE_OVERRIDES[templateId] ?? { documentStatus: "Approved", approvalStatus: "Approved" };
  return buildTemplatePayload(template.schema, overrides);
}
