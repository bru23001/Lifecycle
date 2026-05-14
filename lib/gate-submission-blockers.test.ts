import { describe, expect, it } from "vitest";

import type { GateSubmissionState } from "@/components/lifecycle-workspace/submit-gate-review-types";
import { resolveFirstGateBlockerHref } from "@/lib/gate-submission-blockers";

function baseState(over: Partial<GateSubmissionState> = {}): GateSubmissionState {
  return {
    projectId: "proj-1",
    gateCode: "G3",
    gateName: "Gate 3",
    canSubmit: false,
    missingRequirements: [],
    submitHref: "/projects/proj-1/gates/g3/review",
    requiredInputs: [],
    evidenceItems: [],
    validationWarnings: [],
    assignedApprovers: [],
    ...over,
  };
}

describe("resolveFirstGateBlockerHref", () => {
  it("should prefer first non-complete required input href", () => {
    const href = resolveFirstGateBlockerHref(
      baseState({
        requiredInputs: [
          { id: "a", label: "A", status: "complete", href: "/a" },
          { id: "b", label: "B", status: "incomplete", href: "/b" },
        ],
      }),
    );
    expect(href).toBe("/b");
  });

  it("should fall back to evidence anchor when no inputs but no evidence", () => {
    expect(resolveFirstGateBlockerHref(baseState({ evidenceItems: [] }))).toBe(
      "/projects/proj-1/workspace#evidence-attachments",
    );
  });
});
