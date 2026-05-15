import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { computeValidationSummary, deriveSectionStatus } from "@/lib/template-wizard-computed";
import { formatDateTimeLabel, isArtifactBodyApproved, projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { getAllTemplates, getTemplate, templateRegistry } from "@/templates/registry";
import type { AnyLifecycleTemplate, TemplateField } from "@/templates/types";
import { toJsonEvidence } from "@/templates/renderJsonEvidence";
import { toMarkdown } from "@/templates/renderMarkdown";
import { getFieldGuide } from "@/lib/server/template-wizard-field-guides";
import type {
  ArtifactSaveState,
  DynamicField,
  JsonEvidence,
  OptionalSectionDefinition,
  TemplateSection,
  TemplateSelectionItem,
  TemplateWizardData,
  WizardArtifactStatus,
  WizardHeaderData,
} from "@/types/template-wizard.types";
import { projectTemplateWizardHref } from "@/lib/projects-url";
import { workspacePhaseMeta, workspacePhasePurpose } from "@/lib/workspacePhases";

/** Deep links for repeater/refPicker fields that are edited in the workspace, not the slim wizard. */
export type TemplateWizardNavContext = {
  projectId: string;
  workspacePhase: number;
};

function asRecord(data: unknown): Record<string, unknown> {
  return typeof data === "object" && data !== null && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

export function resolveRegistryTemplateId(routeSegment: string): string | null {
  let key: string;
  try {
    key = decodeURIComponent(routeSegment).trim();
  } catch {
    key = routeSegment.trim();
  }
  if (!key) return null;
  if (key in templateRegistry) return key;
  const unresolvedKey: string = key;
  const asDots = unresolvedKey.replace(/-/g, ".");
  if (asDots in templateRegistry) return asDots;
  const asDashes = unresolvedKey.replace(/\./g, "-");
  if (asDashes in templateRegistry) return asDashes;
  const lower = unresolvedKey.toLowerCase();
  for (const id of Object.keys(templateRegistry)) {
    if (id.toLowerCase() === lower) return id;
  }
  // Final fallback: compare normalized tokens so aliases like `a-3-2` resolve to `A-3.2`.
  const normalized = unresolvedKey.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const id of Object.keys(templateRegistry)) {
    const idNormalized = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (idNormalized === normalized) return id;
  }
  return null;
}

function mergeGuide(
  base: DynamicField["helpPopover"],
  guide: ReturnType<typeof getFieldGuide>,
): DynamicField["helpPopover"] {
  if (!guide) return base;
  return {
    ...(base ?? {}),
    ...guide,
  };
}

function mapRegistryFieldToDynamic(
  templateId: string,
  sectionId: string,
  field: TemplateField,
  nav: TemplateWizardNavContext,
): DynamicField {
  const workspaceHref = `/projects/${nav.projectId}/workspace?phase=${nav.workspacePhase}`;
  const guide = getFieldGuide(templateId, field.name);

  if (field.type === "repeater") {
    const hint = `Structured repeater rows are captured in the workspace (${workspaceHref}).`;
    return {
      id: `${sectionId}-${field.name}`,
      name: field.name,
      label: field.label,
      type: "textarea",
      required: false,
      delegateToWorkspace: true,
      placeholder: field.description,
      helpText: [field.description, hint].filter(Boolean).join(" "),
      expandable: true,
      helpPopover: mergeGuide(
        {
          purpose: field.description,
          expectedInput:
            "Structured rows are managed in the workspace; this draft accepts free-form notes.",
          evidenceExpectation: hint,
        },
        guide,
      ),
    };
  }
  if (field.type === "refPicker") {
    const hint = `References (${field.refTarget}) are selected in the workspace (${workspaceHref}). Optional: paste one id per line for a quick draft.`;
    return {
      id: `${sectionId}-${field.name}`,
      name: field.name,
      label: field.label,
      type: "textarea",
      required: false,
      delegateToWorkspace: true,
      placeholder: field.placeholder,
      helpText: [field.description, hint].filter(Boolean).join(" "),
      expandable: true,
      helpPopover: mergeGuide(
        {
          purpose: field.description,
          expectedInput: "Paste one reference id per line.",
          evidenceExpectation: hint,
        },
        guide,
      ),
    };
  }
  if (field.type === "tags") {
    return {
      id: `${sectionId}-${field.name}`,
      name: field.name,
      label: field.label,
      type: "textarea",
      required: Boolean(field.required),
      placeholder: field.placeholder,
      helpText: "Comma-separated tags.",
      expandable: true,
      helpPopover: mergeGuide(
        {
          purpose: field.description,
          expectedInput: "Comma-separated tags. Lowercase, hyphenated.",
          exampleValue: "security, performance, ux",
        },
        guide,
      ),
    };
  }

  const helpPopover = mergeGuide(buildHelpPopover(field), guide);
  const base = {
    id: `${sectionId}-${field.name}`,
    name: field.name,
    label: field.label,
    required: Boolean(field.required),
    placeholder: field.placeholder,
    helpText: field.description,
    helpPopover,
    options: field.options,
  };

  switch (field.type) {
    case "text":
      return { ...base, type: "text" };
    case "textarea":
      return { ...base, type: "textarea", expandable: true };
    case "number":
      return { ...base, type: "number" };
    case "date":
      return { ...base, type: "date" };
    case "select":
      return { ...base, type: "select", options: field.options ?? [] };
    case "checkbox":
      return { ...base, type: "checkbox" };
    default:
      return { ...base, type: "textarea", expandable: true };
  }
}

function buildHelpPopover(field: {
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "tags";
  description?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}): DynamicField["helpPopover"] {
  const purpose = field.description?.trim() || undefined;
  let expectedInput: string | undefined;
  let exampleValue: string | undefined;
  let validationRule: string | undefined;

  switch (field.type) {
    case "text":
      expectedInput = "Single-line text.";
      exampleValue = field.placeholder;
      break;
    case "textarea":
      expectedInput = "Multi-line text. Use full sentences and reference evidence where possible.";
      exampleValue = field.placeholder;
      break;
    case "number":
      expectedInput = "Numeric value.";
      break;
    case "date":
      expectedInput = "ISO date (YYYY-MM-DD).";
      exampleValue = "2026-03-15";
      break;
    case "select":
      expectedInput = "Choose one of the provided options.";
      exampleValue = field.options?.[0]?.label;
      break;
    case "checkbox":
      expectedInput = "Check to confirm.";
      break;
    case "tags":
      expectedInput = "Comma-separated tags.";
      exampleValue = "security, performance, ux";
      break;
  }
  if (field.required) {
    validationRule = "Required before the artifact can be marked complete or exported.";
  }

  if (!purpose && !expectedInput && !exampleValue && !validationRule) {
    return undefined;
  }
  return { purpose, expectedInput, exampleValue, validationRule };
}

export function buildWizardSectionsFromTemplate(
  template: AnyLifecycleTemplate,
  nav: TemplateWizardNavContext,
): TemplateSection[] {
  return template.sections.map((section, idx) => ({
    id: section.id,
    order: idx + 1,
    title: section.title,
    description: section.description,
    required: true,
    optional: false,
    status: "not_started" as const,
    fields: section.fields.map((f) =>
      mapRegistryFieldToDynamic(template.templateId, section.id, f, nav),
    ),
  }));
}

function applySectionStatuses(sections: TemplateSection[], values: Record<string, unknown>): TemplateSection[] {
  return sections.map((s) => ({
    ...s,
    status: deriveSectionStatus(s, values),
  }));
}

function mapArtifactToWizardStatus(artifact: { dataJson: unknown; status: string } | null): WizardArtifactStatus {
  if (!artifact) return "not_started";
  if (isArtifactBodyApproved(artifact.dataJson)) return "approved";
  if (artifact.status !== "Draft" && artifact.status.toLowerCase().includes("review")) {
    return "in_review";
  }
  return "in_progress";
}

function selectionCompletionForTemplate(
  template: AnyLifecycleTemplate,
  values: Record<string, unknown>,
  nav: TemplateWizardNavContext,
): number {
  const sections = buildWizardSectionsFromTemplate(template, nav);
  const withStatus = applySectionStatuses(sections, values);
  const complete = withStatus.filter((s) => s.status === "complete").length;
  return withStatus.length === 0 ? 0 : Math.round((complete / withStatus.length) * 100);
}

function selectionStatusForArtifact(
  artifact: { dataJson: unknown; status: string } | null,
  template: AnyLifecycleTemplate,
  nav: TemplateWizardNavContext,
): TemplateSelectionItem["status"] {
  if (!artifact) return "not_started";
  if (isArtifactBodyApproved(artifact.dataJson)) return "approved";
  const pct = selectionCompletionForTemplate(template, asRecord(artifact.dataJson), nav);
  if (pct >= 100) return "complete";
  return "in_progress";
}

export async function loadTemplateWizardData(
  projectRouteParam: string,
  templateRouteParam: string,
): Promise<TemplateWizardData> {
  const resolvedProjectId = await resolveProjectIdFromRouteParam(projectRouteParam);
  if (!resolvedProjectId) {
    notFound();
  }

  const registryId = resolveRegistryTemplateId(templateRouteParam);
  if (!registryId) {
    notFound();
  }

  const template = getTemplate(registryId);

  const [project, viewer, phaseArtifacts, artifactVersionHistory, collaborationCommentRows, collaborationReviewRows] =
    await Promise.all([
    prisma.project.findUnique({
      where: { id: resolvedProjectId },
      select: {
        id: true,
        name: true,
        slug: true,
        vaultFolder: true,
        currentPhase: true,
      },
    }),
    getCurrentUserDisplay(),
    prisma.artifact.findMany({
      where: {
        projectId: resolvedProjectId,
        templateId: {
          in: getAllTemplates().map((t) => t.templateId),
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        evidenceLinks: true,
      },
    }),
    prisma.artifact.findMany({
      where: { projectId: resolvedProjectId, templateId: registryId },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        version: true,
        localId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.wizardCollaborationComment.findMany({
      where: { projectId: resolvedProjectId, templateId: registryId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true, initials: true } } },
    }),
    prisma.artifactReviewRequest.findMany({
      where: { projectId: resolvedProjectId, templateId: registryId },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  if (!project) {
    notFound();
  }

  const nav: TemplateWizardNavContext = { projectId: project.id, workspacePhase: template.phase };
  const baseSections = buildWizardSectionsFromTemplate(template, nav);

  const latestByTemplate = new Map<string, (typeof phaseArtifacts)[number]>();
  for (const row of phaseArtifacts) {
    if (!latestByTemplate.has(row.templateId)) {
      latestByTemplate.set(row.templateId, row);
    }
  }

  const latestSelf = latestByTemplate.get(registryId) ?? null;
  const formValues = asRecord(latestSelf?.dataJson ?? {});

  const sectionsHydrated = applySectionStatuses(baseSections, formValues);

  const phaseMeta = workspacePhaseMeta(template.phase);
  const displayCode = projectDisplayCode(project.vaultFolder, project.slug);

  const wizardStatus = mapArtifactToWizardStatus(latestSelf);
  const versionLabel = latestSelf ? `v${latestSelf.version} (${latestSelf.status})` : "v0 (Draft)";
  const headerBase: WizardHeaderData = {
    projectId: displayCode,
    projectName: project.name,
    templateId: template.templateId,
    templateCode: template.templateId,
    templateName: template.title,
    phaseNumber: template.phase,
    phaseName: phaseMeta.title,
    status: wizardStatus,
    purpose: workspacePhasePurpose(template.phase),
    ownerName: viewer.name,
    templateVersion: "v1",
    artifactVersion: versionLabel,
    lastSavedLabel: latestSelf ? `Saved ${formatDateTimeLabel(latestSelf.updatedAt)}` : undefined,
    completionPercent: 0,
  };

  const validationSummary = computeValidationSummary(headerBase, sectionsHydrated, formValues);

  const wizardHeader: WizardHeaderData = {
    ...headerBase,
    completionPercent: validationSummary.completionPercent,
  };

  const selectableTemplates = getAllTemplates().sort(
    (a, b) => a.phase - b.phase || a.templateId.localeCompare(b.templateId),
  );

  const templateSelections: TemplateSelectionItem[] = selectableTemplates.map((t) => {
    const art = latestByTemplate.get(t.templateId) ?? null;
    const data = asRecord(art?.dataJson ?? {});
    const itemNav: TemplateWizardNavContext = { projectId: project.id, workspacePhase: t.phase };
    const itemPhaseMeta = workspacePhaseMeta(t.phase);
    const pct = selectionCompletionForTemplate(t, data, itemNav);
    const fieldLabels = t.sections.flatMap((section) =>
      section.fields.map((field) => `${section.title}: ${field.label}`),
    );
    return {
      id: t.templateId,
      templateCode: t.templateId,
      name: t.title,
      required: true,
      status: selectionStatusForArtifact(art, t, itemNav),
      completionPercent: pct,
      href: projectTemplateWizardHref(project.id, t.templateId),
      phaseNumber: t.phase,
      phaseName: itemPhaseMeta.title,
      gateCode: t.gate,
      version: "v1",
      schemaVersion: "schema:v1",
      releaseDateLabel: "Catalog v1",
      changeSummary: `${t.title} is available in the current lifecycle template registry.`,
      addedFields: fieldLabels.slice(0, 12),
      deprecatedFields: [],
      compatibilityNotes:
        t.maturity === "scaffold"
          ? "Scaffold template: compatible with the wizard, with detailed evidence completed in workspace tools."
          : "Compatible with the current Template Wizard form, Markdown preview, and JSON evidence export.",
      migrationImpact: art
        ? "Existing artifact data is reused when opening this template."
        : "No existing artifact data was found; switching opens a fresh draft.",
      maturity: t.maturity ?? "full",
    };
  });

  const optionalSections: OptionalSectionDefinition[] = [];
  const selectedTemplate = {
    id: template.templateId,
    code: template.templateId,
    name: template.title,
    version: "v1",
    sections: sectionsHydrated,
    optionalSections,
  };

  const generatedAtLabel = formatDateTimeLabel(new Date());
  const markdownPreview = toMarkdown({
    wizardHeader,
    sections: sectionsHydrated,
    formValues,
    generatedAtLabel,
  });

  const persistedEvidenceLinks: JsonEvidence["evidenceLinks"] =
    latestSelf?.evidenceLinks.map((l) => ({
      evidenceId: l.evidenceId,
      linkedToSectionId: undefined,
      linkedToFieldName: undefined,
    })) ?? [];

  const jsonEvidence = toJsonEvidence({
    wizardHeader,
    selectedTemplate,
    projectId: project.id,
    generatedBy: viewer.name,
    sections: sectionsHydrated,
    formValues,
    validationSummary,
    persistedArtifactId: latestSelf?.id,
    evidenceLinks: persistedEvidenceLinks,
    generatedAt: new Date().toISOString(),
  });

  const blockers = validationSummary.issues
    .filter((i) => i.severity === "error")
    .map((i) => i.message);

  const artifactSaveState: ArtifactSaveState = {
    artifactId: latestSelf?.id,
    templateId: template.templateId,
    projectId: project.id,
    phaseId: `phase-${template.phase}`,
    status: latestSelf ? "in_progress" : "draft",
    canSave: true,
    canExportMarkdown: validationSummary.completionPercent > 0,
    canExportJson: true,
    canMarkComplete: validationSummary.exportReady,
    blockers,
  };

  const activeSectionId =
    sectionsHydrated.find((s) => s.status !== "complete")?.id ?? sectionsHydrated[0]?.id ?? "";

  return {
    user: viewer,
    project: {
      id: project.id,
      code: displayCode,
      name: project.name,
    },
    persistedArtifactId: latestSelf?.id,
    persistedEvidenceLinks,
    wizardHeader,
    templateSelections,
    selectedTemplate,
    activeSectionId,
    formValues,
    validationSummary,
    markdownPreview,
    jsonEvidence,
    artifactSaveState,
    artifactVersionHistory: artifactVersionHistory.map((r) => ({
      id: r.id,
      version: r.version,
      localId: r.localId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    collaborationComments: collaborationCommentRows.map((c) => ({
      id: c.id,
      body: c.body,
      resolved: c.resolved,
      visibility: c.visibility === "reviewers" ? "reviewers" : "internal",
      sectionId: c.sectionId ?? undefined,
      fieldName: c.fieldName ?? undefined,
      artifactId: c.artifactId ?? undefined,
      createdAt: c.createdAt.toISOString(),
      authorName: c.author?.name?.trim() || "Unknown",
      authorInitials: c.author?.initials?.trim() || "?",
    })),
    collaborationReviewRequests: collaborationReviewRows.map((r) => ({
      id: r.id,
      assigneeName: r.assigneeName,
      assigneeRole: r.assigneeRole,
      reviewScope: r.reviewScope,
      dueAt: r.dueAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
