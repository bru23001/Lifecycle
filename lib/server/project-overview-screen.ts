import {
  ownerDisplayFromProjectRow,
  parseProjectApplicabilityMetadata,
  resolveProjectListStatus,
} from "@/lib/project-applicability-metadata";
import { indexLatestGateDecisions, nextOpenGateForPhase } from "@/lib/gateStatus";
import { prisma } from "@/lib/prisma";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { getProjectAuditScreenEntries } from "@/lib/server/project-audit-screen";
import { buildSelectedProjectFromListItem } from "@/lib/server/projects-screen";
import { buildSelectedProjectRecentActivity } from "@/lib/project-recent-activity";
import { projectAuditTrailListHref } from "@/lib/projects-url";
import type { ProjectListItem, SelectedProject } from "@/types/projects.types";

function formatProjectCode(slug: string, vaultFolder: string): string {
  const tail = vaultFolder.split("-")[1] ?? slug.slice(0, 3);
  const prefix = slug.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3) || "PRJ";
  return `${prefix}-${tail.padStart(3, "0").slice(-3)}`;
}

function timeAgoHours(hours: number): string {
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export type ProjectOverviewScreenData = {
  user: { name: string; role: string; initials: string };
  selectedProject: SelectedProject;
  progressPercent: number;
};

export async function loadProjectOverviewScreenData(
  projectId: string,
): Promise<ProjectOverviewScreenData | null> {
  const screenUser = await getCurrentUserDisplay();

  const row = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { name: true } },
      _count: {
        select: { artifacts: true, traceLinks: true, evidenceItems: true },
      },
      artifacts: { select: { status: true, updatedAt: true } },
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          gateId: true,
          decision: true,
          createdAt: true,
          evidencePassSnapshot: true,
          authorityName: true,
          authorityRole: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  const phase = row.currentPhase;
  const status = resolveProjectListStatus(phase, row._count.artifacts, row.applicabilityJson);
  const listItem: ProjectListItem = {
    id: row.id,
    name: row.name,
    code: formatProjectCode(row.slug, row.vaultFolder),
    owner: ownerDisplayFromProjectRow(
      row.applicabilityJson,
      row.owner?.name ?? null,
      screenUser.name,
    ),
    currentPhase: phase,
    progressPercent: Math.min(100, Math.max(8, Math.round((phase / 14) * 100))),
    status,
    updatedLabel: timeAgoHours(
      Math.max(1, Math.round((Date.now() - row.updatedAt.getTime()) / 3600000)),
    ),
    missingEvidenceCount: 0,
  };

  let selectedProject = buildSelectedProjectFromListItem(listItem);
  const pm = parseProjectApplicabilityMetadata(row.applicabilityJson);
  const scopePreview =
    pm.scope && pm.scope.length > 96 ? `${pm.scope.slice(0, 93)}…` : (pm.scope ?? "—");
  const auditTrailEntries = await getProjectAuditScreenEntries(row.id);
  const artifactTotal = row._count.artifacts;
  const artifactComplete = row.artifacts.filter((artifact) => artifact.status !== "Draft").length;
  const evidenceTotal = row._count.evidenceItems;
  const traceTotal = row._count.traceLinks;
  const recentGate = row.gateDecisions.slice(0, 3);
  const workspaceHref = `/projects/${row.id}/workspace`;

  const latestByGateForNav = indexLatestGateDecisions(
    row.gateDecisions.map((d) => ({
      gateId: d.gateId,
      decision: d.decision,
      evidencePassSnapshot: d.evidencePassSnapshot,
      createdAt: d.createdAt,
    })),
  );
  const gateReviewSlug = nextOpenGateForPhase(row.currentPhase, latestByGateForNav).toLowerCase();

  const mergedRecentActivity = buildSelectedProjectRecentActivity(row.id, recentGate, auditTrailEntries);

  selectedProject = {
    ...selectedProject,
    auditTrailEntries,
    header: {
      ...selectedProject.header,
      id: row.id,
      name: row.name,
      code: listItem.code,
      currentPhase: row.currentPhase,
      updatedLabel: listItem.updatedLabel,
    },
    metrics: [
      {
        id: "artifacts",
        label: "Artifacts",
        value: String(artifactTotal),
        note: `${artifactComplete} complete`,
        tone: "blue",
      },
      {
        id: "gates",
        label: "Gates",
        value: String(recentGate.length),
        note: "recent decisions",
        tone: "green",
      },
      {
        id: "evidence",
        label: "Evidence",
        value: String(evidenceTotal),
        note: `${evidenceTotal} linked`,
        tone: "amber",
      },
      {
        id: "trace",
        label: "Trace Links",
        value: String(traceTotal),
        note: "coverage links",
        tone: "purple",
      },
    ],
    recentActivity:
      mergedRecentActivity.length > 0
        ? mergedRecentActivity
        : recentGate.length > 0
          ? recentGate.map((item, index) => ({
              id: `decision-${index}`,
              title: `${item.gateId} decision recorded — ${item.decision}`,
              meta: `${item.authorityName ?? "Reviewer"} · ${item.authorityRole ?? "Authority"}`,
              timeLabel: timeAgoHours(Math.max(1, Math.round((Date.now() - item.createdAt.getTime()) / 3600000))),
              href: `/projects/${row.id}/gates/${item.gateId.toLowerCase()}/review`,
            }))
          : selectedProject.recentActivity,
    gateStatuses:
      recentGate.length > 0
        ? recentGate.map((item) => ({
            gateId: item.gateId,
            title: item.gateId,
            status:
              item.decision === "Accepted"
                ? "Approved"
                : item.decision === "Conditional"
                  ? "In Review"
                  : "Changes Requested",
            timeLabel: timeAgoHours(Math.max(1, Math.round((Date.now() - item.createdAt.getTime()) / 3600000))),
          }))
        : selectedProject.gateStatuses,
    snapshot: [
      { key: "Project Code", value: listItem.code },
      { key: "Type", value: "Platform" },
      { key: "Business Area", value: "Security" },
      { key: "Owner", value: selectedProject.header.owner },
      { key: "Lifecycle model", value: pm.lifecycleModel ?? "—" },
      { key: "Phase", value: `Phase ${row.currentPhase} of 14` },
      { key: "Scope", value: scopePreview },
      { key: "Vault", value: row.vaultFolder },
    ],
    quickActions: [
      { id: "qa-profile", label: "Edit Project Profile", href: `/projects?selected=${row.id}&tab=profile` },
      {
        id: "qa-lifecycle",
        label: "View Lifecycle Timeline",
        href: `/projects?selected=${row.id}&tab=lifecycle-timeline`,
      },
      {
        id: "qa-gate",
        label: "Open Gate Review",
        href: `/projects/${row.id}/gates/${gateReviewSlug}/review`,
      },
      { id: "qa-artifacts", label: "Manage Artifacts", href: `/projects/${row.id}/artifacts` },
      { id: "qa-evidence", label: "View Evidence", href: `/projects/${row.id}/evidence` },
      {
        id: "qa-trace",
        label: "View Traceability Matrix",
        href: `/projects/${row.id}/traceability`,
      },
      { id: "qa-audit", label: "View Audit Trail", href: projectAuditTrailListHref(row.id) },
      {
        id: "qa-export",
        label: "Export Project Package",
        href: `/projects/${row.id}/reports/evidence-package/configure`,
      },
    ],
    nextRequiredAction: {
      description:
        "Complete required artifacts and evidence items before advancing to the next lifecycle gate review.",
      ctaLabel: "Go to Lifecycle Workspace",
      href: workspaceHref,
    },
    gatesNavHref: `/projects/${row.id}/gates/${gateReviewSlug}/review`,
  };

  return {
    user: screenUser,
    selectedProject,
    progressPercent: listItem.progressPercent,
  };
}
