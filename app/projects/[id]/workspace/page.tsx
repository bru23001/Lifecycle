import { notFound } from "next/navigation";

import { LifecycleWorkspaceView } from "@/components/lifecycle-workspace/lifecycle-workspace-view";
import type { EvidenceRow, TemplateRow } from "@/components/lifecycle-workspace/current-phase-main-panel";
import type { CurrentPhaseWorkspaceData } from "@/components/lifecycle-workspace/current-phase-workspace-types";
import type { CompletionChecklistItem } from "@/components/lifecycle-workspace/completion-checklist-types";
import type { PhaseHeaderData } from "@/components/lifecycle-workspace/phase-header-types";
import { derivePhaseHeaderStatus } from "@/components/lifecycle-workspace/phase-header-types";
import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import type { NextRequiredAction } from "@/components/lifecycle-workspace/next-required-action-types";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
import { phaseLabel } from "@/lib/phaseLabels";
import { buildPhaseNavigatorItems } from "@/lib/phaseNavigatorItems";
import { prisma } from "@/lib/prisma";
import { parseApplicability } from "@/lib/applicability";
import { indexLatestGateDecisions, nextOpenGateForPhase } from "@/lib/gateStatus";
import {
  domainPhaseForWorkspaceIndex,
  gateHeaderDisplayName,
  workspaceNavigatorIndex,
  workspacePhaseMeta,
  workspacePhaseObjectives,
  workspacePhasePurpose,
  WORKSPACE_PHASES,
} from "@/lib/workspacePhases";
import { mapEvidenceRowsToAttachments } from "@/lib/mapEvidenceAttachments";
import { mapTemplateRowsToRequiredTemplates } from "@/lib/mapRequiredTemplates";
import { displayFromCurrentUser, getCurrentUser } from "@/lib/server/current-user";
import { projectTemplateWizardHref } from "@/lib/projects-url";
import { getTemplatesForPhase } from "@/templates/registry";
import type { LifecycleWorkspaceScreenData } from "@/types/lifecycle-workspace.types";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function latestArtifactByTemplate(
  artifacts: { templateId: string; version: number; status: string; updatedAt: Date }[],
): Map<string, (typeof artifacts)[number]> {
  const m = new Map<string, (typeof artifacts)[number]>();
  for (const a of artifacts) {
    const cur = m.get(a.templateId);
    if (!cur || a.version > cur.version) m.set(a.templateId, a);
  }
  return m;
}

function templateRowFromArtifact(
  templateId: string,
  title: string,
  description: string,
  artifact: { status: string; updatedAt: Date } | undefined,
): TemplateRow {
  if (!artifact) {
    return {
      id: templateId,
      title,
      description,
      status: "Not Started",
      progressPct: 0,
      lastUpdated: "—",
    };
  }
  const complete = artifact.status !== "Draft";
  const progressPct = complete ? 100 : 55;
  return {
    id: templateId,
    title,
    description,
    status: complete ? "Completed" : "In Progress",
    progressPct,
    lastUpdated: formatDate(artifact.updatedAt),
  };
}

function evidenceKind(i: number): EvidenceRow["kind"] {
  const r = i % 3;
  if (r === 0) return "pdf";
  if (r === 1) return "excel";
  return "word";
}

function buildValidationWarnings(
  rows: TemplateRow[],
  projectId: string,
): ValidationWarning[] {
  const out: ValidationWarning[] = [];
  const a32 = rows.find((r) => r.id === "A-3.2");
  if (a32 && a32.status !== "Completed") {
    out.push({
      id: "warn-a32",
      message: "A-3.2 is missing at least one scoring justification.",
      severity: "warning",
      relatedObjectType: "template",
      relatedObjectId: "A-3.2",
      href: projectTemplateWizardHref(projectId, "A-3.2"),
    });
  }
  const a31 = rows.find((r) => r.id === "A-3.1");
  if (a31 && a31.status !== "Completed") {
    out.push({
      id: "warn-a31",
      message: "A-3.1 selection scorecard requires weighted criteria.",
      severity: "warning",
      relatedObjectType: "template",
      relatedObjectId: "A-3.1",
      href: projectTemplateWizardHref(projectId, "A-3.1"),
    });
  }
  const drafts = rows.filter((r) => r.status === "In Progress");
  if (drafts.length > 0 && out.length < 3) {
    const firstDraft = drafts[0]!;
    out.push({
      id: "warn-drafts",
      message: `${drafts.length} template(s) still in draft — finalize before gate submission.`,
      severity: "warning",
      relatedObjectType: "template",
      relatedObjectId: firstDraft.id,
      href: projectTemplateWizardHref(projectId, firstDraft.id),
    });
  }
  return out.slice(0, 5);
}

