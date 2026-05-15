import { parseApplicability, type Applicability } from "@/lib/applicability";
import { prisma } from "@/lib/prisma";
import { getAllTemplates, getTemplate, hasTemplate } from "@/templates/registry";
import type { AnyLifecycleTemplate } from "@/templates/types";
import { workspacePhaseMeta } from "@/lib/workspacePhases";
import type { ArtifactWorkflowStatus } from "@/types/artifact-library.types";
import type {
  ProjectsArtifactsTabData,
  ProjectsArtifactsTabRow,
  ProjectsArtifactsTabTemplateOption,
  ProjectsArtifactsTabVersionRow,
} from "@/types/projects.types";
import { formatDateTimeAbsolute, formatDateTimeRelative } from "@/lib/datetime-format";

type ArtifactRow = {
  id: string;
  templateId: string;
  localId: string;
  version: number;
  status: string;
  dataJson: unknown;
  createdAt: Date;
  updatedAt: Date;
  evidenceLinks: { evidenceId: string }[];
};

function passesApplicability(templateId: string, app: Applicability): boolean {
  if (templateId === "A-11" && !app.data) return false;
  if (templateId === "A-12" && !app.apis) return false;
  if (templateId === "UXD-001" && !app.ui) return false;
  return true;
}

function isArtifactBodyApprovedJson(data: unknown): boolean {
  const d = data as Record<string, unknown>;
  const s = d.documentStatus ?? d.approvalStatus;
  return s === "Approved";
}

function mapArtifactWorkflow(dbStatus: string, dataJson: unknown): ArtifactWorkflowStatus {
  if (dbStatus === "Archived") return "archived";
  if (dbStatus !== "Draft") return "approved";
  if (isArtifactBodyApprovedJson(dataJson)) return "approved";
  return "draft";
}

function timeLabelFromDate(d: Date): string {
  return formatDateTimeRelative(d);
}

function artifactCode(templateId: string, localId: string, version: number): string {
  return `${templateId} · ${localId} · v${version}`;
}

function templateMeta(templateId: string): { name: string; phaseNumber: number; phaseName: string } {
  if (!hasTemplate(templateId)) {
    return {
      name: templateId,
      phaseNumber: 1,
      phaseName: workspacePhaseMeta(1).title,
    };
  }
  const t = getTemplate(templateId);
  const phaseNumber = t.phase;
  return {
    name: t.title,
    phaseNumber,
    phaseName: workspacePhaseMeta(phaseNumber).title,
  };
}

function latestPerLogicalArtifact(rows: ArtifactRow[]): ArtifactRow[] {
  const m = new Map<string, ArtifactRow>();
  for (const row of rows) {
    const key = `${row.templateId}\u0000${row.localId}`;
    const cur = m.get(key);
    if (!cur || row.version > cur.version) m.set(key, row);
  }
  return [...m.values()].sort((a, b) => {
    const pa = templateMeta(a.templateId).phaseNumber;
    const pb = templateMeta(b.templateId).phaseNumber;
    if (pa !== pb) return pa - pb;
    return templateMeta(a.templateId).name.localeCompare(templateMeta(b.templateId).name);
  });
}

function truncJson(data: unknown, max: number): string {
  const raw = JSON.stringify(data ?? {}, null, 2);
  return raw.length > max ? `${raw.slice(0, max)}\n/* truncated */` : raw;
}

function buildMarkdownExport(artifact: ArtifactRow, templateName: string, phaseName: string): string {
  const body =
    typeof artifact.dataJson === "object" && artifact.dataJson !== null
      ? JSON.stringify(artifact.dataJson, null, 2)
      : String(artifact.dataJson ?? "");
  const md = [
    `# ${templateName}`,
    "",
    `_Template ${artifact.templateId} · ${phaseName} · Version ${artifact.version}_`,
    "",
    "## Captured data (JSON)",
    "",
    "```json",
    body.slice(0, 12_000) + (body.length > 12_000 ? "\n/* truncated */" : ""),
    "```",
  ].join("\n");
  return md;
}

function templateMarker(
  tmpl: AnyLifecycleTemplate,
  currentPhase: number,
): ProjectsArtifactsTabTemplateOption["marker"] {
  if (tmpl.applicabilityKey) return "conditional";
  if (tmpl.phase <= currentPhase) return "required";
  return "optional";
}

export async function loadProjectsArtifactsTabData(projectId: string): Promise<ProjectsArtifactsTabData | null> {
  const row = await prisma.project.findFirst({
    where: { id: projectId, archivedAt: null },
    select: {
      id: true,
      name: true,
      currentPhase: true,
      applicabilityJson: true,
      artifacts: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          templateId: true,
          localId: true,
          version: true,
          status: true,
          dataJson: true,
          createdAt: true,
          updatedAt: true,
          evidenceLinks: { select: { evidenceId: true } },
        },
      },
    },
  });

  if (!row) return null;

  const app = parseApplicability(row.applicabilityJson);
  const templatesForModal: ProjectsArtifactsTabTemplateOption[] = getAllTemplates()
    .filter((t) => passesApplicability(t.templateId, app))
    .map((t) => ({
      templateId: t.templateId,
      title: t.title,
      phaseNumber: t.phase,
      phaseName: workspacePhaseMeta(t.phase).title,
      marker: templateMarker(t, row.currentPhase),
    }))
    .sort((a, b) => a.phaseNumber - b.phaseNumber || a.title.localeCompare(b.title));

  const all = row.artifacts as ArtifactRow[];
  const logicalLatest = latestPerLogicalArtifact(all);

  const artifacts: ProjectsArtifactsTabRow[] = logicalLatest.map((a) => {
    const meta = templateMeta(a.templateId);
    const wf = mapArtifactWorkflow(a.status, a.dataJson);
    const versionRowsAll = all
      .filter((x) => x.templateId === a.templateId && x.localId === a.localId)
      .sort((x, y) => y.version - x.version);

    const versions: ProjectsArtifactsTabVersionRow[] = versionRowsAll.map((v) => ({
      artifactRowId: v.id,
      version: String(v.version),
      author: "Workspace",
      timestampLabel: formatDateTimeAbsolute(v.createdAt),
      changeSummary: `${v.templateId} · ${v.localId} · v${v.version} · ${v.status}`,
      isCurrent: v.id === a.id,
      jsonPayload: truncJson(v.dataJson, 8_000),
    }));

    return {
      id: a.id,
      artifactCode: artifactCode(a.templateId, a.localId, a.version),
      name: meta.name,
      templateId: a.templateId,
      localId: a.localId,
      phaseNumber: meta.phaseNumber,
      status: wf,
      version: String(a.version),
      lastUpdatedLabel: timeLabelFromDate(a.updatedAt),
      detailHref: `/projects/${row.id}/artifacts/${a.id}`,
      templateWizardHref: `/projects/${row.id}/templates/${encodeURIComponent(a.templateId)}`,
      evidenceCenterHref: `/projects/${row.id}/evidence`,
      exportMarkdown: buildMarkdownExport(a, meta.name, meta.phaseName),
      exportJson: truncJson(a.dataJson, 100_000),
      versions,
    };
  });

  return {
    projectId: row.id,
    projectName: row.name,
    currentPhase: row.currentPhase,
    templatesForModal,
    artifacts,
    fullLibraryHref: `/projects/${row.id}/artifacts`,
  };
}
