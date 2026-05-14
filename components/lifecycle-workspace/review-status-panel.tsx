import { Suspense } from "react";

import { CompletionChecklist } from "@/components/lifecycle-workspace/completion-checklist";
import type {
  CompletionChecklistItem,
  CompletionRulesPayload,
} from "@/components/lifecycle-workspace/completion-checklist-types";
import { SubmitGateReviewCard } from "@/components/lifecycle-workspace/submit-gate-review-card";
import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import { ValidationWarnings } from "@/components/lifecycle-workspace/validation-warnings";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";

export type { CompletionChecklistItem } from "@/components/lifecycle-workspace/completion-checklist-types";

export function ReviewStatusPanel({
  checklistItems,
  completionRules,
  projectRecordId,
  phaseNumber,
  validationWarnings,
  gateSubmissionState,
}: {
  checklistItems: CompletionChecklistItem[];
  completionRules: CompletionRulesPayload;
  projectRecordId: string;
  phaseNumber: number;
  validationWarnings: ValidationWarning[];
  gateSubmissionState: GateSubmissionState;
}) {
  return (
    <div data-pane="status" className="review-status-panel">
      <ValidationWarnings
        warnings={validationWarnings}
        projectId={projectRecordId}
        phaseNumber={phaseNumber}
      />
      <CompletionChecklist
        items={checklistItems}
        completionRules={completionRules}
        projectRecordId={projectRecordId}
        phaseNumber={phaseNumber}
      />
      <Suspense fallback={null}>
        <SubmitGateReviewCard state={gateSubmissionState} />
      </Suspense>
    </div>
  );
}
