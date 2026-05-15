import {
  getGateVisualState,
  indexLatestGateDecisions,
  nextOpenGateForPhase,
} from "@/lib/gateStatus";
import { prisma } from "@/lib/prisma";
import { projectAuditTrailListHref } from "@/lib/projects-url";
import { ALL_GATES } from "@/lib/server/helpers";
import {
  WORKSPACE_PHASE_MAX,
  gateHeaderDisplayName,
  workspacePhaseProgressPercent,
} from "@/lib/workspacePhases";
import type { DashboardData } from "@/types/dashboard.types";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { resolveContinueNextActionHref } from "@/lib/continue-next-action-href";
import { OPEN_APPROVAL_STATUSES } from "@/lib/server/approval-writes";
import { buildDashboardSettingsAlerts } from "@/lib/dashboard-settings-alerts";
import { decisionLabelFromStatus, resolveRecentDecisionHref } from "@/lib/recent-decision-href";

const DEFAULT_DASHBOARD_TIP: DashboardData["tip"] = {
  message: "Keep your evidence and artifacts up to date to ensure smooth gate reviews.",
  ctaLabel: "View projects",
  ctaHref: "/projects",
};

function percentForPhase(phase: number): number {
  return workspacePhaseProgressPercent(phase);
}

function decisionLabel(decision: string | undefined): "Approved" | "Changes Requested" | "Pending" {
  return decisionLabelFromStatus(decision ?? "");
}

