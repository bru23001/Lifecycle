import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { gateHeaderDisplayName } from "@/lib/workspacePhases";
import { getAllTemplates, getTemplatesForGate } from "@/templates/registry";
import type {
  EvidenceCenterData,
  EvidenceCenterSelectedEvidence,
  EvidenceDetail,
  EvidenceItem,
} from "@/types/evidence-center.types";
import type { GateId } from "@/lib/gateRules";
import { getCurrentUserDisplay, type CurrentUserDisplay } from "@/lib/server/current-user";
import { ALL_GATES, formatDateTimeLabel, projectDisplayCode } from "@/lib/server/helpers";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";

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
        },
      },
      artifacts: true,
    },
  });

  if (!project) {
    notFound();
  }

  const userDisplay = await getCurrentUserDisplay();

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
    status: coerceItemStatus(e.status),
    completenessPercent: e.completenessPercent,
    href: `/projects/${projectId}/evidence/${e.id}`,
  }));

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

    const linkedGates =
      row.gateCode ?
        [
          {
            id: row.gateCode,
            label: `${row.gateCode} — ${gateHeaderDisplayName(row.gateCode as GateId)}`,
            href: `/projects/${projectId}/gates/${String(row.gateCode).toLowerCase()}/review`,
          },
        ]
      : [];

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
        detailsHref: `/projects/${projectId}/reports/missing-evidence`,
      },
      linkedArtifacts,
      linkedGates,
      history: [
        {
          id: `h-${row.id}-created`,
          label: "Created",
          timestampLabel: formatDateTimeLabel(row.createdAt),
        },
        {
          id: `h-${row.id}-updated`,
          label: "Updated",
          timestampLabel: formatDateTimeLabel(row.updatedAt),
        },
      ],
      comments: [],
    };
  }

  const evidencePackages: Record<string, EvidenceCenterSelectedEvidence> = {};
  for (const row of proj.evidenceItems) {
    evidencePackages[row.id] = buildPackage(row);
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
    const linked = proj.evidenceItems.filter((e) => e.gateCode === g).length;
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
  const evidenceByPhaseFixed = Array.from({ length: 14 }, (_, i) => {
    const phaseNumber = i + 1;
    const templatesForPhase = allT.filter((t) => t.phase === phaseNumber);
    const requiredEvidence = Math.max(templatesForPhase.length, 1);
    const items = proj.evidenceItems.filter((e) => e.phaseNumber === phaseNumber).length;
    const coveragePercent = Math.min(100, Math.round((items / requiredEvidence) * 100));
    let status: EvidenceCenterData["evidenceByPhase"][0]["status"] = "not_started";
    if (coveragePercent >= 90) status = "complete";
    else if (coveragePercent > 0) status = "partial";
    else if (items === 0) status = "missing";

    return {
      phaseId: `phase-${phaseNumber}`,
      phaseNumber,
      phaseName: PHASE_NAMES[phaseNumber] ?? `Phase ${phaseNumber}`,
      evidenceItems: items,
      requiredEvidence,
      coveragePercent,
      status,
      href: `/projects/${projectId}/workspace?phase=${phaseNumber}`,
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
    },
    evidenceItems,
    selectedEvidence,
    evidenceByGate,
    evidenceByPhase: evidenceByPhaseFixed,
    evidenceByArtifact,
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
      secondaryLabel: "Save Review",
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
      detailsHref: `/projects/${projectId}/reports/missing-evidence`,
    },
    linkedArtifacts: [],
    linkedGates: [],
    history: [],
    comments: [],
  };
}
