import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { parseApplicability } from "@/lib/applicability";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { isArtifactBodyApproved, projectDisplayCode } from "@/lib/server/helpers";
import { buildPhaseNavigatorItems } from "@/lib/phaseNavigatorItems";
import {
  buildCompletionChecklistItems,
  buildCompletionRulesPayload,
} from "@/lib/workspaceCompletionChecklist";
import { buildNextPhaseWorkspaceChecklistSteps } from "@/lib/workspace-next-phase-checklist";
import {
  buildGateMissingRequirements,
  buildWorkspacePhaseSlice,
} from "@/lib/workspacePhaseWorkspaceSlice";
import {
  WORKSPACE_PHASE_MAX,
  clampWorkspacePhase,
  domainPhaseForWorkspaceIndex,
  gateHeaderDisplayName,
  workspacePhaseMeta,
  workspacePhaseObjectives,
  workspacePhasePurpose,
} from "@/lib/workspacePhases";
import { projectGatePackagePreviewHref, projectTemplateWizardHref } from "@/lib/projects-url";
import { getTemplatesForPhase } from "@/templates/registry";
import type {
  NextPhaseWorkspaceViewData,
  RequiredTemplateStatus,
  RequiredTemplateSummary,
} from "@/types/next-phase-workspace.types";
import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import type { PhaseNavigatorMeta } from "@/components/lifecycle-workspace/phase-navigator-types";

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

  const phaseTemplates = getTemplatesForPhase(domainPhaseForWorkspaceIndex(phaseNumber));

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

  const user = await getCurrentUserDisplay();
  const applicability = parseApplicability(project.applicabilityJson);
  const sliceProject = {
    id: project.id,
    artifacts: project.artifacts,
    applicabilityJson: project.applicabilityJson,
  };

  const navSlice = buildWorkspacePhaseSlice(sliceProject, dbPhase, user);
  const projectPhaseBlocked =
    !navSlice.templatesComplete ||
    navSlice.validationWarnings.some((w) => w.severity === "error");
  const projectPhaseReadyForReview =
    navSlice.templatesComplete &&
    navSlice.evidenceRows.length > 0 &&
    !navSlice.validationWarnings.some((w) => w.severity === "error" || w.severity === "warning");

  const phaseNavigatorItems = buildPhaseNavigatorItems({
    projectId,
    projectCurrentPhase: dbPhase,
    selectedWorkspacePhase: phaseNumber,
    projectPhaseBlocked,
    projectPhaseReadyForReview,
  });

  const viewSlice = buildWorkspacePhaseSlice(sliceProject, phaseNumber, user);
  const viewMeta = workspacePhaseMeta(phaseNumber);
  const gateBannerId = viewMeta.gate ?? "G1";
  const gateDisplayName = gateHeaderDisplayName(viewMeta.gate);

  const checklistSteps = buildNextPhaseWorkspaceChecklistSteps({
    projectId,
    workspacePhaseNumber: phaseNumber,
    templateRows: viewSlice.templateRows,
    evidenceRows: viewSlice.evidenceRows,
    validationWarnings: viewSlice.validationWarnings,
  });

  const completionRules = buildCompletionRulesPayload({
    gateCode: gateBannerId,
    gateDisplayName,
  });

  const checklistItems = buildCompletionChecklistItems(checklistSteps, undefined, {
    projectId,
    gateBannerId,
    gateDisplayName,
    validationWarnings: viewSlice.validationWarnings,
  });

  const gatesHref = `/projects/${projectId}/gates`;
  const curDbMeta = workspacePhaseMeta(dbPhase);
  const nextPhaseN = dbPhase + 1;
  const startPhaseModal =
    dbPhase < WORKSPACE_PHASE_MAX ?
      {
        nextPhase: nextPhaseN,
        nextPhaseTitle: workspacePhaseMeta(nextPhaseN).title,
        currentPhaseTitle: curDbMeta.title,
        checklistPreview: workspacePhaseObjectives(dbPhase).slice(0, 4),
        nextTemplateLabels: getTemplatesForPhase(domainPhaseForWorkspaceIndex(nextPhaseN))
          .slice(0, 6)
          .map((t) => t.title),
        evidenceExpectation:
          "Link gate-aligned evidence and finalize required templates before advancing the lifecycle phase.",
        gateCode: curDbMeta.gate ?? "G1",
        gateName: gateHeaderDisplayName(curDbMeta.gate),
      }
    : null;

  const lockedContext = {
    currentPhaseTitle: curDbMeta.title,
    gateCode: curDbMeta.gate ?? "G1",
    gateName: gateHeaderDisplayName(curDbMeta.gate),
    missingBullets: [
      "Complete templates and gate evidence on the active lifecycle phase.",
      "Obtain the prior gate decision before opening later milestones.",
    ],
  };

  const phaseNavigatorMeta: PhaseNavigatorMeta = {
    gatesHref,
    projectCurrentPhase: dbPhase,
    completionByPhase: {},
    startPhaseModal,
    lockedContext,
    applicability,
  };

  const missing = buildGateMissingRequirements(
    viewSlice.templateRows,
    viewSlice.evidenceRows.length,
    viewSlice.validationWarnings,
  );
  const gateCodeSubmit = gateBannerId;
  const gateSubmissionState: GateSubmissionState = {
    projectId,
    gateCode: gateCodeSubmit,
    gateName: gateDisplayName,
    canSubmit: missing.length === 0,
    missingRequirements: missing,
    submitHref: `/projects/${projectId}/gates/${gateCodeSubmit.toLowerCase()}/review`,
    readinessPercent:
      checklistItems.length === 0
        ? 0
        : Math.round(
            (checklistItems.filter((c) => c.status === "complete").length / checklistItems.length) *
              100,
          ),
    packagePreviewHref: projectGatePackagePreviewHref(projectId, gateCodeSubmit),
    requiredInputs: viewSlice.templateRows.map((t) => ({
      id: t.id,
      label: t.title,
      status:
        t.status === "Completed" ? "complete"
        : t.status === "In Progress" ? "incomplete"
        : "missing",
      href: projectTemplateWizardHref(projectId, t.id),
    })),
    evidenceItems: viewSlice.evidenceRows.map((e) => ({
      id: e.id,
      name: e.name,
      href: `/projects/${projectId}/artifacts/${e.id}`,
    })),
    validationWarnings: viewSlice.validationWarnings.map((w) => ({
      id: w.id,
      message: w.message,
      severity: w.severity,
      href: w.href,
    })),
  };

  return {
    projectId,
    projectName: project.name,
    projectCode: code,
    phaseNumber,
    projectCurrentPhase: dbPhase,
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
    phaseNavigatorItems,
    phaseNavigatorMeta,
    checklistItems,
    completionRules,
    validationWarnings: viewSlice.validationWarnings,
    gateSubmissionState,
  };
}
