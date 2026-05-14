import type {
  CompletionChecklistItem,
  CompletionRulesPayload,
} from "@/components/lifecycle-workspace/completion-checklist-types";
import type { CurrentPhaseWorkspaceData } from "@/components/lifecycle-workspace/current-phase-workspace-types";
import type {
  EvidenceAttachment,
  EvidenceWorkspaceContextPayload,
} from "@/components/lifecycle-workspace/evidence-attachments-types";
import type { PhaseHeaderData } from "@/components/lifecycle-workspace/phase-header-types";
import type { PhaseNavItem } from "@/components/lifecycle-workspace/phase-navigator-types";
import type { RequiredTemplate } from "@/components/lifecycle-workspace/required-templates-types";
import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import type { NextRequiredAction } from "@/components/lifecycle-workspace/next-required-action-types";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";

export type LifecycleWorkspaceScreenData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
  };
  phaseHeader: PhaseHeaderData;
  phaseNavigatorItems: PhaseNavItem[];
  workspace: CurrentPhaseWorkspaceData;
  requiredTemplates: RequiredTemplate[];
  evidenceAttachments: EvidenceAttachment[];
  evidenceWorkspace: EvidenceWorkspaceContextPayload;
  checklistItems: CompletionChecklistItem[];
  completionRules: CompletionRulesPayload;
  validationWarnings: ValidationWarning[];
  gateSubmissionState: GateSubmissionState;
  nextRequiredAction: NextRequiredAction;
  /** Payload for workspace “Export phase package” (ZIP) from the action bar. */
  phaseExportZipBase: Record<string, unknown>;
};
