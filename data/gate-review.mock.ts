import type { GateReviewData } from "@/types/gate-review.types";

export const gateReviewMock: GateReviewData = {
  user: {
    name: "Alex Developer",
    role: "Solution Architect",
    initials: "AD",
  },
  project: {
    id: "sip-001",
    code: "SIP-001",
    name: "Secure Identity Platform",
  },
  gateReviewHeader: {
    projectId: "sip-001",
    projectName: "Secure Identity Platform",
    gateId: "g2",
    gateCode: "G2",
    gateNumber: 2,
    totalGates: 13,
    gateName: "Feasibility Approval",
    status: "pending_decision",
    purpose:
      "Confirm that the selected solution is feasible, meets business needs, and is viable from technical, operational, and financial viewpoints.",
    phaseNumber: 3,
    phaseName: "Evaluation & Selection",
    gateOwnerName: "Alex Developer",
    submittedOnLabel: "May 12, 2024 10:42 AM",
    submittedByName: "Alex Developer",
    reviewType: "standard",
    dueDateLabel: "May 19, 2024",
    approversAssigned: 3,
    readinessPercent: 92,
  },
  gateOverview: {
    purpose:
      "Ensure the selected solution is feasible, meets business needs, and is viable from technical, operational, and financial perspectives.",
    successCriteria: [
      "Viable solution selected",
      "Feasibility risks identified",
      "High-level cost estimate provided",
      "Stakeholders aligned",
      "Required evidence attached",
    ],
    approvalConsequence: "Unlocks Phase 4: Feasibility & Business Case.",
    rejectionConsequence: "Returns project to Phase 3 for rework.",
    currentPhaseLabel: "Phase 3: Evaluation & Selection",
    phaseProgressPercent: 65,
    phaseWorkspaceHref: "/projects/sip-001/workspace?phase=3",
  },
  requiredInputs: [
    {
      id: "input-a-3-1",
      inputCode: "A-3.1",
      name: "Solution Options Analysis",
      description: "Analysis of viable solution alternatives.",
      provided: true,
      status: "complete",
      linkedArtifactId: "artifact-a-3-1",
      href: "/projects/sip-001/artifacts/a-3-1",
    },
    {
      id: "input-a-3-2",
      inputCode: "A-3.2",
      name: "Evaluation & Scoring Matrix",
      description: "Scoring and comparison of solution options.",
      provided: true,
      status: "complete",
      linkedArtifactId: "artifact-a-3-2",
      href: "/projects/sip-001/artifacts/a-3-2",
    },
    {
      id: "input-a-3-3",
      inputCode: "A-3.3",
      name: "Recommended Solution",
      description: "Recommended solution and justification.",
      provided: true,
      status: "complete",
      linkedArtifactId: "artifact-a-3-3",
      href: "/projects/sip-001/artifacts/a-3-3",
    },
    {
      id: "input-cost-estimate",
      inputCode: "EV-COST",
      name: "High-Level Cost Estimate",
      description: "Preliminary cost estimate for the selected solution.",
      provided: true,
      status: "complete",
      href: "/projects/sip-001/evidence/ev-cost",
    },
  ],
  completionEvidence: [
    {
      id: "ev-001",
      name: "Market Research Report",
      type: "pdf",
      linkedTo: ["A-3.1"],
      addedBy: "Alex Developer",
      addedOnLabel: "May 12, 2024 10:10 AM",
      href: "/projects/sip-001/evidence/ev-001",
      downloadHref: "/api/evidence/ev-001/download",
    },
    {
      id: "ev-002",
      name: "Vendor Comparison Spreadsheet",
      type: "spreadsheet",
      linkedTo: ["A-3.1", "A-3.2"],
      addedBy: "Alex Developer",
      addedOnLabel: "May 12, 2024 10:12 AM",
      href: "/projects/sip-001/evidence/ev-002",
      downloadHref: "/api/evidence/ev-002/download",
    },
    {
      id: "ev-003",
      name: "Cost Estimation Summary",
      type: "document",
      linkedTo: ["A-3.3"],
      addedBy: "Alex Developer",
      addedOnLabel: "May 11, 2024 4:45 PM",
      href: "/projects/sip-001/evidence/ev-003",
      downloadHref: "/api/evidence/ev-003/download",
    },
    {
      id: "ev-004",
      name: "Stakeholder Alignment Memo",
      type: "document",
      linkedTo: ["A-3.3", "EV-COST"],
      addedBy: "Alex Developer",
      addedOnLabel: "May 11, 2024 2:15 PM",
      href: "/projects/sip-001/evidence/ev-004",
      downloadHref: "/api/evidence/ev-004/download",
    },
    {
      id: "ev-005",
      name: "Risk Register Snapshot",
      type: "spreadsheet",
      linkedTo: ["A-3.2"],
      addedBy: "Alex Developer",
      addedOnLabel: "May 10, 2024 5:01 PM",
      href: "/projects/sip-001/evidence/ev-005",
      downloadHref: "/api/evidence/ev-005/download",
    },
    {
      id: "ev-006",
      name: "Executive Summary",
      type: "pdf",
      linkedTo: ["A-3.1"],
      addedBy: "Alex Developer",
      addedOnLabel: "May 10, 2024 9:30 AM",
      href: "/projects/sip-001/evidence/ev-006",
      downloadHref: "/api/evidence/ev-006/download",
    },
  ],
  decisionCriteria: {
    criteria: [
      {
        id: "criterion-feasibility",
        name: "Solution Feasibility",
        weightPercent: 30,
        assessment: "meets",
        evidenceRefs: ["ev-001", "ev-002"],
      },
      {
        id: "criterion-business-value",
        name: "Business Value Alignment",
        weightPercent: 25,
        assessment: "meets",
        evidenceRefs: ["artifact-a-3-3"],
      },
      {
        id: "criterion-cost",
        name: "Cost & Financial Viability",
        weightPercent: 25,
        assessment: "meets",
        evidenceRefs: ["ev-003"],
      },
      {
        id: "criterion-risk",
        name: "Risk & Mitigation",
        weightPercent: 20,
        assessment: "partially_meets",
        evidenceRefs: ["artifact-a-3-2"],
      },
    ],
    overallAssessment: "meets_requirements",
  },
  approvers: [
    {
      id: "approver-001",
      name: "Morgan Avery",
      role: "IT Director",
      status: "reviewed",
      reviewedOnLabel: "May 13, 2024 9:15 AM",
      comments: "Inputs are sufficient for feasibility review.",
    },
    {
      id: "approver-002",
      name: "Jordan Blake",
      role: "Finance Manager",
      status: "in_review",
    },
    {
      id: "approver-003",
      name: "Taylor Kim",
      role: "Business Sponsor",
      status: "pending",
    },
  ],
  decisionRecord: {
    gateId: "g2",
    projectId: "sip-001",
    comments: "",
    conditions: [],
    status: "not_recorded",
  },
  nextPhaseUnlock: {
    canUnlock: false,
    unlockStatus: "ready",
    currentPhaseNumber: 3,
    nextPhaseNumber: 4,
    nextPhaseName: "Feasibility & Business Case",
    requirements: [
      { id: "decision", label: "Gate decision recorded", status: "incomplete" },
      { id: "inputs", label: "Required inputs complete", status: "complete" },
      { id: "evidence", label: "Evidence package complete", status: "complete" },
    ],
    carriedForwardArtifacts: [
      "A-3.1 Solution Options Analysis",
      "A-3.2 Evaluation & Scoring Matrix",
      "A-3.3 Recommended Solution",
    ],
    nextPhaseHref: "/projects/sip-001/workspace?phase=4",
  },
  actionState: {
    readinessLabel: "Ready for Decision",
    readinessDescription: "All required inputs and evidence have been provided.",
    canSaveReview: true,
    canSubmitDecision: false,
    submitBlockers: ["No decision has been selected."],
  },
};

/** Resolve demo links to the current route's `projectId` / `gateId`. */
export function buildGateReviewMock(projectId: string, gateId: string): GateReviewData {
  const base = JSON.parse(JSON.stringify(gateReviewMock)) as GateReviewData;
  base.project.id = projectId;
  base.gateReviewHeader.projectId = projectId;
  base.gateReviewHeader.gateId = gateId;
  base.decisionRecord.projectId = projectId;
  base.decisionRecord.gateId = gateId;
  base.gateOverview.phaseWorkspaceHref = `/projects/${projectId}/workspace?phase=3`;
  base.nextPhaseUnlock.nextPhaseHref = `/projects/${projectId}/workspace?phase=4`;

  const sip = "/projects/sip-001";
  const rewrite = (s: string) => s.replaceAll(sip, `/projects/${projectId}`);

  base.requiredInputs = base.requiredInputs.map((row) => ({
    ...row,
    href: row.href ? rewrite(row.href) : undefined,
  }));
  base.completionEvidence = base.completionEvidence.map((row) => ({
    ...row,
    href: rewrite(row.href),
    downloadHref: row.downloadHref,
  }));

  return base;
}
