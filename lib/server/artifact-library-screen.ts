import { indexLatestGateDecisions, type GateDecisionRow } from "@/lib/gateStatus";
import { prisma } from "@/lib/prisma";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { getTemplate, getTemplatesForPhase, hasTemplate } from "@/templates/registry";
import type { LifecycleGateId } from "@/templates/types";
import {
  domainPhaseForWorkspaceIndex,
  gateHeaderDisplayName,
  workspacePhaseMeta,
} from "@/lib/workspacePhases";
import type {
  ArtifactActivityItem,
  ArtifactComment,
  ArtifactDetail,
  ArtifactExportPackage,
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

function formatProjectCode(slug: string, vaultFolder: string): string {
  const tail = vaultFolder.split("-")[1] ?? slug.slice(0, 3);
  const prefix = slug.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3) || "PRJ";
  return `${prefix}-${tail.padStart(3, "0").slice(-3)}`;
}

function timeAgoHours(hours: number): string {
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function timeLabelFromDate(d: Date): string {
  return timeAgoHours(Math.max(1, Math.round((Date.now() - d.getTime()) / 3600000)));
}

function isArtifactBodyApprovedJson(data: unknown): boolean {
  const d = data as Record<string, unknown>;
  const s = d.documentStatus ?? d.approvalStatus;
  return s === "Approved";
}

function mapDbToWorkflowStatus(dbStatus: string, dataJson: unknown): ArtifactWorkflowStatus {
  if (dbStatus === "Archived") return "archived";
  if (dbStatus !== "Draft") return "approved";
  if (isArtifactBodyApprovedJson(dataJson)) return "approved";
  return "draft";
}

function artifactCode(templateId: string, localId: string, version: number): string {
  return `${templateId} · ${localId} · v${version}`;
}

type ArtifactRow = {
  id: string;
  templateId: string;
  localId: string;
  version: number;
  status: string;
  dataJson: unknown;
  markdownPath: string;
  createdAt: Date;
  updatedAt: Date;
  evidenceLinks: { evidenceId: string; evidence: { evidenceCode: string; name: string } }[];
};

function latestPerLogicalArtifact(rows: ArtifactRow[]): ArtifactRow[] {
  const m = new Map<string, ArtifactRow>();
  for (const row of rows) {
    const key = `${row.templateId}\u0000${row.localId}`;
    const cur = m.get(key);
    if (!cur || row.version > cur.version) m.set(key, row);
  }
  return [...m.values()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function templateMeta(templateId: string): {
  name: string;
  phaseNumber: number;
  phaseName: string;
  gate: LifecycleGateId;
} {
  if (!hasTemplate(templateId)) {
    return {
      name: templateId,
      phaseNumber: 1,
      phaseName: workspacePhaseMeta(1).title,
      gate: "G1",
    };
  }
  const t = getTemplate(templateId);
  const phaseNumber = t.phase;
  const phaseMeta = workspacePhaseMeta(phaseNumber);
  const gate: LifecycleGateId = t.gate ?? phaseMeta.gate ?? "G1";
  return {
    name: t.title,
    phaseNumber,
    phaseName: phaseMeta.title,
    gate,
  };
}

function linkedGateForArtifact(
  projectId: string,
  currentPhase: number,
  gate: LifecycleGateId,
  latestByGate: Map<string, GateDecisionRow>,
): LinkedGate {
  const latest = latestByGate.get(gate);
  let status: LinkedGate["status"] = "pending_decision";
  if (latest) {
    if (latest.decision === "Accepted" && latest.evidencePassSnapshot) status = "approved";
    else if (latest.decision === "Rejected") status = "rejected";
    else if (latest.decision === "Changes Requested" || latest.decision === "Declined")
      status = "changes_requested";
    else status = "pending_decision";
  }
  return {
    gateId: gate,
    gateCode: gate,
    gateName: gateHeaderDisplayName(gate),
    status,
    reviewHref: `/projects/${projectId}/gates/${gate.toLowerCase()}/review`,
  };
}

function buildMarkdownView(
  artifact: ArtifactRow,
  templateName: string,
  phaseName: string,
): MarkdownArtifactView {
  const body =
    typeof artifact.dataJson === "object" && artifact.dataJson !== null
      ? JSON.stringify(artifact.dataJson, null, 2)
      : String(artifact.dataJson ?? "");
  const md = [
    `# ${templateName}`,
    "",
    `_Template ${artifact.templateId} · ${phaseName} · Version ${artifact.version}_`,
    "",
    `Registered path: \`${artifact.markdownPath}\``,
    "",
    "## Captured data (JSON)",
    "",
    "```json",
    body.slice(0, 12000) + (body.length > 12000 ? "\n/* truncated */" : ""),
    "```",
  ].join("\n");
  return {
    artifactId: artifact.id,
    title: templateName,
    markdown: md,
    generatedAtLabel: timeLabelFromDate(artifact.updatedAt),
    hasMissingPlaceholders: artifact.status === "Draft" && !isArtifactBodyApprovedJson(artifact.dataJson),
  };
}

function asRecord(data: unknown): Record<string, unknown> {
  return typeof data === "object" && data !== null && !Array.isArray(data) ? (data as Record<string, unknown>) : {};
}

function buildJsonEvidence(
  artifact: ArtifactRow,
  projectId: string,
  projectName: string,
  phaseNumber: number,
  templateId: string,
  templateCode: string,
): ArtifactJsonEvidence {
  const data = asRecord(artifact.dataJson);
  const template = hasTemplate(templateId) ? getTemplate(templateId) : null;
  const sections =
    template?.sections.map((s) => {
      const values: Record<string, unknown> = {};
      for (const f of s.fields) {
        if ("name" in f) values[f.name] = data[f.name] ?? null;
      }
      const filled = Object.values(values).filter((v) => v !== null && v !== "" && v !== undefined).length;
      const total = Math.max(1, Object.keys(values).length);
      const pct = Math.round((filled / total) * 100);
      return {
        sectionId: s.id,
        title: s.title,
        status: pct >= 100 ? "complete" : pct > 0 ? "in_progress" : "empty",
        values,
      };
    }) ?? [
      {
        sectionId: "payload",
        title: "Artifact payload",
        status: Object.keys(data).length ? "in_progress" : "empty",
        values: data,
      },
    ];

  const requiredSections = sections.length;
  const completedSections = sections.filter((s) => s.status === "complete").length;
  const completionPercent =
    requiredSections === 0 ? 100 : Math.round((completedSections / requiredSections) * 100);

  const issues: ArtifactJsonEvidence["validation"]["issues"] = [];
  if (artifact.status === "Draft") {
    issues.push({
      id: "draft",
      severity: "warning",
      message: "Artifact is still in draft — finalize fields before gate submission.",
    });
  }

  return {
    artifactId: artifact.id,
    projectId,
    phaseId: `phase-${phaseNumber}`,
    phaseNumber,
    templateId,
    templateCode,
    templateVersion: "1.0",
    artifactVersion: String(artifact.version),
    status: artifact.status,
    generatedAt: artifact.updatedAt.toISOString(),
    generatedBy: projectName,
    sections,
    validation: {
      completionPercent,
      exportReady: completionPercent >= 80 && artifact.status !== "Draft",
      issues,
    },
    evidenceLinks: artifact.evidenceLinks.map((l) => ({
      evidenceId: l.evidence.evidenceCode,
      linkedToSectionId: undefined,
      linkedToFieldName: undefined,
    })),
  };
}

function buildVersionHistory(rows: ArtifactRow[], currentId: string, projectId: string): ArtifactVersion[] {
  return [...rows]
    .sort((a, b) => b.version - a.version)
    .map((r) => {
      const st: ArtifactVersion["status"] =
        r.status !== "Draft"
          ? "approved"
          : isArtifactBodyApprovedJson(r.dataJson)
            ? "approved"
            : "draft";
      return {
        id: r.id,
        version: String(r.version),
        status: st,
        createdBy: "Workspace",
        createdOnLabel: r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        changeSummary: `${r.templateId} v${r.version}`,
        markdownSnapshotHref: `/projects/${projectId}/artifacts/${r.id}`,
        jsonSnapshotHref: `/projects/${projectId}/artifacts/${r.id}`,
        canRestore: r.id !== currentId,
      };
    });
}

function buildSelected(
  artifact: ArtifactRow,
  project: {
    id: string;
    name: string;
    slug: string;
    vaultFolder: string;
    currentPhase: number;
  },
  allVersions: ArtifactRow[],
  latestByGate: Map<string, GateDecisionRow>,
): ArtifactLibraryData["selectedArtifact"] {
  const { name: templateName, phaseNumber, phaseName, gate } = templateMeta(artifact.templateId);
  const wf = mapDbToWorkflowStatus(artifact.status, artifact.dataJson);
  const jsonEvidence = buildJsonEvidence(
    artifact,
    project.id,
    project.name,
    phaseNumber,
    artifact.templateId,
    artifact.templateId,
  );
  const completedSections = jsonEvidence.sections.filter((s) => s.status === "complete").length;
  const wordCount = Math.max(0, Math.round(JSON.stringify(artifact.dataJson ?? {}).length / 5));

  const detail: ArtifactDetail = {
    id: artifact.id,
    artifactCode: artifactCode(artifact.templateId, artifact.localId, artifact.version),
    name: templateName,
    description: hasTemplate(artifact.templateId)
      ? (getTemplate(artifact.templateId).sections[0]?.description ?? templateName)
      : "Lifecycle artifact",
    projectId: project.id,
    projectName: project.name,
    phaseNumber,
    phaseName,
    templateId: artifact.templateId,
    templateName,
    ownerName: project.name,
    status: wf,
    version: String(artifact.version),
    artifactVersionLabel: `Version ${artifact.version}`,
    lastUpdatedLabel: timeLabelFromDate(artifact.updatedAt),
    createdOnLabel: artifact.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };

  const linkedPhase: LinkedPhase = {
    phaseId: `phase-${phaseNumber}`,
    phaseNumber,
    totalPhases: 14,
    phaseName,
    status: phaseNumber < project.currentPhase ? "complete" : phaseNumber === project.currentPhase ? "in_progress" : "not_started",
    workspaceHref: `/projects/${project.id}/workspace?phase=${phaseNumber}`,
  };

  const linkedGate = linkedGateForArtifact(project.id, project.currentPhase, gate, latestByGate);

  const quickInfo: ArtifactQuickInfoData = {
    artifactType: "Lifecycle template",
    templateVersion: "1.0",
    artifactVersion: String(artifact.version),
    status: wf.replaceAll("_", " "),
    overallProgressPercent: jsonEvidence.validation.completionPercent,
    requiredSections: jsonEvidence.sections.length,
    completedSections,
    evidenceItems: artifact.evidenceLinks.length,
    wordCount,
    lastUpdatedBy: "Workspace",
  };

  const exportPackage: ArtifactExportPackage = {
    artifactId: artifact.id,
    canExportMarkdown: true,
    canExportJsonEvidence: true,
    canExportFullPackage: jsonEvidence.validation.exportReady,
    markdownFilename: `${artifact.templateId}-v${artifact.version}.md`,
    jsonFilename: `${artifact.templateId}-v${artifact.version}.json`,
    packageFilename: `${artifact.templateId}-v${artifact.version}-package.zip`,
    blockers: jsonEvidence.validation.exportReady
      ? []
      : ["Complete required sections or exit draft status before exporting a full package."],
  };

  const activityLog: ArtifactActivityItem[] = [
    {
      id: "a1",
      actor: "Workspace",
      action: `Saved ${artifact.templateId} v${artifact.version}`,
      timestampLabel: timeLabelFromDate(artifact.updatedAt),
    },
  ];

  const comments: ArtifactComment[] = [];

  return {
    detail,
    markdownView: buildMarkdownView(artifact, templateName, phaseName),
    jsonEvidence,
    versionHistory: buildVersionHistory(allVersions, artifact.id, project.id),
    linkedPhase,
    linkedGate,
    quickInfo,
    exportPackage,
    activityLog,
    comments,
  };
}

export async function loadArtifactLibraryScreenData(
  projectId: string,
  artifactId: string,
): Promise<ArtifactLibraryData | null> {
  const user = await getCurrentUserDisplay();

  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      vaultFolder: true,
      currentPhase: true,
      artifacts: {
        orderBy: [{ updatedAt: "desc" }],
        include: {
          evidenceLinks: {
            include: { evidence: { select: { evidenceCode: true, name: true } } },
          },
        },
      },
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          gateId: true,
          decision: true,
          evidencePassSnapshot: true,
          createdAt: true,
        },
      },
    },
  });

  if (!row) return null;

  const artifacts = row.artifacts as ArtifactRow[];
  if (artifacts.length === 0) return null;

  const latestByGate = indexLatestGateDecisions(
    row.gateDecisions.map((d) => ({
      gateId: d.gateId,
      decision: d.decision,
      evidencePassSnapshot: d.evidencePassSnapshot,
      createdAt: d.createdAt,
    })),
  );

  const logicalLatest = latestPerLogicalArtifact(artifacts);
  const selected = artifacts.find((a) => a.id === artifactId);
  if (!selected) return null;

  const allVersions = artifacts.filter(
    (a) => a.templateId === selected.templateId && a.localId === selected.localId,
  );

  const code = formatProjectCode(row.slug, row.vaultFolder);

  const artifactListItems: ArtifactListItem[] = logicalLatest.map((a) => {
    const meta = templateMeta(a.templateId);
    const wf = mapDbToWorkflowStatus(a.status, a.dataJson);
    return {
      id: a.id,
      artifactCode: artifactCode(a.templateId, a.localId, a.version),
      name: meta.name,
      phaseNumber: meta.phaseNumber,
      phaseName: meta.phaseName,
      templateId: a.templateId,
      templateName: meta.name,
      status: wf,
      version: String(a.version),
      lastUpdatedLabel: timeLabelFromDate(a.updatedAt),
      href: `/projects/${row.id}/artifacts/${a.id}`,
    };
  });

  return {
    user,
    project: {
      id: row.id,
      code,
      name: row.name,
      currentPhase: row.currentPhase,
    },
    artifactListItems,
    selectedArtifact: buildSelected(
      selected,
      {
        id: row.id,
        name: row.name,
        slug: row.slug,
        vaultFolder: row.vaultFolder,
        currentPhase: row.currentPhase,
      },
      allVersions,
      latestByGate,
    ),
  };
}

