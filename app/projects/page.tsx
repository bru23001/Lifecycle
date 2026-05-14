import { redirect } from "next/navigation";

import { ProjectsPage as ProjectsScreenPage } from "@/components/projects/projects-page";
import {
  PROJECT_DETAIL_TABS,
  emptyPlaceholderSelectedProject,
} from "@/data/projects.constants";
import { prisma } from "@/lib/prisma";
import { parseApplicability } from "@/lib/applicability";
import {
  ownerDisplayFromProjectRow,
  parseProjectApplicabilityMetadata,
  resolveProjectListStatus,
} from "@/lib/project-applicability-metadata";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { indexLatestGateDecisions, nextOpenGateForPhase } from "@/lib/gateStatus";
import { buildProjectBlockers } from "@/lib/project-blockers";
import { buildSelectedProjectRecentActivity } from "@/lib/project-recent-activity";
import { OPEN_APPROVAL_STATUSES } from "@/lib/server/approval-writes";
import { getProjectAuditScreenEntries } from "@/lib/server/project-audit-screen";
import { normalizeProjectDetailTabQueryParam } from "@/lib/normalize-project-detail-tab-query";
import {
  parseProjectsListQuery,
  rowMatchesListQuery,
  sortProjectListRows,
  stripProjectListFilterRow,
  type ProjectListFilterRow,
} from "@/lib/projects-list-query";
import { projectAuditTrailListHref, projectsListHref } from "@/lib/projects-url";
import { formatProjectCode } from "@/lib/format-project-code";
import { buildSelectedProjectFromListItem } from "@/lib/server/projects-screen";
import { loadProjectsArtifactsTabData } from "@/lib/server/projects-artifacts-tab";
import { buildSelectedProjectProfileFromRow } from "@/lib/server/selected-project-profile";
import type { ProjectDetailTab, ProjectsScreenData, SelectedProject } from "@/types/projects.types";

export const dynamic = "force-dynamic";

/** Next.js `searchParams` values may be `string | string[]`; use the first string. */
function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : undefined;
}

function parseDetailTab(rawTab: string | undefined): ProjectDetailTab {
  const normalized = normalizeProjectDetailTabQueryParam(rawTab);
  const tab = PROJECT_DETAIL_TABS.find((item) => item.id === normalized);
  return tab?.id ?? "overview";
}

