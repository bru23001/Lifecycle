import { notFound } from "next/navigation";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { clampWorkspacePhase, gateHeaderDisplayName } from "@/lib/workspacePhases";
import { getAllTemplates, getTemplate, getTemplatesForGate } from "@/templates/registry";
import type {
  EvidenceCenterData,
  EvidenceCenterSelectedEvidence,
  EvidenceCommentRow,
  EvidenceCommentVisibility,
  EvidenceDetail,
  EvidenceHistoryEvent,
  EvidenceItem,
} from "@/types/evidence-center.types";
import type { GateId } from "@/lib/gateRules";
import { getCurrentUser, getCurrentUserDisplay, type CurrentUserDisplay } from "@/lib/server/current-user";
import { evidenceLinkedToGate } from "@/lib/evidence-gate-links";
import { evidenceLinkedToPhase } from "@/lib/evidence-phase-links";
import { ALL_GATES, formatDateTimeLabel, projectDisplayCode } from "@/lib/server/helpers";
import { phaseCompletionImpact } from "@/lib/server/phase-evidence-traceability";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import type { CoverageStatus } from "@/types/traceability.types";

function phaseLinkStatus(linked: number, total: number): CoverageStatus {
  if (total <= 0) return "complete";
  const capped = Math.min(linked, total);
  if (capped >= total) return "complete";
  if (capped <= 0) return "missing";
  return "partial";
}

const PHASE_NAMES: Record<number, string> = {
  1: "Idea capture & charter",
  2: "Problem definition",
  3: "Evaluation & selection",
  4: "Feasibility detail",
  5: "Business case & stakeholders",
  6: "Requirements baseline",
  7: "Scope & planning control",
  8: "Architecture & design",
  9: "Development preparation",
  10: "Build planning & contracts",
  11: "Implementation readiness",
  12: "Build & integrate",
  13: "Verification & release",
  14: "Deploy & operate",
};

function templatePhaseNumber(templateId: string): number | null {
  try {
    const t = getTemplate(templateId);
    return typeof t.phase === "number" ? t.phase : null;
  } catch {
    return null;
  }
}

function coerceEvidenceType(
  raw: string,
): EvidenceItem["evidenceType"] {
  const allowed: EvidenceItem["evidenceType"][] = [
    "pdf",
    "spreadsheet",
    "document",
    "image",
    "link",
    "json",
    "markdown",
    "report",
  ];
  return allowed.includes(raw as EvidenceItem["evidenceType"])
    ? (raw as EvidenceItem["evidenceType"])
    : "document";
}

function coerceClassification(
  raw: string,
): EvidenceDetail["classification"] {
  const allowed: EvidenceDetail["classification"][] = [
    "public",
    "internal",
    "confidential",
    "restricted",
  ];
  return allowed.includes(raw as EvidenceDetail["classification"])
    ? (raw as EvidenceDetail["classification"])
    : "internal";
}

function coerceItemStatus(
  raw: string,
): EvidenceItem["status"] {
  const allowed: EvidenceItem["status"][] = [
    "linked",
    "partially_linked",
    "unlinked",
    "archived",
  ];
  return allowed.includes(raw as EvidenceItem["status"])
    ? (raw as EvidenceItem["status"])
    : "linked";
}

const EVIDENCE_AUDIT_SUMMARY: Record<string, string> = {
  "evidence.item_created": "Evidence item created",
  "evidence.metadata_updated": "Metadata updated",
  "evidence.linked_to_artifact": "Linked to artifact",
  "evidence.unlinked_from_artifact": "Unlinked from artifact",
  "evidence.linked_to_gate": "Linked to gate",
  "evidence.unlinked_from_gate": "Unlinked from gate",
  "evidence.linked_to_workspace_phase": "Linked to workspace phase",
  "evidence.linked_to_phases": "Linked to lifecycle phases",
  "evidence.unlinked_from_phase": "Unlinked from lifecycle phase",
  "evidence.unlinked_from_workspace_phase": "Unlinked from workspace phase",
  "evidence.item_archived": "Evidence archived",
  "evidence.item_deleted": "Evidence deleted",
  "evidence.comment_created": "Comment added",
  "evidence.comment_updated": "Comment updated",
  "evidence.comment_deleted": "Comment deleted",
  "evidence.comment_resolved": "Comment resolved",
};

