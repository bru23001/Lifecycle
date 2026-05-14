"use server";

import { revalidatePath } from "next/cache";

import { parseApplicability, type Applicability } from "@/lib/applicability";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { clampWorkspacePhase, domainPhaseForWorkspaceIndex } from "@/lib/workspacePhases";
import { getTemplatesForPhase } from "@/templates/registry";

export type AdvanceLifecyclePhaseResult =
  | { ok: true; newPhase: number }
  | { ok: false; error: string; blockingTemplates?: string[] };

function filterTemplatesForPhase(phase: number, app: Applicability) {
  const p = domainPhaseForWorkspaceIndex(phase);
  return getTemplatesForPhase(p).filter((tmpl) => {
    const tid = tmpl.templateId;
    if (tid === "A-11" && !app.data) return false;
    if (tid === "A-12" && !app.apis) return false;
    if (tid === "UXD-001" && !app.ui) return false;
    return true;
  });
}

function latestArtifactByTemplate(
  artifacts: { templateId: string; version: number; status: string }[],
): Map<string, { status: string; version: number }> {
  const m = new Map<string, { status: string; version: number }>();
  for (const a of artifacts) {
    const cur = m.get(a.templateId);
    if (!cur || a.version > cur.version) {
      m.set(a.templateId, { status: a.status, version: a.version });
    }
  }
  return m;
}

export async function advanceLifecyclePhase(projectId: string): Promise<AdvanceLifecyclePhaseResult> {
  await requireCurrentUser();

  const project = await prisma.project.findFirst({
    where: { id: projectId, archivedAt: null },
    include: {
      artifacts: { select: { templateId: true, version: true, status: true } },
    },
  });
  if (!project) {
    return { ok: false, error: "Project not found or archived." };
  }

  const phase = clampWorkspacePhase(project.currentPhase);
  if (phase >= 14) {
    return { ok: false, error: "Already at the final lifecycle phase." };
  }

  const app = parseApplicability(project.applicabilityJson);
  const required = filterTemplatesForPhase(phase, app);
  const byTemplate = latestArtifactByTemplate(project.artifacts);
  const blocking: string[] = [];
  for (const tmpl of required) {
    const art = byTemplate.get(tmpl.templateId);
    if (!art || art.status === "Draft") {
      blocking.push(`${tmpl.templateId} — ${tmpl.title}`);
    }
  }
  if (blocking.length > 0) {
    return {
      ok: false,
      error: "Complete all required artifacts for the current phase before advancing.",
      blockingTemplates: blocking,
    };
  }

  const newPhase = clampWorkspacePhase(phase + 1);

  await prisma.project.update({
    where: { id: projectId },
    data: { currentPhase: newPhase },
  });

  await recordAudit({
    action: "project.phase_advanced",
    subjectKind: "project",
    subjectId: projectId,
    projectId,
    metadata: { fromPhase: phase, toPhase: newPhase },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);
  return { ok: true, newPhase };
}
