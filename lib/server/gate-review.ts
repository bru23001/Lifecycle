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
import { projectTemplateWizardHref } from "@/lib/projects-url";

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
        include: {
          artifactLinks: { include: { artifact: true } },
        },
      },
      gateApproverAssignments: {
        where: { gateId: gate },
        orderBy: { createdAt: "asc" },
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
      wizardHref: projectTemplateWizardHref(projectId, tid),
    });
  }
  const requiredInputsBase = [...inputMap.values()];

  const completionEvidence = project.evidenceItems.map((e) => {
    const firstLink = e.artifactLinks[0];
    const linkedArtifactSummary = firstLink?.artifact
      ? `${firstLink.artifact.templateId} (v${firstLink.artifact.version})`
      : undefined;
    return {
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
      evidenceCode: e.evidenceCode,
      classification: e.classification,
      gateCode: e.gateCode ?? gate,
      phaseNumber: e.phaseNumber ?? anchorPhase,
      linkedArtifactSummary,
    };
  });

  const requiredInputs = requiredInputsBase.map((row) => ({
    ...row,
    linkedEvidenceLabels: completionEvidence
      .filter((ev) => ev.linkedTo.includes(row.inputCode))
      .map((ev) => ev.name),
  }));

  const criteria = evaluation.checks.map((c, i) => ({
    id: c.id ?? `chk-${i}`,
    name: c.templateId ? `${c.templateId} check` : c.id,
    description: c.message,
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

  const directoryUsers = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
  const assignableApprovers = directoryUsers.map((u) => ({
    userId: u.id,
    name: u.name?.trim() || u.email,
    role: u.role,
  }));

  const assignedApprovers = project.gateApproverAssignments.map((a) => ({
    userId: a.userId ?? null,
    name: a.approverName,
    role: a.approverRole,
  }));

  const assignedDueAtIso =
    project.gateApproverAssignments.find((a) => a.dueAt)?.dueAt?.toISOString() ?? null;

  const approvalConsequenceText = `Advances workspace toward Phase ${nextPhase}: ${PHASE_NAMES[nextPhase] ?? "next milestone"}.`;
  const rejectionConsequenceText =
    "Returns work to the prior milestone for remediation.";

  const roleSource =
    project.gateApproverAssignments.length > 0
      ? [...new Set(project.gateApproverAssignments.map((a) => a.approverRole))]
      : [...new Set(directoryUsers.map((u) => u.role).filter(Boolean))];
  const requiredApproverRoles =
    roleSource.length >= 2 ? roleSource.slice(0, 10) : ["Governance", "Engineering", "Security", "Product"];

  const relatedTemplateRefs =
    templatesForGate.length > 0 ? templatesForGate.slice(0, 5) : [`Gate ${gate} package`];

  const successCriteriaDetails = objectives.slice(0, 5).map((label, i) => ({
    id: `sc-${i}`,
    label,
    requiredThreshold:
      "All configured gate evidence checks pass; approvers complete criteria assessment before the decision is recorded.",
    evidenceExpectation:
      "Artifacts for linked templates plus completion evidence attached to this gate.",
    acceptanceNotes:
      "Governance records the outcome in the Gate Review decision log; conditions are tracked until closed.",
    relatedTemplates: relatedTemplateRefs,
  }));

  const gatePolicy = {
    gateCode: gate,
    gateName: gateHeaderDisplayName(gate),
    relatedPhaseLabel: `Phase ${anchorPhase}: ${phaseName}`,
    requiredInputs: requiredInputs.map((i) => ({
      inputCode: i.inputCode,
      name: i.name,
      description: i.description,
    })),
    requiredEvidence: completionEvidence.map((e) => e.name),
    requiredApproverRoles,
    decisionRule:
      "Accepted and Conditional require every automated evidence check to pass. Returned, Deferred, and Rejected may be used when evidence is incomplete or advance is declined.",
    unlockRule: `When advance decisions pass evidence checks, the workspace may progress toward Phase ${nextPhase}: ${PHASE_NAMES[nextPhase] ?? "the next milestone"}.`,
    policyVersion: "Master Lifecycle Decision Gates / CYBERCUBE platform policy (demo)",
  };

  const gateConsequences = {
    ifApproved: approvalConsequenceText,
    ifConditional:
      "The project may advance only after documented conditions are accepted and tracked; downstream work should assume constraints until cleared.",
    ifChangesRequested:
      "The gate package is returned for revision. Update artifacts, re-link evidence, and resubmit when ready for another review cycle.",
    ifRejected: rejectionConsequenceText,
    nextPhaseImpact: `Only Approved (or Conditional with passing evidence) clears this gate toward Phase ${nextPhase}. Other outcomes keep the project in the current governance posture until remediated.`,
    auditImpact:
      "Each recorded decision is appended to the audit trail with actor, decision, timestamp, and evidence snapshot references.",
  };

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
      successCriteriaDetails,
      approvalConsequence: approvalConsequenceText,
      rejectionConsequence: rejectionConsequenceText,
      currentPhaseLabel: `Phase ${phase}: ${workspacePhaseMeta(phase).title}`,
      phaseProgressPercent: Math.round((phase / 14) * 100),
      phaseWorkspaceHref: `/projects/${projectId}/workspace?phase=${anchorPhase}`,
      policy: gatePolicy,
      consequences: gateConsequences,
    },
    requiredInputs: requiredInputs,
    completionEvidence,
    decisionCriteria: {
      criteria,
      overallAssessment,
    },
    approvers:
      project.gateApproverAssignments.length > 0
        ? project.gateApproverAssignments.map((a) => ({
            id: a.id,
            userId: a.userId,
            name: a.approverName,
            role: a.approverRole,
            status: "pending" as const,
            assignedOnLabel: formatDateTimeLabel(a.createdAt),
            dueDateLabel: a.dueAt ? formatDateTimeLabel(a.dueAt) : undefined,
            approvalHistory: [
              {
                id: `${a.id}-assigned`,
                label: "Approver assigned",
                detail: `${a.approverName} (${a.approverRole}) added to this gate.`,
                atLabel: formatDateTimeLabel(a.createdAt),
              },
            ],
          }))
        : [
            {
              id: "a1",
              name: "Review Lead",
              role: "Governance",
              status: evaluation.pass ? ("reviewed" as const) : ("pending" as const),
              reviewedOnLabel: evaluation.pass ? formatDateTimeLabel(new Date()) : undefined,
              comments: evaluation.pass ? "Evidence checks satisfied." : undefined,
              decisionLabel: evaluation.pass ? "Approved" : undefined,
              assignedOnLabel: formatDateTimeLabel(project.updatedAt),
              dueDateLabel: undefined,
              approvalHistory: [
                {
                  id: "a1-h1",
                  label: "Assigned",
                  detail: "Review Lead nominated for Governance sign-off.",
                  atLabel: formatDateTimeLabel(project.updatedAt),
                },
                ...(evaluation.pass
                  ? [
                      {
                        id: "a1-h2",
                        label: "Review recorded",
                        detail: "Approver acknowledged evidence checks.",
                        atLabel: formatDateTimeLabel(new Date()),
                      },
                    ]
                  : []),
              ],
            },
            {
              id: "a2",
              name: "Technical Owner",
              role: "Engineering",
              status: "pending" as const,
              assignedOnLabel: formatDateTimeLabel(project.updatedAt),
              approvalHistory: [
                {
                  id: "a2-h1",
                  label: "Assigned",
                  detail: "Technical Owner added for Engineering review.",
                  atLabel: formatDateTimeLabel(project.updatedAt),
                },
              ],
            },
          ],
    decisionRecord: {
      id: latestDecisionRow?.id,
      gateId: gateParam.toLowerCase(),
      projectId,
      comments: latestDecisionRow?.nextAction ?? "",
      conditions: [],
      status: latestForGate ? "finalized" : "not_recorded",
      decisionLabel: latestDecisionRow?.decision ?? latestForGate?.decision,
      decidedBy: latestDecisionRow
        ? `${latestDecisionRow.authorityName} (${latestDecisionRow.authorityRole})`
        : undefined,
      decidedOn: latestDecisionRow ? formatDateTimeLabel(latestDecisionRow.createdAt) : undefined,
      decidedOnIso: latestDecisionRow?.createdAt?.toISOString(),
      evidencePassSnapshot: latestDecisionRow?.evidencePassSnapshot,
    },
    nextPhaseUnlock: (() => {
      const nextMeta = workspacePhaseMeta(nextPhase);
      const blockingIssues = evaluation.checks.filter((c) => !c.ok).map((c) => c.message);
      const carriedForwardArtifactLinks =
        templatesForGate.length > 0
          ? project.artifacts
              .filter((a) => templatesForGate.includes(a.templateId))
              .slice(0, 40)
              .map((a) => ({
                id: a.id,
                label: `${a.templateId} · v${a.version} · ${a.localId}`,
                href: `/projects/${projectId}/artifacts/${a.id}`,
              }))
          : undefined;
      return {
        canUnlock: evaluation.pass,
        unlockStatus: evaluation.pass ? ("ready" as const) : ("locked" as const),
        currentPhaseNumber: anchorPhase,
        nextPhaseNumber: nextPhase,
        nextPhaseName: PHASE_NAMES[nextPhase] ?? `Phase ${nextPhase}`,
        requirements: [
          {
            id: "evidence",
            label: "Gate evidence checks pass",
            status: evaluation.pass ? ("complete" as const) : ("incomplete" as const),
          },
          {
            id: "decision",
            label: "Gate decision recorded",
            status: latestForGate ? ("complete" as const) : ("incomplete" as const),
          },
        ],
        carriedForwardArtifacts: templatesForGate,
        carriedForwardArtifactLinks,
        nextPhaseHref: `/projects/${projectId}/workspace?phase=${nextPhase}`,
        gateDependencyLabel: `${gate} must be satisfied with an advance decision when evidence checks pass before Phase ${nextPhase} (${nextMeta.title}) is fully available in the workspace.`,
        blockingIssues: blockingIssues.length ? blockingIssues : undefined,
        recommendedNextAction: evaluation.pass
          ? "Record the gate decision in Gate Review, then open the next phase workspace when unlock shows ready."
          : "Remediate failing evidence checks in Gate Review until all checks pass, then record your decision.",
        requiredTemplatesForNextPhase:
          templatesForGate.length > 0 ? [...templatesForGate] : [`Templates linked to ${gate} evaluation`],
        evidenceExpectationsForNextPhase: [
          "Attach and classify completion evidence for each required template before downstream gates.",
          "Keep traceability from evidence to decision comments for audit readiness.",
        ],
        initialChecklistItems: workspacePhaseObjectives(nextPhase).map((label, i) => ({
          id: `wp-${nextPhase}-${i}`,
          label,
        })),
      };
    })(),
    actionState: {
      readinessLabel: evaluation.pass ? "Evidence ready" : "Remediation needed",
      readinessDescription: evaluation.pass
        ? "All automated checks passed for this gate."
        : "Resolve failing checks before recording an advance decision.",
      canSaveReview: true,
      canSubmitDecision: evaluation.pass,
      submitBlockers: evaluation.pass ? [] : evaluation.checks.filter((c) => !c.ok).map((c) => c.message),
      structuredSubmitBlockers: [],
    },
    assignableApprovers,
    assignedApprovers,
    assignedDueAtIso,
    artifactPickerOptions: project.artifacts.slice(0, 120).map((a) => ({
      id: a.id,
      label: `${a.templateId} · v${a.version} · ${a.localId}`,
    })),
    approversPersisted: project.gateApproverAssignments.length > 0,
  };
}
