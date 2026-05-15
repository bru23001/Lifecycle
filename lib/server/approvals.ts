import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { evaluateDecisionState } from "@/lib/approval-decision";
import { canOpenGateReview } from "@/lib/phaseTransitions";
import type { GateId } from "@/lib/gateRules";
import { indexLatestGateDecisions } from "@/lib/gateStatus";
import {
  gateHeaderDisplayName,
  workspacePhaseMeta,
  clampWorkspacePhase,
} from "@/lib/workspacePhases";
import type {
  ApprovalApprover,
  ApprovalAttachment,
  ApprovalCenterData,
  ApprovalDetail,
  ApprovalHistoryEvent,
  ApprovalPackage,
  ApproverComment,
  PendingApproval,
} from "@/types/approval-center.types";

import { backfillMissingApprovals, OPEN_APPROVAL_STATUSES } from "@/lib/server/approval-writes";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { formatDateTimeLabel } from "@/lib/server/helpers";
import { stripSpecSectionHeadingPrefix } from "@/lib/approval-display-strings";

const approvalListInclude = {
  submittedBy: { select: { name: true, role: true, initials: true } },
  artifact: true,
  project: {
    include: {
      gateDecisions: { orderBy: { createdAt: "desc" as const } },
      artifacts: true,
      evidenceItems: {
        take: 1,
        orderBy: { updatedAt: "desc" as const },
        select: { id: true },
      },
      _count: {
        select: { evidenceItems: true },
      },
    },
  },
  comments: {
    include: { author: { select: { name: true, role: true, initials: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.ApprovalInclude;

type LoadedApproval = Prisma.ApprovalGetPayload<{ include: typeof approvalListInclude }>;

function gateAnchorPhase(gate: GateId): number {
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

function isArtifactApprovedJson(data: unknown): boolean {
  const d = data as Record<string, unknown>;
  const s = d.documentStatus ?? d.approvalStatus;
  return s === "Approved";
}

function coercePriority(p: string): PendingApproval["priority"] {
  if (p === "low" || p === "medium" || p === "high" || p === "critical") return p;
  return "medium";
}

function mapPrismaToDetailStatus(status: string): ApprovalDetail["status"] {
  if (
    status === "pending" ||
    status === "in_review" ||
    status === "approved" ||
    status === "rejected" ||
    status === "changes_requested" ||
    status === "superseded" ||
    status === "overdue" ||
    status === "blocked"
  ) {
    return status;
  }
  return "pending";
}

function mapPrismaToPendingStatus(status: string): PendingApproval["status"] {
  if (status === "pending") return "pending";
  if (status === "in_review") return "in_review";
  if (status === "changes_requested") return "in_review";
  return "blocked";
}

function queueTabForRow(
  approvalType: string,
  prismaStatus: string,
): PendingApproval["queueTab"] {
  if (prismaStatus === "changes_requested") return "changes_requested";
  if (approvalType === "artifact_review") return "my_reviews";
  return "pending";
}

function isGateRowEligible(row: LoadedApproval): boolean {
  if (row.approvalType !== "gate_review" || !row.gateId || !row.project) return false;
  const gate = row.gateId as GateId;
  const phase = clampWorkspacePhase(row.project.currentPhase);
  const decisionsRows = row.project.gateDecisions.map((d) => ({
    gateId: d.gateId,
    decision: d.decision,
    evidencePassSnapshot: d.evidencePassSnapshot,
    createdAt: d.createdAt,
  }));
  const latestByGate = indexLatestGateDecisions(decisionsRows);
  const eligibility = canOpenGateReview(phase, gate, latestByGate);
  if (!eligibility.ok) return false;
  const latest = latestByGate.get(gate);
  const advanced =
    latest &&
    (latest.decision === "Accepted" || latest.decision === "Conditional") &&
    latest.evidencePassSnapshot;
  return !advanced;
}

function isArtifactRowEligible(row: LoadedApproval): boolean {
  if (row.approvalType !== "artifact_review" || !row.artifact || !row.project) return false;
  if (row.artifact.status !== "Draft") return false;
  if (isArtifactApprovedJson(row.artifact.dataJson)) return false;
  const drafts = row.project.artifacts.filter(
    (a) => a.templateId === row.artifact!.templateId && a.status === "Draft",
  );
  if (drafts.length === 0) return false;
  const latestDraft = drafts.reduce((best, a) =>
    a.updatedAt > best.updatedAt ? a : best,
  );
  return latestDraft.id === row.artifact.id;
}

function mapComments(row: LoadedApproval, fallbackName: string): ApproverComment[] {
  return [...row.comments]
    .reverse()
    .map((c) => ({
      id: c.id,
      authorName: c.author?.name?.trim() || fallbackName,
      authorRole: c.author?.role?.trim() || "Reviewer",
      authorInitials: c.author?.initials?.trim() || "R",
      statusAtComment: "in_review" as const,
      createdOnLabel: formatDateTimeLabel(c.createdAt),
      body: c.body,
      visibility: "public_to_project" as const,
    }));
}

function buildHistory(row: LoadedApproval, submittedLabel: string): ApprovalHistoryEvent[] {
  const aid = row.id;
  const gateReviewHref =
    row.approvalType === "gate_review" && row.gateId && row.project ?
      `/projects/${row.project.id}/gates/${(row.gateId as string).toLowerCase()}/review`
    : undefined;
  const workspaceHref = row.project ? `/projects/${row.project.id}/workspace` : undefined;
  const relatedObjectLabel =
    row.approvalType === "gate_review" && row.gateId && row.project ?
      `${row.gateId} — ${gateHeaderDisplayName(row.gateId as GateId)}`
    : row.artifact ?
      `${row.artifact.templateId} · ${stripSpecSectionHeadingPrefix(row.artifact.localId)}`
    : row.project?.name ?? "Approval package";

  const events: ApprovalHistoryEvent[] = [
    {
      id: `${aid}-h-submitted`,
      approvalId: aid,
      eventType: "submitted",
      title:
        row.approvalType === "gate_review" ? "Gate ready for review" : "Artifact draft submitted",
      actorName: submittedLabel,
      actorRole: "Submitter",
      timestampLabel: formatDateTimeLabel(row.createdAt),
      description:
        row.approvalType === "gate_review"
          ? "Lifecycle phase allows this gate review."
          : "Draft queued for artifact review.",
      statusTone: "blue",
      relatedObjectLabel,
      relatedObjectHref: gateReviewHref ?? workspaceHref,
      beforeValue: "Not submitted",
      afterValue: "Submitted for review",
      auditRecordId: `${aid}-aud-submitted`,
    },
  ];
  for (const c of row.comments) {
    events.push({
      id: `hist-${c.id}`,
      approvalId: aid,
      eventType: "comment_added",
      title: "Comment added",
      actorName: c.author?.name?.trim() || submittedLabel,
      actorRole: c.author?.role?.trim() || "Reviewer",
      timestampLabel: formatDateTimeLabel(c.createdAt),
      description: c.body.slice(0, 200),
      statusTone: "blue",
      relatedObjectLabel: "Comment thread",
      relatedObjectHref: gateReviewHref ?? workspaceHref,
      auditRecordId: `${aid}-aud-comment-${c.id}`,
    });
  }
  return events;
}

function buildApproversForPackage(opts: {
  approvalType: ApprovalDetail["approvalType"];
  inputNames: string[];
  primaryInputLabel?: string;
}): ApprovalApprover[] {
  const fallbackLabels =
    opts.inputNames.length > 0 ? opts.inputNames : (["Package checklist", "Linked evidence"] as const);
  if (opts.approvalType === "artifact_review") {
    const label = opts.primaryInputLabel ?? fallbackLabels[0] ?? "Primary input";
    return [
      {
        id: "apr-primary",
        name: "Jordan Lee",
        role: "Artifact reviewer",
        initials: "JL",
        reviewStatus: "in_review",
        reviewComments: "Reviewing latest draft.",
        assignedInputLabels: [label],
      },
    ];
  }
  return [
    {
      id: "apr-1",
      name: "Jordan Lee",
      role: "Technical reviewer",
      initials: "JL",
      reviewStatus: "in_review",
      reviewComments: undefined,
      reviewedOnLabel: undefined,
      assignedInputLabels: [fallbackLabels[0] ?? "Gate checklist", fallbackLabels[1] ?? "Evidence bundle"].filter(Boolean),
    },
    {
      id: "apr-2",
      name: "Taylor Chen",
      role: "Program manager",
      initials: "TC",
      reviewStatus: "pending",
      assignedInputLabels: ["Stakeholder sign-off"],
    },
  ];
}

function buildSeedAttachments(
  approvalId: string,
  submittedByLabel: string,
  opts: {
    approvalType: ApprovalDetail["approvalType"];
    requiredInputs: ApprovalPackage["requiredInputs"];
    evidenceListHref?: string;
  },
): ApprovalAttachment[] {
  const uploadedOnLabel = formatDateTimeLabel(new Date());
  if (opts.approvalType === "gate_review") {
    return [
      {
        id: `att-${approvalId}-gate-1`,
        fileName: "Gate-review-summary.pdf",
        mimeType: "application/pdf",
        sizeLabel: "240 KB",
        attachmentType: "Review packet",
        description: "Compiled snapshots for reviewers.",
        uploadedBy: submittedByLabel,
        uploadedOnLabel,
        classification: "internal",
        link: { kind: "none" },
        previewHint: "PDF preview opens in an external viewer after download.",
      },
      {
        id: `att-${approvalId}-gate-2`,
        fileName: "Evidence-index.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        sizeLabel: "88 KB",
        attachmentType: "Evidence manifest",
        description: "Row-level evidence pointers for this gate.",
        uploadedBy: submittedByLabel,
        uploadedOnLabel,
        classification: "confidential",
        link: opts.evidenceListHref
          ? { kind: "evidence", label: "Evidence hub", href: opts.evidenceListHref }
          : { kind: "evidence", label: "Evidence hub" },
        previewHint: "Spreadsheet preview is not embedded in this view.",
      },
    ];
  }
  const inp = opts.requiredInputs[0];
  return [
    {
      id: `att-${approvalId}-art-1`,
      fileName: `${(inp?.name ?? "artifact").replace(/\s+/g, "_")}-reference.png`,
      mimeType: "image/png",
      sizeLabel: "128 KB",
      attachmentType: "Supporting image",
      uploadedBy: submittedByLabel,
      uploadedOnLabel,
      classification: "internal",
      link: inp
        ? {
            kind: "required_input",
            inputId: inp.id,
            inputName: inp.name,
            href: inp.linkedObjectHref,
          }
        : { kind: "none" },
      previewHint: "PNG preview is available when the file is opened locally.",
    },
  ];
}

function buildPackage(row: LoadedApproval, userDisplay: { name: string; role: string; initials: string }): ApprovalPackage {
  const submittedLabel = row.submittedBy?.name?.trim() || userDisplay.name;
  const priority = coercePriority(row.priority);
  const detailStatus = mapPrismaToDetailStatus(row.status);
  const id = row.id;

  if (row.approvalType === "gate_review" && row.gateId && row.project) {
    const gate = row.gateId as GateId;
    const anchorPhase = gateAnchorPhase(gate);
    const pid = row.project.id;
    const gateReviewHref = `/projects/${pid}/gates/${gate.toLowerCase()}/review`;
    const firstEvidence = row.project.evidenceItems[0];
    const artifacts = row.project.artifacts;
    const primaryArtifact =
      artifacts.length === 0 ? null : artifacts.reduce((a, b) => (a.updatedAt > b.updatedAt ? a : b));

    const detail: ApprovalDetail = {
      id,
      approvalCode: gate,
      title: `${gate} — ${gateHeaderDisplayName(gate)}`,
      description: `Gate review package for ${row.project.name}.`,
      approvalType: "gate_review",
      projectId: pid,
      projectName: row.project.name,
      phaseNumber: anchorPhase,
      phaseName: workspacePhaseMeta(anchorPhase).title,
      gateCode: gate,
      gateName: gateHeaderDisplayName(gate),
      gateReviewHref,
      workspaceHref: `/projects/${pid}/workspace?phase=${anchorPhase}`,
      artifactsLibraryHref: `/projects/${pid}/artifacts`,
      evidenceListHref: `/projects/${pid}/evidence`,
      primaryArtifactDetailHref: primaryArtifact ? `/projects/${pid}/artifacts/${primaryArtifact.id}` : undefined,
      primaryEvidenceDetailHref: firstEvidence ? `/projects/${pid}/evidence/${firstEvidence.id}` : undefined,
      status: detailStatus,
      submittedBy: submittedLabel,
      submittedOnLabel: formatDateTimeLabel(row.updatedAt),
      dueDateLabel: "Open",
      priority,
      linkedArtifactsCount: artifacts.length,
      evidenceItemsCount: row.project._count.evidenceItems,
      approversCount: 2,
      reviewType: "standard",
    };
    const requiredInputs: ApprovalPackage["requiredInputs"] = [];
    const comments = mapComments(row, userDisplay.name);
    const decisionDraft: ApprovalPackage["decisionDraft"] = {
      approvalId: id,
      comments: "",
      requiredChanges: [],
      conditions: [],
      canSubmit: false,
      blockers: [],
    };
    const history = buildHistory(row, submittedLabel);
    const approvers = buildApproversForPackage({
      approvalType: "gate_review",
      inputNames: [],
    });
    const attachments = buildSeedAttachments(id, submittedLabel, {
      approvalType: "gate_review",
      requiredInputs: [],
      evidenceListHref: detail.evidenceListHref,
    });
    const base: ApprovalPackage = {
      detail,
      requiredInputs,
      comments,
      approvers,
      attachments,
      decisionDraft,
      history,
      actionState: {
        readinessLabel: "Review readiness",
        readinessSummary:
          "Open the gate review screen to evaluate evidence and record a decision.",
        canSaveReview: true,
        canSubmitDecision: false,
        submitBlockers: [],
      },
    };
    return { ...base, actionState: evaluateDecisionState(decisionDraft, base) };
  }

  const art = row.artifact!;
  const project = row.project!;
  const phase = clampWorkspacePhase(project.currentPhase);
  const firstEvidence = project.evidenceItems[0];
  const pid = project.id;
  const displayLocalId = stripSpecSectionHeadingPrefix(art.localId);
  const detail: ApprovalDetail = {
    id,
    approvalCode: art.templateId,
    title: `${art.templateId} · ${displayLocalId}`,
    description: "Artifact draft pending approval.",
    approvalType: "artifact_review",
    projectId: pid,
    projectName: project.name,
    phaseNumber: phase,
    phaseName: workspacePhaseMeta(phase).title,
    workspaceHref: `/projects/${pid}/workspace?phase=${phase}`,
    artifactsLibraryHref: `/projects/${pid}/artifacts`,
    evidenceListHref: `/projects/${pid}/evidence`,
    primaryArtifactDetailHref: `/projects/${pid}/artifacts/${art.id}`,
    primaryEvidenceDetailHref: firstEvidence ? `/projects/${pid}/evidence/${firstEvidence.id}` : undefined,
    status: detailStatus,
    submittedBy: submittedLabel,
    submittedOnLabel: formatDateTimeLabel(row.updatedAt),
    dueDateLabel: "Draft",
    priority,
    linkedArtifactsCount: 1,
    evidenceItemsCount: project._count.evidenceItems,
    approversCount: 1,
    reviewType: "standard",
  };
  const requiredInputs: ApprovalPackage["requiredInputs"] = [
    {
      id: `inp-${art.id}`,
      inputCode: art.templateId,
      name: displayLocalId,
      description: "Latest artifact version",
      status: "incomplete",
      requiredLevel: "required",
      linkedObjectLabel: "Artifact",
      linkedObjectHref: `/projects/${project.id}/artifacts/${art.id}`,
    },
  ];
  const comments = mapComments(row, userDisplay.name);
  const decisionDraft: ApprovalPackage["decisionDraft"] = {
    approvalId: id,
    comments: "",
    requiredChanges: [],
    conditions: [],
    canSubmit: false,
    blockers: ["Approve artifact in Template / Artifact workflow."],
  };
  const history = buildHistory(row, submittedLabel);
  const approvers = buildApproversForPackage({
    approvalType: "artifact_review",
    inputNames: requiredInputs.map((r) => r.name),
    primaryInputLabel: requiredInputs[0]?.name,
  });
  const attachments = buildSeedAttachments(id, submittedLabel, {
    approvalType: "artifact_review",
    requiredInputs,
    evidenceListHref: detail.evidenceListHref,
  });
  const base: ApprovalPackage = {
    detail,
    requiredInputs,
    comments,
    approvers,
    attachments,
    decisionDraft,
    history,
    actionState: {
      readinessLabel: "Draft artifact",
      readinessSummary: "Complete and approve artifact content.",
      canSaveReview: true,
      canSubmitDecision: false,
      submitBlockers: [],
    },
  };
  return { ...base, actionState: evaluateDecisionState(decisionDraft, base) };
}

function buildPendingRow(row: LoadedApproval, userDisplay: { name: string }): PendingApproval {
  const submittedLabel = row.submittedBy?.name?.trim() || userDisplay.name;
  const priority = coercePriority(row.priority);
  const id = row.id;
  const href = `/approvals/${id}`;

  const submittedAtMs = row.createdAt.getTime();
  const updatedAtMs = row.updatedAt.getTime();
  const dueAtMs = row.dueAt?.getTime() ?? null;

  if (row.approvalType === "gate_review" && row.gateId && row.project) {
    const gate = row.gateId as GateId;
    const anchorPhase = gateAnchorPhase(gate);
    return {
      id,
      approvalCode: gate,
      title: `${gate} — ${gateHeaderDisplayName(gate)}`,
      approvalType: "gate_review",
      projectId: row.project.id,
      projectName: row.project.name,
      submittedBy: submittedLabel,
      submittedOnLabel: formatDateTimeLabel(row.updatedAt),
      submittedAtMs,
      updatedAtMs,
      dueAtMs,
      phaseNumber: anchorPhase,
      gateCode: gate,
      dueDateLabel: "Open",
      priority,
      status: mapPrismaToPendingStatus(row.status),
      href,
      queueTab: queueTabForRow(row.approvalType, row.status),
    };
  }

  const art = row.artifact!;
  const project = row.project!;
  return {
    id,
    approvalCode: art.templateId,
    title: `${art.templateId} · ${stripSpecSectionHeadingPrefix(art.localId)}`,
    approvalType: "artifact_review",
    projectId: project.id,
    projectName: project.name,
    submittedBy: submittedLabel,
    submittedOnLabel: formatDateTimeLabel(row.updatedAt),
    submittedAtMs,
    updatedAtMs,
    dueAtMs,
    dueDateLabel: "Draft",
    priority,
    status: mapPrismaToPendingStatus(row.status),
    href,
    queueTab: queueTabForRow(row.approvalType, row.status),
  };
}

function emptyPackage(id: string, submittedByLabel: string): ApprovalPackage {
  return {
    detail: {
      id,
      approvalCode: "—",
      title: "No approval selected",
      description: "Create a project or advance lifecycle to generate gate reviews.",
      approvalType: "gate_review",
      projectId: "",
      projectName: "",
      status: "pending",
      submittedBy: submittedByLabel,
      submittedOnLabel: formatDateTimeLabel(new Date()),
      priority: "low",
      linkedArtifactsCount: 0,
      evidenceItemsCount: 0,
      approversCount: 0,
      reviewType: "standard",
    },
    requiredInputs: [],
    comments: [],
    approvers: [],
    attachments: [],
    decisionDraft: {
      approvalId: id,
      comments: "",
      requiredChanges: [],
      conditions: [],
      canSubmit: false,
      blockers: [],
    },
    history: [],
    actionState: {
      readinessLabel: "Idle",
      readinessSummary: "No items.",
      canSaveReview: false,
      canSubmitDecision: false,
      submitBlockers: [],
    },
  };
}

export async function loadApprovalCenterData(
  selectedApprovalId?: string,
): Promise<ApprovalCenterData> {
  const userDisplay = await getCurrentUserDisplay();

  await backfillMissingApprovals();

  const rows = await prisma.approval.findMany({
    where: { status: { in: [...OPEN_APPROVAL_STATUSES] } },
    orderBy: { updatedAt: "desc" },
    include: approvalListInclude,
  });

  const eligible = rows.filter((row) => {
    if (row.approvalType === "gate_review") return isGateRowEligible(row);
    if (row.approvalType === "artifact_review") return isArtifactRowEligible(row);
    return false;
  });

  const pendingApprovals: PendingApproval[] = eligible.map((row) => buildPendingRow(row, userDisplay));
  const approvalPackages: Record<string, ApprovalPackage> = {};
  for (const row of eligible) {
    approvalPackages[row.id] = buildPackage(row, userDisplay);
  }

  const projects = await prisma.project.findMany({
    where: { archivedAt: null },
    select: { id: true, name: true },
  });

  if (pendingApprovals.length === 0) {
    const placeholderId = "approval-none";
    const now = Date.now();
    pendingApprovals.push({
      id: placeholderId,
      approvalCode: "—",
      title: "No open approvals",
      approvalType: "gate_review",
      projectId: projects[0]?.id ?? "none",
      projectName: projects[0]?.name ?? "No projects",
      submittedBy: userDisplay.name,
      submittedOnLabel: formatDateTimeLabel(new Date()),
      submittedAtMs: now,
      updatedAtMs: now,
      dueAtMs: null,
      priority: "low",
      status: "pending",
      href: "/projects",
      queueTab: "pending",
    });
    approvalPackages[placeholderId] = emptyPackage(placeholderId, userDisplay.name);
  }

  const selectedId =
    selectedApprovalId && approvalPackages[selectedApprovalId] ?
      selectedApprovalId
    : pendingApprovals[0]!.id;

  const selectedApproval =
    approvalPackages[selectedId] ?? emptyPackage(selectedId, userDisplay.name);

  return {
    user: { ...userDisplay },
    pendingApprovals,
    selectedApproval,
    approvalPackages,
  };
}
