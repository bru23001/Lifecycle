import { notFound } from "next/navigation";

import { evaluateGateForProject, type GateId } from "@/lib/gateRules";
import { prisma } from "@/lib/prisma";
import {
  getGateVisualState,
  indexLatestGateDecisions,
  type GateDecisionRow,
} from "@/lib/gateStatus";
import { reportDetailPath } from "@/lib/reports-detail-paths";
import { mergeReportsFilters, reportsFiltersToSearchParams } from "@/lib/reports-url";
import { clampWorkspacePhase, workspacePhaseMeta } from "@/lib/workspacePhases";
import { templateRegistry } from "@/templates/registry";
import type { ReportsFilters, ReportsPageData } from "@/types/reports.types";

import {
  ALL_GATES,
  formatDateTimeLabel,
  isArtifactBodyApproved,
  projectDisplayCode,
} from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";

const TOTAL_PHASES = 14;

function resolveDateBounds(
  f: ReportsFilters,
): { from: Date; to: Date } | null {
  const to = new Date();
  const from = new Date();

  switch (f.dateRange) {
    case "this_week":
      from.setUTCDate(to.getUTCDate() - 7);
      break;
    case "this_month":
      from.setUTCDate(to.getUTCDate() - 30);
      break;
    case "this_quarter":
      from.setUTCDate(to.getUTCDate() - 90);
      break;
    case "this_year":
      from.setUTCDate(to.getUTCDate() - 365);
      break;
    case "custom":
      if (f.startDate && f.endDate) {
        return {
          from: new Date(f.startDate),
          to: new Date(f.endDate),
        };
      }
      return null;
    default:
      return null;
  }

  from.setUTCHours(0, 0, 0, 0);
  to.setUTCHours(23, 59, 59, 999);
  return { from, to };
}

function inBounds(d: Date, bounds: { from: Date; to: Date } | null): boolean {
  if (!bounds) return true;
  return d >= bounds.from && d <= bounds.to;
}

async function countBlockingGates(
  projectId: string,
  phase: number,
  gateScope?: GateId,
): Promise<number> {
  const gates = gateScope ? [gateScope] : ALL_GATES;
  let n = 0;
  for (const g of gates) {
    try {
      const ev = await evaluateGateForProject(projectId, g);
      const visual = getGateVisualState(phase, g);
      if (visual === "ready" && !ev.pass) n += 1;
    } catch {
      // ignore
    }
  }
  return n;
}

