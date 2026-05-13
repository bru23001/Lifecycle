import { evaluateGateForProject } from "@/lib/gateRules";
import type { GateId } from "@/lib/gateRules";
import {
  getGateVisualState,
  indexLatestGateDecisions,
  nextOpenGateForPhase,
  type GateDecisionRow,
} from "@/lib/gateStatus";
import { ALL_GATES, formatDateTimeLabel, projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { prisma } from "@/lib/prisma";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { clampWorkspacePhase, gateHeaderDisplayName } from "@/lib/workspacePhases";

/**
 * Immutable snapshot of a recorded gate decision used by the gates-list
 * "View Decision Record" drawer.
 *
 * - Strictly read-only (no mutation actions surface in the drawer).
 * - CYBERCUBE 3.3 (Data Classification): treat as CON-class — never log raw
 *   comments fields client-side; surfaces them only inside the drawer.
 */
export type GateDecisionRecordSnapshot = {
  gateDecisionId: string;
  gateId: GateId;
  decisionLabel: string;
  decidedByName: string;
  decidedByRole: string;
  decidedOnLabel: string;
  decidedOnIso: string;
  comments: string;
  conditions: string[];
  evidenceSnapshot: {
    passed: boolean;
    label: string;
  };
  /** Deep-link to the corresponding `AuditEntry` for this decision. */
  auditEntryId: string | null;
  auditHref: string | null;
};

export type GatesListRow = {
  gateId: GateId;
  title: string;
  reviewHref: string;
  visualState: ReturnType<typeof getGateVisualState>;
  decisionSummary: string;
  evidenceChecksPassing: number;
  evidenceChecksTotal: number;
  rulesPass: boolean;
  /** Present only when a `GateDecision` has been recorded for this gate. */
  decisionRecord: GateDecisionRecordSnapshot | null;
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

type StoredGateDecision = {
  id: string;
  gateId: string;
  decision: string;
  authorityName: string;
  authorityRole: string;
  nextAction: string;
  evidencePassSnapshot: boolean;
  createdAt: Date;
};

/**
 * Builds the immutable `GateDecisionRecordSnapshot` consumed by the
 * "View Decision Record" drawer. Pure function so the same logic can be
 * unit-tested independently of Prisma.
 */
export function buildDecisionRecordSnapshot(
  projectId: string,
  gateId: GateId,
  row: StoredGateDecision,
  auditByDecisionId: Map<string, string>,
): GateDecisionRecordSnapshot {
  const auditEntryId = auditByDecisionId.get(row.id) ?? null;
  return {
    gateDecisionId: row.id,
    gateId,
    decisionLabel: row.decision,
    decidedByName: row.authorityName,
    decidedByRole: row.authorityRole,
    decidedOnLabel: formatDateTimeLabel(row.createdAt),
    decidedOnIso: row.createdAt.toISOString(),
    comments: row.nextAction,
    // Conditions are not persisted as a separate field on `GateDecision` yet;
    // `nextAction` carries the full text. The drawer shows conditions as an
    // empty section when not available, which is intentional until the
    // Prisma schema gains a dedicated column.
    conditions: [],
    evidenceSnapshot: {
      passed: row.evidencePassSnapshot,
      label: row.evidencePassSnapshot
        ? "Evidence gate cleared at decision time"
        : "Evidence gate not cleared at decision time",
    },
    auditEntryId,
    auditHref: auditEntryId ? `/projects/${projectId}/audit/${auditEntryId}` : null,
  };
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
          id: true,
          gateId: true,
          decision: true,
          authorityName: true,
          authorityRole: true,
          nextAction: true,
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

  // Build a `gateId -> latest full decision row` lookup so the gates list can
  // assemble immutable `GateDecisionRecordSnapshot` payloads for the drawer.
  const fullLatestByGate = new Map<string, (typeof project.gateDecisions)[number]>();
  for (const d of project.gateDecisions) {
    if (!fullLatestByGate.has(d.gateId)) {
      fullLatestByGate.set(d.gateId, d);
    }
  }

  // One query for all gate-decision audit entries on this project. The drawer
  // shows a deep-link to the underlying `AuditEntry`; we look the latest entry
  // up by `subjectId = gateDecisionId` (see `recordGateReview.ts`).
  const decisionIds = [...fullLatestByGate.values()].map((d) => d.id);
  const auditByDecisionId = new Map<string, string>();
  if (decisionIds.length > 0) {
    const auditRows = await prisma.auditEntry.findMany({
      where: {
        projectId: project.id,
        subjectKind: "gate_decision",
        subjectId: { in: decisionIds },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, subjectId: true },
    });
    for (const a of auditRows) {
      if (!auditByDecisionId.has(a.subjectId)) {
        auditByDecisionId.set(a.subjectId, a.id);
      }
    }
  }

  const evaluations = await Promise.all(
    ALL_GATES.map((gateId) => evaluateGateForProject(project.id, gateId)),
  );

  const rows: GatesListRow[] = ALL_GATES.map((gateId, i) => {
    const evaluation = evaluations[i]!;
    const latest = latestByGate.get(gateId);
    const latestFull = fullLatestByGate.get(gateId);
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
      decisionRecord: latestFull
        ? buildDecisionRecordSnapshot(project.id, gateId, latestFull, auditByDecisionId)
        : null,
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
