/**
 * Traceability matrix + link detail (server).
 *
 * ## Link ID contract (`/projects/{projectId}/traceability/{linkId}`)
 *
 * - **TraceLink rows** use `TraceLink.id` (cuid) as `linkId`. Matrix rows that surface a DB
 *   trace link should set `detailHref` to `/projects/{projectId}/traceability/{traceLink.id}`.
 * - **Artifact ↔ gate** readiness (no `TraceLink` row): `ag:{artifactId}:{gateId}` where
 *   `artifactId` is `Artifact.id`, `gateId` is `G1`…`G10` (no `:` inside ids).
 * - **Evidence ↔ approval**: `ea:{evidenceId}:{approvalId}` with `EvidenceItem.id` and
 *   `Approval.id`.
 *
 * Detail resolution tries `TraceLink` by id first, then parses `ag:` / `ea:` prefixes only.
 */
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  getGateVisualState,
  indexLatestGateDecisions,
  type GateDecisionRow,
} from "@/lib/gateStatus";
import { normalizeGateParam } from "@/lib/gateNormalize";
import {
  ALL_GATES,
  formatDateTimeLabel,
  isArtifactBodyApproved,
  projectDisplayCode,
} from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import {
  clampWorkspacePhase,
  gateHeaderDisplayName,
  WORKSPACE_PHASE_MAX,
  WORKSPACE_PHASES,
  workspacePhaseMeta,
} from "@/lib/workspacePhases";
import type {
  ArtifactGateCoverage,
  CoverageStatus,
  CoverageSummary,
  EvidenceApprovalCoverage,
  GateEvidenceCoverage,
  GateTraceStatus,
  PhaseArtifactCoverage,
  RequirementDesignCoverage,
  RequirementKind,
  RequirementTestCoverage,
  TraceabilityActionState,
  TraceabilityFilters,
  TraceabilityGap,
  TraceabilityLinkDetail,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

export type TraceabilityViewMode = TraceabilityMatrixData["filters"]["viewMode"];

export type TraceabilityShell = {
  projectId: string;
  projectName: string;
  projectCode: string;
  user: TraceabilityMatrixData["user"];
  phaseProgressPct: number;
};

const AG_PREFIX = "ag:";
const EA_PREFIX = "ea:";

function parseJsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function dbKindToRequirementKind(kind: string): RequirementKind | null {
  if (kind === "CRS") return "business";
  if (kind === "SRS_FR") return "functional";
  if (kind === "SRS_NFR" || kind === "NFR") return "non_functional";
  return null;
}

const REQUIREMENT_BUCKET_ORDER: RequirementKind[] = [
  "business",
  "functional",
  "non_functional",
  "interface",
  "data",
];

const REQUIREMENT_BUCKET_LABEL: Record<RequirementKind, string> = {
  business: "Business Requirements",
  functional: "Functional Requirements",
  non_functional: "Non-Functional Requirements",
  interface: "Interface Requirements",
  data: "Data Requirements",
};

function coverageFromRatio(linked: number, total: number): { percent: number; status: CoverageStatus } {
  if (total <= 0) return { percent: 100, status: "complete" };
  const percent = Math.min(100, Math.round((100 * linked) / total));
  if (linked >= total) return { percent, status: "complete" };
  if (linked <= 0) return { percent, status: "missing" };
  return { percent, status: "partial" };
}

function normalizeEvidenceGate(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  const g = normalizeGateParam(code);
  return g ?? null;
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

function linkStrengthForRelation(relation: string): TraceabilityLinkDetail["linkStrength"] {
  if (relation === "implements" || relation === "derives") return "strong";
  if (relation === "informs") return "medium";
  return "weak";
}

export async function getTraceabilityShell(projectId: string): Promise<TraceabilityShell | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, slug: true, vaultFolder: true, currentPhase: true },
  });
  if (!project) return null;
  const user = await getCurrentUserDisplay();
  const phase = clampWorkspacePhase(project.currentPhase);
  return {
    projectId: project.id,
    projectName: project.name,
    projectCode: projectDisplayCode(project.vaultFolder, project.slug),
    user: { name: user.name, role: user.role, initials: user.initials },
    phaseProgressPct: Math.round((phase / WORKSPACE_PHASE_MAX) * 100),
  };
}

export type LoadTraceabilityMatrixOptions = {
  viewMode?: TraceabilityViewMode;
  searchTerm?: string;
};

