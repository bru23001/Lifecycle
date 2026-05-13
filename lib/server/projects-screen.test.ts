import { describe, expect, it } from "vitest";

import { buildSelectedProjectFromListItem } from "@/lib/server/projects-screen";

describe("buildSelectedProjectFromListItem", () => {
  it("wires fallback traceability quick action to the project route", () => {
    const selected = buildSelectedProjectFromListItem({
      id: "proj_123",
      name: "Lifecycle hardening",
      code: "LIF-123",
      owner: "Owner",
      currentPhase: 4,
      progressPercent: 29,
      status: "In Progress",
      updatedLabel: "2h ago",
      missingEvidenceCount: 0,
    });

    const traceabilityQuickAction = selected.quickActions.find((action) => action.id === "qa-trace");

    expect(traceabilityQuickAction?.href).toBe("/projects/proj_123/traceability");
  });
});