export async function getDashboardData(): Promise<DashboardData> {
  const userDisplay = await getCurrentUserDisplay();

  const projectsQuery = prisma.project.findMany({
    where: { archivedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 4,
    include: {
      _count: { select: { artifacts: true, gateDecisions: true, auditEntries: true } },
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
    include: { project: { select: { id: true, name: true } } },
  });
  const decisionsForGateSummaryQuery = prisma.gateDecision.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      gateId: true,
      decision: true,
      projectId: true,
      createdAt: true,
    },
  });
  const approvalsForRecentQuery = prisma.approval.findMany({
    where: {
      status: { in: ["approved", "changes_requested", "rejected"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      projectId: true,
      gateId: true,
      status: true,
      updatedAt: true,
      project: { select: { name: true } },
    },
  });
  const auditForRecentQuery = prisma.auditEntry.findMany({
    where: {
      subjectKind: { in: ["gate_decision", "approval"] },
      projectId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      projectId: true,
      action: true,
      createdAt: true,
      project: { select: { name: true } },
    },
  });
  const firstGlobalPendingApprovalQuery = prisma.approval.findFirst({
    where: { status: { in: [...OPEN_APPROVAL_STATUSES] } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const openApprovalsCountQuery = prisma.approval.count({
    where: { status: { in: [...OPEN_APPROVAL_STATUSES] } },
  });

  let projects: Awaited<typeof projectsQuery> = [];
  let recentGateDecisions: Awaited<typeof decisionsQuery> = [];
  let gateSummaryDecisions: Awaited<typeof decisionsForGateSummaryQuery> = [];
  let recentApprovals: Awaited<typeof approvalsForRecentQuery> = [];
  let recentAudit: Awaited<typeof auditForRecentQuery> = [];
  let firstGlobalPendingApproval: { id: string } | null = null;
  let openApprovalsCount = 0;

  try {
    [
      projects,
      recentGateDecisions,
      gateSummaryDecisions,
      recentApprovals,
      recentAudit,
      firstGlobalPendingApproval,
      openApprovalsCount,
    ] = await Promise.all([
      projectsQuery,
      decisionsQuery,
      decisionsForGateSummaryQuery,
      approvalsForRecentQuery,
      auditForRecentQuery,
      firstGlobalPendingApprovalQuery,
      openApprovalsCountQuery,
    ]);
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
      auditEventCount: project._count.auditEntries,
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
    const latest = gateSummaryDecisions.find((decision) => decision.gateId === gate);
    const leadId = displayProjects[0]?.projectId ?? null;
    if (latest === undefined) {
      return {
        gateId: gate,
        title: gateHeaderDisplayName(gate),
        label: "Pending" as const,
        count: 0,
        widthPercent: 0,
        reviewProjectId: leadId,
      };
    }
    const label = decisionLabel(latest.decision);
    return {
      gateId: gate,
      title: gateHeaderDisplayName(gate),
      label,
      count: label === "Approved" ? 1 : label === "Changes Requested" ? 1 : 0,
      widthPercent: label === "Approved" ? 100 : label === "Changes Requested" ? 32 : 46,
      reviewProjectId: latest.projectId,
    };
  });

  const decisionRows = [
    ...recentGateDecisions.map((decision) => ({
      id: `gate-${decision.id}`,
      gate: decision.gateId,
      label: decisionLabel(decision.decision),
      projectName: decision.project.name,
      createdAtMs: decision.createdAt.getTime(),
      targetType: "gate_review" as const,
      targetHref: resolveRecentDecisionHref({
        targetType: "gate_review",
        projectId: decision.projectId,
        gateId: decision.gateId,
      }),
    })),
    ...recentApprovals.map((approval) => ({
      id: `approval-${approval.id}`,
      gate: approval.gateId ?? "APPROVAL",
      label: decisionLabelFromStatus(approval.status),
      projectName: approval.project?.name ?? "Unknown project",
      createdAtMs: approval.updatedAt.getTime(),
      targetType: "approval_detail" as const,
      targetHref: resolveRecentDecisionHref({
        targetType: "approval_detail",
        approvalId: approval.id,
      }),
    })),
    ...recentAudit.map((audit) => ({
      id: `audit-${audit.id}`,
      gate: "AUDIT",
      label: decisionLabelFromStatus(audit.action),
      projectName: audit.project?.name ?? "Unknown project",
      createdAtMs: audit.createdAt.getTime(),
      targetType: "audit_detail" as const,
      targetHref: resolveRecentDecisionHref({
        targetType: "audit_detail",
        projectId: audit.projectId,
        auditEventId: audit.id,
      }),
    })),
  ]
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 3)
    .map((row) => ({
      id: row.id,
      gate: row.gate,
      label: row.label,
      projectName: row.projectName,
      targetType: row.targetType,
      targetHref: row.targetHref,
    }));

  const leadProject = displayProjects[0];
  const leadGate = leadProject
    ? nextOpenGateForPhase(leadProject.phase, leadProject.latestByGate)
    : "G1";
  const gateSummaryProjectId = leadProject?.projectId ?? null;
  const gateSummaryDefaultReviewHref =
    leadProject?.projectId != null
      ? `/projects/${leadProject.projectId}/gates/${leadGate.toLowerCase()}/review`
      : null;
  const gateSummaryAllGatesHref =
    leadProject?.projectId != null
      ? `/projects/${leadProject.projectId}?tab=gates`
      : null;
  const leadProjectAuditTrailHref =
    leadProject?.projectId != null ? projectAuditTrailListHref(leadProject.projectId) : null;
  // Keep the alternative link disabled until the project-scoped approval history route exists.
  const recentDecisionsProjectApprovalHistoryHref = null;
  const blockersOverviewHref =
    leadProject?.projectId != null
      ? missingEvidence > 0
        ? `/projects/${leadProject.projectId}/evidence`
        : `/projects/${leadProject.projectId}/traceability`
      : "/projects";
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

  let continueNextHref: string | null = null;
  if (continueWorkingProject?.projectId) {
    continueNextHref = `/projects/${continueWorkingProject.projectId}/workspace`;
    try {
      const [openApproval, leadDetail] = await Promise.all([
        prisma.approval.findFirst({
          where: {
            projectId: continueWorkingProject.projectId,
            status: { in: [...OPEN_APPROVAL_STATUSES] },
          },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        }),
        prisma.project.findUnique({
          where: { id: continueWorkingProject.projectId },
          select: {
            id: true,
            currentPhase: true,
            applicabilityJson: true,
            artifacts: {
              select: {
                id: true,
                templateId: true,
                version: true,
                status: true,
                updatedAt: true,
                markdownPath: true,
              },
              orderBy: { updatedAt: "desc" },
            },
          },
        }),
      ]);
      if (leadDetail) {
        continueNextHref = resolveContinueNextActionHref({
          projectId: leadDetail.id,
          currentPhase: leadDetail.currentPhase,
          applicabilityJson: leadDetail.applicabilityJson,
          artifacts: leadDetail.artifacts,
          latestByGate: continueWorkingProject.latestByGate,
          firstOpenApprovalId: openApproval?.id ?? null,
        });
      }
    } catch {
      // keep workspace fallback
    }
  }

  const inProgressCount = displayProjects.filter((project) => project.status === "In Progress").length;
  const distinctPhases = new Set(displayProjects.map((project) => project.phase)).size;

  let settingsAlerts = buildDashboardSettingsAlerts({
    lifecycleNonActive: 0,
    templateAttention: 0,
    gateNonActive: 0,
  });
  try {
    const [lifecycleNonActive, templateAttention, gateNonActive] = await Promise.all([
      prisma.lifecyclePhaseConfig.count({ where: { NOT: { status: "active" } } }),
      prisma.templateRegistryEntry.count({
        where: { status: { in: ["draft", "deprecated"] } },
      }),
      prisma.gateRuleConfig.count({ where: { NOT: { status: "active" } } }),
    ]);
    settingsAlerts = buildDashboardSettingsAlerts({
      lifecycleNonActive,
      templateAttention,
      gateNonActive,
    });
  } catch {
    settingsAlerts = [];
  }

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
        targetHref:
          leadProject?.projectId != null
            ? `/projects/${leadProject.projectId}/workspace?phase=${leadProject.phase}`
            : "/projects",
        value: hasProjects ? distinctPhases : 0,
      },
      {
        id: "gates-pending-review",
        label: "Gate Status Summary",
        value: pendingGateCount,
        note: hasProjects ? "Awaiting decision" : "No gates in flight",
        tone: "amber",
        targetHref: gateSummaryDefaultReviewHref ?? "/approvals",
      },
      {
        id: "missing-evidence",
        label: "Blockers / Missing Evidence",
        value: missingEvidence,
        note: hasProjects
          ? `Across ${displayProjects.filter((project) => project.artifactsCount < 2).length} projects`
          : "Nothing to report",
        tone: "red",
        targetHref: blockersOverviewHref,
      },
      {
        id: "pending-approvals",
        label: "Pending Approvals",
        value: openApprovalsCount > 0 ? openApprovalsCount : pendingApprovals,
        note:
          openApprovalsCount > 0
            ? "Requires your action"
            : pendingApprovals > 0
              ? "Gate decisions in flight"
              : "You are up to date",
        tone: "purple",
        targetHref: "/approvals",
      },
    ],
    lifecycleProgress: displayProjects.map((project) => ({
      projectId: project.projectId,
      projectName: project.name,
      currentPhase: project.phase,
      progressPercent: project.progressPercent,
    })),
    gateStatuses,
    gateSummaryProjectId,
    gateSummaryDefaultReviewHref,
    gateSummaryAllGatesHref,
    recentDecisionsProjectApprovalHistoryHref,
    leadProjectAuditTrailHref,
    firstPendingApprovalId: firstGlobalPendingApproval?.id ?? null,
    openApprovalsCount,
    nextActions,
    recentDecisions: decisionRows.slice(0, 3),
    projectSnapshots: displayProjects.map((project) => ({
      projectId: project.projectId,
      name: project.name,
      phase: project.phase,
      gate: project.gate,
      status: project.status,
      auditEventCount: project.auditEventCount,
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
      continueNextHref,
    },
    tip:
      hasProjects && settingsAlerts.length > 0
        ? {
            message:
              "Platform configuration needs attention — review lifecycle phases, template registry, or gate rules before teams rely on them.",
            ctaLabel: "Open settings",
            ctaHref: "/settings/lifecycle",
          }
        : hasProjects
          ? DEFAULT_DASHBOARD_TIP
          : {
              message:
                "Start by creating a project. Your dashboard will fill in as artifacts, gates, and decisions accumulate.",
              ctaLabel: "Create project",
              ctaHref: "/projects/new",
            },
    settingsAlerts,
  };
}