export async function loadTraceabilityMatrix(
  projectId: string,
  options?: LoadTraceabilityMatrixOptions,
): Promise<TraceabilityMatrixData> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      artifacts: { orderBy: { updatedAt: "desc" } },
      requirements: true,
      features: true,
      traceLinks: { orderBy: { createdAt: "desc" } },
      gateDecisions: { orderBy: { createdAt: "desc" } },
      evidenceItems: true,
      approvals: {
        where: { approvalType: "gate_review" },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const resolvedProjectId = project.id;

  const [user, lifecycleRows, templateRows, gateRuleRows] = await Promise.all([
    getCurrentUserDisplay(),
    prisma.lifecyclePhaseConfig.findMany({ orderBy: { phaseNumber: "asc" } }),
    prisma.templateRegistryEntry.findMany({ where: { status: "active" } }),
    prisma.gateRuleConfig.findMany({ where: { status: "active" } }),
  ]);

  const lifecycleByPhase = new Map(lifecycleRows.map((r) => [r.phaseNumber, r]));
  const templateByCode = new Map(templateRows.map((t) => [t.templateCode, t]));
  const gateRuleByCode = new Map(gateRuleRows.map((g) => [g.gateCode.toUpperCase(), g]));

  const decisionsRows: GateDecisionRow[] = project.gateDecisions.map((d) => ({
    gateId: d.gateId,
    decision: d.decision,
    evidencePassSnapshot: d.evidencePassSnapshot,
    createdAt: d.createdAt,
  }));
  const latestByGate = indexLatestGateDecisions(decisionsRows);
  const currentPhase = clampWorkspacePhase(project.currentPhase);

  const artifactTemplateIds = new Set(project.artifacts.map((a) => a.templateId));

  const phaseArtifactLinks: PhaseArtifactCoverage[] = [];
  for (let phaseNumber = 1; phaseNumber <= WORKSPACE_PHASE_MAX; phaseNumber++) {
    const cfg = lifecycleByPhase.get(phaseNumber);
    const required = cfg ? parseJsonStringArray(cfg.requiredArtifactIdsJson) : [];
    const meta = workspacePhaseMeta(phaseNumber);
    const linked = required.filter((tid) => artifactTemplateIds.has(tid)).length;
    const total = required.length;
    const { percent, status } = coverageFromRatio(linked, total);
    phaseArtifactLinks.push({
      phaseId: `phase-${phaseNumber}`,
      phaseNumber,
      phaseName: cfg?.name?.trim() || meta.title,
      artifactsLinked: linked,
      totalArtifactsRequired: total,
      coveragePercent: percent,
      status,
      href: `/projects/${resolvedProjectId}/workspace?phase=${phaseNumber}`,
    });
  }

  const reqsByKind = new Map<RequirementKind, typeof project.requirements>();
  for (const k of REQUIREMENT_BUCKET_ORDER) reqsByKind.set(k, []);
  for (const r of project.requirements) {
    const rk = dbKindToRequirementKind(r.kind);
    if (rk) {
      reqsByKind.get(rk)!.push(r);
    }
  }

  const links = project.traceLinks;

  function hasDesignTrace(reqId: string): boolean {
    return links.some(
      (l) =>
        (l.fromKind === "feature" &&
          l.toKind === "requirement" &&
          l.toId === reqId &&
          l.relation === "implements") ||
        (l.fromKind === "requirement" &&
          l.toKind === "requirement" &&
          (l.fromId === reqId || l.toId === reqId) &&
          l.relation === "derives"),
    );
  }

  function hasTestIntent(req: { verificationMethod?: string | null }): boolean {
    return Boolean(req.verificationMethod?.trim());
  }

  const requirementDesignLinks: RequirementDesignCoverage[] = REQUIREMENT_BUCKET_ORDER.map((kind) => {
    const bucket = reqsByKind.get(kind) ?? [];
    const requirementsTotal = bucket.length;
    const designLinksTotal = bucket.filter((r) => hasDesignTrace(r.id)).length;
    const { percent, status } = coverageFromRatio(designLinksTotal, requirementsTotal);
    return {
      requirementType: kind,
      label: REQUIREMENT_BUCKET_LABEL[kind],
      requirementsTotal,
      designLinksTotal,
      coveragePercent: percent,
      status,
      href: `/projects/${resolvedProjectId}/traceability/requirements-design?type=${kind}`,
    };
  });

  const requirementTestLinks: RequirementTestCoverage[] = REQUIREMENT_BUCKET_ORDER.map((kind) => {
    const bucket = reqsByKind.get(kind) ?? [];
    const requirementsTotal = bucket.length;
    const testLinksTotal = bucket.filter((r) => hasTestIntent(r)).length;
    const { percent, status } = coverageFromRatio(testLinksTotal, requirementsTotal);
    return {
      requirementType: kind,
      label: REQUIREMENT_BUCKET_LABEL[kind],
      requirementsTotal,
      testLinksTotal,
      coveragePercent: percent,
      status,
      href: `/projects/${resolvedProjectId}/traceability/requirements-tests?type=${kind}`,
    };
  });

  const gateEvidenceLinks: GateEvidenceCoverage[] = ALL_GATES.map((gate) => {
    const rule = gateRuleByCode.get(gate);
    const requiredEvidence = rule?.requiredEvidenceCount ?? 0;
    const gateNorm = gate;
    const evidenceLinked = project.evidenceItems.filter(
      (e) => normalizeEvidenceGate(e.gateCode) === gateNorm,
    ).length;
    const { percent, status } = coverageFromRatio(
      requiredEvidence > 0 ? Math.min(evidenceLinked, requiredEvidence) : evidenceLinked,
      requiredEvidence,
    );
    const visual = getGateVisualState(currentPhase, gate, latestByGate);
    const latest = latestByGate.get(gate);
    const gateStatus = mapLatestDecisionToGateStatus(latest, visual);
    return {
      gateId: gate.toLowerCase(),
      gateCode: gate,
      gateName: gateHeaderDisplayName(gate),
      gateStatus,
      evidenceLinked,
      requiredEvidence,
      coveragePercent: requiredEvidence > 0 ? percent : evidenceLinked > 0 ? 100 : 0,
      status: requiredEvidence > 0 ? status : evidenceLinked > 0 ? ("complete" as const) : ("missing" as const),
      href: `/projects/${resolvedProjectId}/gates/${gate.toLowerCase()}/review`,
    };
  });

  const latestArtifactByTemplate = new Map<string, (typeof project.artifacts)[0]>();
  for (const a of project.artifacts) {
    if (!latestArtifactByTemplate.has(a.templateId)) latestArtifactByTemplate.set(a.templateId, a);
  }

  const artifactGateLinks: ArtifactGateCoverage[] = [];
  for (const art of latestArtifactByTemplate.values()) {
    const reg = templateByCode.get(art.templateId);
    const phaseNum = reg?.phaseNumber ?? 1;
    const gate = WORKSPACE_PHASES[Math.min(Math.max(phaseNum, 1), WORKSPACE_PHASES.length) - 1]?.gate;
    if (!gate) continue;
    const approved = isArtifactBodyApproved(art.dataJson);
    const rowStatus: CoverageStatus = approved ? "complete" : art.status === "Draft" ? "partial" : "missing";
    const id = `${AG_PREFIX}${art.id}:${gate}`;
    artifactGateLinks.push({
      id,
      artifactLocalId: art.localId,
      artifactTitle: `${art.templateId} v${art.version}`,
      gateCode: gate,
      gateName: gateHeaderDisplayName(gate),
      status: rowStatus,
      href: `/projects/${resolvedProjectId}/artifacts/${art.id}`,
      detailHref: `/projects/${resolvedProjectId}/traceability/${encodeURIComponent(id)}`,
    });
  }

  const evidenceApprovalLinks: EvidenceApprovalCoverage[] = [];
  for (const ev of project.evidenceItems) {
    const g = normalizeEvidenceGate(ev.gateCode);
    if (!g) continue;
    const approval = project.approvals.find((a) => {
      const ag = a.gateId ? normalizeGateParam(a.gateId) : null;
      return ag === g;
    });
    if (!approval) continue;
    const id = `${EA_PREFIX}${ev.id}:${approval.id}`;
    const st = approval.status;
    const approvalStatus: EvidenceApprovalCoverage["approvalStatus"] =
      st === "approved" ? "approved"
      : st === "rejected" ? "rejected"
      : st === "changes_requested" ? "changes_requested"
      : "pending";
    const rowStatus: CoverageStatus =
      approvalStatus === "approved" ? "complete"
      : approvalStatus === "pending" ? "partial"
      : "missing";
    evidenceApprovalLinks.push({
      id,
      evidenceLabel: `${ev.evidenceCode} — ${ev.name}`,
      approvalTitle: `${g} gate review`,
      approvalStatus,
      status: rowStatus,
      href: `/projects/${resolvedProjectId}/evidence/${ev.id}`,
      detailHref: `/projects/${resolvedProjectId}/traceability/${encodeURIComponent(id)}`,
    });
  }

  const reqById = new Map(project.requirements.map((r) => [r.id, r]));
  const featById = new Map(project.features.map((f) => [f.id, f]));
  const artById = new Map(project.artifacts.map((a) => [a.id, a]));

  function resolveEndpoint(kind: string, id: string): { label: string; href: string } | null {
    if (kind === "requirement") {
      const r = reqById.get(id);
      if (!r) return null;
      return {
        label: `${r.localId} — ${r.title}`,
        href: `/projects/${resolvedProjectId}/requirements`,
      };
    }
    if (kind === "feature") {
      const f = featById.get(id);
      if (!f) return null;
      return {
        label: `${f.localId} — ${f.title}`,
        href: `/projects/${resolvedProjectId}/features`,
      };
    }
    if (kind === "artifact") {
      const a = artById.get(id);
      if (!a) return null;
      return {
        label: `${a.templateId} · ${a.localId}`,
        href: `/projects/${resolvedProjectId}/artifacts/${a.id}`,
      };
    }
    return null;
  }

  const traceabilityGaps: TraceabilityGap[] = [];

  for (const r of project.requirements) {
    const incoming = links.some((l) => l.toKind === "requirement" && l.toId === r.id);
    const outgoing = links.some((l) => l.fromKind === "requirement" && l.fromId === r.id);
    if (!incoming && !outgoing) {
      traceabilityGaps.push({
        id: `gap-req-${r.id}`,
        type: "requirement_gap",
        objectId: r.localId,
        objectName: r.title,
        issue: "No trace links (incoming or outgoing)",
        impact: r.kind === "CRS" ? "high" : "medium",
        href: `/projects/${resolvedProjectId}/requirements`,
      });
    } else if (!hasDesignTrace(r.id) && (r.kind === "SRS_FR" || r.kind === "SRS_NFR")) {
      traceabilityGaps.push({
        id: `gap-design-${r.id}`,
        type: "requirement_gap",
        objectId: r.localId,
        objectName: r.title,
        issue: "No design link (feature implements)",
        impact: "medium",
        href: `/projects/${resolvedProjectId}/requirements`,
      });
    }
  }

  for (const f of project.features) {
    const incoming = links.some((l) => l.toKind === "feature" && l.toId === f.id);
    const outgoing = links.some((l) => l.fromKind === "feature" && l.fromId === f.id);
    if (!incoming && !outgoing) {
      traceabilityGaps.push({
        id: `gap-feat-${f.id}`,
        type: "design_orphan",
        objectId: f.localId,
        objectName: f.title,
        issue: "Feature has no trace links",
        impact: "medium",
        href: `/projects/${resolvedProjectId}/features`,
      });
    }
  }

  for (const e of project.evidenceItems) {
    const g = normalizeEvidenceGate(e.gateCode);
    const linkedToGate = g && project.approvals.some((a) => (a.gateId ? normalizeGateParam(a.gateId) : null) === g);
    if (!linkedToGate && g) {
      traceabilityGaps.push({
        id: `gap-ev-${e.id}`,
        type: "evidence_orphan",
        objectId: e.evidenceCode,
        objectName: e.name,
        issue: "Evidence tagged to gate but no gate review approval row",
        impact: "low",
        href: `/projects/${resolvedProjectId}/evidence/${e.id}`,
      });
    }
  }

  for (const l of links) {
    const from = resolveEndpoint(l.fromKind, l.fromId);
    const to = resolveEndpoint(l.toKind, l.toId);
    if (!from || !to) {
      traceabilityGaps.push({
        id: `gap-broken-${l.id}`,
        type: "broken_link",
        objectId: l.id.slice(0, 12),
        objectName: `${l.fromKind} → ${l.toKind}`,
        issue: "Trace link references a missing object",
        impact: "high",
        href: `/projects/${resolvedProjectId}/traceability/${l.id}`,
      });
    }
  }

  const sectionPercents = [
    ...phaseArtifactLinks.map((r) => r.coveragePercent),
    ...requirementDesignLinks.map((r) => r.coveragePercent),
    ...requirementTestLinks.map((r) => r.coveragePercent),
    ...gateEvidenceLinks.map((r) => r.coveragePercent),
  ];
  const overallCoveragePercent =
    sectionPercents.length > 0 ?
      Math.round(sectionPercents.reduce((a, b) => a + b, 0) / sectionPercents.length)
    : 0;

  const statusCounts = { complete: 0, partial: 0, missing: 0 };
  const bump = (rows: { status: CoverageStatus }[]) => {
    for (const r of rows) statusCounts[r.status]++;
  };
  bump(phaseArtifactLinks);
  bump(requirementDesignLinks);
  bump(requirementTestLinks);
  bump(gateEvidenceLinks);
  const sumRows =
    phaseArtifactLinks.length +
    requirementDesignLinks.length +
    requirementTestLinks.length +
    gateEvidenceLinks.length;
  const denom = Math.max(sumRows, 1);

  const coverageSummary: CoverageSummary = {
    overallCoveragePercent,
    complete: { count: statusCounts.complete, percent: Math.round((100 * statusCounts.complete) / denom) },
    partial: { count: statusCounts.partial, percent: Math.round((100 * statusCounts.partial) / denom) },
    missing: { count: statusCounts.missing, percent: Math.round((100 * statusCounts.missing) / denom) },
    orphaned: { count: traceabilityGaps.filter((g) => g.type !== "requirement_gap" && g.type !== "broken_link").length },
    totals: {
      requirements: project.requirements.length,
      designs: project.features.length,
      tests: project.requirements.filter((r) => hasTestIntent(r)).length,
      evidenceItems: project.evidenceItems.length,
      gates: ALL_GATES.length,
      artifacts: project.artifacts.length,
    },
    reportHref: `/projects/${resolvedProjectId}/traceability/report`,
  };

  const actionState: TraceabilityActionState = {
    title: "Traceability connects intent to evidence.",
    description:
      "Coverage is derived from lifecycle configuration, requirements, features, artifacts, gate rules, and recorded decisions.",
    ctaLabel: "Open Traceability Report",
    href: `/projects/${resolvedProjectId}/traceability/report`,
  };

  const stamps: Date[] = [
    project.updatedAt,
    ...project.artifacts.map((a) => a.updatedAt),
    ...project.requirements.map((r) => r.updatedAt),
    ...project.evidenceItems.map((e) => e.updatedAt),
    ...project.traceLinks.map((t) => t.createdAt),
    ...project.gateDecisions.map((d) => d.createdAt),
  ];
  const lastUpdated = stamps.reduce((a, b) => (a > b ? a : b), project.updatedAt);

  const filters: TraceabilityFilters = {
    projectId: resolvedProjectId,
    searchTerm: options?.searchTerm ?? "",
    viewMode: options?.viewMode ?? "all_links",
    phaseNumber: "all",
    status: "all",
    objectType: "all",
    lastUpdatedLabel: formatDateTimeLabel(lastUpdated),
  };

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: resolvedProjectId,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
    },
    filters,
    phaseArtifactLinks,
    requirementDesignLinks,
    requirementTestLinks,
    gateEvidenceLinks,
    artifactGateLinks,
    evidenceApprovalLinks,
    traceabilityGaps,
    coverageSummary,
    actionState,
  };
}

