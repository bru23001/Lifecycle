import {
  getGateVisualState,
  indexLatestGateDecisions,
  nextOpenGateForPhase,
} from "@/lib/gateStatus";
import { prisma } from "@/lib/prisma";
import { ALL_GATES } from "@/lib/server/helpers";
import {
  WORKSPACE_PHASE_MAX,
  gateHeaderDisplayName,
  workspacePhaseProgressPercent,
} from "@/lib/workspacePhases";
import type { DashboardData } from "@/types/dashboard.types";
import { getCurrentUserDisplay } from "@/lib/server/current-user";

const DEFAULT_DASHBOARD_TIP: DashboardData["tip"] = {
  message: "Keep your evidence and artifacts up to date to ensure smooth gate reviews.",
  ctaLabel: "View projects",
  ctaHref: "/projects",
};

function percentForPhase(phase: number): number {
  return workspacePhaseProgressPercent(phase);
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
  const userDisplay = await getCurrentUserDisplay();

  const projectsQuery = prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 4,
    include: {
      _count: { select: { artifacts: true, gateDecisions: true } },
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          gateId: true,
          decision: true,
          evidencePassSnapshot: true,
          createdAt: true,
        },
      },
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
    // Leave empty when DB access fails; UI shows empty states.
  }

  const realProjects = projects.map((project) => {
    const latestByGate = indexLatestGateDecisions(
      project.gateDecisions.map((d) => ({
        gateId: d.gateId,
        decision: d.decision,
        evidencePassSnapshot: d.evidencePassSnapshot,
        createdAt: d.createdAt,
      })),
    );
    return {
      projectId: project.id,
      name: project.name,
      phase: project.currentPhase,
      gate: nextOpenGateForPhase(project.currentPhase, latestByGate),
      status: "In Progress" as const,
      progressPercent: percentForPhase(project.currentPhase),
      artifactsCount: project._count.artifacts,
      latestByGate,
    };
  });

  const displayProjects = realProjects.slice(0, 4);
  const hasProjects = displayProjects.length > 0;

  const pendingGateCount = hasProjects
    ? displayProjects.reduce(
        (acc, project) =>
          acc +
          ALL_GATES.filter(
            (gate) => getGateVisualState(project.phase, gate, project.latestByGate) === "ready",
          ).length,
        0,
      )
    : 0;

  const missingEvidence = hasProjects
    ? Math.max(0, displayProjects.filter((project) => project.artifactsCount < 2).length)
    : 0;

  const pendingApprovals = recentGateDecisions.filter(
    (decision) => decisionLabel(decision.decision) !== "Approved",
  ).length;

  const gateStatuses = ALL_GATES.slice(0, 5).map((gate) => {
    const latest = recentGateDecisions.find((decision) => decision.gateId === gate);
    if (latest === undefined) {
      return {
        gateId: gate,
        title: gateHeaderDisplayName(gate),
        label: "Pending" as const,
        count: 0,
        widthPercent: 0,
      };
    }
    const label = decisionLabel(latest.decision);
    return {
      gateId: gate,
      title: gateHeaderDisplayName(gate),
      label,
      count: label === "Approved" ? 1 : label === "Changes Requested" ? 1 : 0,
      widthPercent: label === "Approved" ? 100 : label === "Changes Requested" ? 32 : 46,
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
      : [];

  const leadProject = displayProjects[0];
  const leadGate = leadProject
    ? nextOpenGateForPhase(leadProject.phase, leadProject.latestByGate)
    : "G1";
  const nextActions =
    realProjects.length > 0 && leadProject
      ? [
          {
            id: "next-1",
            title: `Review Gate ${leadGate}`,
            projectName: leadProject.name,
            dueLabel: "Due Today",
            dueTone: "text-amber-700 bg-amber-50",
            targetHref: leadProject.projectId
              ? `/projects/${leadProject.projectId}/gates/${leadGate.toLowerCase()}/review`
              : "/projects",
          },
          {
            id: "next-2",
            title: "Complete pending artifacts",
            projectName: displayProjects[1]?.name ?? leadProject.name,
            dueLabel: "Due in 2 days",
            dueTone: "text-blue-700 bg-blue-50",
            targetHref:
              displayProjects[1]?.projectId != null
                ? `/projects/${displayProjects[1].projectId}/artifacts`
                : leadProject.projectId
                  ? `/projects/${leadProject.projectId}/artifacts`
                  : "/projects",
          },
          {
            id: "next-3",
            title: "Provide Evidence",
            projectName: displayProjects[2]?.name ?? leadProject.name,
            dueLabel: "Overdue",
            dueTone: "text-rose-700 bg-rose-50",
            targetHref:
              displayProjects[2]?.projectId != null
                ? `/projects/${displayProjects[2].projectId}/evidence`
                : leadProject.projectId
                  ? `/projects/${leadProject.projectId}/evidence`
                  : "/projects",
          },
        ]
      : [];

  const continueWorkingProject = realProjects[0] ?? null;

  const inProgressCount = displayProjects.filter((project) => project.status === "In Progress").length;
  const distinctPhases = new Set(displayProjects.map((project) => project.phase)).size;

  return {
    user: {
      name: userDisplay.name,
      role: userDisplay.role,
      initials: userDisplay.initials,
    },
    metrics: [
      {
        id: "active-projects",
        label: "Active Projects",
        value: displayProjects.length,
        note: hasProjects ? `${inProgressCount} in progress` : "Create a project to begin",
        tone: "blue",
        targetHref: "/projects",
      },
      {
        id: "phases-in-progress",
        label: "Lifecycle Progress",
        note: hasProjects ? `Across ${displayProjects.length} projects` : "No lifecycle data yet",
        tone: "green",
        targetHref: "/projects",
        value: hasProjects ? distinctPhases : 0,
      },
      {
        id: "gates-pending-review",
        label: "Gate Status Summary",
        value: pendingGateCount,
        note: hasProjects ? "Awaiting decision" : "No gates in flight",
        tone: "amber",
        targetHref: "/approvals",
      },
      {
        id: "missing-evidence",
        label: "Blockers / Missing Evidence",
        value: missingEvidence,
        note: hasProjects
          ? `Across ${displayProjects.filter((project) => project.artifactsCount < 2).length} projects`
          : "Nothing to report",
        tone: "red",
        targetHref: "/projects",
      },
      {
        id: "pending-approvals",
        label: "Pending Approvals",
        value: pendingApprovals,
        note: pendingApprovals > 0 ? "Requires your action" : "You are up to date",
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
      projectName: continueWorkingProject?.name ?? "",
      phaseSummary: continueWorkingProject
        ? `Phase ${continueWorkingProject.phase} of ${WORKSPACE_PHASE_MAX}`
        : "No active project",
      progressPercent: continueWorkingProject?.progressPercent ?? 0,
      currentPhase: continueWorkingProject?.phase ?? null,
      gatesHref:
        continueWorkingProject?.projectId != null
          ? `/projects/${continueWorkingProject.projectId}/gates/${nextOpenGateForPhase(
              continueWorkingProject.phase,
              continueWorkingProject.latestByGate,
            ).toLowerCase()}/review`
          : null,
    },
    tip: hasProjects
      ? DEFAULT_DASHBOARD_TIP
      : {
          message: "Start by creating a project. Your dashboard will fill in as artifacts, gates, and decisions accumulate.",
          ctaLabel: "Create project",
          ctaHref: "/projects?new=1",
        },
  };
}
