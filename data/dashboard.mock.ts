import type { DashboardData } from "@/types/dashboard.types";

export const DASHBOARD_SAMPLE_PROJECTS = [
  "Secure Identity Platform",
  "Data Governance Hub",
  "Threat Intelligence System",
  "Compliance Automation Tool",
] as const;

export const DASHBOARD_FALLBACK_DATA: Omit<DashboardData, "continueWorking"> = {
  user: {
    name: "Alex Developer",
    role: "Project Owner",
    initials: "AD",
  },
  metrics: [
    {
      id: "active-projects",
      label: "Active Projects",
      value: 4,
      note: "3 in progress",
      tone: "blue",
      targetHref: "/projects",
    },
    {
      id: "phases-in-progress",
      label: "Phases In Progress",
      value: 3,
      note: "Across 4 projects",
      tone: "green",
      targetHref: "/projects",
    },
    {
      id: "gates-pending-review",
      label: "Gates Pending Review",
      value: 5,
      note: "Awaiting decision",
      tone: "amber",
      targetHref: "/approvals",
    },
    {
      id: "missing-evidence",
      label: "Missing Evidence",
      value: 7,
      note: "Across 3 projects",
      tone: "red",
      targetHref: "/projects",
    },
    {
      id: "pending-approvals",
      label: "Pending Approvals",
      value: 5,
      note: "Requires your action",
      tone: "purple",
      targetHref: "/approvals",
    },
  ],
  lifecycleProgress: [
    { projectId: null, projectName: DASHBOARD_SAMPLE_PROJECTS[0], progressPercent: 65 },
    { projectId: null, projectName: DASHBOARD_SAMPLE_PROJECTS[1], progressPercent: 40 },
    { projectId: null, projectName: DASHBOARD_SAMPLE_PROJECTS[2], progressPercent: 20 },
    { projectId: null, projectName: DASHBOARD_SAMPLE_PROJECTS[3], progressPercent: 10 },
  ],
  gateStatuses: [
    { gateId: "G1", title: "Concept Approval", label: "Approved", count: 3, widthPercent: 100 },
    { gateId: "G2", title: "Feasibility Approval", label: "Pending", count: 0, widthPercent: 46 },
    { gateId: "G3", title: "Solution Approval", label: "Changes Requested", count: 1, widthPercent: 32 },
    { gateId: "G4", title: "Readiness Approval", label: "Pending", count: 0, widthPercent: 46 },
    { gateId: "G5", title: "Deployment Approval", label: "Pending", count: 0, widthPercent: 46 },
  ],
  nextActions: [
    {
      id: "next-1",
      title: "Review Gate G2",
      projectName: DASHBOARD_SAMPLE_PROJECTS[0],
      dueLabel: "Due Today",
      dueTone: "text-amber-700 bg-amber-50",
      targetHref: "/projects",
    },
    {
      id: "next-2",
      title: "Complete Artifact A-3.2",
      projectName: DASHBOARD_SAMPLE_PROJECTS[1],
      dueLabel: "Due in 2 days",
      dueTone: "text-blue-700 bg-blue-50",
      targetHref: "/projects",
    },
    {
      id: "next-3",
      title: "Provide Evidence",
      projectName: DASHBOARD_SAMPLE_PROJECTS[2],
      dueLabel: "Overdue",
      dueTone: "text-rose-700 bg-rose-50",
      targetHref: "/projects",
    },
  ],
  recentDecisions: [
    { id: "decision-1", gate: "G1", label: "Approved", projectName: DASHBOARD_SAMPLE_PROJECTS[0] },
    { id: "decision-2", gate: "G2", label: "Pending", projectName: DASHBOARD_SAMPLE_PROJECTS[1] },
    {
      id: "decision-3",
      gate: "G3",
      label: "Changes Requested",
      projectName: DASHBOARD_SAMPLE_PROJECTS[2],
    },
  ],
  projectSnapshots: [
    { projectId: null, name: DASHBOARD_SAMPLE_PROJECTS[0], phase: 6, gate: "G2", status: "In Progress" },
    { projectId: null, name: DASHBOARD_SAMPLE_PROJECTS[1], phase: 4, gate: "G1", status: "In Progress" },
    { projectId: null, name: DASHBOARD_SAMPLE_PROJECTS[2], phase: 2, gate: "G1", status: "Blocked" },
    { projectId: null, name: DASHBOARD_SAMPLE_PROJECTS[3], phase: 1, gate: "G1", status: "Pending" },
  ],
  tip: {
    message: "Keep your evidence and artifacts up to date to ensure smooth gate reviews.",
    ctaLabel: "View Lifecycle Guide",
    ctaHref: "/projects",
  },
};
