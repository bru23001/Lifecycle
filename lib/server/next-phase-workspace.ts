import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { isArtifactBodyApproved, projectDisplayCode } from "@/lib/server/helpers";
import {
  clampWorkspacePhase,
  workspacePhaseMeta,
  workspacePhaseObjectives,
  workspacePhasePurpose,
} from "@/lib/workspacePhases";
import { getTemplatesForPhase } from "@/templates/registry";
import type {
  NextPhaseWorkspaceViewData,
  RequiredTemplateStatus,
  RequiredTemplateSummary,
} from "@/types/next-phase-workspace.types";

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

  const phaseTemplates = getTemplatesForPhase(phaseNumber);

  /**
   * For each template registered to this phase, find the most recently
   * updated artifact for THIS project (if any) and derive its display status.
   * If none exists, the template is presented as "not started" so the user
   * can click to start the wizard. This is what was broken before — the page
   * used to show a help string instead of actionable templates.
   */
  const requiredTemplates: RequiredTemplateSummary[] = phaseTemplates.map((t) => {
    const latest = project.artifacts.find((a) => a.templateId === t.templateId);
    let status: RequiredTemplateStatus = "not_started";
    let statusHint: string | undefined;
    if (latest) {
      if (isArtifactBodyApproved(latest.dataJson)) {
        status = "approved";
      } else if (
        latest.status !== "Draft" &&
        latest.status.toLowerCase().includes("review")
      ) {
        status = "in_review";
      } else {
        status = "in_progress";
      }
      statusHint = `v${latest.version} · saved ${latest.updatedAt
        .toISOString()
        .slice(0, 10)}`;
    }
    return {
      templateId: t.templateId,
      title: t.title,
      gate: t.gate,
      href: `/projects/${projectId}/templates/${encodeURIComponent(t.templateId)}`,
      status,
      statusHint,
    };
  });

  const requiredTemplatesEmptyMessage =
    requiredTemplates.length === 0
      ? "No templates are registered for this phase yet. Open the Template Registry to add one."
      : undefined;

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
    requiredTemplates,
    requiredTemplatesEmptyMessage,
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
