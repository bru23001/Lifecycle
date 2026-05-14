import { notFound } from "next/navigation";

import { getGateVisualState, indexLatestGateDecisions, type GateDecisionRow } from "@/lib/gateStatus";
import { normalizeGateParam } from "@/lib/gateNormalize";
import { prisma } from "@/lib/prisma";
import { ALL_GATES, formatDateTimeLabel, projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { clampWorkspacePhase, gateHeaderDisplayName } from "@/lib/workspacePhases";
import type { CoverageStatus, GateTraceStatus } from "@/types/traceability.types";
import type {
  GateEvidenceGateDetailData,
  GateEvidenceLinkedItem,
  GateEvidenceMissingRow,
  GateEvidenceTraceabilityListData,
  GateEvidenceTraceListRow,
} from "@/types/gate-evidence-traceability.types";

function parseJsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function normalizeEvidenceGate(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  return normalizeGateParam(code);
}

function coverageFromRatio(linked: number, total: number): { percent: number; status: CoverageStatus } {
  if (total <= 0) return { percent: 100, status: "complete" };
  const percent = Math.min(100, Math.round((100 * linked) / total));
  if (linked >= total) return { percent, status: "complete" };
  if (linked <= 0) return { percent, status: "missing" };
  return { percent, status: "partial" };
}

function mapLatestDecisionToGateStatus(
  latest: GateDecisionRow | undefined,
  visual: ReturnType<typeof getGateVisualState>,
): GateTraceStatus {
  if (latest) {
    if (latest.decision === "Accepted" || latest.decision === "Conditional") {
      return latest.evidencePassSnapshot ? "approved" : "pending_decision";
    }
    if (latest.decision === "Rejected") return "rejected";
    if (latest.decision === "Returned" || latest.decision === "Deferred") return "changes_requested";
  }
  if (visual === "upcoming") return "not_reached";
  if (visual === "ready") return "not_submitted";
  return "approved";
}

function buildDecisionSummary(
  latest: GateDecisionRow | undefined,
): { text: string; latest: GateEvidenceGateDetailData["gate"]["latestDecision"] } {
  if (!latest) {
    return { text: "No decision recorded for this gate.", latest: null };
  }
  const snap = latest.evidencePassSnapshot ? "evidence checks passed" : "evidence checks not fully passed";
  return {
    text: `${latest.decision} · ${snap} (${formatDateTimeLabel(latest.createdAt)})`,
    latest: {
      decision: latest.decision,
      createdAtLabel: formatDateTimeLabel(latest.createdAt),
      evidencePassSnapshot: latest.evidencePassSnapshot,
    },
  };
}

async function loadGateTraceabilityContext(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      vaultFolder: true,
      currentPhase: true,
      evidenceItems: true,
      gateDecisions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) notFound();

  const [user, gateRuleRows] = await Promise.all([
    getCurrentUserDisplay(),
    prisma.gateRuleConfig.findMany({ where: { status: "active" } }),
  ]);

  const gateRuleByCode = new Map(gateRuleRows.map((g) => [g.gateCode.toUpperCase(), g]));
  const decisionsRows: GateDecisionRow[] = project.gateDecisions.map((d) => ({
    gateId: d.gateId,
    decision: d.decision,
    evidencePassSnapshot: d.evidencePassSnapshot,
    createdAt: d.createdAt,
  }));
  const latestByGate = indexLatestGateDecisions(decisionsRows);
  const currentPhase = clampWorkspacePhase(project.currentPhase);

  return {
    project,
    user,
    gateRuleByCode,
    latestByGate,
    currentPhase,
  };
}

