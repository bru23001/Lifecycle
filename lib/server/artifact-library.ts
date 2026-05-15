import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getGateVisualState, indexLatestGateDecisions } from "@/lib/gateStatus";
import type { GateId } from "@/lib/gateRules";
import { inferArtifactExportName } from "@/lib/markdownExporter";
import { getVaultRoot } from "@/lib/vault";
import { hasTemplate, getTemplate } from "@/templates/registry";
import type { AnyLifecycleTemplate } from "@/templates/types";
import type {
  ArtifactActivityItem,
  ArtifactComment,
  ArtifactDetail,
  ArtifactJsonEvidence,
  ArtifactLibraryData,
  ArtifactListItem,
  ArtifactQuickInfoData,
  ArtifactVersion,
  ArtifactWorkflowStatus,
  LinkedGate,
  LinkedPhase,
  MarkdownArtifactView,
} from "@/types/artifact-library.types";
import {
  formatDateTimeLabel,
  formatTimeAgoFragment,
  isArtifactBodyApproved,
  projectDisplayCode,
} from "@/lib/server/helpers";
import { getCurrentUserDisplay, type CurrentUserDisplay } from "@/lib/server/current-user";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { OPEN_APPROVAL_STATUSES } from "@/lib/server/approval-writes";
import { gateHeaderDisplayName, workspacePhaseMeta } from "@/lib/workspacePhases";

const ARTIFACT_LIBRARY_RELATIONS = {
  evidenceLinks: { include: { evidence: true } },
  approvals: {
    orderBy: { updatedAt: "desc" } satisfies Prisma.ApprovalOrderByWithRelationInput,
    include: {
      comments: {
        orderBy: { createdAt: "desc" } satisfies Prisma.ApprovalCommentOrderByWithRelationInput,
        include: { author: { select: { name: true } } },
      },
    },
  },
} satisfies Prisma.ArtifactInclude;

type ArtifactRow = Prisma.ArtifactGetPayload<{ include: typeof ARTIFACT_LIBRARY_RELATIONS }>;

const PROJECT_ARTIFACT_LIBRARY_INCLUDE = {
  artifacts: {
    orderBy: { updatedAt: "desc" } satisfies Prisma.ArtifactOrderByWithRelationInput,
    include: ARTIFACT_LIBRARY_RELATIONS,
  },
  gateDecisions: { orderBy: { createdAt: "desc" } satisfies Prisma.GateDecisionOrderByWithRelationInput },
  approvals: {
    where: { approvalType: "gate_review" } satisfies Prisma.ApprovalWhereInput,
    orderBy: { updatedAt: "desc" } satisfies Prisma.ApprovalOrderByWithRelationInput,
  },
} satisfies Prisma.ProjectInclude;

type ProjectLibraryRow = Prisma.ProjectGetPayload<{
  include: typeof PROJECT_ARTIFACT_LIBRARY_INCLUDE;
}>;

