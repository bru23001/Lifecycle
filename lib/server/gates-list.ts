import { evaluateGateForProject } from "@/lib/gateRules";
import type { GateId } from "@/lib/gateRules";
import {
  getGateVisualState,
  indexLatestGateDecisions,
  nextOpenGateForPhase,
  type GateDecisionRow,
} from "@/lib/gateStatus";
import { ALL_GATES, projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { prisma } from "@/lib/prisma";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { clampWorkspacePhase, gateHeaderDisplayName } from "@/lib/workspacePhases";

export type GatesListRow = {
  gateId: GateId;
  title: string;
  reviewHref: string;
  visualState: ReturnType<typeof getGateVisualState>;
  decisionSummary: string;
  evidenceChecksPassing: number;
  evidenceChecksTotal: number;
  rulesPass: boolean;
};

export type GatesListScreenData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; name: string; code: string };
  currentPhase: number;
  rows: GatesListRow[];
  nextReviewHref: string;
};

function decisionSummaryFromRow(row: GateDecisionRow | undefined): string {
  if (!row) return "No decision recorded";
  const ev = row.evidencePassSnapshot ? "Evidence gate cleared" : "Evidence still open";
  return `${row.decision} · ${ev}`;
}

export async function loadGatesListScreen(projectParam: string): Promise<GatesListScreenData | null> {
  const resolvedId = await resolveProjectIdFromRouteParam(projectParam);
  if (!resolvedId) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: resolvedId },
    select: {
      id: true,
      name: true,
      slug: true,
      vaultFolder: true,
      currentPhase: true,
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        select: {
          gateId: true,
          decision: true,
          evidencePassSnapshot: true,
          createdAt: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  const user = await getCurrentUserDisplay();
  const decisionsRows: GateDecisionRow[] = project.gateDecisions.map((d) => ({
    gateId: d.gateId,
    decision: d.decision,
    evidencePassSnapshot: d.evidencePassSnapshot,
    createdAt: d.createdAt,
  }));
  const latestByGate = indexLatestGateDecisions(decisionsRows);
  const currentPhase = clampWorkspacePhase(project.currentPhase);

  const evaluations = await Promise.all(
    ALL_GATES.map((gateId) => evaluateGateForProject(project.id, gateId)),
  );

  const rows: GatesListRow[] = ALL_GATES.map((gateId, i) => {
    const evaluation = evaluations[i]!;
    const latest = latestByGate.get(gateId);
    const passing = evaluation.checks.filter((c) => c.ok).length;
    const total = evaluation.checks.length;
    return {
      gateId,
      title: gateHeaderDisplayName(gateId),
      reviewHref: `/projects/${project.id}/gates/${gateId.toLowerCase()}/review`,
      visualState: getGateVisualState(currentPhase, gateId, latestByGate),
      decisionSummary: decisionSummaryFromRow(latest),
      evidenceChecksPassing: passing,
      evidenceChecksTotal: total,
      rulesPass: evaluation.pass,
    };
  });

  const nextReviewHref = `/projects/${project.id}/gates/${nextOpenGateForPhase(currentPhase, latestByGate).toLowerCase()}/review`;

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      name: project.name,
      code: projectDisplayCode(project.vaultFolder, project.slug),
    },
    currentPhase,
    rows,
    nextReviewHref,
  };
}
