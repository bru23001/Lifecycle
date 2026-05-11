import { ProjectsPage as ProjectsScreenPage } from "@/components/projects/projects-page";
import {
  PROJECT_DETAIL_TABS,
  PROJECTS_LIST_FALLBACK,
  PROJECTS_USER_FALLBACK,
  buildFallbackSelectedProject,
} from "@/data/projects.mock";
import { prisma } from "@/lib/prisma";
import type { ProjectDetailTab, ProjectListItem, ProjectsScreenData, SelectedProject } from "@/types/projects.types";

export const dynamic = "force-dynamic";

function formatProjectCode(slug: string, vaultFolder: string): string {
  const tail = vaultFolder.split("-")[1] ?? slug.slice(0, 3);
  const prefix = slug.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3) || "PRJ";
  return `${prefix}-${tail.padStart(3, "0").slice(-3)}`;
}

function parseDetailTab(rawTab: string | undefined): ProjectDetailTab {
  const tab = PROJECT_DETAIL_TABS.find((item) => item.id === rawTab);
  return tab?.id ?? "overview";
}

function timeAgoHours(hours: number): string {
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

type PageProps = {
  searchParams: Promise<{ selected?: string; tab?: string }>;
};

export default async function ProjectsRoutePage({ searchParams }: PageProps) {
  const { selected, tab } = await searchParams;

  const rows = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      _count: {
        select: { artifacts: true, traceLinks: true },
      },
      artifacts: { select: { status: true, updatedAt: true } },
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          gateId: true,
          decision: true,
          createdAt: true,
          authorityName: true,
          authorityRole: true,
        },
      },
    },
  });

  const dbProjects: ProjectListItem[] = rows.map((project) => {
    const phase = project.currentPhase;
    let status: ProjectListItem["status"] = "In Progress";
    if (phase <= 2 && project.slug.includes("threat")) status = "Blocked";
    if (phase <= 1 && project._count.artifacts === 0) status = "Pending";
    return {
      id: project.id,
      name: project.name,
      code: formatProjectCode(project.slug, project.vaultFolder),
      owner: "Alex Developer",
      currentPhase: phase,
      progressPercent: Math.min(100, Math.max(8, Math.round((phase / 14) * 100))),
      status,
      updatedLabel: timeAgoHours(
        Math.max(1, Math.round((Date.now() - project.updatedAt.getTime()) / 3600000)),
      ),
    };
  });

  const projects = dbProjects.length > 0 ? dbProjects : PROJECTS_LIST_FALLBACK;
  const selectedProjectId =
    selected && projects.some((project) => project.id === selected)
      ? selected
      : projects[0]?.id ?? PROJECTS_LIST_FALLBACK[0]!.id;
  const selectedTab = parseDetailTab(tab);
  const selectedDbProject = rows.find((row) => row.id === selectedProjectId);
  const selectedProjectRow =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? PROJECTS_LIST_FALLBACK[0]!;

  let selectedProject: SelectedProject = buildFallbackSelectedProject(selectedProjectRow);

  if (selectedDbProject) {
    const artifactTotal = selectedDbProject._count.artifacts;
    const artifactComplete = selectedDbProject.artifacts.filter((artifact) => artifact.status !== "Draft").length;
    const traceTotal = selectedDbProject._count.traceLinks;
    const recentGate = selectedDbProject.gateDecisions.slice(0, 3);
    const workspaceHref = `/projects/${selectedDbProject.id}/workspace`;

    selectedProject = {
      ...selectedProject,
      header: {
        ...selectedProject.header,
        id: selectedDbProject.id,
        name: selectedDbProject.name,
        code: selectedProjectRow.code,
        currentPhase: selectedDbProject.currentPhase,
        updatedLabel: selectedProjectRow.updatedLabel,
      },
      metrics: [
        { id: "artifacts", label: "Artifacts", value: String(artifactTotal), note: `${artifactComplete} complete`, tone: "blue" },
        { id: "gates", label: "Gates", value: String(recentGate.length), note: "recent decisions", tone: "green" },
        { id: "evidence", label: "Evidence", value: String(Math.max(artifactTotal, 1)), note: `${artifactComplete} complete`, tone: "amber" },
        { id: "trace", label: "Trace Links", value: String(traceTotal), note: "coverage links", tone: "purple" },
      ],
      recentActivity:
        recentGate.length > 0
          ? recentGate.map((item, index) => ({
              id: `decision-${index}`,
              title: `${item.gateId} decision recorded — ${item.decision}`,
              meta: `${item.authorityName ?? "Reviewer"} · ${item.authorityRole ?? "Authority"}`,
              timeLabel: timeAgoHours(Math.max(1, Math.round((Date.now() - item.createdAt.getTime()) / 3600000))),
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
        { key: "Project Code", value: selectedProjectRow.code },
        { key: "Type", value: "Platform" },
        { key: "Business Area", value: "Security" },
        { key: "Owner", value: selectedProject.header.owner },
        { key: "Phase", value: `Phase ${selectedDbProject.currentPhase} of 14` },
        { key: "Vault", value: selectedDbProject.vaultFolder },
      ],
      quickActions: [
        { id: "qa-profile", label: "Edit Project Profile", href: `/projects?selected=${selectedDbProject.id}&tab=profile` },
        { id: "qa-gate", label: "Open Gate Review", href: `/projects/${selectedDbProject.id}/gates/g1/review` },
        { id: "qa-audit", label: "View Audit Trail", href: `/projects?selected=${selectedDbProject.id}&tab=audit-trail` },
        { id: "qa-artifacts", label: "Manage Artifacts", href: `/projects/${selectedDbProject.id}/artifacts` },
      ],
      nextRequiredAction: {
        description:
          "Complete required artifacts and evidence items before advancing to the next lifecycle gate review.",
        ctaLabel: "Go to Lifecycle Workspace",
        href: workspaceHref,
      },
    };
  }

  const screenData: ProjectsScreenData = {
    user: PROJECTS_USER_FALLBACK,
    projects,
    selectedProject,
  };

  return (
    <ProjectsScreenPage
      data={screenData}
      selectedProjectId={selectedProjectId}
      selectedTab={selectedTab}
    />
  );
}
