import type { TraceabilityLinkDetail } from "@/types/traceability.types";

import { buildTraceabilityMatrixMock } from "@/data/traceability.mock";

export function getTraceabilityLinkDetail(projectId: string, linkId: string): TraceabilityLinkDetail | null {
  const m = buildTraceabilityMatrixMock(projectId);

  const ag = m.artifactGateLinks.find((r) => r.id === linkId);
  if (ag) {
    return {
      id: ag.id,
      linkType: "Artifact → Gate",
      linkStrength: ag.status === "complete" ? "strong" : ag.status === "partial" ? "medium" : "weak",
      sourceKind: "Artifact",
      sourceLabel: `${ag.artifactLocalId} — ${ag.artifactTitle}`,
      sourceHref: ag.href,
      targetKind: "Gate",
      targetLabel: `${ag.gateCode} — ${ag.gateName}`,
      targetHref: `/projects/${projectId}/gates/${ag.gateCode.toLowerCase()}/review`,
      createdBy: "Alex Developer",
      createdAtLabel: "May 10, 2024 9:42 AM",
      evidenceReference: `Gate readiness bundle (${ag.gateCode})`,
      validationStatus: ag.status === "missing" ? "warning" : "valid",
    };
  }

  const ea = m.evidenceApprovalLinks.find((r) => r.id === linkId);
  if (ea) {
    return {
      id: ea.id,
      linkType: "Evidence → Approval",
      linkStrength: ea.status === "complete" ? "strong" : ea.status === "partial" ? "medium" : "weak",
      sourceKind: "Evidence",
      sourceLabel: ea.evidenceLabel,
      sourceHref: ea.href,
      targetKind: "Approval",
      targetLabel: ea.approvalTitle,
      targetHref: `/projects/${projectId}/approvals`,
      createdBy: "Jordan Analyst",
      createdAtLabel: "May 11, 2024 2:15 PM",
      evidenceReference: "Signed approval record + attachments",
      validationStatus: ea.approvalStatus === "rejected" ? "invalid" : ea.approvalStatus === "pending" ? "warning" : "valid",
    };
  }

  return null;
}