type AuditRowForEvidence = {
  id: string;
  action: string;
  createdAt: Date;
  metadata: Prisma.JsonValue;
  actor: { name: string | null; email: string } | null;
};

function auditActorLabel(a: AuditRowForEvidence): string {
  const n = a.actor?.name?.trim();
  if (n) return n;
  if (a.actor?.email) return a.actor.email;
  return "System";
}

function parseMentionsJson(raw: Prisma.JsonValue): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw) as unknown;
      return Array.isArray(p) ? p.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function coerceCommentVisibility(raw: string): EvidenceCommentVisibility {
  if (raw === "internal" || raw === "reviewers") return raw;
  return "project";
}

function formatAuditDelta(
  action: string,
  meta: Prisma.JsonValue,
  artifactLabel: (artifactId: string) => string | undefined,
): { previousValue: string; newValue: string; relatedObject: string } {
  const m =
    meta && typeof meta === "object" && !Array.isArray(meta) ? (meta as Record<string, unknown>) : {};
  let previousValue = "—";
  let newValue = "—";
  let relatedObject = "—";

  if (typeof m.evidenceCode === "string") relatedObject = m.evidenceCode;
  if (typeof m.artifactId === "string") {
    relatedObject = artifactLabel(m.artifactId) ?? `Artifact ${m.artifactId}`;
  }
  if (typeof m.gateCode === "string") {
    relatedObject = `${m.gateCode} — ${gateHeaderDisplayName(m.gateCode as GateId)}`;
  }

  if (action === "evidence.unlinked_from_workspace_phase") {
    previousValue =
      m.beforePhase != null || m.beforeGate != null
        ? `Phase ${String(m.beforePhase ?? "—")}, gate ${String(m.beforeGate ?? "—")}`
        : "Workspace link";
    newValue = "Phase and gate cleared on evidence";
  } else if (action === "evidence.linked_to_workspace_phase") {
    newValue = `Phase ${String(m.phaseNumber ?? "—")}, gate ${String(m.gateCode ?? "—")}`;
  } else if (action === "evidence.linked_to_phases") {
    const nums = Array.isArray(m.phaseNumbers) ? m.phaseNumbers.filter((x): x is number => typeof x === "number") : [];
    newValue =
      nums.length > 0 ? `Phases ${nums.sort((a, b) => a - b).join(", ")}` : "Phase links added";
    if (nums.length > 0) {
      relatedObject = `Phases ${nums.sort((a, b) => a - b).join(", ")}`;
    }
  } else if (action === "evidence.unlinked_from_phase") {
    newValue =
      typeof m.phaseNumber === "number" ?
        `Removed · Phase ${m.phaseNumber} — ${PHASE_NAMES[m.phaseNumber] ?? ""}`.trim()
      : "Phase link removed";
    if (typeof m.phaseNumber === "number") {
      relatedObject = `Phase ${m.phaseNumber} — ${PHASE_NAMES[m.phaseNumber] ?? `Phase ${m.phaseNumber}`}`;
    }
  } else if (action === "evidence.linked_to_gate") {
    newValue =
      typeof m.gateCode === "string" ?
        `Gate ${m.gateCode} — ${gateHeaderDisplayName(m.gateCode as GateId)}`
      : "Gate link added";
  } else if (action === "evidence.unlinked_from_gate") {
    newValue =
      typeof m.gateCode === "string" ?
        `Removed · Gate ${m.gateCode} — ${gateHeaderDisplayName(m.gateCode as GateId)}`
      : "Gate link removed";
  } else if (action === "evidence.linked_to_artifact") {
    newValue = relatedObject !== "—" ? `Linked · ${relatedObject}` : "Linked to artifact";
  } else if (action === "evidence.unlinked_from_artifact") {
    newValue = relatedObject !== "—" ? `Unlinked · ${relatedObject}` : "Artifact link removed";
  } else if (action === "evidence.metadata_updated") {
    newValue = "Metadata fields saved";
  } else if (action === "evidence.item_archived") {
    newValue = "Status set to archived";
  } else if (action === "evidence.item_deleted") {
    newValue = "Evidence row removed";
  } else if (action === "evidence.item_created") {
    newValue = `Registered · ${String(m.evidenceType ?? "item")}`;
  } else {
    const parts = Object.entries(m)
      .filter(([, v]) => v != null && String(v) !== "")
      .map(([k, v]) => `${k}: ${String(v)}`);
    if (parts.length) newValue = parts.join("; ");
  }

  return { previousValue, newValue, relatedObject };
}