export async function loadReportsPageData(
  projectIdParam: string,
  filters?: ReportsFilters,
): Promise<ReportsPageData> {
  const resolvedId = await resolveProjectIdFromRouteParam(projectIdParam);
  if (!resolvedId) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: resolvedId },
    include: {
      artifacts: true,
      gateDecisions: { orderBy: { createdAt: "desc" } },
      traceLinks: true,
      evidenceItems: true,
    },
  });

  if (!project) {
    notFound();
  }

  const projectId = project.id;

  const f = filters ?? mergeReportsFilters(projectId);

  const bounds = resolveDateBounds(f);
  const gateScope =
    f.gateCode !== "all" && ALL_GATES.includes(f.gateCode as GateId)
      ? (f.gateCode as GateId)
      : undefined;

  const storedPhase = clampWorkspacePhase(project.currentPhase);
  const focusPhase =
    typeof f.phaseNumber === "number" ? f.phaseNumber : storedPhase;

  const decisionsFiltered = project.gateDecisions.filter((d) =>
    inBounds(d.createdAt, bounds),
  );
  const decisionsForGateIndex: GateDecisionRow[] = (
    bounds ? decisionsFiltered : project.gateDecisions
  ).map((d) => ({
    gateId: d.gateId,
    decision: d.decision,
    evidencePassSnapshot: d.evidencePassSnapshot,
    createdAt: d.createdAt,
  }));
  const latestByGate = indexLatestGateDecisions(decisionsForGateIndex);

  const gatesToScore = gateScope ? [gateScope] : ALL_GATES;

  let approved = 0;
  let pending = 0;
  let rejected = 0;
  let notReached = 0;

  for (const g of gatesToScore) {
    const latest = latestByGate.get(g);
    const visual = getGateVisualState(focusPhase, g, latestByGate);
    const passed =
      latest &&
      (latest.decision === "Accepted" || latest.decision === "Conditional") &&
      latest.evidencePassSnapshot;
    if (passed) {
      approved += 1;
      continue;
    }
    if (latest?.decision === "Rejected") {
      rejected += 1;
      continue;
    }
    if (visual === "ready") pending += 1;
    else notReached += 1;
  }

  const artifactsScoped = project.artifacts.filter((a) =>
    inBounds(a.createdAt, bounds),
  );

  // Artifact pipeline counts feed evidence-severity heuristics on the
  // missing-evidence summary. Drafts roll into "high" severity, in-review into
  // "medium". The rolled-up artifact-completion / evidence-completeness
  // dashboards are no longer surfaced in the six-report spec.
  const templateIds = Object.keys(templateRegistry);
  let inReview = 0;
  let draft = 0;

  const latestByTemplate = new Map<string, (typeof project.artifacts)[0]>();
  for (const a of artifactsScoped) {
    const prev = latestByTemplate.get(a.templateId);
    if (!prev || a.createdAt > prev.createdAt) latestByTemplate.set(a.templateId, a);
  }

  for (const tid of templateIds) {
    const art = latestByTemplate.get(tid);
    if (!art) {
      draft += 1;
      continue;
    }
    if (isArtifactBodyApproved(art.dataJson)) {
      continue;
    }
    if (art.status === "Submitted" || art.status === "InReview") {
      inReview += 1;
    } else if (art.status === "Draft") {
      draft += 1;
    }
  }

  const traceLinksScoped = project.traceLinks.filter((t) =>
    inBounds(t.createdAt, bounds),
  );
  const traceCount = traceLinksScoped.length;

  const reqCount = await prisma.requirement.count({ where: { projectId } });
  const featCount = await prisma.feature.count({ where: { projectId } });
  const expectedLinks = Math.max(reqCount + featCount, 1);
  const completeLinks = traceCount;
  const missingLinks = Math.max(0, expectedLinks - completeLinks);
  const coveragePercent = Math.min(
    100,
    Math.round((completeLinks / expectedLinks) * 100),
  );

  let evidenceItems = project.evidenceItems.filter((e) =>
    inBounds(e.createdAt, bounds),
  );
  if (typeof f.phaseNumber === "number") {
    evidenceItems = evidenceItems.filter((e) => e.phaseNumber === f.phaseNumber);
  }

  const partial = evidenceItems.filter((e) => e.status === "partially_linked").length;
  const unlinked = evidenceItems.filter((e) => e.status === "unlinked").length;

  const auditWhere: { projectId: string; createdAt?: { gte: Date; lte: Date } } = {
    projectId,
  };
  if (bounds) {
    auditWhere.createdAt = { gte: bounds.from, lte: bounds.to };
  }

  const [userDisplay, blockingGates, auditEntriesCount] = await Promise.all([
    getCurrentUserDisplay(),
    countBlockingGates(projectId, focusPhase, gateScope),
    prisma.auditEntry.count({ where: auditWhere }),
  ]);

  const phasesCompleted = Math.max(0, focusPhase - 1);
  const phasesNotStarted = Math.max(0, TOTAL_PHASES - focusPhase);
  const phasesInProgress = Math.min(
    1,
    TOTAL_PHASES - phasesCompleted - phasesNotStarted,
  );
  const meta = workspacePhaseMeta(focusPhase);
  const upcomingGate = meta.gate;

  const gateDecisionTotal = gateScope ? 1 : ALL_GATES.length;
  const approvalRatePercent =
    gateDecisionTotal > 0 ? Math.round((approved / gateDecisionTotal) * 100) : 0;

  let lastDecisionLabel: string | undefined;
  const sortedDecisions = [...decisionsFiltered].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  if (sortedDecisions[0]) {
    lastDecisionLabel = `${sortedDecisions[0].gateId} ${sortedDecisions[0].decision} ${formatDateTimeLabel(sortedDecisions[0].createdAt)}`;
  }

  const histApproved = decisionsFiltered.filter(
    (d) => d.decision === "Accepted" || d.decision === "Conditional",
  ).length;
  const histRejected = decisionsFiltered.filter((d) => d.decision === "Rejected").length;
  const histPending = pending;

  const artifactBytes = artifactsScoped.reduce(
    (acc, a) => acc + (a.markdownPath?.length ?? 0),
    0,
  );
  const estimatedFileCount =
    artifactsScoped.length + evidenceItems.length + traceLinksScoped.length;
  const estimatedSizeLabel =
    estimatedFileCount === 0 ? "—" : `${Math.max(1, Math.round(artifactBytes / 1024))} KB (est.)`;

  const blockersCount = blockingGates;

  const code = projectDisplayCode(project.vaultFolder, project.slug);
  const basePath = `/projects/${projectId}/reports`;
  const detail = (segment: Parameters<typeof reportDetailPath>[1]) =>
    reportDetailPath(projectId, segment);
  const nowLabel = formatDateTimeLabel(new Date());

  const filterQs = reportsFiltersToSearchParams({
    ...f,
    projectId,
    lastUpdatedLabel: nowLabel,
  }).toString();
  const exportQuery = filterQs ? `&${filterQs}` : "";

  const partialLinks = Math.min(
    traceCount,
    Math.max(0, Math.ceil(expectedLinks * 0.15)),
  );
  const orphanedItems = Math.min(
    missingLinks,
    Math.max(0, Math.floor(expectedLinks * 0.25)),
  );

  return {
    user: userDisplay,
    project: {
      id: project.id,
      code,
      name: project.name,
    },
    filters: {
      ...f,
      projectId,
      lastUpdatedLabel: nowLabel,
    },
    reports: {
      lifecycleStatus: {
        reportId: "report-lifecycle-status",
        overallProgressPercent: Math.round((focusPhase / TOTAL_PHASES) * 100),
        phasesCompleted,
        phasesInProgress,
        phasesNotStarted,
        totalPhases: TOTAL_PHASES,
        currentPhaseNumber: focusPhase,
        currentPhaseName: meta.title,
        upcomingGateCode: upcomingGate,
        blockersCount,
        lastGeneratedLabel: nowLabel,
        viewHref: detail("lifecycleStatus"),
        exportHref: `/api/projects/${projectId}/reports/export?key=lifecycleStatus&format=pdf${exportQuery}`,
      },
      gateDecision: {
        reportId: "report-gate-decisions",
        totalGates: gateDecisionTotal,
        approved,
        pending,
        rejected,
        notReached,
        approvalRatePercent,
        averageDecisionDays: undefined,
        lastDecisionLabel,
        lastGeneratedLabel: nowLabel,
        viewHref: detail("gateDecisions"),
        exportHref: `/api/projects/${projectId}/reports/export?key=gateDecision&format=pdf${exportQuery}`,
      },
      traceability: {
        reportId: "report-traceability",
        coveragePercent,
        completeLinks,
        partialLinks,
        missingLinks,
        orphanedItems,
        criticalGaps: blockingGates > 0 ? Math.min(3, blockingGates) : 0,
        lastGeneratedLabel: nowLabel,
        viewHref: detail("traceability"),
        exportHref: `/api/projects/${projectId}/reports/export?key=traceability&format=pdf${exportQuery}`,
      },
      missingEvidence: {
        reportId: "report-missing-evidence",
        missingItems: unlinked,
        orphanedItems,
        incompleteItems: partial,
        critical: blockingGates > 2 ? 2 : blockingGates,
        high: Math.min(7, draft),
        medium: Math.min(8, inReview),
        low: Math.min(5, partial),
        blockingGates,
        lastGeneratedLabel: nowLabel,
        viewHref: detail("missingEvidence"),
        exportHref: `/api/projects/${projectId}/reports/export?key=missingEvidence&format=csv${exportQuery}`,
      },
      approvalHistory: {
        reportId: "report-approval-history",
        totalDecisions: decisionsFiltered.length,
        approved: histApproved,
        changesRequested: decisionsFiltered.filter((d) => d.decision === "Returned").length,
        rejected: histRejected,
        pending: histPending,
        averageReviewTimeHours: undefined,
        lastApprovalLabel: lastDecisionLabel,
        lastGeneratedLabel: nowLabel,
        viewHref: detail("approvalHistory"),
        exportHref: `/api/projects/${projectId}/reports/export?key=approvalHistory&format=pdf${exportQuery}`,
      },
      fullProjectEvidencePackage: {
        reportId: "report-full-evidence-package",
        includesArtifacts: artifactsScoped.length > 0,
        includesEvidenceFiles: evidenceItems.length > 0,
        includesGateDecisions: decisionsFiltered.length > 0,
        includesTraceabilityLinks: traceLinksScoped.length > 0,
        includesApprovalRecords: decisionsFiltered.length > 0,
        includesAuditManifest: true,
        sectionCounts: {
          artifacts: artifactsScoped.length,
          evidenceFiles: evidenceItems.length,
          gateDecisions: decisionsFiltered.length,
          traceabilityLinks: traceLinksScoped.length,
          approvalRecords: decisionsFiltered.length,
          auditEntries: auditEntriesCount,
        },
        estimatedSizeLabel,
        estimatedFileCount,
        lastGeneratedLabel: nowLabel,
        viewHref: detail("evidencePackage"),
        configureHref: `${detail("evidencePackage")}/configure`,
        exportHref: `/api/projects/${projectId}/reports/export?key=fullProjectEvidencePackage&format=zip${exportQuery}`,
      },
    },
    actionState: {
      title: "Reports are ready for governance review.",
      description:
        "Choose a report above to view, filter, and export lifecycle data for governance and compliance.",
      canScheduleReports: true,
      canRefreshReports: true,
      scheduleHref: `${basePath}/schedule`,
      refreshActionId: "refresh-all-reports",
    },
  };
}
