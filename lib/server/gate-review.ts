import { notFound } from "next/navigation";

import { evaluateGateForProject } from "@/lib/gateRules";
import type { GateId } from "@/lib/gateRules";
import { indexLatestGateDecisions } from "@/lib/gateStatus";
import { normalizeGateParam } from "@/lib/gateNormalize";
import { hasTemplate } from "@/templates/registry";
import {
  clampWorkspacePhase,
  gateHeaderDisplayName,
  workspacePhaseMeta,
  workspacePhaseObjectives,
  workspacePhasePurpose,
} from "@/lib/workspacePhases";
import type { GateReviewData } from "@/types/gate-review.types";

import {
  formatDateTimeLabel,
  isArtifactBodyApproved,
  projectDisplayCode,
} from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { prisma } from "@/lib/prisma";
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

function gatePhaseAnchor(gate: GateId): number {
  switch (gate) {
    case "G1":
      return 1;
    case "G2":
      return 2;
    case "G3":
      return 4;
    case "G4":
      return 6;
    case "G5":
      return 8;
    case "G6":
      return 9;
    case "G7":
      return 12;
    case "G8":
      return 13;
    case "G9":
    case "G10":
      return 14;
    default:
      return 1;
  }
}

export async function loadGateReviewData(
  projectIdParam: string,
  gateParam: string,
): Promise<GateReviewData> {
  const gate = normalizeGateParam(gateParam);
  if (!gate) {
    notFound();
  }

  const resolvedId = await resolveProjectIdFromRouteParam(projectIdParam);
  if (!resolvedId) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: resolvedId },
    include: {
      artifacts: { orderBy: { createdAt: "desc" } },
      gateDecisions: { orderBy: { createdAt: "desc" } },
      evidenceItems: {
        where: { gateCode: gate },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const userDisplay = await getCurrentUserDisplay();

  const projectId = project.id;

  const phase = clampWorkspacePhase(project.currentPhase);
  const evaluation = await evaluateGateForProject(projectId, gate);
  const latestByGate = indexLatestGateDecisions(
    project.gateDecisions.map((d) => ({
      gateId: d.gateId,
      decision: d.decision,
      evidencePassSnapshot: d.evidencePassSnapshot,
      createdAt: d.createdAt,
    })),
  );
  const latestForGate = latestByGate.get(gate);
  const latestDecisionRow = await prisma.gateDecision.findFirst({
    where: { projectId, gateId: gate },
    orderBy: { createdAt: "desc" },
  });

  const anchorPhase = gatePhaseAnchor(gate);
  const phaseName = PHASE_NAMES[anchorPhase] ?? workspacePhaseMeta(anchorPhase).title;

  const purposeLines = workspacePhasePurpose(anchorPhase);
  const objectives = workspacePhaseObjectives(anchorPhase);

  const templatesForGate = [...new Set(evaluation.checks.map((c) => c.templateId).filter(Boolean))] as string[];

  const latestArtifactByTemplate = new Map<string, (typeof project.artifacts)[0]>();
  for (const a of project.artifacts) {
    if (!latestArtifactByTemplate.has(a.templateId)) {
      latestArtifactByTemplate.set(a.templateId, a);
    }
  }

  const inputMap = new Map<string, import("@/types/gate-review.types").RequiredGateInput>();
  for (let idx = 0; idx < evaluation.checks.length; idx += 1) {
    const c = evaluation.checks[idx]!;
    const tid = c.templateId;
    if (!tid || !hasTemplate(tid) || inputMap.has(tid)) continue;
    const art = latestArtifactByTemplate.get(tid);
    const approved = art ? isArtifactBodyApproved(art.dataJson) : false;
    const provided = Boolean(art);
    let status: import("@/types/gate-review.types").RequiredGateInput["status"] = "missing";
    if (approved) status = "complete";
    else if (provided) status = art!.status === "Submitted" ? "needs_review" : "incomplete";

    inputMap.set(tid, {
      id: `req-${tid}-${idx}`,
      inputCode: tid,
      name: tid,
      description: c.message.slice(0, 200),
      provided,
      status,
      linkedArtifactId: art?.id,
      href: art ? `/projects/${projectId}/artifacts/${art.id}` : undefined,
    });
  }
  const requiredInputs = [...inputMap.values()];

  const completionEvidence = project.evidenceItems.map((e) => ({
    id: e.id,
    name: e.name,
    type: (["pdf", "spreadsheet", "document", "image", "link", "json"].includes(e.evidenceType)
      ? e.evidenceType
      : "document") as import("@/types/gate-review.types").GateEvidenceItem["type"],
    linkedTo: templatesForGate.length ? templatesForGate : [gate],
    addedBy: e.uploadedByName,
    addedOnLabel: formatDateTimeLabel(e.updatedAt),
    href: `/projects/${projectId}/evidence/${e.id}`,
    downloadHref: e.downloadHref ?? undefined,
  }));

  const criteria = evaluation.checks.map((c, i) => ({
    id: c.id ?? `chk-${i}`,
    name: c.templateId ? `${c.templateId} check` : c.id,
    weightPercent: Math.floor(100 / Math.max(evaluation.checks.length, 1)),
    assessment:
      (c.ok ? "meets" : "does_not_meet") as import("@/types/gate-review.types").DecisionCriterion["assessment"],
    evidenceRefs: c.templateId ? [c.templateId] : [],
  }));

  const overallAssessment =
    evaluation.pass ?
      ("meets_requirements" as const)
    : ("does_not_meet_requirements" as const);

  const nextPhase =
    gate === "G1" ? 2
    : gate === "G2" ? 3
    : gate === "G3" ? 6
    : gate === "G4" ? 7
    : gate === "G5" ? 9
    : gate === "G6" ? 10
    : gate === "G7" ? 13
    : gate === "G8" ? 14
    : gate === "G9" ? 14
    : 14;

  const headerStatus =
    latestForGate?.decision === "Accepted" || latestForGate?.decision === "Conditional" ?
      ("approved" as const)
    : ("pending_decision" as const);

  const code = projectDisplayCode(project.vaultFolder, project.slug);

  return {
    user: { ...userDisplay },
    project: {
      id: projectId,
      code,
      name: project.name,
    },
    gateReviewHeader: {
      projectId,
      projectName: project.name,
      gateId: gateParam.toLowerCase(),
      gateCode: gate,
      gateNumber: Number.parseInt(gate.replace("G", ""), 10) || 1,
      totalGates: 10,
      gateName: gateHeaderDisplayName(gate),
      status: headerStatus,
      purpose: purposeLines,
      phaseNumber: anchorPhase,
      phaseName,
      gateOwnerName: userDisplay.name,
      submittedOnLabel: formatDateTimeLabel(project.updatedAt),
      submittedByName: userDisplay.name,
      reviewType: "standard",
      dueDateLabel: "—",
      approversAssigned: 2,
      readinessPercent: evaluation.pass ? 95 : 55,
    },
    gateOverview: {
      purpose: purposeLines,
      successCriteria: objectives.slice(0, 5),
      approvalConsequence: `Advances workspace toward Phase ${nextPhase}: ${PHASE_NAMES[nextPhase] ?? "next milestone"}.`,
      rejectionConsequence: "Returns work to the prior milestone for remediation.",
      currentPhaseLabel: `Phase ${phase}: ${workspacePhaseMeta(phase).title}`,
      phaseProgressPercent: Math.round((phase / 14) * 100),
      phaseWorkspaceHref: `/projects/${projectId}/workspace?phase=${anchorPhase}`,
    },
    requiredInputs,
    completionEvidence,
    decisionCriteria: {
      criteria,
      overallAssessment,
    },
    approvers: [
      {
        id: "a1",
        name: "Review Lead",
        role: "Governance",
        status: evaluation.pass ? "reviewed" : "pending",
        reviewedOnLabel: evaluation.pass ? formatDateTimeLabel(new Date()) : undefined,
        comments: evaluation.pass ? "Evidence checks satisfied." : undefined,
      },
      {
        id: "a2",
        name: "Technical Owner",
        role: "Engineering",
        status: "pending",
      },
    ],
    decisionRecord: {
      gateId: gateParam.toLowerCase(),
      projectId,
      comments: latestDecisionRow?.nextAction ?? "",
      conditions: [],
      status: latestForGate ? "finalized" : "not_recorded",
      decisionLabel: latestForGate?.decision,
    },
    nextPhaseUnlock: {
      canUnlock: evaluation.pass,
      unlockStatus: evaluation.pass ? "ready" : "locked",
      currentPhaseNumber: anchorPhase,
      nextPhaseNumber: nextPhase,
      nextPhaseName: PHASE_NAMES[nextPhase] ?? `Phase ${nextPhase}`,
      requirements: [
        {
          id: "evidence",
          label: "Gate evidence checks pass",
          status: evaluation.pass ? "complete" : "incomplete",
        },
        {
          id: "decision",
          label: "Gate decision recorded",
          status: latestForGate ? "complete" : "incomplete",
        },
      ],
      carriedForwardArtifacts: templatesForGate,
      nextPhaseHref: `/projects/${projectId}/workspace?phase=${nextPhase}`,
    },
    actionState: {
      readinessLabel: evaluation.pass ? "Evidence ready" : "Remediation needed",
      readinessDescription: evaluation.pass
        ? "All automated checks passed for this gate."
        : "Resolve failing checks before recording an advance decision.",
      canSaveReview: true,
      canSubmitDecision: evaluation.pass,
      submitBlockers: evaluation.pass ? [] : evaluation.checks.filter((c) => !c.ok).map((c) => c.message),
    },
  };
}
