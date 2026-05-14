import { notFound } from "next/navigation";

import type { Artifact } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isArtifactBodyApproved, projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import {
  clampWorkspacePhase,
  WORKSPACE_PHASE_MAX,
  workspacePhaseMeta,
} from "@/lib/workspacePhases";
import type { CoverageStatus } from "@/types/traceability.types";
import type {
  PhaseArtifactLinkedArtifactRow,
  PhaseArtifactLinkHealth,
  PhaseArtifactTraceabilityListData,
  PhaseArtifactTraceabilityPhaseDetailData,
  PhaseArtifactTraceabilityPhaseSummary,
} from "@/types/phase-artifact-traceability.types";

function parseJsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function coverageFromRatio(linked: number, total: number): { percent: number; status: CoverageStatus } {
  if (total <= 0) return { percent: 100, status: "complete" };
  const percent = Math.min(100, Math.round((100 * linked) / total));
  if (linked >= total) return { percent, status: "complete" };
  if (linked <= 0) return { percent, status: "missing" };
  return { percent, status: "partial" };
}

function phaseLinkHealth(status: CoverageStatus): { health: PhaseArtifactLinkHealth; label: string } {
  if (status === "complete") return { health: "healthy", label: "All required templates satisfied" };
  if (status === "partial") return { health: "attention", label: "Some required artifacts still open" };
  return { health: "blocked", label: "Required artifacts missing" };
}

function artifactLinkHealth(art: { status: string; dataJson: unknown }): { health: PhaseArtifactLinkHealth; label: string } {
  const approved = isArtifactBodyApproved(art.dataJson);
  if (approved && art.status !== "Draft") return { health: "healthy", label: "Body approved" };
  if (approved && art.status === "Draft") return { health: "attention", label: "Approved body; status still draft" };
  if (art.status === "Draft") return { health: "attention", label: "Draft — review body" };
  return { health: "blocked", label: "Body not approved" };
}

async function fetchProjectWithArtifacts(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: { artifacts: true },
  });
}

async function loadPhaseArtifactContext(projectId: string) {
  const project = await fetchProjectWithArtifacts(projectId);
  if (!project) notFound();

  const [lifecycleRows, templateRows] = await Promise.all([
    prisma.lifecyclePhaseConfig.findMany({ orderBy: { phaseNumber: "asc" } }),
    prisma.templateRegistryEntry.findMany({ where: { status: "active" } }),
  ]);

  const lifecycleByPhase = new Map(
    lifecycleRows.map((r) => [
      r.phaseNumber,
      {
        name: r.name?.trim() || workspacePhaseMeta(r.phaseNumber).title,
        required: parseJsonStringArray(r.requiredArtifactIdsJson),
      },
    ]),
  );
  const templateByCode = new Map(templateRows.map((t) => [t.templateCode, { name: t.name }]));

  const latestByTemplate = new Map<string, Artifact>();
  for (const a of project.artifacts) {
    const cur = latestByTemplate.get(a.templateId);
    if (!cur || a.version > cur.version) latestByTemplate.set(a.templateId, a);
  }

  const artifactTemplateIds = new Set(project.artifacts.map((x) => x.templateId));

  const summaries: PhaseArtifactTraceabilityPhaseSummary[] = [];
  for (let phaseNumber = 1; phaseNumber <= WORKSPACE_PHASE_MAX; phaseNumber++) {
    const cfg = lifecycleByPhase.get(phaseNumber);
    const required = cfg?.required ?? [];
    const linked = required.filter((tid) => artifactTemplateIds.has(tid)).length;
    const total = required.length;
    const { percent, status } = coverageFromRatio(linked, total);
    const meta = workspacePhaseMeta(phaseNumber);
    const { health, label } = phaseLinkHealth(status);
    summaries.push({
      phaseNumber,
      phaseName: cfg?.name ?? meta.title,
      requiredCount: total,
      linkedCount: linked,
      missingCount: Math.max(0, total - linked),
      coveragePercent: percent,
      status,
      linkHealth: health,
      linkHealthLabel: label,
      workspaceHref: `/projects/${projectId}/workspace?phase=${phaseNumber}`,
      detailHref: `/projects/${projectId}/traceability/phase-artifacts/${phaseNumber}`,
    });
  }

  return { project, summaries, lifecycleByPhase, templateByCode, latestArtifactByTemplate: latestByTemplate };
}

export async function loadPhaseArtifactTraceabilityList(projectId: string): Promise<PhaseArtifactTraceabilityListData> {
  const user = await getCurrentUserDisplay();
  const { project, summaries } = await loadPhaseArtifactContext(projectId);

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase: clampWorkspacePhase(project.currentPhase),
    },
    phases: summaries,
  };
}

export async function loadPhaseArtifactTraceabilityPhaseDetail(
  projectId: string,
  phaseIdParam: string,
): Promise<PhaseArtifactTraceabilityPhaseDetailData> {
  const phaseNumber = Number.parseInt(phaseIdParam, 10);
  if (!Number.isFinite(phaseNumber) || phaseNumber < 1 || phaseNumber > WORKSPACE_PHASE_MAX) {
    notFound();
  }

  const user = await getCurrentUserDisplay();
  const { project, summaries, lifecycleByPhase, templateByCode, latestArtifactByTemplate } =
    await loadPhaseArtifactContext(projectId);
  const summary = summaries.find((s) => s.phaseNumber === phaseNumber);
  if (!summary) notFound();

  const cfg = lifecycleByPhase.get(phaseNumber);
  const required = cfg?.required ?? [];

  const linkedArtifacts: PhaseArtifactLinkedArtifactRow[] = [];
  const missingTemplates: { templateId: string; templateName: string }[] = [];

  for (const tid of required) {
    const art = latestArtifactByTemplate.get(tid);
    if (art) {
      const tmpl = templateByCode.get(tid);
      const { health, label } = artifactLinkHealth(art);
      linkedArtifacts.push({
        id: art.id,
        templateId: art.templateId,
        localId: art.localId,
        version: art.version,
        title: tmpl ? `${tmpl.name} (${tid})` : tid,
        status: art.status,
        linkHealth: health,
        linkHealthLabel: label,
        ownerLabel: null,
        href: `/projects/${projectId}/artifacts/${art.id}`,
      });
    } else {
      missingTemplates.push({
        templateId: tid,
        templateName: templateByCode.get(tid)?.name ?? tid,
      });
    }
  }

  const artifactIds = linkedArtifacts.map((r) => r.id);
  if (artifactIds.length > 0) {
    const approvals = await prisma.approval.findMany({
      where: {
        projectId,
        approvalType: "artifact_review",
        artifactId: { in: artifactIds },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        artifactId: true,
        submittedBy: { select: { name: true } },
      },
    });
    const ownerByArtifact = new Map<string, string>();
    for (const a of approvals) {
      if (!a.artifactId) continue;
      const name = a.submittedBy?.name?.trim();
      if (name && !ownerByArtifact.has(a.artifactId)) ownerByArtifact.set(a.artifactId, name);
    }
    for (const row of linkedArtifacts) {
      row.ownerLabel = ownerByArtifact.get(row.id) ?? null;
    }
  }

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase: clampWorkspacePhase(project.currentPhase),
    },
    matrixHref: `/projects/${projectId}/traceability`,
    phase: {
      ...summary,
      linkedArtifacts,
      missingTemplates,
    },
  };
}