export async function loadArtifactLibraryEmptyProject(
  projectId: string,
): Promise<{
  user: { name: string; role: string; initials: string };
  project: { id: string; name: string; code: string; currentPhase: number };
} | null> {
  const user = await getCurrentUserDisplay();
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      vaultFolder: true,
      currentPhase: true,
      _count: { select: { artifacts: true } },
    },
  });
  if (!row) return null;
  const code = formatProjectCode(row.slug, row.vaultFolder);
  return {
    user,
    project: { id: row.id, name: row.name, code, currentPhase: row.currentPhase },
  };
}

export async function getDefaultArtifactIdForLibrary(
  projectId: string,
  options?: { workspacePhase?: number },
): Promise<string | null> {
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      artifacts: {
        orderBy: [{ updatedAt: "desc" }],
        select: { id: true, templateId: true, localId: true, version: true },
      },
    },
  });
  if (!row || row.artifacts.length === 0) return null;
  let pool = latestPerLogicalArtifact(row.artifacts as ArtifactRow[]);
  const ws = options?.workspacePhase;
  if (ws !== undefined && ws >= 1 && ws <= 14) {
    const domain = domainPhaseForWorkspaceIndex(ws);
    const allowed = new Set(getTemplatesForPhase(domain).map((t) => t.templateId));
    const scoped = pool.filter((a) => allowed.has(a.templateId));
    if (scoped.length > 0) pool = scoped;
  }
  return pool[0]?.id ?? null;
}