function buildEvidenceHistoryEvents(
  row: {
    id: string;
    name: string;
    evidenceCode: string;
    createdAt: Date;
    updatedAt: Date;
    uploadedByName: string;
  },
  audits: AuditRowForEvidence[],
  artifactLabel: (artifactId: string) => string | undefined,
): EvidenceHistoryEvent[] {
  const fromAudits: EvidenceHistoryEvent[] = audits.map((a) => {
    const delta = formatAuditDelta(a.action, a.metadata, artifactLabel);
    const eventType = EVIDENCE_AUDIT_SUMMARY[a.action] ?? a.action.replace(/^evidence\./, "").replace(/_/g, " ");
    return {
      id: `audit-${a.id}`,
      summaryLabel: eventType,
      timestampLabel: formatDateTimeLabel(a.createdAt),
      timestampIso: a.createdAt.toISOString(),
      eventType,
      actor: auditActorLabel(a),
      previousValue: delta.previousValue,
      newValue: delta.newValue,
      relatedObject: delta.relatedObject,
      auditReference: a.id,
    };
  });

  const hasCreate = audits.some((a) => a.action === "evidence.item_created");
  const bootstrap: EvidenceHistoryEvent[] = [];
  if (!hasCreate) {
    bootstrap.push({
      id: `h-${row.id}-created`,
      summaryLabel: "Evidence record created",
      timestampLabel: formatDateTimeLabel(row.createdAt),
      timestampIso: row.createdAt.toISOString(),
      eventType: "Record created",
      actor: row.uploadedByName,
      previousValue: "—",
      newValue: row.name,
      relatedObject: row.evidenceCode,
      auditReference: "",
    });
  }

  const merged = [...fromAudits, ...bootstrap];
  merged.sort((x, y) => y.timestampIso.localeCompare(x.timestampIso));
  return merged;
}

