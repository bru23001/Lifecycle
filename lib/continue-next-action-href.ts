import type { TemplateRow } from "@/components/lifecycle-workspace/current-phase-main-panel";
import { buildValidationWarnings } from "@/lib/workspacePhaseWorkspaceSlice";
import { parseApplicability } from "@/lib/applicability";
import type { GateDecisionRow } from "@/lib/gateStatus";
import { nextOpenGateForPhase } from "@/lib/gateStatus";
import { formatDateTimeRelative } from "@/lib/datetime-format";
import { workspaceNavigatorIndex } from "@/lib/workspacePhases";
import { projectTemplateWizardHref } from "@/lib/projects-url";
import { getTemplatesForPhase } from "@/templates/registry";

export type ContinueNextArtifactLite = {
  id: string;
  templateId: string;
  version: number;
  status: string;
  updatedAt: Date;
  markdownPath: string;
};

function formatArtifactDate(d: Date): string {
  return formatDateTimeRelative(d);
}

function latestArtifactByTemplate(
  artifacts: ContinueNextArtifactLite[],
): Map<string, ContinueNextArtifactLite> {
  const m = new Map<string, ContinueNextArtifactLite>();
  for (const a of artifacts) {
    const cur = m.get(a.templateId);
    if (!cur || a.version > cur.version) m.set(a.templateId, a);
  }
  return m;
}

function templateRowFromArtifact(
  templateId: string,
  title: string,
  description: string,
  artifact: { status: string; updatedAt: Date } | undefined,
): TemplateRow {
  if (!artifact) {
    return {
      id: templateId,
      title,
      description,
      status: "Not Started",
      progressPct: 0,
      lastUpdated: "—",
    };
  }
  const complete = artifact.status !== "Draft";
  const progressPct = complete ? 100 : 55;
  return {
    id: templateId,
    title,
    description,
    status: complete ? "Completed" : "In Progress",
    progressPct,
    lastUpdated: formatArtifactDate(artifact.updatedAt),
  };
}

/**
 * Single destination for "Continue next required action" (dashboard + shell),
 * aligned with `app/projects/[id]/workspace/page.tsx` prioritization (canonical `/templates/` wizard).
 */
export function resolveContinueNextActionHref(args: {
  projectId: string;
  currentPhase: number;
  applicabilityJson: unknown;
  artifacts: ContinueNextArtifactLite[];
  latestByGate: Map<string, GateDecisionRow>;
  firstOpenApprovalId: string | null;
}): string {
  const { projectId, currentPhase, applicabilityJson, artifacts, latestByGate, firstOpenApprovalId } =
    args;

  if (firstOpenApprovalId) {
    return `/approvals/${firstOpenApprovalId}`;
  }

  const navPhase = workspaceNavigatorIndex(currentPhase);
  const workspaceBase = `/projects/${projectId}/workspace?phase=${navPhase}`;

  const app = parseApplicability(applicabilityJson);
  const phaseTemplates = getTemplatesForPhase(currentPhase).filter((tmpl) => {
    const tid = tmpl.templateId;
    if (tid === "A-11" && !app.data) return false;
    if (tid === "A-12" && !app.apis) return false;
    if (tid === "UXD-001" && !app.ui) return false;
    return true;
  });

  const byTemplate = latestArtifactByTemplate(artifacts);
  const templateRows: TemplateRow[] = phaseTemplates.map((tmpl) =>
    templateRowFromArtifact(
      tmpl.templateId,
      tmpl.title,
      tmpl.sections[0]?.description ?? tmpl.title,
      byTemplate.get(tmpl.templateId),
    ),
  );

  const templatesComplete =
    templateRows.length === 0 || templateRows.every((t) => t.status === "Completed");

  const evidenceRows = artifacts.filter((a) => phaseTemplates.some((t) => t.templateId === a.templateId));

  const validationWarnings = buildValidationWarnings(templateRows, projectId, navPhase, []);

  const firstIncompleteTemplate = templateRows.find((t) => t.status !== "Completed");
  if (firstIncompleteTemplate) {
    return projectTemplateWizardHref(projectId, firstIncompleteTemplate.id);
  }

  if (evidenceRows.length === 0) {
    return `${workspaceBase}#evidence-attachments`;
  }

  if (validationWarnings.some((w) => w.severity !== "info")) {
    return `${workspaceBase}#validation-warnings`;
  }

  if (
    templatesComplete &&
    evidenceRows.length > 0 &&
    validationWarnings.filter((w) => w.severity === "warning" || w.severity === "error").length === 0
  ) {
    const gate = nextOpenGateForPhase(currentPhase, latestByGate);
    return `/projects/${projectId}/gates/${gate.toLowerCase()}/review`;
  }

  return `${workspaceBase}#completion-checklist`;
}
