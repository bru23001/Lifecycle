import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { normalizeGateParam } from "@/lib/gateNormalize";
import type { GateId } from "@/lib/gateRules";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { formatDateTimeLabel } from "@/lib/server/helpers";
import { filterWideAuditRowsForGate } from "@/lib/gate-audit-trail-filter";
import type { GateAuditTrailEvent, GateAuditTrailViewData } from "@/types/gate-audit.types";
import { gateHeaderDisplayName } from "@/lib/workspacePhases";

function asRecord(meta: unknown): Record<string, unknown> {
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return {};
}

function categoryForAction(action: string): GateAuditTrailEvent["eventCategory"] {
  if (action === "gate_review.recorded") return "decision";
  if (action.startsWith("gate_review.evidence")) return "evidence";
  if (action.includes("approver")) return "approver";
  if (action.includes("criteria")) return "criteria";
  if (action.includes("submit") || action.includes("submission")) return "submission";
  return "other";
}

function summarizeEvent(action: string, meta: Record<string, unknown>): string {
  switch (action) {
    case "gate_review.recorded":
      return `Decision recorded: ${String(meta.decision ?? "—")} · phase → ${String(meta.newPhase ?? "—")}`;
    case "gate_review.evidence_added":
      return `Evidence added (${String(meta.evidenceType ?? "file")}) · ${String(meta.evidenceCode ?? meta.subjectId ?? "")}`;
    case "gate_review.evidence_unlinked":
      return `Evidence unlinked · ${String(meta.evidenceName ?? "")}`;
    case "gate_review.evidence_deleted":
      return `Evidence removed · ${String(meta.evidenceName ?? "")}`;
    case "gate_review.approvers_assigned":
      return `Approvers assigned (${Array.isArray(meta.approverRoles) ? (meta.approverRoles as string[]).join(", ") : "roles"})`;
    case "gate_review.approver_reminder_sent":
      return `Approver reminder sent (${String((meta.assignmentIds as unknown[])?.length ?? "?")} recipient(s))`;
    default:
      return action.replace(/\./g, " · ");
  }
}

function mapEntry(
  row: {
    id: string;
    action: string;
    subjectKind: string;
    subjectId: string;
    metadata: unknown;
    createdAt: Date;
  },
  actorLabel: string,
): GateAuditTrailEvent {
  const meta = asRecord(row.metadata);
  return {
    id: row.id,
    action: row.action,
    eventCategory: categoryForAction(row.action),
    subjectKind: row.subjectKind,
    subjectId: row.subjectId,
    actorLabel,
    timestampIso: row.createdAt.toISOString(),
    timestampLabel: formatDateTimeLabel(row.createdAt),
    summary: summarizeEvent(row.action, meta),
    auditReference: `AUD-${row.id.slice(0, 8).toUpperCase()}`,
    metadata: meta,
  };
}

/** Load gate-scoped audit trail for a resolved project id (server action + pages). */
export async function loadGateAuditTrailViewDataForProject(
  projectId: string,
  gate: GateId,
): Promise<GateAuditTrailViewData | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });
  if (!project) {
    return null;
  }

  const decisions = await prisma.gateDecision.findMany({
    where: { projectId: project.id, gateId: gate },
    select: { id: true },
  });
  const decisionIds = new Set(decisions.map((d) => d.id));

  const wideRows = await prisma.auditEntry.findMany({
    where: {
      projectId: project.id,
      OR: [{ action: { startsWith: "gate_review." } }, { subjectKind: "gate_decision" }],
    },
    orderBy: { createdAt: "desc" },
    take: 400,
    select: {
      id: true,
      action: true,
      subjectKind: true,
      subjectId: true,
      actorId: true,
      metadata: true,
      createdAt: true,
    },
  });

  const rows = filterWideAuditRowsForGate(wideRows, gate, decisionIds);

  const actorIds = [...new Set(rows.map((r) => r.actorId).filter((x): x is string => Boolean(x)))];
  const actors =
    actorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
  const actorLabelById = new Map(
    actors.map((u) => [u.id, u.name?.trim() || u.email?.trim() || u.id]),
  );

  const events: GateAuditTrailEvent[] = rows.map((r) =>
    mapEntry(r, r.actorId ? (actorLabelById.get(r.actorId) ?? "System") : "System"),
  );

  return {
    projectId: project.id,
    projectName: project.name,
    gateId: gate.toLowerCase(),
    gateCode: gate,
    gateName: gateHeaderDisplayName(gate),
    events,
  };
}

export async function loadGateAuditTrailView(
  projectIdParam: string,
  gateParam: string | undefined,
): Promise<GateAuditTrailViewData | null> {
  const gate = normalizeGateParam(gateParam ?? "");
  if (!gate) {
    return null;
  }

  const resolvedId = await resolveProjectIdFromRouteParam(projectIdParam);
  if (!resolvedId) {
    return null;
  }

  const data = await loadGateAuditTrailViewDataForProject(resolvedId, gate);
  if (!data) {
    notFound();
  }
  return data;
}
