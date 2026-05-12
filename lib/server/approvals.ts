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
  ApprovalCenterData,
  ApprovalPackage,
  ApproverComment,
  ApprovalDetail,
  ApprovalHistoryEvent,
  PendingApproval,
} from "@/types/approval-center.types";

import { backfillMissingApprovals, OPEN_APPROVAL_STATUSES } from "@/lib/server/approval-writes";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { formatDateTimeLabel } from "@/lib/server/helpers";

const approvalListInclude = {
  submittedBy: { select: { name: true, role: true, initials: true } },
  artifact: true,
  project: {
    include: {
      gateDecisions: { orderBy: { createdAt: "desc" as const } },
      artifacts: true,
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
  const events: ApprovalHistoryEvent[] = [
    {
      id: `${row.id}-h-submitted`,
      eventType: "submitted",
      title:
        row.approvalType === "gate_review" ? "Gate ready for review" : "Artifact draft submitted",
      actorName: submittedLabel,
      timestampLabel: formatDateTimeLabel(row.createdAt),
      description:
        row.approvalType === "gate_review"
          ? "Lifecycle phase allows this gate review."
          : "Draft queued for artifact review.",
      statusTone: "blue",
    },
  ];
  for (const c of row.comments) {
    events.push({
      id: `hist-${c.id}`,
      eventType: "comment_added",
      title: "Comment added",
      actorName: c.author?.name?.trim() || submittedLabel,
      timestampLabel: formatDateTimeLabel(c.createdAt),
      description: c.body.slice(0, 200),
      statusTone: "blue",
    });
  }
  return events;
}

function buildPackage(row: LoadedApproval, userDisplay: { name: string; role: string; initials: string }): ApprovalPackage {
  const submittedLabel = row.submittedBy?.name?.trim() || userDisplay.name;
  const priority = coercePriority(row.priority);
  const detailStatus = mapPrismaToDetailStatus(row.status);
  const id = row.id;

  if (row.approvalType === "gate_review" && row.gateId && row.project) {
    const gate = row.gateId as GateId;
    const anchorPhase = gateAnchorPhase(gate);
    const gateReviewHref = `/projects/${row.project.id}/gates/${gate.toLowerCase()}/review`;
    const detail: ApprovalDetail = {
      id,
      approvalCode: gate,
      title: `${gate} — ${gateHeaderDisplayName(gate)}`,
      description: `Gate review package for ${row.project.name}.`,
      approvalType: "gate_review",
      projectId: row.project.id,
      projectName: row.project.name,
      phaseNumber: anchorPhase,
      phaseName: workspacePhaseMeta(anchorPhase).title,
      gateCode: gate,
      gateName: gateHeaderDisplayName(gate),
      gateReviewHref,
      status: detailStatus,
      submittedBy: submittedLabel,
      submittedOnLabel: formatDateTimeLabel(row.updatedAt),
      dueDateLabel: "Open",
      priority,
      linkedArtifactsCount: row.project.artifacts.length,
      evidenceItemsCount: 0,
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
    const base: ApprovalPackage = {
      detail,
      requiredInputs,
      comments,
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
  const detail: ApprovalDetail = {
    id,
    approvalCode: art.templateId,
    title: `${art.templateId} · ${art.localId}`,
    description: "Artifact draft pending approval.",
    approvalType: "artifact_review",
    projectId: project.id,
    projectName: project.name,
    status: detailStatus,
    submittedBy: submittedLabel,
    submittedOnLabel: formatDateTimeLabel(row.updatedAt),
    dueDateLabel: "Draft",
    priority,
    linkedArtifactsCount: 1,
    evidenceItemsCount: 0,
    approversCount: 1,
    reviewType: "standard",
  };
  const requiredInputs: ApprovalPackage["requiredInputs"] = [
    {
      id: `inp-${art.id}`,
      inputCode: art.templateId,
      name: art.localId,
      description: "Latest artifact version",
      status: "incomplete",
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
  const base: ApprovalPackage = {
    detail,
    requiredInputs,
    comments,
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

  if (row.approvalType === "gate_review" && row.gateId && row.project) {
    const gate = row.gateId as GateId;
    return {
      id,
      approvalCode: gate,
      title: `${gate} — ${gateHeaderDisplayName(gate)}`,
      approvalType: "gate_review",
      projectId: row.project.id,
      projectName: row.project.name,
      submittedBy: submittedLabel,
      submittedOnLabel: formatDateTimeLabel(row.updatedAt),
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
    title: `${art.templateId} · ${art.localId}`,
    approvalType: "artifact_review",
    projectId: project.id,
    projectName: project.name,
    submittedBy: submittedLabel,
    submittedOnLabel: formatDateTimeLabel(row.updatedAt),
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

  const projects = await prisma.project.findMany({ select: { id: true, name: true } });

  if (pendingApprovals.length === 0) {
    const placeholderId = "approval-none";
    pendingApprovals.push({
      id: placeholderId,
      approvalCode: "—",
      title: "No open approvals",
      approvalType: "gate_review",
      projectId: projects[0]?.id ?? "none",
      projectName: projects[0]?.name ?? "No projects",
      submittedBy: userDisplay.name,
      submittedOnLabel: formatDateTimeLabel(new Date()),
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
