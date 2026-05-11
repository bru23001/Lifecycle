import type { LifecycleWorkspaceScreenData } from "@/types/lifecycle-workspace.types";

export const lifecycleWorkspaceMock: LifecycleWorkspaceScreenData = {
  user: {
    name: "Alex Developer",
    role: "Project Owner",
    initials: "AD",
  },
  project: {
    id: "sip-001",
    name: "Secure Identity Platform",
    code: "SIP-001",
  },
  phaseHeader: {
    projectId: "sip-001",
    projectName: "Secure Identity Platform",
    phaseNumber: 3,
    totalPhases: 14,
    phaseName: "Evaluation & Selection",
    status: "in_progress",
    purpose: "Select and justify the recommended solution option.",
    ownerName: "Alex Developer",
    startedOnLabel: "May 10, 2026",
    targetCompletionLabel: "May 24, 2026",
    gateCode: "G2",
    gateName: "Feasibility Approval",
    completionPercent: 62,
  },
  phaseNavigatorItems: [
    { phaseNumber: 1, name: "Idea Capture", status: "completed", href: "/projects/sip-001/workspace?phase=1", gateCode: "G1" },
    { phaseNumber: 2, name: "Problem Definition", status: "completed", href: "/projects/sip-001/workspace?phase=2" },
    { phaseNumber: 3, name: "Evaluation & Selection", status: "current", href: "/projects/sip-001/workspace?phase=3", gateCode: "G2" },
    { phaseNumber: 4, name: "Feasibility & Business Case", status: "not_started", href: "/projects/sip-001/workspace?phase=4" },
  ],
  workspace: {
    title: "Current Phase Workspace",
    instructions:
      "Complete all required templates and checklist items, attach supporting evidence, and resolve validation warnings before submitting for Gate review.",
    infoMessage: "All items in this phase must be completed to submit to Gate G2.",
    objectives: [
      "Compare viable solution alternatives.",
      "Score options using defined evaluation criteria.",
      "Select and justify the recommended solution.",
      "Prepare gate-ready evidence.",
    ],
  },
  requiredTemplates: [],
  evidenceAttachments: [],
  checklistItems: [],
  validationWarnings: [],
  gateSubmissionState: {
    gateCode: "G2",
    gateName: "Feasibility Approval",
    canSubmit: false,
    missingRequirements: ["Complete required templates"],
    submitHref: "/projects/sip-001/gate/G2",
  },
  nextRequiredAction: {
    label: "Next Required Action",
    description: "Complete pending template entries and attach supporting evidence.",
    ctaLabel: "Go to next incomplete item",
    href: "/projects/sip-001/workspace#completion-checklist",
  },
};