export async function loadGateEvidenceTraceabilityList(projectId: string): Promise<GateEvidenceTraceabilityListData> {
  const ctx = await loadGateTraceabilityContext(projectId);
  const { project, user, gateRuleByCode, latestByGate, currentPhase } = ctx;

  const gates: GateEvidenceTraceListRow[] = ALL_GATES.map((gate) => {
    const rule = gateRuleByCode.get(gate);
    const requiredEvidence = rule?.requiredEvidenceCount ?? 0;
    const evidenceLinked = project.evidenceItems.filter(
      (e) => normalizeEvidenceGate(e.gateCode) === gate,
    ).length;
    const { percent, status } = coverageFromRatio(
      requiredEvidence > 0 ? Math.min(evidenceLinked, requiredEvidence) : evidenceLinked,
      requiredEvidence,
    );
    const visual = getGateVisualState(currentPhase, gate, latestByGate);
    const latest = latestByGate.get(gate);
    const gateStatus = mapLatestDecisionToGateStatus(latest, visual);
    const { text: decisionSummary } = buildDecisionSummary(latest);
    const missingCount = Math.max(0, requiredEvidence - evidenceLinked);
    const gateParam = gate.toLowerCase();

    return {
      gateCode: gate,
      gateName: gateHeaderDisplayName(gate),
      gateIdParam: gateParam,
      gateStatus,
      evidenceLinked,
      requiredEvidence,
      missingCount,
      coveragePercent: requiredEvidence > 0 ? percent : evidenceLinked > 0 ? 100 : 0,
      linkStatus: requiredEvidence > 0 ? status : evidenceLinked > 0 ? "complete" : "missing",
      decisionSummary,
      detailHref: `/projects/${project.id}/traceability/gate-evidence/${gateParam}`,
      reviewHref: `/projects/${project.id}/gates/${gateParam}/review`,
    };
  });

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase,
    },
    matrixHref: `/projects/${project.id}/traceability`,
    gates,
  };
}

export async function loadGateEvidenceGateDetail(
  projectId: string,
  gateParam: string,
): Promise<GateEvidenceGateDetailData> {
  const gate = normalizeGateParam(gateParam);
  if (!gate) notFound();

  const ctx = await loadGateTraceabilityContext(projectId);
  const { project, user, gateRuleByCode, latestByGate, currentPhase } = ctx;

  const rule = gateRuleByCode.get(gate);
  const requiredEvidence = rule?.requiredEvidenceCount ?? 0;
  const requiredInputLabels = parseJsonStringArray(rule?.requiredInputIdsJson);

  const linkedRaw = project.evidenceItems.filter((e) => normalizeEvidenceGate(e.gateCode) === gate);
  const evidenceLinked = linkedRaw.length;
  const { percent, status } = coverageFromRatio(
    requiredEvidence > 0 ? Math.min(evidenceLinked, requiredEvidence) : evidenceLinked,
    requiredEvidence,
  );
  const visual = getGateVisualState(currentPhase, gate, latestByGate);
  const latest = latestByGate.get(gate);
  const gateStatus = mapLatestDecisionToGateStatus(latest, visual);
  const { text: decisionSummaryText, latest: latestDecision } = buildDecisionSummary(latest);

  const gap = Math.max(0, requiredEvidence - evidenceLinked);
  const missingEvidence: GateEvidenceMissingRow[] = [];
  for (let i = 0; i < gap; i++) {
    missingEvidence.push({
      id: `missing-${i}`,
      label: requiredInputLabels[i] ?? `Required evidence slot ${i + 1}`,
    });
  }

  const linkedEvidence: GateEvidenceLinkedItem[] = linkedRaw.map((e) => ({
    id: e.id,
    evidenceCode: e.evidenceCode,
    name: e.name,
    evidenceType: e.evidenceType,
    completenessPercent: e.completenessPercent,
    phaseNumber: e.phaseNumber,
    detailHref: `/projects/${project.id}/evidence/${e.id}`,
  }));

  const gateParamLc = gate.toLowerCase();

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase,
    },
    matrixHref: `/projects/${project.id}/traceability`,
    listHref: `/projects/${project.id}/traceability/gate-evidence`,
    gate: {
      gateCode: gate,
      gateName: gateHeaderDisplayName(gate),
      gateStatus,
      requiredEvidence,
      requiredInputLabels,
      evidenceLinked,
      coveragePercent: requiredEvidence > 0 ? percent : evidenceLinked > 0 ? 100 : 0,
      linkStatus: requiredEvidence > 0 ? status : evidenceLinked > 0 ? "complete" : "missing",
      decisionSummary: decisionSummaryText,
      latestDecision,
    },
    linkedEvidence,
    missingEvidence,
    reviewHref: `/projects/${project.id}/gates/${gateParamLc}/review`,
    addEvidenceHref: `/projects/${project.id}/evidence?gate=${gate}`,
  };
}
