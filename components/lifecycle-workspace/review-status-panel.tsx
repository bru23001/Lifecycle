import { CompletionChecklist } from "@/components/lifecycle-workspace/completion-checklist";
import type { CompletionChecklistItem } from "@/components/lifecycle-workspace/completion-checklist-types";
import { SubmitGateReviewCard } from "@/components/lifecycle-workspace/submit-gate-review-card";
import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import { ValidationWarnings } from "@/components/lifecycle-workspace/validation-warnings";
import type { ValidationWarning } from "@/components/lifecycle-workspace/validation-warnings-types";

export type { CompletionChecklistItem } from "@/components/lifecycle-workspace/completion-checklist-types";

export function ReviewStatusPanel({
  checklistItems,
  validationWarnings,
  gateSubmissionState,
}: {
  checklistItems: CompletionChecklistItem[];
  validationWarnings: ValidationWarning[];
  gateSubmissionState: GateSubmissionState;
}) {
  return (
    <div className="review-status-panel space-y-4">
      <CompletionChecklist items={checklistItems} />
      <ValidationWarnings warnings={validationWarnings} />
      <SubmitGateReviewCard state={gateSubmissionState} />
    </div>
  );
}