function asRecord(data: unknown): Record<string, unknown> {
  return typeof data === "object" && data !== null && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

function phaseTitle(n: number): string {
  return workspacePhaseMeta(n).title;
}

function resolveTemplate(templateId: string): AnyLifecycleTemplate | null {
  if (!hasTemplate(templateId)) return null;
  try {
    return getTemplate(templateId);
  } catch {
    return null;
  }
}

function relativeTimeLabel(d: Date): string {
  return `Updated ${formatTimeAgoFragment(d)}`;
}

function mapApprovalToWorkflow(
  approvedBody: boolean,
  approval: ArtifactRow["approvals"][number] | undefined,
): ArtifactWorkflowStatus {
  if (approvedBody) return "approved";
  if (!approval) return "draft";
  switch (approval.status) {
    case "in_review":
      return "in_review";
    case "changes_requested":
      return "changes_requested";
    case "approved":
      return "in_progress";
    case "pending":
    default:
      return "draft";
  }
}

function linkedGateForTemplate(project: ProjectLibraryRow, template: AnyLifecycleTemplate | null): LinkedGate {
  const gateFromProject = workspacePhaseMeta(project.currentPhase).gate;
  const gate = (template?.gate ?? gateFromProject ?? "G2") as GateId;
  const latestByGate = indexLatestGateDecisions(
    project.gateDecisions.map((d) => ({
      gateId: d.gateId,
      decision: d.decision,
      evidencePassSnapshot: d.evidencePassSnapshot,
      createdAt: d.createdAt,
    })),
  );
  const visual = getGateVisualState(project.currentPhase, gate, latestByGate);
  let status: LinkedGate["status"] = "not_started";
  if (visual === "done") status = "approved";
  else if (visual === "ready") status = "pending_decision";

  const openApprovalStatuses = new Set<string>(OPEN_APPROVAL_STATUSES);
  const openGateReview = project.approvals.find(
    (a) =>
      a.approvalType === "gate_review" &&
      a.gateId === gate &&
      openApprovalStatuses.has(a.status),
  );
  if (openGateReview?.status === "changes_requested") status = "changes_requested";
  else if (openGateReview && visual !== "done") status = "pending_decision";

  return {
    gateId: gate.toLowerCase(),
    gateCode: gate,
    gateName: gateHeaderDisplayName(gate),
    status,
    reviewHref: `/projects/${project.id}/gates/${gate.toLowerCase()}/review`,
  };
}

function linkedPhaseForProject(project: ProjectLibraryRow, artifactPhase: number): LinkedPhase {
  const p = Math.min(14, Math.max(1, artifactPhase));
  let status: LinkedPhase["status"] = "not_started";
  if (p < project.currentPhase) status = "complete";
  else if (p === project.currentPhase) status = "in_progress";
  else status = "not_started";

  return {
    phaseId: `phase-${p}`,
    phaseNumber: p,
    totalPhases: 14,
    phaseName: phaseTitle(p),
    status,
    workspaceHref: `/projects/${project.id}/workspace?phase=${p}`,
  };
}

/** When the project has no artifacts yet (no DB row for current phase). */
function linkedPhaseStandalone(
  projectId: string,
  projectCurrentPhase: number,
  artifactPhase: number,
): LinkedPhase {
  const p = Math.min(14, Math.max(1, artifactPhase));
  let status: LinkedPhase["status"] = "not_started";
  if (p < projectCurrentPhase) status = "complete";
  else if (p === projectCurrentPhase) status = "in_progress";
  else status = "not_started";
  return {
    phaseId: `phase-${p}`,
    phaseNumber: p,
    totalPhases: 14,
    phaseName: phaseTitle(p),
    status,
    workspaceHref: `/projects/${projectId}/workspace?phase=${p}`,
  };
}

async function readVaultMarkdownSafe(relativePath: string): Promise<string | null> {
  try {
    const normalized = relativePath.replace(/^\/+/, "");
    const fullPath = path.join(getVaultRoot(), ...normalized.split("/"));
    return await readFile(fullPath, "utf8");
  } catch {
    return null;
  }
}

function buildJsonSections(template: AnyLifecycleTemplate | null, data: Record<string, unknown>) {
  if (!template) {
    return [
      {
        sectionId: "data",
        title: "Artifact data",
        status: "complete",
        values: { keys: Object.keys(data).slice(0, 20) },
      },
    ];
  }
  return template.sections.map((section) => {
    const values: Record<string, unknown> = {};
    let filled = 0;
    let total = 0;
    for (const f of section.fields) {
      if (f.type === "repeater") {
        const arr = data[f.name];
        values[f.name] = Array.isArray(arr) ? arr : [];
        total += 1;
        if (Array.isArray(arr) && arr.length > 0) filled += 1;
      } else {
        const v = data[f.name];
        values[f.name] = v ?? null;
        total += 1;
        if (v !== undefined && v !== null) {
          if (typeof v === "string") {
            if (v.trim().length > 0) filled += 1;
          } else {
            filled += 1;
          }
        }
      }
    }
    let status = "partial";
    if (total === 0 || filled === total) status = "complete";
    else if (filled === 0) status = "pending";
    return { sectionId: section.id, title: section.title, status, values };
  });
}

function countWords(markdown: string): number {
  const t = markdown.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function buildJsonEvidence(args: {
  artifact: ArtifactRow;
  projectId: string;
  template: AnyLifecycleTemplate | null;
  data: Record<string, unknown>;
  workflow: ArtifactWorkflowStatus;
  viewerName: string;
  /** Used when `template` is missing from the registry (phase labels in JSON export). */
  phaseFallback: number;
}): ArtifactJsonEvidence {
  const sections = buildJsonSections(args.template, args.data);
  const complete = sections.filter((s) => s.status === "complete").length;
  const completionPercent =
    sections.length === 0 ? 0 : Math.round((complete / sections.length) * 100);
  const issues: ArtifactJsonEvidence["validation"]["issues"] = [];
  if (completionPercent < 100) {
    issues.push({
      id: "incomplete-sections",
      severity: "warning",
      message: "Some template sections are still empty or incomplete.",
    });
  }
  const phaseNumber = args.template?.phase ?? args.phaseFallback;
  return {
    artifactId: args.artifact.id,
    projectId: args.projectId,
    phaseId: `phase-${phaseNumber}`,
    phaseNumber,
    templateId: args.artifact.templateId,
    templateCode: args.artifact.templateId,
    templateVersion: "v1",
    artifactVersion: `v${args.artifact.version}`,
    status: args.workflow,
    generatedAt: args.artifact.updatedAt.toISOString(),
    generatedBy: args.viewerName,
    sections,
    validation: {
      completionPercent,
      exportReady: completionPercent >= 80,
      issues,
    },
    evidenceLinks: args.artifact.evidenceLinks.map((l) => ({
      evidenceId: l.evidenceId,
      linkedToSectionId: undefined,
      linkedToFieldName: undefined,
    })),
  };
}

function buildMarkdownView(args: {
  artifact: ArtifactRow;
  template: AnyLifecycleTemplate | null;
  markdown: string;
}): MarkdownArtifactView {
  const title =
    args.template ?
      `${args.artifact.templateId} ${args.template.title}`
    : `${args.artifact.templateId} artifact`;
  const hasMissing =
    args.markdown.includes("{{") ||
    /\bTBD\b/i.test(args.markdown) ||
    /\[\s*\]\s*TODO/i.test(args.markdown);
  return {
    artifactId: args.artifact.id,
    title,
    markdown: args.markdown,
    generatedAtLabel: `Generated ${formatDateTimeLabel(args.artifact.updatedAt)}`,
    hasMissingPlaceholders: hasMissing,
  };
}

function buildExportPackage(args: {
  artifact: ArtifactRow;
  template: AnyLifecycleTemplate | null;
  data: Record<string, unknown>;
  json: ArtifactJsonEvidence;
}): ArtifactLibraryData["selectedArtifact"]["exportPackage"] {
  const tid = args.artifact.templateId;
  const title = args.template?.title ?? tid;
  const slug = args.template
    ? inferArtifactExportName(tid, args.data, title)
    : tid.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const blockers: string[] = [];
  if (!args.json.validation.exportReady) {
    blockers.push("Complete required sections before exporting the full package.");
  }
  return {
    artifactId: args.artifact.id,
    canExportMarkdown: args.json.validation.completionPercent > 0,
    canExportJsonEvidence: true,
    canExportFullPackage: args.json.validation.exportReady,
    markdownFilename: `${tid}_${slug}.md`,
    jsonFilename: `${tid}_${slug}.evidence.json`,
    packageFilename: `${tid}_${slug}.package.zip`,
    blockers,
  };
}

function buildActivityAndComments(artifact: ArtifactRow): {
  activityLog: ArtifactActivityItem[];
  comments: ArtifactComment[];
} {
  const events: { at: Date; item: ArtifactActivityItem }[] = [
    {
      at: artifact.createdAt,
      item: {
        id: `act-created-${artifact.id}`,
        actor: "System",
        action: "Artifact draft created",
        timestampLabel: formatDateTimeLabel(artifact.createdAt),
      },
    },
  ];
  const comments: ArtifactComment[] = [];

  for (const appr of artifact.approvals) {
    for (const c of appr.comments) {
      const author = c.author?.name?.trim() || "Reviewer";
      events.push({
        at: c.createdAt,
        item: {
          id: `act-${c.id}`,
          actor: author,
          action: "Comment on review",
          timestampLabel: formatDateTimeLabel(c.createdAt),
        },
      });
      comments.push({
        id: c.id,
        author,
        body: c.body,
        createdOnLabel: formatDateTimeLabel(c.createdAt),
      });
    }
  }

  events.sort((a, b) => b.at.getTime() - a.at.getTime());
  return { activityLog: events.map((e) => e.item), comments };
}

function buildVersionHistory(artifact: ArtifactRow, viewerName: string): ArtifactVersion[] {
  return [
    {
      id: `version-${artifact.id}-v${artifact.version}`,
      version: `v${artifact.version}`,
      status: isArtifactBodyApproved(artifact.dataJson) ? "approved" : "draft",
      createdBy: viewerName,
      createdOnLabel: formatDateTimeLabel(artifact.updatedAt),
      changeSummary: `Version ${artifact.version} (${artifact.status})`,
      canRestore: false,
    },
  ];
}

async function loadProjectForArtifacts(
  resolvedProjectId: string,
): Promise<ProjectLibraryRow | null> {
  return prisma.project.findUnique({
    where: { id: resolvedProjectId },
    include: PROJECT_ARTIFACT_LIBRARY_INCLUDE,
  });
}

function buildListItem(
  artifact: ArtifactRow,
  projectId: string,
  phaseFallback: number,
  template: AnyLifecycleTemplate | null,
  workflow: ArtifactWorkflowStatus,
): ArtifactListItem {
  const phaseNumber = template?.phase ?? phaseFallback;
  return {
    id: artifact.id,
    artifactCode: artifact.templateId,
    name: template?.title ?? `${artifact.templateId} (${artifact.localId})`,
    phaseNumber,
    phaseName: phaseTitle(phaseNumber),
    templateId: artifact.templateId,
    templateName: template?.title ?? artifact.templateId,
    status: workflow,
    version: `v${artifact.version}`,
    lastUpdatedLabel: relativeTimeLabel(artifact.updatedAt),
    href: `/projects/${projectId}/artifacts/${artifact.id}`,
  };
}

function buildDetail(args: {
  artifact: ArtifactRow;
  project: ProjectLibraryRow;
  template: AnyLifecycleTemplate | null;
  data: Record<string, unknown>;
  workflow: ArtifactWorkflowStatus;
  viewerName: string;
}): ArtifactDetail {
  const { artifact, project, template, data, workflow, viewerName } = args;
  const phaseNumber = template?.phase ?? project.currentPhase ?? 1;
  const name = template?.title ?? `${artifact.templateId} (${artifact.localId})`;
  const desc =
    (typeof data.executiveSummary === "string" && data.executiveSummary) ||
    (typeof data.ideaTitle === "string" && data.ideaTitle) ||
    (typeof data.problemTitle === "string" && data.problemTitle) ||
    template?.title ||
    "Lifecycle artifact output.";
  const label =
    workflow === "approved" ? "Approved" : workflow === "in_review" ? "In review" : "Draft";
  return {
    id: artifact.id,
    artifactCode: artifact.templateId,
    name,
    description: typeof desc === "string" ? desc.slice(0, 500) : String(desc).slice(0, 500),
    projectId: project.id,
    projectName: project.name,
    phaseNumber,
    phaseName: phaseTitle(phaseNumber),
    templateId: artifact.templateId,
    templateName: template?.title ?? artifact.templateId,
    ownerName: viewerName,
    status: workflow,
    version: `v${artifact.version}`,
    artifactVersionLabel: `v${artifact.version} (${label})`,
    lastUpdatedLabel: formatDateTimeLabel(artifact.updatedAt),
    createdOnLabel: formatDateTimeLabel(artifact.createdAt),
    isStarred: false,
  };
}

async function buildSelectedArtifact(args: {
  artifact: ArtifactRow;
  project: ProjectLibraryRow;
  viewer: CurrentUserDisplay;
}): Promise<ArtifactLibraryData["selectedArtifact"]> {
  const { artifact, project, viewer } = args;
  const data = asRecord(artifact.dataJson);
  const template = resolveTemplate(artifact.templateId);
  const latestApproval = artifact.approvals[0];
  const approvedBody = isArtifactBodyApproved(artifact.dataJson);
  const workflow = mapApprovalToWorkflow(approvedBody, latestApproval);

  const markdown =
    (await readVaultMarkdownSafe(artifact.markdownPath)) ??
    (template ? template.toMarkdown(data) : "_No markdown available._");

  const detail = buildDetail({
    artifact,
    project,
    template,
    data,
    workflow,
    viewerName: viewer.name,
  });
  const markdownView = buildMarkdownView({ artifact, template, markdown });
  const jsonEvidence = buildJsonEvidence({
    artifact,
    projectId: project.id,
    template,
    data,
    workflow,
    viewerName: viewer.name,
    phaseFallback: project.currentPhase,
  });
  const { activityLog, comments } = buildActivityAndComments(artifact);
  const exportPackage = buildExportPackage({ artifact, template, data, json: jsonEvidence });
  const quickInfo: ArtifactQuickInfoData = {
    artifactType: "Template output",
    templateVersion: "v1",
    artifactVersion: detail.artifactVersionLabel,
    status: workflow === "approved" ? "Approved" : "In progress",
    overallProgressPercent: jsonEvidence.validation.completionPercent,
    requiredSections: jsonEvidence.sections.length || 1,
    completedSections: jsonEvidence.sections.filter((s) => s.status === "complete").length,
    evidenceItems: artifact.evidenceLinks.length,
    wordCount: countWords(markdown),
    lastUpdatedBy: viewer.name,
  };

  return {
    detail,
    markdownView,
    jsonEvidence,
    versionHistory: buildVersionHistory(artifact, viewer.name),
    linkedPhase: linkedPhaseForProject(project, template?.phase ?? project.currentPhase ?? 1),
    linkedGate: linkedGateForTemplate(project, template),
    quickInfo,
    exportPackage,
    activityLog,
    comments,
  };
}

function emptyLibrary(
  projectId: string,
  projectName: string,
  code: string,
  viewer: CurrentUserDisplay,
  currentPhase: number,
): ArtifactLibraryData {
  const p = Math.min(14, Math.max(1, currentPhase));
  const gate = (workspacePhaseMeta(p).gate ?? "G2") as GateId;
  const placeholderDetail: ArtifactDetail = {
    id: "empty",
    artifactCode: "—",
    name: "No artifacts yet",
    description: "Save a template from the workspace to populate the artifact library.",
    projectId,
    projectName,
    phaseNumber: p,
    phaseName: phaseTitle(p),
    templateId: "—",
    templateName: "—",
    ownerName: viewer.name,
    status: "not_started",
    version: "v0",
    artifactVersionLabel: "v0 (Not started)",
    lastUpdatedLabel: "—",
    createdOnLabel: "—",
    isStarred: false,
  };
  const emptyMarkdown: MarkdownArtifactView = {
    artifactId: "empty",
    title: "Artifact library",
    markdown: `# No artifacts\n\nUse the **workspace** to complete a phase template and **save** — drafts appear here automatically.`,
    generatedAtLabel: formatDateTimeLabel(new Date()),
    hasMissingPlaceholders: false,
  };
  const emptyJson: ArtifactJsonEvidence = {
    artifactId: "empty",
    projectId,
    phaseId: `phase-${p}`,
    phaseNumber: p,
    templateId: "—",
    templateCode: "—",
    templateVersion: "v0",
    artifactVersion: "v0",
    status: "not_started",
    generatedAt: new Date().toISOString(),
    generatedBy: viewer.name,
    sections: [],
    validation: { completionPercent: 0, exportReady: false, issues: [] },
    evidenceLinks: [],
  };
  return {
    user: viewer,
    project: { id: projectId, code, name: projectName, currentPhase: p },
    artifactListItems: [],
    selectedArtifact: {
      detail: placeholderDetail,
      markdownView: emptyMarkdown,
      jsonEvidence: emptyJson,
      versionHistory: [],
      linkedPhase: linkedPhaseStandalone(projectId, p, p),
      linkedGate: {
        gateId: gate.toLowerCase(),
        gateCode: gate,
        gateName: gateHeaderDisplayName(gate),
        status: "not_started",
        reviewHref: `/projects/${projectId}/gates/${gate.toLowerCase()}/review`,
      },
      quickInfo: {
        artifactType: "—",
        templateVersion: "v0",
        artifactVersion: "v0",
        status: "Not started",
        overallProgressPercent: 0,
        requiredSections: 0,
        completedSections: 0,
        evidenceItems: 0,
        wordCount: 0,
        lastUpdatedBy: viewer.name,
      },
      exportPackage: {
        artifactId: "empty",
        canExportMarkdown: false,
        canExportJsonEvidence: false,
        canExportFullPackage: false,
        markdownFilename: "empty.md",
        jsonFilename: "empty.json",
        packageFilename: "empty.zip",
        blockers: ["Create an artifact from the workspace to enable exports."],
      },
      activityLog: [],
      comments: [],
    },
  };
}

export async function loadArtifactLibraryData(
  projectIdParam: string,
  selectedArtifactId?: string,
): Promise<ArtifactLibraryData> {
  const resolvedId = await resolveProjectIdFromRouteParam(projectIdParam);
  if (!resolvedId) {
    notFound();
  }

  const [project, viewer] = await Promise.all([
    loadProjectForArtifacts(resolvedId),
    getCurrentUserDisplay(),
  ]);

  if (!project) {
    notFound();
  }

  const projectId = project.id;
  const code = projectDisplayCode(project.vaultFolder, project.slug);

  if (project.artifacts.length === 0) {
    if (selectedArtifactId) {
      notFound();
    }
    return emptyLibrary(projectId, project.name, code, viewer, project.currentPhase);
  }

  if (selectedArtifactId) {
    const exists = project.artifacts.some((a) => a.id === selectedArtifactId);
    if (!exists) {
      notFound();
    }
  }

  const artifactListItems: ArtifactListItem[] = project.artifacts.map((a) => {
    const template = resolveTemplate(a.templateId);
    const latestApproval = a.approvals[0];
    const workflow = mapApprovalToWorkflow(isArtifactBodyApproved(a.dataJson), latestApproval);
    return buildListItem(a, projectId, project.currentPhase, template, workflow);
  });

  const selectedRow =
    (selectedArtifactId ?
      project.artifacts.find((a) => a.id === selectedArtifactId)
    : undefined) ?? project.artifacts[0];

  const selectedArtifact = await buildSelectedArtifact({
    artifact: selectedRow!,
    project,
    viewer,
  });

  return {
    user: viewer,
    project: {
      id: projectId,
      code,
      name: project.name,
      currentPhase: project.currentPhase,
    },
    artifactListItems,
    selectedArtifact,
  };
}
