import type { TemplateRow } from "@/components/lifecycle-workspace/current-phase-main-panel";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
import { parseApplicability } from "@/lib/applicability";
import type { GateDecisionRow } from "@/lib/gateStatus";
import { nextOpenGateForPhase } from "@/lib/gateStatus";
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

function buildValidationWarnings(rows: TemplateRow[], projectId: string): ValidationWarning[] {
  const out: ValidationWarning[] = [];
  const a32 = rows.find((r) => r.id === "A-3.2");
  if (a32 && a32.status !== "Completed") {
    out.push({
      id: "warn-a32",
      message: "A-3.2 is missing at least one scoring justification.",
      severity: "warning",
      relatedObjectType: "template",
      relatedObjectId: "A-3.2",
      href: projectTemplateWizardHref(projectId, "A-3.2"),
    });
  }
  const a31 = rows.find((r) => r.id === "A-3.1");
  if (a31 && a31.status !== "Completed") {
    out.push({
      id: "warn-a31",
      message: "A-3.1 selection scorecard requires weighted criteria.",
      severity: "warning",
      relatedObjectType: "template",
      relatedObjectId: "A-3.1",
      href: projectTemplateWizardHref(projectId, "A-3.1"),
    });
  }
  const drafts = rows.filter((r) => r.status === "In Progress");
  if (drafts.length > 0 && out.length < 3) {
    const firstDraft = drafts[0]!;
    out.push({
      id: "warn-drafts",
      message: `${drafts.length} template(s) still in draft — finalize before gate submission.`,
      severity: "warning",
      relatedObjectType: "template",
      relatedObjectId: firstDraft.id,
      href: projectTemplateWizardHref(projectId, firstDraft.id),
    });
  }
  return out.slice(0, 5);
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

  const validationWarnings = buildValidationWarnings(templateRows, projectId);

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
