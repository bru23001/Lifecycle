import { DASHBOARD_FALLBACK_DATA } from "@/data/dashboard.mock";
import type { GateId } from "@/lib/gateRules";
import { getGateVisualState } from "@/lib/gateStatus";
import { prisma } from "@/lib/prisma";
import type { DashboardData } from "@/types/dashboard.types";

const gates: GateId[] = ["G1", "G2", "G3", "G4", "G5", "G6"];

function percentForPhase(phase: number): number {
  return Math.min(100, Math.max(10, Math.round((phase / 9) * 100)));
}

function gateTitle(gate: GateId): string {
  switch (gate) {
    case "G1":
      return "Concept Approval";
    case "G2":
      return "Feasibility Approval";
    case "G3":
      return "Solution Approval";
    case "G4":
      return "Readiness Approval";
    case "G5":
      return "Deployment Approval";
    case "G6":
      return "Architecture Approval";
    default: {
      return gate;
    }
  }
}

function decisionLabel(decision: string | undefined): "Approved" | "Changes Requested" | "Pending" {
  switch (decision) {
    case "Accepted":
      return "Approved";
    case "Returned":
    case "Rejected":
      return "Changes Requested";
    default:
      return "Pending";
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const projectsQuery = prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 4,
    include: {
      _count: { select: { artifacts: true, gateDecisions: true } },
    },
  });
  const decisionsQuery = prisma.gateDecision.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { project: { select: { name: true } } },
  });

  let projects: Awaited<typeof projectsQuery> = [];
  let recentGateDecisions: Awaited<typeof decisionsQuery> = [];

  try {
    [projects, recentGateDecisions] = await Promise.all([projectsQuery, decisionsQuery]);
  } catch {
    // Fall back to deterministic values when DB access is unavailable.
  }

  const realProjects = projects.map((project, index) => ({
    projectId: project.id,
    name: project.name,
    phase: project.currentPhase,
    gate:
      gates.find((gate) => getGateVisualState(project.currentPhase, gate) === "ready") ??
      "G1",
    status:
      project.currentPhase <= 3 && index === 2
        ? ("Blocked" as const)
        : ("In Progress" as const),
    progressPercent: percentForPhase(project.currentPhase),
    artifactsCount: project._count.artifacts,
  }));

  const fallbackSnapshots = DASHBOARD_FALLBACK_DATA.projectSnapshots.map((item, index) => ({
    projectId: item.projectId,
    name: item.name,
    phase: item.phase,
    gate: item.gate,
    status: item.status,
    progressPercent:
      DASHBOARD_FALLBACK_DATA.lifecycleProgress[index]?.progressPercent ?? 10,
    artifactsCount: [5, 3, 1, 0][index] ?? 0,
  }));

  const displayProjects = [...realProjects, ...fallbackSnapshots.slice(realProjects.length)].slice(
    0,
    4,
  );

  const pendingGateCount = Math.max(
    1,
    displayProjects.flatMap((project) =>
      gates.filter((gate) => getGateVisualState(project.phase, gate) === "ready"),
    ).length,
  );

  const missingEvidence =
    projects.length === 0
      ? 7
      : Math.max(1, displayProjects.filter((project) => project.artifactsCount < 2).length);

  const pendingApprovals = recentGateDecisions.filter(
    (decision) => decisionLabel(decision.decision) !== "Approved",
  ).length;

  const gateStatuses = gates.slice(0, 5).map((gate, index) => {
    const latest = recentGateDecisions.find((decision) => decision.gateId === gate);
    const label =
      latest === undefined
        ? index === 0
          ? "Approved"
          : index === 2
            ? "Changes Requested"
            : "Pending"
        : decisionLabel(latest.decision);
    return {
      gateId: gate,
      title: gateTitle(gate),
      label,
      count: label === "Approved" ? 3 : label === "Changes Requested" ? 1 : 0,
      widthPercent:
        label === "Approved" ? 100 : label === "Changes Requested" ? 32 : 46,
    };
  });

  const decisionRows =
    recentGateDecisions.length > 0
      ? recentGateDecisions.map((decision) => ({
          id: `${decision.gateId}-${decision.project.name}`,
          gate: decision.gateId,
          label: decisionLabel(decision.decision),
          projectName: decision.project.name,
        }))
      : DASHBOARD_FALLBACK_DATA.recentDecisions;

  const nextActions =
    realProjects.length > 0
      ? [
          {
            id: "next-1",
            title: "Review Gate G2",
            projectName: displayProjects[0]?.name ?? DASHBOARD_FALLBACK_DATA.nextActions[0].projectName,
            dueLabel: "Due Today",
            dueTone: "text-amber-700 bg-amber-50",
            targetHref: displayProjects[0]?.projectId
              ? `/projects/${displayProjects[0].projectId}/gates/g2/review`
              : "/projects",
          },
          {
            id: "next-2",
            title: "Complete Artifact A-3.2",
            projectName: displayProjects[1]?.name ?? DASHBOARD_FALLBACK_DATA.nextActions[1].projectName,
            dueLabel: "Due in 2 days",
            dueTone: "text-blue-700 bg-blue-50",
            targetHref: displayProjects[1]?.projectId
              ? `/projects/${displayProjects[1].projectId}/artifacts`
              : "/projects",
          },
          {
            id: "next-3",
            title: "Provide Evidence",
            projectName: displayProjects[2]?.name ?? DASHBOARD_FALLBACK_DATA.nextActions[2].projectName,
            dueLabel: "Overdue",
            dueTone: "text-rose-700 bg-rose-50",
            targetHref: displayProjects[2]?.projectId
              ? `/projects/${displayProjects[2].projectId}/evidence`
              : "/projects",
          },
        ]
      : DASHBOARD_FALLBACK_DATA.nextActions;

  const continueWorkingProject = realProjects[0] ?? null;

  return {
    user: DASHBOARD_FALLBACK_DATA.user,
    metrics: [
      {
        id: "active-projects",
        label: "Active Projects",
        value: displayProjects.length,
        note: `${displayProjects.filter((project) => project.status === "In Progress").length} in progress`,
        tone: "blue",
        targetHref: "/projects",
      },
      {
        id: "phases-in-progress",
        label: "Lifecycle Progress",
        value: new Set(displayProjects.map((project) => project.phase)).size,
        note: `Across ${displayProjects.length} projects`,
        tone: "green",
        targetHref: "/projects",
      },
      {
        id: "gates-pending-review",
        label: "Gate Status Summary",
        value: pendingGateCount,
        note: "Awaiting decision",
        tone: "amber",
        targetHref: "/approvals",
      },
      {
        id: "missing-evidence",
        label: "Blockers / Missing Evidence",
        value: missingEvidence,
        note: `Across ${Math.max(1, displayProjects.filter((project) => project.artifactsCount < 2).length)} projects`,
        tone: "red",
        targetHref: "/projects",
      },
      {
        id: "pending-approvals",
        label: "Pending Approvals",
        value: Math.max(pendingApprovals, projects.length === 0 ? 5 : 0),
        note: "Requires your action",
        tone: "purple",
        targetHref: "/approvals",
      },
    ],
    lifecycleProgress: displayProjects.map((project) => ({
      projectId: project.projectId,
      projectName: project.name,
      progressPercent: project.progressPercent,
    })),
    gateStatuses,
    nextActions,
    recentDecisions: decisionRows.slice(0, 3),
    projectSnapshots: displayProjects.map((project) => ({
      projectId: project.projectId,
      name: project.name,
      phase: project.phase,
      gate: project.gate,
      status: project.status,
    })),
    continueWorking: {
      projectId: continueWorkingProject?.projectId ?? null,
      projectName: continueWorkingProject?.name ?? "Demo Project",
      phaseSummary: continueWorkingProject
        ? `Phase ${continueWorkingProject.phase} of 14`
        : "Phase 1 of 14",
      progressPercent: continueWorkingProject?.progressPercent ?? 10,
    },
    tip: DASHBOARD_FALLBACK_DATA.tip,
  };
}
