import { parseApplicability } from "@/lib/applicability";
import {
  domainPhaseForWorkspaceIndex,
  workspacePhaseMeta,
  workspacePhaseObjectives,
  workspacePhasePurpose,
} from "@/lib/workspacePhases";
import { getTemplatesForPhase } from "@/templates/registry";

export type PhaseGuidePayload = {
  purpose: string;
  entryCriteria: string[];
  requiredOutputs: string[];
  completionRules: string[];
  gateRelationship: string;
  evidenceRequirements: string;
  commonMistakes: string[];
  relatedTemplates: { id: string; title: string }[];
};

const COMMON_MISTAKES: string[] = [
  "Treating templates as optional narrative instead of gate evidence.",
  "Deferring traceability until the end of the phase.",
  "Submitting for gate review with draft artifacts still marked as in progress.",
];

export function buildPhaseGuidePayload(args: {
  workspacePhaseIndex: number;
  gateCode: string;
  gateName: string;
  applicabilityJson: unknown;
}): PhaseGuidePayload {
  const { workspacePhaseIndex, gateCode, gateName } = args;
  const app = parseApplicability(args.applicabilityJson);
  const domain = domainPhaseForWorkspaceIndex(workspacePhaseIndex);
  const templates = getTemplatesForPhase(domain).filter((tmpl) => {
    const tid = tmpl.templateId;
    if (tid === "A-11" && !app.data) return false;
    if (tid === "A-12" && !app.apis) return false;
    if (tid === "UXD-001" && !app.ui) return false;
    return true;
  });
  const objectives = workspacePhaseObjectives(workspacePhaseIndex);
  const meta = workspacePhaseMeta(workspacePhaseIndex);

  return {
    purpose: workspacePhasePurpose(workspacePhaseIndex),
    entryCriteria: [
      "Prior milestone exit criteria satisfied or explicitly waived under governance.",
      "Named delivery owner and sponsor alignment for this phase scope.",
      objectives[0] ?? "Phase objectives acknowledged by the core team.",
    ],
    requiredOutputs: objectives,
    completionRules: [
      "All catalog templates for this phase reach a non-draft artifact state.",
      "Evidence is linked to artifacts with no unresolved validation blockers.",
      `Gate ${meta.gate ?? gateCode} readiness matches the submission checklist before review.`,
    ],
    gateRelationship:
      gateCode !== "—"
        ? `${gateCode} (${gateName}) governs exit from this milestone; decisions are recorded on the project before downstream phases unlock.`
        : "This milestone is not directly gated; follow portfolio policy for closure evidence.",
    evidenceRequirements:
      "Attach exports or registered artifacts for each required template. Gate reviewers expect an evidence pass snapshot with traceable links, not working-folder placeholders.",
    commonMistakes: COMMON_MISTAKES,
    relatedTemplates: templates.map((t) => ({ id: t.templateId, title: t.title })),
  };
}
