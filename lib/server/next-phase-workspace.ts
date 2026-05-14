import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { projectDisplayCode } from "@/lib/server/helpers";
import {
  clampWorkspacePhase,
  workspacePhaseMeta,
  workspacePhaseObjectives,
  workspacePhasePurpose,
} from "@/lib/workspacePhases";
import type { NextPhaseWorkspaceViewData } from "@/types/next-phase-workspace.types";

/**
 * Loads the “next phase workspace” surface for `/projects/[id]/workspace?phase=`.
 * Templates list prefers artifacts already on the project (recent first).
 */
export async function loadNextPhaseWorkspaceView(
  projectIdParam: string,
  phaseParam: string | undefined,
): Promise<NextPhaseWorkspaceViewData | null> {
  const resolvedId = await resolveProjectIdFromRouteParam(projectIdParam);
  if (!resolvedId) return null;

  const project = await prisma.project.findUnique({
    where: { id: resolvedId },
    include: {
      artifacts: { orderBy: { updatedAt: "desc" }, take: 80 },
    },
  });
  if (!project) {
    notFound();
  }

  const projectId = project.id;
  const code = projectDisplayCode(project.vaultFolder, project.slug);
  const dbPhase = clampWorkspacePhase(project.currentPhase);
  const requested = phaseParam ? Number.parseInt(phaseParam, 10) : NaN;
  const phaseNumber = clampWorkspacePhase(Number.isFinite(requested) ? requested : dbPhase);
  const meta = workspacePhaseMeta(phaseNumber);
  const purpose = workspacePhasePurpose(phaseNumber);
  const objectives = workspacePhaseObjectives(phaseNumber);

  const templateIds = [...new Set(project.artifacts.map((a) => a.templateId))].slice(0, 24);

  const carriedForwardArtifacts = project.artifacts.slice(0, 24).map((a) => ({
    id: a.id,
    label: `${a.templateId} · v${a.version} · ${a.localId}`,
    href: `/projects/${projectId}/artifacts/${a.id}`,
  }));

  const gateDependencyLabel = meta.gate
    ? `This milestone aligns with ${meta.gate} in the master lifecycle map; complete the gate package before claiming downstream readiness.`
    : "Advance through lifecycle gates in order; do not skip mandatory approvals.";

  return {
    projectId,
    projectName: project.name,
    projectCode: code,
    phaseNumber,
    phaseTitle: meta.title,
    phasePurpose: purpose,
    requiredTemplates: templateIds.length ? templateIds : ["No artifacts yet — register templates from the Template Registry."],
    evidenceExpectations: [
      "Link completion evidence to templates before requesting the next gate.",
      "Use the Evidence Center classification fields for every upload.",
    ],
    initialChecklist: objectives.map((label, i) => ({ id: `chk-${phaseNumber}-${i}`, label })),
    carriedForwardArtifacts,
    gateDependencyLabel,
    phaseGateCode: meta.gate,
  };
}
