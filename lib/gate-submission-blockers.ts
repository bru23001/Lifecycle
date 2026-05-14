import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";

/** First navigable fix for gate submission blockers (templates → evidence → validation). */
export function resolveFirstGateBlockerHref(state: GateSubmissionState): string {
  const inputs = state.requiredInputs ?? [];
  const blockingInput = inputs.find((i) => i.status !== "complete");
  if (blockingInput?.href) return blockingInput.href;

  if (!state.evidenceItems || state.evidenceItems.length === 0) {
    return `/projects/${state.projectId}/workspace#evidence-attachments`;
  }

  const err = state.validationWarnings?.find((w) => w.severity === "error" && w.href);
  if (err?.href) return err.href;

  const warn = state.validationWarnings?.find((w) => w.severity !== "info" && w.href);
  if (warn?.href) return warn.href;

  return `/projects/${state.projectId}/workspace#completion-checklist`;
}
