import type {
  CompletionChecklistItem,
  CompletionRulesPayload,
} from "@/components/lifecycle-workspace/completion-checklist-types";
import type { ChecklistOverrideRecord } from "@/lib/workspacePhaseDetails";
import { projectTemplateWizardHref } from "@/lib/projects-url";

export type WorkspaceChecklistStep = {
  id: string;
  label: string;
  isDone: () => boolean;
  href?: string;
  required: boolean;
  governance: CompletionChecklistItem["governance"];
  kind: "template" | "evidence" | "warnings" | "gate_ready";
  templateRow?: { id: string; title: string; templateId: string };
};

export function buildCompletionRulesPayload(input: {
  gateCode: string;
  gateDisplayName: string;
}): CompletionRulesPayload {
  return {
    requiredArtifactsRule:
      "Every required template for this workspace phase must reach a non-Draft finalized artifact with catalog validation satisfied before the phase is treated as template-complete.",
    requiredEvidenceRule:
      "At least one evidence item must be linked to this phase (vault upload or trace link) so gate reviewers can open a coherent evidence bundle.",
    requiredApprovalsRule:
      "Gate submission remains blocked until assigned approvers record decisions on any in-flight artifact or gate review queues configured for this gate.",
    validationRule:
      "Workspace validation warnings at error or warning severity must be cleared or explicitly accepted under change control before the checklist marks validation as satisfied.",
    gateSubmissionRule: `Gate ${input.gateCode} (${input.gateDisplayName}) submission requires the checklist, evidence bundle, and approver inputs captured in the Submit Gate Review flow to be consistent at submit time.`,
    manualOverridePolicy:
      "Manual overrides are audit-logged, require a stated reason and comment, and do not remove underlying template or evidence obligations — they adjust checklist presentation for coordination exceptions only.",
    ruleSourceReference:
      "Lifecycle workspace completion model · CYBERCUBE gate readiness · synthesized from workspace phase slice + gate submission card rules.",
  };
}

function effectiveDone(computedDone: boolean, override?: ChecklistOverrideRecord): boolean {
  if (!override) return computedDone;
  if (override.targetStatus === "complete") return true;
  return false;
}

function itemDetail(
  step: WorkspaceChecklistStep,
  ctx: {
    projectId: string;
    gateBannerId: string;
    gateDisplayName: string;
    validationErrorCount: number;
  },
): CompletionChecklistItem["detail"] {
  const gateLine = `Gate ${ctx.gateBannerId}: ${ctx.gateDisplayName}`;

  if (step.kind === "template" && step.templateRow) {
    const href = projectTemplateWizardHref(ctx.projectId, step.templateRow.id);
    return {
      description: `Finalize ${step.templateRow.title} (${step.templateRow.templateId}) for this phase so downstream traceability and gate evidence stay aligned.`,
      requiredArtifact: `${step.templateRow.templateId} — ${step.templateRow.title}`,
      requiredArtifactHref: href,
      requiredEvidence:
        "Export or attach evidence links from the Template Wizard (JSON/Markdown) so reviewers can open a frozen snapshot.",
      validationRule:
        "Catalog-required fields must be answered; blocking validation messages from the template registry must be resolved before status reads Completed.",
      blockingSeverity: "high",
      relatedTemplate: `${step.templateRow.templateId} — ${step.templateRow.title}`,
      relatedTemplateHref: href,
      resolveActionLabel: "Open Template Wizard",
      resolveHref: href,
    };
  }

  if (step.kind === "evidence") {
    const href = `/projects/${ctx.projectId}/workspace#evidence-attachments`;
    return {
      description:
        "Attach phase-scoped evidence (files, links, or registered evidence items) so the gate bundle is non-empty at submission.",
      requiredArtifact: "—",
      requiredEvidence: "Minimum one evidence attachment linked to this phase workspace.",
      validationRule: "Evidence items must be classified and scoped to this project vault path.",
      blockingSeverity: "high",
      relatedTemplate: "—",
      resolveActionLabel: "Open evidence attachments",
      resolveHref: href,
    };
  }

  if (step.kind === "warnings") {
    const href = `/projects/${ctx.projectId}/workspace#validation-warnings`;
    return {
      description:
        "Clear validation warnings raised by workspace checks (trace gaps, template gaps, or policy findings) before treating the phase as review-ready.",
      requiredArtifact: "—",
      requiredEvidence: "—",
      validationRule:
        ctx.validationErrorCount > 0
          ? `${ctx.validationErrorCount} blocking validation finding(s) must be resolved or triaged.`
          : "No blocking validation errors; clear remaining warnings to satisfy this checklist line.",
      blockingSeverity: ctx.validationErrorCount > 0 ? "high" : "medium",
      relatedTemplate: "—",
      resolveActionLabel: "Review validation warnings",
      resolveHref: href,
    };
  }

  return {
    description: `Aggregate readiness for ${gateLine}: templates complete, evidence attached, and validation clear.`,
    requiredArtifact: "All required phase templates finalized.",
    requiredEvidence: "Phase evidence bundle present.",
    validationRule: "No unresolved error- or warning-severity validation items.",
    blockingSeverity: "high",
    relatedTemplate: "See individual template lines above.",
    resolveActionLabel: "Open gate submission",
    resolveHref: `/projects/${ctx.projectId}/gates/${ctx.gateBannerId.toLowerCase()}/review`,
  };
}

export function buildCompletionChecklistItems(
  steps: WorkspaceChecklistStep[],
  overrides: Record<string, ChecklistOverrideRecord> | undefined,
  ctx: {
    projectId: string;
    gateBannerId: string;
    gateDisplayName: string;
    validationWarnings: Array<{ severity: string }>;
  },
): CompletionChecklistItem[] {
  const ov = overrides ?? {};
  const validationErrorCount = ctx.validationWarnings.filter((w) => w.severity === "error").length;

  return steps.map((s) => {
    const computedDone = s.isDone();
    const rowOverride = ov[s.id];
    const done = effectiveDone(computedDone, rowOverride);

    let status: CompletionChecklistItem["status"];
    if (done) {
      status = "complete";
    } else if (
      s.id === "warnings-clear" &&
      ctx.validationWarnings.some((w) => w.severity === "error") &&
      !rowOverride
    ) {
      status = "blocked";
    } else {
      status = "incomplete";
    }

    return {
      id: s.id,
      label: s.label,
      status,
      required: s.required,
      href: s.href,
      governance: s.governance,
      computedDone,
      detail: itemDetail(s, {
        projectId: ctx.projectId,
        gateBannerId: ctx.gateBannerId,
        gateDisplayName: ctx.gateDisplayName,
        validationErrorCount,
      }),
    };
  });
}