function buildGateMissingRequirements(
  templateRows: TemplateRow[],
  evidenceCount: number,
  validationWarnings: ValidationWarning[],
): string[] {
  const req: string[] = [];
  for (const t of templateRows) {
    if (t.status !== "Completed") {
      req.push(`${t.id} ${t.title} is incomplete`);
    }
  }
  if (evidenceCount === 0) {
    req.push("Attach supporting evidence");
  }
  for (const w of validationWarnings) {
    if (w.severity !== "info") {
      req.push(w.message);
    }
  }
  return req.slice(0, 10);
}

export default async function LifecycleWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      artifacts: {
        select: {
          id: true,
          templateId: true,
          version: true,
          status: true,
          updatedAt: true,
          markdownPath: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        select: {
          gateId: true,
          decision: true,
          evidencePassSnapshot: true,
          createdAt: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const userDisplay = displayFromCurrentUser(await getCurrentUser());

  const rawPhase = sp.phase?.trim();
  const parsedPhase = rawPhase ? Number.parseInt(rawPhase, 10) : NaN;
  const hasPhaseParam =
    Number.isFinite(parsedPhase) && parsedPhase >= 1 && parsedPhase <= 14;

  const navFromDb = workspaceNavigatorIndex(project.currentPhase);
  const activeWsPhase = hasPhaseParam ? parsedPhase : navFromDb;

  const templateDomainPhase = hasPhaseParam
    ? domainPhaseForWorkspaceIndex(parsedPhase)
    : project.currentPhase;

  const app = parseApplicability(project.applicabilityJson);
  const phaseTemplates = getTemplatesForPhase(templateDomainPhase).filter((tmpl) => {
    const tid = tmpl.templateId;
    if (tid === "A-11" && !app.data) return false;
    if (tid === "A-12" && !app.apis) return false;
    if (tid === "UXD-001" && !app.ui) return false;
    return true;
  });

  const byTemplate = latestArtifactByTemplate(project.artifacts);

  const templateRows: TemplateRow[] = phaseTemplates.map((tmpl) =>
    templateRowFromArtifact(
      tmpl.templateId,
      tmpl.title,
      tmpl.sections[0]?.description ?? tmpl.title,
      byTemplate.get(tmpl.templateId),
    ),
  );

  const templatesComplete =
    templateRows.length === 0 ||
    templateRows.every((t) => t.status === "Completed");

  const evidenceRows: EvidenceRow[] = project.artifacts
    .filter((a) => phaseTemplates.some((t) => t.templateId === a.templateId))
    .slice(0, 12)
    .map((a, i) => ({
      id: a.id,
      name: `${a.templateId} — saved artifact v${a.version}`,
      type: a.markdownPath.endsWith(".md") ? "Markdown export" : "Registered artifact",
      linkedTemplateId: a.templateId,
      addedBy: userDisplay.name,
      addedOn: formatDate(a.updatedAt),
      kind: evidenceKind(i),
    }));

  const meta = workspacePhaseMeta(activeWsPhase);
  const latestByGate = indexLatestGateDecisions(project.gateDecisions);
  const shellGatesHref = `/projects/${project.id}/gates/${nextOpenGateForPhase(project.currentPhase, latestByGate).toLowerCase()}/review`;
  let gateId = meta.gate;
  if (activeWsPhase === 14) {
    const g9 = latestByGate.get("G9");
    const g9Ok = Boolean(
      g9 &&
        (g9.decision === "Accepted" || g9.decision === "Conditional") &&
        g9.evidencePassSnapshot,
    );
    gateId = g9Ok ? "G10" : "G9";
  }

  const validationWarnings = buildValidationWarnings(templateRows, project.id);
  const evidenceAttachments = mapEvidenceRowsToAttachments(evidenceRows, project.id);

  const gateBannerId = gateId ?? "G3";

  type Step = {
    id: string;
    label: string;
    isDone: () => boolean;
    href?: string;
    required: boolean;
  };

  const steps: Step[] = [
    ...templateRows.map((t) => ({
      id: `tmpl-${t.id}`,
      label: `Complete ${t.title}`,
      isDone: () => t.status === "Completed",
      required: true,
      href: projectTemplateWizardHref(project.id, t.id),
    })),
    {
      id: "evidence-pkg",
      label: "Attach supporting evidence",
      isDone: () => evidenceRows.length > 0,
      required: true,
      href: `/projects/${project.id}/workspace#evidence-attachments`,
    },
    {
      id: "warnings-clear",
      label: "Resolve validation warnings",
      isDone: () =>
        validationWarnings.filter((w) => w.severity === "warning" || w.severity === "error")
          .length === 0,
      required: true,
      href: `/projects/${project.id}/workspace#validation-warnings`,
    },
    {
      id: "ready-for-gate",
      label: `Ready for Gate ${gateBannerId}: ${gateId ? gateHeaderDisplayName(gateId) : "review"}`,
      isDone: () =>
        templatesComplete &&
        evidenceRows.length > 0 &&
        validationWarnings.filter((w) => w.severity === "warning" || w.severity === "error")
          .length === 0,
      required: true,
    },
  ];

  const checklistItems: CompletionChecklistItem[] = steps.map((s) => {
    const done = s.isDone();
    let status: CompletionChecklistItem["status"];
    if (done) {
      status = "complete";
    } else if (
      s.id === "warnings-clear" &&
      validationWarnings.some((w) => w.severity === "error")
    ) {
      status = "blocked";
    } else {
      status = "incomplete";
    }
    return {
      id: s.id,
      label: s.label,
      status,
      required: s.required,
      href: s.href,
    };
  });

  const completedTemplates = templateRows.filter((t) => t.status === "Completed").length;
  const notStartedTemplates = templateRows.filter((t) => t.status === "Not Started").length;
  const headerPct =
    templateRows.length > 0
      ? Math.round((completedTemplates / templateRows.length) * 100)
      : 0;

  const phaseSummary = phaseLabel(templateDomainPhase);

  const startedOn = formatDate(project.createdAt);
  const targetCompletion = formatDate(
    new Date(project.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000),
  );

  const phaseStatus = derivePhaseHeaderStatus({
    templateCount: templateRows.length,
    completedTemplates,
    notStartedTemplates,
    warningCount: validationWarnings.length,
  });

  const phaseHeader: PhaseHeaderData = {
    projectId: project.slug,
    projectName: project.name,
    phaseNumber: activeWsPhase,
    totalPhases: WORKSPACE_PHASES.length,
    phaseName: meta.title,
    status: phaseStatus,
    purpose: workspacePhasePurpose(activeWsPhase),
    ownerName: userDisplay.name,
    startedOnLabel: startedOn,
    targetCompletionLabel: targetCompletion,
    gateCode: gateId ?? "—",
    gateName: gateId ? gateHeaderDisplayName(gateId) : "Not assigned",
    completionPercent: headerPct,
  };

  const currentPhaseWorkspace: CurrentPhaseWorkspaceData = {
    title: hasPhaseParam ? `Phase ${activeWsPhase} workspace` : "Current Phase Workspace",
    instructions: [
      phaseSummary,
      "",
      "Complete all required templates and checklist items, attach supporting evidence, and resolve validation warnings before submitting for Gate review.",
    ].join("\n"),
    infoMessage: `All items in this phase must be completed to submit to Gate ${gateBannerId}.`,
    objectives: workspacePhaseObjectives(activeWsPhase),
  };

  const requiredTemplates = mapTemplateRowsToRequiredTemplates(templateRows, project.id);

  const activeReadyForReview =
    templateRows.length > 0 &&
    templateRows.every((t) => t.status === "Completed");
  const activeBlocked =
    validationWarnings.filter((w) => w.severity === "warning" || w.severity === "error")
      .length >= 3;

  const phaseNavigatorItems = buildPhaseNavigatorItems({
    projectId: project.id,
    activeWorkspacePhase: activeWsPhase,
    activeBlocked,
    activeReadyForReview,
  });

  const gateSubmissionState: GateSubmissionState = {
    gateCode: gateBannerId,
    gateName: gateId ? gateHeaderDisplayName(gateId) : "Gate review",
    canSubmit:
      templatesComplete &&
      evidenceRows.length > 0 &&
      validationWarnings.filter((w) => w.severity !== "info").length === 0,
    missingRequirements: buildGateMissingRequirements(
      templateRows,
      evidenceRows.length,
      validationWarnings,
    ),
    submitHref: `/projects/${project.id}/gates/${gateBannerId.toLowerCase()}/review`,
  };

  const firstIncompleteTemplate = templateRows.find((t) => t.status !== "Completed");
  let nextHref = `/projects/${project.id}/workspace#completion-checklist`;
  if (firstIncompleteTemplate) {
    nextHref = projectTemplateWizardHref(project.id, firstIncompleteTemplate.id);
  } else if (evidenceRows.length === 0) {
    nextHref = `/projects/${project.id}/workspace#evidence-attachments`;
  } else if (validationWarnings.some((w) => w.severity !== "info")) {
    nextHref = `/projects/${project.id}/workspace#validation-warnings`;
  }

  const nextRequiredAction: NextRequiredAction = {
    label: "Next Required Action",
    description: firstIncompleteTemplate
      ? `Complete the pending items in this phase — next up: ${firstIncompleteTemplate.title}. Then submit for Gate ${gateBannerId} review.`
      : evidenceRows.length === 0
        ? `Attach supporting evidence for this phase, then submit for Gate ${gateBannerId} review.`
        : validationWarnings.some((w) => w.severity !== "info")
          ? `Resolve validation warnings, then submit for Gate ${gateBannerId} review.`
          : `Resolve checklist items and submit for Gate ${gateBannerId} review.`,
    ctaLabel: "Go to next incomplete item",
    href: nextHref,
  };

  const screenData: LifecycleWorkspaceScreenData = {
    user: { name: userDisplay.name, role: userDisplay.role, initials: userDisplay.initials },
    project: {
      id: project.id,
      name: project.name,
      code: project.vaultFolder,
    },
    phaseHeader,
    phaseNavigatorItems,
    workspace: currentPhaseWorkspace,
    requiredTemplates,
    evidenceAttachments,
    checklistItems,
    validationWarnings,
    gateSubmissionState,
    nextRequiredAction,
  };

  return (
    <LifecycleWorkspaceView
      projectId={screenData.project.id}
      projectName={screenData.project.name}
      phaseSummary={phaseSummary}
      phaseProgressPct={headerPct}
      projectCurrentPhase={navFromDb}
      gatesHref={shellGatesHref}
      breadcrumbCode={screenData.project.code}
      userInitials={screenData.user.initials}
      userName={screenData.user.name}
      userRole={screenData.user.role}
      phaseHeader={screenData.phaseHeader}
      phaseNavigatorItems={screenData.phaseNavigatorItems}
      workspace={screenData.workspace}
      requiredTemplates={screenData.requiredTemplates}
      evidenceAttachments={screenData.evidenceAttachments}
      checklistItems={screenData.checklistItems}
      validationWarnings={screenData.validationWarnings}
      gateSubmissionState={screenData.gateSubmissionState}
      nextRequiredAction={screenData.nextRequiredAction}
    />
  );
}
