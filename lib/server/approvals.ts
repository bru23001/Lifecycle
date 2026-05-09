import { prisma } from "@/lib/prisma";
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
  PendingApproval,
} from "@/types/approval-center.types";

import { ALL_GATES, formatDateTimeLabel, SOLO_USER_DISPLAY } from "@/lib/server/helpers";

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

export async function loadApprovalCenterData(
  selectedApprovalId?: string,
): Promise<ApprovalCenterData> {
  const projects = await prisma.project.findMany({
    include: {
      gateDecisions: { orderBy: { createdAt: "desc" } },
      artifacts: { orderBy: { createdAt: "desc" } },
    },
  });

  const pendingApprovals: PendingApproval[] = [];
  const approvalPackages: Record<string, ApprovalPackage> = {};

  for (const project of projects) {
    const phase = clampWorkspacePhase(project.currentPhase);
    const decisionsRows = project.gateDecisions.map((d) => ({
      gateId: d.gateId,
      decision: d.decision,
      evidencePassSnapshot: d.evidencePassSnapshot,
      createdAt: d.createdAt,
    }));
    const latestByGate = indexLatestGateDecisions(decisionsRows);

    for (const gate of ALL_GATES) {
      const eligibility = canOpenGateReview(phase, gate, latestByGate);
      if (!eligibility.ok) continue;

      const latest = latestByGate.get(gate);
      const advanced =
        latest &&
        (latest.decision === "Accepted" || latest.decision === "Conditional") &&
        latest.evidencePassSnapshot;

      if (advanced) continue;

      const id = `approval-${gate}-${project.id}`;
      const href = `/approvals/${id}`;
      pendingApprovals.push({
        id,
        approvalCode: gate,
        title: `${gate} — ${gateHeaderDisplayName(gate)}`,
        approvalType: "gate_review",
        projectId: project.id,
        projectName: project.name,
        submittedBy: SOLO_USER_DISPLAY.name,
        submittedOnLabel: formatDateTimeLabel(project.updatedAt),
        dueDateLabel: "Open",
        priority: gate === "G4" || gate === "G8" ? "high" : "medium",
        status: "pending",
        href,
        queueTab: "pending",
      });

      const anchorPhase = gateAnchorPhase(gate);
      approvalPackages[id] = {
        detail: {
          id,
          approvalCode: gate,
          title: `${gate} — ${gateHeaderDisplayName(gate)}`,
          description: `Gate review package for ${project.name}.`,
          approvalType: "gate_review",
          projectId: project.id,
          projectName: project.name,
          phaseNumber: anchorPhase,
          phaseName: workspacePhaseMeta(anchorPhase).title,
          gateCode: gate,
          gateName: gateHeaderDisplayName(gate),
          status: "pending",
          submittedBy: SOLO_USER_DISPLAY.name,
          submittedOnLabel: formatDateTimeLabel(project.updatedAt),
          dueDateLabel: "Open",
          priority: gate === "G4" ? "high" : "medium",
          linkedArtifactsCount: project.artifacts.length,
          evidenceItemsCount: 0,
          approversCount: 2,
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
          blockers: ["Use Gate Review to record a formal decision."],
        },
        history: [
          {
            id: `${id}-h1`,
            eventType: "submitted",
            title: "Gate ready for review",
            actorName: SOLO_USER_DISPLAY.name,
            timestampLabel: formatDateTimeLabel(project.updatedAt),
            description: "Lifecycle phase allows this gate review.",
            statusTone: "blue",
          },
        ],
        actionState: {
          readinessLabel: "Review readiness",
          readinessSummary: "Open the gate review screen to evaluate evidence and record a decision.",
          canSaveReview: true,
          canSubmitDecision: false,
          submitBlockers: ["Record decision from Gate Review workflow."],
        },
      };
    }

    const latestByTemplate = new Map<string, (typeof project.artifacts)[0]>();
    for (const a of project.artifacts) {
      if (!latestByTemplate.has(a.templateId)) latestByTemplate.set(a.templateId, a);
    }
    for (const art of latestByTemplate.values()) {
      if (art.status !== "Draft") continue;
      if (isArtifactApprovedJson(art.dataJson)) continue;

      const id = `approval-artifact-${art.id}`;
      const href = `/approvals/${id}`;
      pendingApprovals.push({
        id,
        approvalCode: art.templateId,
        title: `${art.templateId} · ${art.localId}`,
        approvalType: "artifact_review",
        projectId: project.id,
        projectName: project.name,
        submittedBy: SOLO_USER_DISPLAY.name,
        submittedOnLabel: formatDateTimeLabel(art.updatedAt),
        dueDateLabel: "Draft",
        priority: "medium",
        status: "in_review",
        href,
        queueTab: "my_reviews",
      });

      approvalPackages[id] = {
        detail: {
          id,
          approvalCode: art.templateId,
          title: `${art.templateId} · ${art.localId}`,
          description: "Artifact draft pending approval.",
          approvalType: "artifact_review",
          projectId: project.id,
          projectName: project.name,
          status: "in_review",
          submittedBy: SOLO_USER_DISPLAY.name,
          submittedOnLabel: formatDateTimeLabel(art.updatedAt),
          priority: "medium",
          linkedArtifactsCount: 1,
          evidenceItemsCount: 0,
          approversCount: 1,
          reviewType: "standard",
        },
        requiredInputs: [
          {
            id: `inp-${art.id}`,
            inputCode: art.templateId,
            name: art.localId,
            description: "Latest artifact version",
            status: "incomplete",
            linkedObjectLabel: `Artifact`,
            linkedObjectHref: `/projects/${project.id}/artifacts/${art.id}`,
          },
        ],
        comments: [],
        decisionDraft: {
          approvalId: id,
          comments: "",
          requiredChanges: [],
          conditions: [],
          canSubmit: false,
          blockers: ["Approve artifact in Template / Artifact workflow."],
        },
        history: [],
        actionState: {
          readinessLabel: "Draft artifact",
          readinessSummary: "Complete and approve artifact content.",
          canSaveReview: true,
          canSubmitDecision: false,
          submitBlockers: [],
        },
      };
    }
  }

  if (pendingApprovals.length === 0) {
    const placeholderId = "approval-none";
    pendingApprovals.push({
      id: placeholderId,
      approvalCode: "—",
      title: "No open approvals",
      approvalType: "gate_review",
      projectId: projects[0]?.id ?? "none",
      projectName: projects[0]?.name ?? "No projects",
      submittedBy: SOLO_USER_DISPLAY.name,
      submittedOnLabel: formatDateTimeLabel(new Date()),
      priority: "low",
      status: "pending",
      href: "/projects",
      queueTab: "pending",
    });
    approvalPackages[placeholderId] = emptyPackage(placeholderId);
  }

  const selectedId =
    selectedApprovalId && approvalPackages[selectedApprovalId] ?
      selectedApprovalId
    : pendingApprovals[0]!.id;

  const selectedApproval = approvalPackages[selectedId] ?? emptyPackage(selectedId);

  return {
    user: { ...SOLO_USER_DISPLAY },
    pendingApprovals,
    selectedApproval,
    approvalPackages,
  };
}

function isArtifactApprovedJson(data: unknown): boolean {
  const d = data as Record<string, unknown>;
  const s = d.documentStatus ?? d.approvalStatus;
  return s === "Approved";
}

function emptyPackage(id: string): ApprovalPackage {
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
      submittedBy: SOLO_USER_DISPLAY.name,
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
