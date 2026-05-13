import { prisma } from "@/lib/prisma";
import { displayFromCurrentUser, getCurrentUser } from "@/lib/server/current-user";
import { OPEN_APPROVAL_STATUSES } from "@/lib/server/approval-writes";
import { resolveRecentDecisionHref } from "@/lib/recent-decision-href";
import type { NotificationCenterData, NotificationCenterItem } from "@/types/notification-center.types";

function timeAgoLabel(d: Date): string {
  const hours = Math.max(1, Math.round((Date.now() - d.getTime()) / 3600000));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export async function loadNotificationCenterData(): Promise<NotificationCenterData> {
  const userDisplay = displayFromCurrentUser(await getCurrentUser());
  const items: NotificationCenterItem[] = [];
  let openApprovalsCount = 0;

  try {
    const [openApprovals, recentDecisions, recentAudit] = await Promise.all([
      prisma.approval.findMany({
        where: { status: { in: [...OPEN_APPROVAL_STATUSES] } },
        orderBy: { createdAt: "asc" },
        take: 40,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.gateDecision.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.auditEntry.findMany({
        where: {
          projectId: { not: null },
          subjectKind: { in: ["gate_decision", "approval"] },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { project: { select: { name: true } } },
      }),
    ]);

    openApprovalsCount = openApprovals.length;

    for (const row of openApprovals) {
      const projectName = row.project?.name ?? "Project";
      const title =
        row.approvalType === "gate_review" && row.gateId
          ? `${row.gateId} gate review awaiting decision`
          : row.approvalType === "artifact_review"
            ? "Artifact review awaiting decision"
            : "Approval awaiting decision";
      items.push({
        id: `approval-${row.id}`,
        kind: "approval_pending",
        title,
        subtitle: projectName,
        timeLabel: timeAgoLabel(row.updatedAt),
        href: `/approvals/${row.id}`,
      });
    }

    for (const row of recentDecisions) {
      items.push({
        id: `gate-decision-${row.id}`,
        kind: "gate_event",
        title: `${row.gateId} recorded — ${row.decision}`,
        subtitle: row.project.name,
        timeLabel: timeAgoLabel(row.createdAt),
        href: `/projects/${row.projectId}/gates/${row.gateId.toLowerCase()}/review`,
      });
    }

    for (const row of recentAudit) {
      const projectName = row.project?.name ?? "Project";
      items.push({
        id: `audit-${row.id}`,
        kind: "audit_event",
        title: row.action.replace(/_/g, " "),
        subtitle: projectName,
        timeLabel: timeAgoLabel(row.createdAt),
        href: resolveRecentDecisionHref({
          targetType: "audit_detail",
          projectId: row.projectId,
          auditEventId: row.id,
        }),
      });
    }
  } catch {
    // Empty feed when DB is unavailable.
  }

  return {
    user: userDisplay,
    items,
    openApprovalsCount,
  };
}
