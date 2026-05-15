import type {
  EvidenceRow,
  TemplateRow,
} from "@/components/lifecycle-workspace/current-phase-main-panel";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";
import type { WorkspaceChecklistStep } from "@/lib/workspaceCompletionChecklist";
import { projectTemplateWizardHref } from "@/lib/projects-url";

/** Checklist rows for the `/projects/[id]/workspace` surface (template → evidence → validation → gate). */
export function buildNextPhaseWorkspaceChecklistSteps(args: {
  projectId: string;
  /** Selected workspace phase (`?phase=`) for deep-link anchors. */
  workspacePhaseNumber: number;
  templateRows: TemplateRow[];
  evidenceRows: EvidenceRow[];
  validationWarnings: ValidationWarning[];
}): WorkspaceChecklistStep[] {
  const { projectId, workspacePhaseNumber, templateRows, evidenceRows, validationWarnings } = args;
  const phaseHref = `/projects/${projectId}/workspace?phase=${workspacePhaseNumber}`;

  const templateSteps: WorkspaceChecklistStep[] = templateRows.map((t) => ({
    id: `check-${t.id}`,
    label: `${t.id} · ${t.title}`,
    isDone: () => t.status === "Completed",
    href: projectTemplateWizardHref(projectId, t.id),
    required: true,
    governance: "catalog",
    kind: "template",
    templateRow: { id: t.id, title: t.title, templateId: t.id },
  }));

  return [
    ...templateSteps,
    {
      id: "evidence-attached",
      label: "Attach supporting evidence",
      isDone: () => evidenceRows.length > 0,
      href: `${phaseHref}#evidence-attachments`,
      required: true,
      governance: "evidence",
      kind: "evidence",
    },
    {
      id: "warnings-clear",
      label: "Resolve validation findings",
      isDone: () => !validationWarnings.some((w) => w.severity === "error" || w.severity === "warning"),
      required: true,
      governance: "none",
      kind: "warnings",
    },
    {
      id: "gate-ready",
      label: "Gate package ready for review",
      isDone: () =>
        templateRows.every((t) => t.status === "Completed") &&
        evidenceRows.length > 0 &&
        !validationWarnings.some((w) => w.severity === "error" || w.severity === "warning"),
      required: true,
      governance: "none",
      kind: "gate_ready",
    },
  ];
}