export async function loadTraceabilityMatrixWithView(
  projectId: string,
  viewMode: TraceabilityViewMode,
): Promise<TraceabilityMatrixData> {
  return loadTraceabilityMatrix(projectId, { viewMode });
}

export async function getTraceabilityLinkDetail(
  projectId: string,
  linkId: string,
): Promise<TraceabilityLinkDetail | null> {
  const decoded = decodeURIComponent(linkId);

  const baseLinkType = (a: string, b: string) => `${a} → ${b}`;

  const trace = await prisma.traceLink.findFirst({
    where: { id: decoded, projectId },
  });
  if (trace) {
    const reqs = await prisma.requirement.findMany({
      where: { projectId },
      select: { id: true, localId: true, title: true },
    });
    const feats = await prisma.feature.findMany({
      where: { projectId },
      select: { id: true, localId: true, title: true },
    });
    const arts = await prisma.artifact.findMany({
      where: { projectId },
      select: { id: true, templateId: true, localId: true },
    });
    const reqMap = new Map(reqs.map((r) => [r.id, r]));
    const featMap = new Map(feats.map((f) => [f.id, f]));
    const artMap = new Map(arts.map((a) => [a.id, a]));

    function label(kind: string, id: string): { label: string; href: string } {
      if (kind === "requirement") {
        const r = reqMap.get(id);
        return {
          label: r ? `${r.localId} — ${r.title}` : id,
          href: `/projects/${projectId}/requirements`,
        };
      }
      if (kind === "feature") {
        const f = featMap.get(id);
        return {
          label: f ? `${f.localId} — ${f.title}` : id,
          href: `/projects/${projectId}/features`,
        };
      }
      if (kind === "artifact") {
        const a = artMap.get(id);
        return {
          label: a ? `${a.templateId} · ${a.localId}` : id,
          href: a ? `/projects/${projectId}/artifacts/${a.id}` : `/projects/${projectId}/workspace`,
        };
      }
      return { label: id.slice(0, 10), href: `/projects/${projectId}/traceability` };
    }

    const src = label(trace.fromKind, trace.fromId);
    const tgt = label(trace.toKind, trace.toId);
    const valid =
      (trace.fromKind === "requirement" ? reqMap.has(trace.fromId) : true) &&
      (trace.toKind === "requirement" ? reqMap.has(trace.toId) : true) &&
      (trace.fromKind === "feature" ? featMap.has(trace.fromId) : true) &&
      (trace.toKind === "feature" ? featMap.has(trace.toId) : true);

    return {
      id: trace.id,
      linkType: `${trace.relation} (${baseLinkType(trace.fromKind, trace.toKind)})`,
      linkStrength: linkStrengthForRelation(trace.relation),
      sourceKind: trace.fromKind,
      sourceLabel: src.label,
      sourceHref: src.href,
      targetKind: trace.toKind,
      targetLabel: tgt.label,
      targetHref: tgt.href,
      createdBy: "System",
      createdAtLabel: formatDateTimeLabel(trace.createdAt),
      evidenceReference: `TraceLink ${trace.id}`,
      validationStatus: valid ? "valid" : "invalid",
    };
  }

  if (decoded.startsWith(AG_PREFIX)) {
    const rest = decoded.slice(AG_PREFIX.length);
    const colon = rest.lastIndexOf(":");
    if (colon <= 0) return null;
    const artifactId = rest.slice(0, colon);
    const gateRaw = rest.slice(colon + 1);
    const gate = normalizeGateParam(gateRaw);
    if (!gate) return null;
    const art = await prisma.artifact.findFirst({
      where: { id: artifactId, projectId },
    });
    if (!art) return null;
    const approved = isArtifactBodyApproved(art.dataJson);
    return {
      id: decoded,
      linkType: "Artifact → Gate",
      linkStrength: approved ? "strong" : art.status === "Draft" ? "medium" : "weak",
      sourceKind: "artifact",
      sourceLabel: `${art.templateId} · ${art.localId}`,
      sourceHref: `/projects/${projectId}/artifacts/${art.id}`,
      targetKind: "gate",
      targetLabel: `${gate} — ${gateHeaderDisplayName(gate)}`,
      targetHref: `/projects/${projectId}/gates/${gate.toLowerCase()}/review`,
      createdBy: "Derived",
      createdAtLabel: formatDateTimeLabel(art.updatedAt),
      evidenceReference: `Template phase linkage · ${gate}`,
      validationStatus: approved ? "valid" : "warning",
    };
  }

  if (decoded.startsWith(EA_PREFIX)) {
    const rest = decoded.slice(EA_PREFIX.length);
    const colon = rest.lastIndexOf(":");
    if (colon <= 0) return null;
    const evidenceId = rest.slice(0, colon);
    const approvalId = rest.slice(colon + 1);
    const [ev, appr] = await Promise.all([
      prisma.evidenceItem.findFirst({ where: { id: evidenceId, projectId } }),
      prisma.approval.findFirst({
        where: { id: approvalId, projectId },
        include: { submittedBy: { select: { name: true } } },
      }),
    ]);
    if (!ev || !appr) return null;
    const st = appr.status;
    const invalid = st === "rejected";
    const warn = st === "pending" || st === "in_review" || st === "changes_requested";
    return {
      id: decoded,
      linkType: "Evidence → Approval",
      linkStrength: st === "approved" ? "strong" : warn ? "medium" : "weak",
      sourceKind: "evidence",
      sourceLabel: `${ev.evidenceCode} — ${ev.name}`,
      sourceHref: `/projects/${projectId}/evidence/${ev.id}`,
      targetKind: "approval",
      targetLabel: appr.gateId ? `${appr.gateId} gate review` : "Artifact review",
      targetHref: `/projects/${projectId}/approvals/${appr.id}`,
      createdBy: appr.submittedBy?.name?.trim() || "—",
      createdAtLabel: formatDateTimeLabel(appr.updatedAt),
      evidenceReference: ev.evidenceCode,
      validationStatus: invalid ? "invalid" : warn ? "warning" : "valid",
    };
  }

  return null;
}
