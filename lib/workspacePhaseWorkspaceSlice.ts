import type { EvidenceRow, TemplateRow } from "@/components/lifecycle-workspace/current-phase-main-panel";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
import { parseApplicability } from "@/lib/applicability";
import { domainPhaseForWorkspaceIndex } from "@/lib/workspacePhases";
import { projectTemplateWizardHref } from "@/lib/projects-url";
import { getTemplatesForPhase } from "@/templates/registry";

export function formatWorkspaceDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function latestArtifactByTemplate(
  artifacts: { templateId: string; version: number; status: string; updatedAt: Date }[],
): Map<string, (typeof artifacts)[number]> {
  const m = new Map<string, (typeof artifacts)[number]>();
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
    lastUpdated: formatWorkspaceDate(artifact.updatedAt),
  };
}

function evidenceKind(i: number): EvidenceRow["kind"] {
  const r = i % 3;
  if (r === 0) return "pdf";
  if (r === 1) return "excel";
  return "word";
}

function evidenceSummaryForTemplate(evidenceRows: EvidenceRow[], templateId: string): string {
  const linked = evidenceRows.filter((e) => e.linkedTemplateId === templateId);
  if (linked.length === 0) return "No evidence linked for this template in this phase.";
  const head = linked.slice(0, 2).map((e) => e.name);
  return head.join(" · ") + (linked.length > 2 ? ` (+${linked.length - 2} more)` : "");
}

function artifactStatusLabel(row: TemplateRow | undefined): string {
  if (!row) return "—";
  if (row.status === "Completed") return `${row.id} artifact finalized`;
  if (row.status === "In Progress") return `${row.id} artifact in Draft — finalize in the template wizard`;
  return `${row.id} not started`;
}

export function buildValidationWarnings(
  rows: TemplateRow[],
  projectId: string,
  workspacePhaseIndex: number,
  evidenceRows: EvidenceRow[],
): ValidationWarning[] {
  const phaseLabel = `Phase ${workspacePhaseIndex}`;
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
      affectedPhaseNumber: workspacePhaseIndex,
      affectedPhaseLabel: phaseLabel,
      affectedTemplateId: "A-3.2",
      affectedTemplateTitle: a32.title,
      affectedArtifactLabel: artifactStatusLabel(a32),
      affectedEvidenceLabel: evidenceSummaryForTemplate(evidenceRows, "A-3.2"),
      ruleId: "LFC-VAL-SCORE-JUST",
      recommendedFix:
        "Open the A-3.2 template wizard, add at least one scoring justification in the selection section, then save a non-Draft version.",
      dismissible: true,
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
      affectedPhaseNumber: workspacePhaseIndex,
      affectedPhaseLabel: phaseLabel,
      affectedTemplateId: "A-3.1",
      affectedTemplateTitle: a31.title,
      affectedArtifactLabel: artifactStatusLabel(a31),
      affectedEvidenceLabel: evidenceSummaryForTemplate(evidenceRows, "A-3.1"),
      ruleId: "LFC-VAL-WEIGHTED-CRITERIA",
      recommendedFix:
        "Define weighted criteria that sum to 100% and document rationale for weights before finalizing A-3.1.",
      dismissible: true,
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
      affectedPhaseNumber: workspacePhaseIndex,
      affectedPhaseLabel: phaseLabel,
      affectedTemplateId: firstDraft.id,
      affectedTemplateTitle: firstDraft.title,
      affectedArtifactLabel: artifactStatusLabel(firstDraft),
      affectedEvidenceLabel: evidenceSummaryForTemplate(evidenceRows, firstDraft.id),
      ruleId: "LFC-VAL-DRAFT-TEMPLATES",
      recommendedFix:
        "Finalize each in-progress template from the catalog (save as non-Draft), then re-run validation.",
      dismissible: true,
    });
  }
  return out.slice(0, 5);
}

export function buildWorkspacePhaseSlice(
  project: {
    id: string;
    artifacts: {
      id: string;
      templateId: string;
      version: number;
      status: string;
      updatedAt: Date;
      markdownPath: string;
    }[];
    applicabilityJson: unknown;
  },
  workspacePhaseIndex: number,
  userDisplay: { name: string },
): {
  templateRows: TemplateRow[];
  evidenceRows: EvidenceRow[];
  validationWarnings: ValidationWarning[];
  templatesComplete: boolean;
} {
  const app = parseApplicability(project.applicabilityJson);
  const templateDomainPhase = domainPhaseForWorkspaceIndex(workspacePhaseIndex);
  const phaseTemplates = getTemplatesForPhase(templateDomainPhase).filter((tmpl) => {
    const tid = tmpl.templateId;
    if (tid === "A-11" && !app.data) return false;
    if (tid === "A-12" && !app.apis) return false;
    if (tid === "UXD-001" && !app.ui) return false;
    return true;
  });
  const byTemplate = latestArtifactByTemplate(project.artifacts);
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
  const evidenceRows: EvidenceRow[] = project.artifacts
    .filter((a) => phaseTemplates.some((t) => t.templateId === a.templateId))
    .slice(0, 12)
    .map((a, i) => ({
      id: a.id,
      name: `${a.templateId} — saved artifact v${a.version}`,
      type: a.markdownPath.endsWith(".md") ? "Markdown export" : "Registered artifact",
      linkedTemplateId: a.templateId,
      addedBy: userDisplay.name,
      addedOn: formatWorkspaceDate(a.updatedAt),
      kind: evidenceKind(i),
    }));
  const validationWarnings = buildValidationWarnings(
    templateRows,
    project.id,
    workspacePhaseIndex,
    evidenceRows,
  );
  return { templateRows, evidenceRows, validationWarnings, templatesComplete };
}

export function buildGateMissingRequirements(
  templateRows: TemplateRow[],
  evidenceCount: number,
  validationWarnings: ValidationWarning[],
): string[] {
  const req: string[] = [];
  for (const t of templateRows) {
    if (t.status !== "Completed") {
      req.push(`${t.id} ${t.title} is incomplete`);
    }
  }
  if (evidenceCount === 0) {
    req.push("Attach supporting evidence");
  }
  for (const w of validationWarnings) {
    if (w.severity !== "info") {
      req.push(w.message);
    }
  }
  return req.slice(0, 10);
}