export async function loadEvidenceCenterData(
  projectIdParam: string,
  selectedEvidenceId?: string,
): Promise<EvidenceCenterData> {
  const resolvedId = await resolveProjectIdFromRouteParam(projectIdParam);
  if (!resolvedId) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: resolvedId },
    include: {
      evidenceItems: {
        orderBy: { updatedAt: "desc" },
        include: {
          artifactLinks: { include: { artifact: true } },
          gateLinks: true,
          phaseLinks: true,
          comments: { orderBy: { createdAt: "asc" } },
        },
      },
      artifacts: true,
    },
  });

  if (!project) {
    notFound();
  }

  const userDisplay = await getCurrentUserDisplay();
  const viewer = await getCurrentUser();
  const gateRuleRows = await prisma.gateRuleConfig.findMany({ where: { status: "active" } });
  const ruleByCode = new Map(gateRuleRows.map((r) => [r.gateCode.toUpperCase(), r]));
  const gateLinkOptions = ALL_GATES.map((gateCode) => {
    const rule = ruleByCode.get(gateCode);
    return {
      gateCode,
      gateName: rule?.gateName?.trim() || gateHeaderDisplayName(gateCode),
      phaseNumber: rule?.relatedPhaseNumber ?? 1,
      requiredEvidence: rule?.requiredEvidenceCount ?? 0,
      ruleStatus: rule?.status ?? "inactive",
    };
  });

  const projectId = project.id;
  const proj = project;
  const code = projectDisplayCode(proj.vaultFolder, proj.slug);

  const evidenceItems: EvidenceItem[] = proj.evidenceItems.map((e) => ({
    id: e.id,
    evidenceCode: e.evidenceCode,
    name: e.name,
    description: e.description || undefined,
    evidenceType: coerceEvidenceType(e.evidenceType),
    projectId,
    projectName: proj.name,
    phaseNumber: e.phaseNumber ?? undefined,
    phaseName: e.phaseNumber ? PHASE_NAMES[e.phaseNumber] : undefined,
    gateCode: e.gateCode ?? undefined,
    gateName: e.gateCode
      ? gateHeaderDisplayName(e.gateCode as GateId)
      : undefined,
    uploadedBy: e.uploadedByName,
    uploadedOnLabel: formatDateTimeLabel(e.updatedAt),
    uploadedAtIso: e.createdAt.toISOString(),
    updatedAtIso: e.updatedAt.toISOString(),
    classification: coerceClassification(e.classification),
    linkedArtifactIds: e.artifactLinks.map((l) => l.artifactId),
    status: coerceItemStatus(e.status),
    completenessPercent: e.completenessPercent,
    href: `/projects/${projectId}/evidence/${e.id}`,
  }));

  const evidenceIds = proj.evidenceItems.map((e) => e.id);
  const auditsForProject =
    evidenceIds.length === 0 ?
      []
    : await prisma.auditEntry.findMany({
        where: { subjectKind: "evidence_item", subjectId: { in: evidenceIds } },
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, email: true } } },
      });

  const auditsByEvidenceId = new Map<string, AuditRowForEvidence[]>();
  for (const a of auditsForProject) {
    const list = auditsByEvidenceId.get(a.subjectId);
    if (list) list.push(a);
    else auditsByEvidenceId.set(a.subjectId, [a]);
  }

  function buildPackage(row: (typeof proj.evidenceItems)[0]): EvidenceCenterSelectedEvidence {
    let tags: string[] = [];
    try {
      const raw = row.tagsJson;
      if (Array.isArray(raw)) tags = raw as string[];
      else if (typeof raw === "string") tags = JSON.parse(raw || "[]") as string[];
    } catch {
      tags = [];
    }

    const detail: EvidenceDetail = {
      id: row.id,
      evidenceCode: row.evidenceCode,
      name: row.name,
      description: row.description || "",
      evidenceType: coerceEvidenceType(row.evidenceType),
      projectId,
      projectName: proj.name,
      phaseNumber: row.phaseNumber ?? undefined,
      phaseName: row.phaseNumber ? PHASE_NAMES[row.phaseNumber] : undefined,
      gateCode: row.gateCode ?? undefined,
      gateName: row.gateCode
        ? gateHeaderDisplayName(row.gateCode as GateId)
        : undefined,
      uploadedBy: row.uploadedByName,
      uploadedOnLabel: formatDateTimeLabel(row.updatedAt),
      fileTypeLabel: row.fileTypeLabel,
      fileSizeLabel:
        row.fileSizeBytes != null ? `${Math.round(row.fileSizeBytes / 1024)} KB` : undefined,
      source: row.source ?? undefined,
      classification: coerceClassification(row.classification),
      retentionPolicyLabel: row.retentionPolicyLabel ?? undefined,
      checksum: row.checksum ?? undefined,
      tags,
      notes: row.notes ?? undefined,
      status: coerceItemStatus(row.status),
      previewHref: row.previewHref ?? undefined,
      downloadHref: row.downloadHref ?? undefined,
    };

    const linkedArtifacts = row.artifactLinks.map((link) => ({
      id: link.artifact.id,
      label: `${link.artifact.templateId} · ${link.artifact.localId}`,
      href: `/projects/${projectId}/artifacts/${link.artifact.id}`,
    }));

    const gateIdSet = new Set<string>();
    for (const gl of row.gateLinks) {
      if (gl.gateCode?.trim()) gateIdSet.add(gl.gateCode.trim().toUpperCase());
    }
    if (row.gateCode?.trim()) gateIdSet.add(row.gateCode.trim().toUpperCase());
    const linkedGates = Array.from(gateIdSet)
      .sort((a, b) => a.localeCompare(b))
      .map((code) => ({
        id: code,
        label: `${code} — ${gateHeaderDisplayName(code as GateId)}`,
        href: `/projects/${projectId}/gates/${code.toLowerCase()}/review`,
      }));

    const phaseNumSet = new Set<number>();
    for (const pl of row.phaseLinks) {
      if (pl.phaseNumber >= 1 && pl.phaseNumber <= 14) phaseNumSet.add(pl.phaseNumber);
    }
    if (row.phaseNumber != null && row.phaseNumber >= 1 && row.phaseNumber <= 14) {
      phaseNumSet.add(row.phaseNumber);
    }
    const linkedPhases = Array.from(phaseNumSet)
      .sort((a, b) => a - b)
      .map((n) => ({
        id: `phase-${n}`,
        label: `Phase ${n} — ${PHASE_NAMES[n] ?? `Phase ${n}`}`,
        href: `/projects/${projectId}/workspace?phase=${n}`,
      }));

    const artifactLabelFn = (artifactId: string) => {
      const link = row.artifactLinks.find((l) => l.artifactId === artifactId);
      return link ? `${link.artifact.templateId} · ${link.artifact.localId}` : undefined;
    };

    const rowAudits = auditsByEvidenceId.get(row.id) ?? [];
    const history = buildEvidenceHistoryEvents(
      {
        id: row.id,
        name: row.name,
        evidenceCode: row.evidenceCode,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        uploadedByName: row.uploadedByName,
      },
      rowAudits,
      artifactLabelFn,
    );

    const comments: EvidenceCommentRow[] = row.comments.map((c) => ({
      id: c.id,
      author: c.authorName,
      authorId: c.authorId,
      body: c.body,
      visibility: coerceCommentVisibility(c.visibility),
      mentions: parseMentionsJson(c.mentionsJson),
      attachmentRef: c.attachmentRef ?? undefined,
      resolved: c.resolved,
      createdAtLabel: formatDateTimeLabel(c.createdAt),
      updatedAtLabel: formatDateTimeLabel(c.updatedAt),
      isViewerAuthor:
        viewer != null &&
        (c.authorId === viewer.id ||
          (!c.authorId && c.authorName.trim() === (viewer.name?.trim() || ""))),
    }));

    const completenessTotal = Math.max(proj.evidenceItems.length, 1);
    const linkedN = proj.evidenceItems.filter((x) => x.status === "linked").length;
    const partialN = proj.evidenceItems.filter((x) => x.status === "partially_linked").length;
    const missingN = proj.evidenceItems.filter((x) => x.status === "unlinked").length;

    return {
      detail,
      completeness: {
        overallPercent: Math.round(((linkedN + partialN * 0.5) / completenessTotal) * 100),
        complete: { count: linkedN, percent: Math.round((linkedN / completenessTotal) * 100) },
        partial: { count: partialN, percent: Math.round((partialN / completenessTotal) * 100) },
        missing: { count: missingN, percent: Math.round((missingN / completenessTotal) * 100) },
        unlinked: {
          count: missingN,
          percent: Math.round((missingN / completenessTotal) * 100),
        },
        detailsHref: `/projects/${projectId}/evidence/completeness`,
      },
      linkedArtifacts,
      linkedGates,
      linkedPhases,
      history,
      comments,
    };
  }

  const evidencePackages: Record<string, EvidenceCenterSelectedEvidence> = {};
  for (const row of proj.evidenceItems) {
    evidencePackages[row.id] = buildPackage(row);
  }

  if (
    selectedEvidenceId != null &&
    selectedEvidenceId !== "" &&
    evidencePackages[selectedEvidenceId] === undefined
  ) {
    notFound();
  }

  const selectedId =
    selectedEvidenceId && evidencePackages[selectedEvidenceId] ?
      selectedEvidenceId
    : proj.evidenceItems[0]?.id ?? "";

  const selectedEvidence =
    selectedId && evidencePackages[selectedId] ?
      evidencePackages[selectedId]
    : buildEmptySelected(projectId, proj.name, userDisplay);

  const evidenceByGate = ALL_GATES.map((g) => {
    const templates = getTemplatesForGate(g);
    const requiredEvidence = Math.max(templates.length, 1);
    const linked = proj.evidenceItems.filter((e) => evidenceLinkedToGate(e, g)).length;
    const coveragePercent = Math.min(100, Math.round((linked / requiredEvidence) * 100));
    let status: EvidenceCenterData["evidenceByGate"][0]["status"] = "not_started";
    if (coveragePercent >= 100) status = "complete";
    else if (coveragePercent > 0) status = "partial";
    else status = "missing";

    return {
      gateId: g.toLowerCase(),
      gateCode: g,
      gateName: gateHeaderDisplayName(g),
      evidenceLinked: linked,
      requiredEvidence,
      coveragePercent,
      status,
      href: `/projects/${projectId}/gates/${g.toLowerCase()}/review`,
    };
  });

  const allT = getAllTemplates();
  const phaseCursor = clampWorkspacePhase(proj.currentPhase);
  const evidenceByPhaseFixed = Array.from({ length: 14 }, (_, i) => {
    const phaseNumber = i + 1;
    const templatesForPhase = allT.filter((t) => t.phase === phaseNumber);
    const requiredEvidence = Math.max(templatesForPhase.length, 1);
    const items = proj.evidenceItems.filter((e) => evidenceLinkedToPhase(e, phaseNumber)).length;
    const coveragePercent = Math.min(100, Math.round((items / requiredEvidence) * 100));
    let status: EvidenceCenterData["evidenceByPhase"][0]["status"] = "not_started";
    if (coveragePercent >= 90) status = "complete";
    else if (coveragePercent > 0) status = "partial";
    else if (items === 0) status = "missing";

    const missingCount = Math.max(0, requiredEvidence - items);
    const linkStatus = phaseLinkStatus(items, requiredEvidence);

    return {
      phaseId: `phase-${phaseNumber}`,
      phaseNumber,
      phaseName: PHASE_NAMES[phaseNumber] ?? `Phase ${phaseNumber}`,
      evidenceItems: items,
      requiredEvidence,
      coveragePercent,
      status,
      detailHref: `/projects/${projectId}/traceability/phase-evidence/phase-${phaseNumber}`,
      workspaceHref: `/projects/${projectId}/workspace?phase=${phaseNumber}`,
      linkStatus,
      missingCount,
      completionImpact: phaseCompletionImpact(phaseNumber, phaseCursor, missingCount, requiredEvidence),
      addEvidenceHref: `/projects/${projectId}/evidence`,
    };
  });

  const evidenceByArtifact = proj.artifacts.map((art) => {
    const linked = proj.evidenceItems.filter((e) =>
      e.artifactLinks.some((l) => l.artifactId === art.id),
    ).length;
    const requiredEvidence = 1;
    const coveragePercent = linked >= 1 ? 100 : 0;
    let status: EvidenceCenterData["evidenceByArtifact"][0]["status"] = "not_started";
    if (linked >= 1) status = "complete";
    else if (art.status !== "Draft") status = "partial";
    else status = "missing";

    return {
      artifactId: art.id,
      artifactLocalId: art.templateId,
      artifactTitle: art.localId,
      evidenceLinked: linked,
      requiredEvidence,
      coveragePercent,
      status,
      href: `/projects/${projectId}/artifacts/${art.id}`,
    };
  });

  const phaseLinkOptions = Array.from({ length: 14 }, (_, i) => {
    const phaseNumber = i + 1;
    const templatesForPhase = allT.filter((t) => t.phase === phaseNumber);
    return {
      phaseNumber,
      phaseName: PHASE_NAMES[phaseNumber] ?? `Phase ${phaseNumber}`,
      requiredEvidence: templatesForPhase.length,
    };
  });

  const linkableArtifacts = proj.artifacts.map((art) => ({
    id: art.id,
    label: `${art.templateId} · ${art.localId} (v${art.version})`,
    templateId: art.templateId,
    localId: art.localId,
    version: art.version,
    status: art.status,
    phaseNumber: templatePhaseNumber(art.templateId),
  }));

  const blockers: string[] = [];
  if (proj.evidenceItems.length === 0) {
    blockers.push("Add at least one evidence item for audit readiness.");
  }

  return {
    user: { ...userDisplay },
    project: {
      id: projectId,
      code,
      name: proj.name,
      currentPhase: Math.min(14, Math.max(1, proj.currentPhase)),
    },
    evidenceItems,
    selectedEvidence,
    evidenceByGate,
    evidenceByPhase: evidenceByPhaseFixed,
    evidenceByArtifact,
    linkableArtifacts,
    gateLinkOptions,
    phaseLinkOptions,
    exportBundle: {
      projectId,
      selectedEvidenceIds: selectedId ? [selectedId] : [],
      canExportSelected: evidenceItems.length > 0,
      canExportByGate: evidenceItems.length > 0,
      canExportFullBundle: evidenceItems.length > 0,
      selectedFilename: `${code}_selected-evidence.json`,
      gateBundleFilename: `${code}_gate-evidence.json`,
      fullBundleFilename: `${code}_full-evidence-bundle.json`,
      blockers,
    },
    actionState: {
      title: "Stay compliant and audit-ready.",
      description: "Keep evidence linked, complete, and up-to-date across the lifecycle.",
      secondaryLabel: "Validate Evidence",
      primaryLabel: "Export Evidence Bundle",
      secondaryHref: `/projects/${projectId}/evidence`,
      primaryHref: `/api/projects/${projectId}/evidence/export?scope=full`,
      canSubmit: evidenceItems.length > 0,
      blockers,
    },
    evidencePackages,
  };
}

function buildEmptySelected(
  projectId: string,
  projectName: string,
  viewer: CurrentUserDisplay,
): EvidenceCenterSelectedEvidence {
  const now = formatDateTimeLabel(new Date());
  return {
    detail: {
      id: "empty",
      evidenceCode: "EV-EMPTY",
      name: "No evidence selected",
      description: "Add evidence items to this project.",
      evidenceType: "document",
      projectId,
      projectName,
      uploadedBy: viewer.name,
      uploadedOnLabel: now,
      fileTypeLabel: "—",
      classification: "internal",
      tags: [],
      status: "unlinked",
    },
    completeness: {
      overallPercent: 0,
      complete: { count: 0, percent: 0 },
      partial: { count: 0, percent: 0 },
      missing: { count: 0, percent: 0 },
      detailsHref: `/projects/${projectId}/evidence/completeness`,
    },
    linkedArtifacts: [],
    linkedGates: [],
    linkedPhases: [],
    history: [],
    comments: [],
  };
}