function timeAgoHours(hours: number): string {
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsRoutePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const selected = searchParamFirst(sp.selected);
  const tab = normalizeProjectDetailTabQueryParam(searchParamFirst(sp.tab));
  const page = searchParamFirst(sp.page);
  const openAuditEventId = searchParamFirst(sp.openAuditEvent) ?? null;
  const newRaw = searchParamFirst(sp.new);
  const intentRaw = searchParamFirst(sp.intent);
  if (newRaw === "1" || newRaw === "true") {
    const q = new URLSearchParams();
    if (intentRaw?.trim()) q.set("intent", intentRaw.trim());
    redirect(`/projects/new${q.size > 0 ? `?${q}` : ""}`);
  }

  const listQuery = parseProjectsListQuery(sp);

  const screenUser = await getCurrentUserDisplay();
  const assignableUserRows = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
    take: 250,
  });

  const rows = await prisma.project.findMany({
    where: { archivedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      slug: true,
      vaultFolder: true,
      currentPhase: true,
      ownerId: true,
      applicabilityJson: true,
      createdAt: true,
      updatedAt: true,
      owner: { select: { id: true, name: true } },
      _count: {
        select: { artifacts: true, traceLinks: true },
      },
      artifacts: { select: { id: true, templateId: true, status: true, updatedAt: true } },
      evidenceItems: {
        select: {
          id: true,
          status: true,
          completenessPercent: true,
          artifactLinks: { select: { artifactId: true } },
        },
      },
      approvals: {
        where: { status: { in: [...OPEN_APPROVAL_STATUSES] } },
        orderBy: { createdAt: "asc" },
        select: {
          approvalType: true,
          gateId: true,
          artifactId: true,
        },
      },
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

  const enrichedRows: ProjectListFilterRow[] = rows.map((project) => {
    const phase = project.currentPhase;
    const status = resolveProjectListStatus(phase, project._count.artifacts, project.applicabilityJson);
    const missingEvidenceCount = project.evidenceItems.filter(
      (item) => item.completenessPercent < 100 || item.artifactLinks.length === 0,
    ).length;
    const lastGate = project.gateDecisions[0]?.createdAt.getTime() ?? 0;
    return {
      id: project.id,
      name: project.name,
      code: formatProjectCode(project.slug, project.vaultFolder),
      owner: ownerDisplayFromProjectRow(
        project.applicabilityJson,
        project.owner?.name ?? null,
        screenUser.name,
      ),
      currentPhase: phase,
      progressPercent: Math.min(100, Math.max(8, Math.round((phase / 14) * 100))),
      status,
      updatedLabel: timeAgoHours(
        Math.max(1, Math.round((Date.now() - project.updatedAt.getTime()) / 3600000)),
      ),
      missingEvidenceCount,
      updatedAtMs: project.updatedAt.getTime(),
      createdAtMs: project.createdAt.getTime(),
      openApprovalsCount: project.approvals.length,
      lastGateDecisionAtMs: lastGate,
    };
  });

  const filteredRows = enrichedRows.filter((row) => rowMatchesListQuery(row, listQuery));
  const sortedRows = sortProjectListRows(filteredRows, listQuery.sort);
  const projects = sortedRows.map(stripProjectListFilterRow);

  const repositoryHasProjects = rows.length > 0;
  const hasVisibleProjects = projects.length > 0;
  const perPage = 6;
  const totalPages = projects.length === 0 ? 1 : Math.max(1, Math.ceil(projects.length / perPage));
  const parsedPage = Number.parseInt(page ?? "", 10);
  const selectedIndex =
    projects.length > 0 && selected ? projects.findIndex((project) => project.id === selected) : -1;
  const inferredPageFromSelection =
    selectedIndex >= 0 ? Math.floor(selectedIndex / perPage) + 1 : 1;
  const currentPage =
    projects.length === 0
      ? 1
      : Number.isFinite(parsedPage) && parsedPage > 0
        ? Math.min(totalPages, parsedPage)
        : inferredPageFromSelection;

  const pageStart = (currentPage - 1) * perPage;
  const pageProjects = projects.slice(pageStart, pageStart + perPage);

  const selectedProjectId =
    !hasVisibleProjects
      ? ""
      : selected && projects.some((project) => project.id === selected)
        ? selected
        : (pageProjects[0]?.id ?? projects[0]!.id);

  const selectedTab = parseDetailTab(tab);
  const selectedDbProject = rows.find((row) => row.id === selectedProjectId);
  const selectedProjectRow =
    !hasVisibleProjects
      ? null
      : (projects.find((project) => project.id === selectedProjectId) ?? projects[0]!);

  let selectedProject: SelectedProject =
    selectedProjectRow != null
      ? buildSelectedProjectFromListItem(selectedProjectRow)
      : emptyPlaceholderSelectedProject();

  if (selectedDbProject && selectedProjectRow) {
    const pm = parseProjectApplicabilityMetadata(selectedDbProject.applicabilityJson);
    const scopePreview =
      pm.scope && pm.scope.length > 96 ? `${pm.scope.slice(0, 93)}…` : (pm.scope ?? "—");
    const auditTrailEntries = await getProjectAuditScreenEntries(selectedDbProject.id);
    const artifactTotal = selectedDbProject._count.artifacts;
    const artifactComplete = selectedDbProject.artifacts.filter((artifact) => artifact.status !== "Draft").length;
    const evidenceTotal = selectedDbProject.evidenceItems.length;
    const traceTotal = selectedDbProject._count.traceLinks;
    const recentGate = selectedDbProject.gateDecisions.slice(0, 3);
    const workspaceHref = `/projects/${selectedDbProject.id}/workspace`;

    const latestByGateForNav = indexLatestGateDecisions(
      selectedDbProject.gateDecisions.map((d) => ({
        gateId: d.gateId,
        decision: d.decision,
        evidencePassSnapshot: d.evidencePassSnapshot,
        createdAt: d.createdAt,
      })),
    );
    const gateReviewSlug = nextOpenGateForPhase(
      selectedDbProject.currentPhase,
      latestByGateForNav,
    ).toLowerCase();
    const blockers = buildProjectBlockers({
      projectId: selectedDbProject.id,
      currentPhase: selectedDbProject.currentPhase,
      traceLinksCount: traceTotal,
      latestByGate: latestByGateForNav,
      artifacts: selectedDbProject.artifacts.map((artifact) => ({
        id: artifact.id,
        templateId: artifact.templateId,
        status: artifact.status,
      })),
      evidenceItems: selectedDbProject.evidenceItems,
      openApprovals: selectedDbProject.approvals,
    });

    const mergedRecentActivity = buildSelectedProjectRecentActivity(
      selectedDbProject.id,
      recentGate,
      auditTrailEntries,
    );

    selectedProject = {
      ...selectedProject,
      auditTrailEntries,
      header: {
        ...selectedProject.header,
        id: selectedDbProject.id,
        name: selectedDbProject.name,
        code: selectedProjectRow.code,
        currentPhase: selectedDbProject.currentPhase,
        updatedLabel: selectedProjectRow.updatedLabel,
        businessArea: pm.businessArea ?? selectedProject.header.businessArea,
      },
      metrics: [
        { id: "artifacts", label: "Artifacts", value: String(artifactTotal), note: `${artifactComplete} complete`, tone: "blue" },
        { id: "gates", label: "Gates", value: String(recentGate.length), note: "recent decisions", tone: "green" },
        { id: "evidence", label: "Evidence", value: String(evidenceTotal), note: `${evidenceTotal} linked`, tone: "amber" },
        { id: "trace", label: "Trace Links", value: String(traceTotal), note: "coverage links", tone: "purple" },
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
                href: `/projects/${selectedDbProject.id}/gates/${item.gateId.toLowerCase()}/review`,
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
      blockers,
      snapshot: [
        { key: "Project Code", value: selectedProjectRow.code },
        { key: "Type", value: "Platform" },
        { key: "Business Area", value: pm.businessArea ?? "—" },
        { key: "Owner", value: selectedProject.header.owner },
        { key: "Lifecycle model", value: pm.lifecycleModel ?? "—" },
        { key: "Phase", value: `Phase ${selectedDbProject.currentPhase} of 14` },
        { key: "Scope", value: scopePreview },
        { key: "Vault", value: selectedDbProject.vaultFolder },
        {
          key: "Missing evidence",
          value: selectedProjectRow.missingEvidenceCount > 0 ? String(selectedProjectRow.missingEvidenceCount) : "None",
        },
      ],
      quickActions: [
        {
          id: "qa-profile",
          label: "Edit Project Profile",
          href: projectsListHref({
            selectedProjectId: selectedDbProject.id,
            selectedTab: "profile",
            currentPage,
            listFilters: listQuery,
          }),
        },
        {
          id: "qa-lifecycle",
          label: "View Lifecycle Timeline",
          href: projectsListHref({
            selectedProjectId: selectedDbProject.id,
            selectedTab: "lifecycle-timeline",
            currentPage,
            listFilters: listQuery,
          }),
        },
        {
          id: "qa-gate",
          label: "Open Gate Review",
          href: `/projects/${selectedDbProject.id}/gates/${gateReviewSlug}/review`,
        },
        { id: "qa-artifacts", label: "Manage Artifacts", href: `/projects/${selectedDbProject.id}/artifacts` },
        { id: "qa-evidence", label: "View Evidence", href: `/projects/${selectedDbProject.id}/evidence` },
        {
          id: "qa-add-evidence",
          label: "Add Evidence",
          href: `/projects/${selectedDbProject.id}/evidence`,
          kind: "modal-add-evidence",
        },
        {
          id: "qa-trace",
          label: "View Traceability Matrix",
          href: `/projects/${selectedDbProject.id}/traceability`,
        },
        {
          id: "qa-generate-report",
          label: "Generate Report",
          href: `/projects/${selectedDbProject.id}/reports`,
          kind: "modal-report-selection",
        },
        { id: "qa-audit", label: "View Audit Trail", href: projectAuditTrailListHref(selectedDbProject.id) },
        {
          id: "qa-export",
          label: "Export Project Package",
          href: `/projects/${selectedDbProject.id}/reports/evidence-package/configure`,
          kind: "modal-export-package",
        },
      ],
      nextRequiredAction: {
        description:
          "Complete required artifacts and evidence items before advancing to the next lifecycle gate review.",
        ctaLabel: "Go to Lifecycle Workspace",
        href: workspaceHref,
      },
      gatesNavHref: `/projects/${selectedDbProject.id}/gates/${gateReviewSlug}/review`,
    };
  }

  const selectedProjectProfile =
    selectedDbProject != null
      ? buildSelectedProjectProfileFromRow({
          id: selectedDbProject.id,
          name: selectedDbProject.name,
          slug: selectedDbProject.slug,
          vaultFolder: selectedDbProject.vaultFolder,
          applicabilityJson: selectedDbProject.applicabilityJson,
          currentPhase: selectedDbProject.currentPhase,
          ownerId: selectedDbProject.ownerId,
          owner: selectedDbProject.owner,
          _count: { artifacts: selectedDbProject._count.artifacts },
        })
      : null;

  const lifecycleStrip =
    selectedDbProject != null && hasVisibleProjects
      ? {
          projectId: selectedDbProject.id,
          currentPhase: selectedDbProject.currentPhase,
          applicability: parseApplicability(selectedDbProject.applicabilityJson),
          gateReviewHref:
            selectedProject.gatesNavHref ?? `/projects/${selectedDbProject.id}/gates/g1/review`,
        }
      : null;

  const artifactsTab =
    selectedDbProject != null && hasVisibleProjects
      ? await loadProjectsArtifactsTabData(selectedDbProject.id)
      : null;

  const screenData: ProjectsScreenData = {
    user: screenUser,
    projects,
    selectedProject,
    assignableUsers: assignableUserRows.map((u) => ({
      id: u.id,
      name: u.name?.trim() || u.email,
      email: u.email,
    })),
    selectedProjectProfile,
    lifecycleStrip,
    artifactsTab,
  };

  return (
    <ProjectsScreenPage
      data={screenData}
      selectedProjectId={selectedProjectId}
      selectedTab={selectedTab}
      currentPage={currentPage}
      totalPages={totalPages}
      repositoryHasProjects={repositoryHasProjects}
      hasVisibleProjects={hasVisibleProjects}
      listFilters={listQuery}
      initialOpenAuditEventId={openAuditEventId}
    />
  );
}
