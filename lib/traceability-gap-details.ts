import type { TraceLinkRelation } from "@/lib/trace-link-relations";
import type { TraceabilityGap, TraceabilityGapType } from "@/types/traceability.types";

/**
 * Pure helpers for the Traceability Gap Detail Drawer.
 *
 * Notes:
 * - `TraceabilityGap.issue` is a free-form sentence produced by the loader
 *   (`lib/server/traceability.ts`). These helpers normalize it into a stable
 *   per-type "missing target" phrase + recommended fix without losing the
 *   loader-provided detail.
 * - `mapGapToCreateLinkPrefill` is best-effort. It derives the source side
 *   of a future `TraceLink` only when the gap's identity is unambiguous.
 *   The drawer/modal MUST still treat the prefill as a suggestion the
 *   caller can override (e.g. "broken_link" cases where the source kind
 *   is unknown from the row alone).
 */

export type CreateLinkPrefillKind = "requirement" | "feature" | "artifact";

export type CreateLinkPrefill = {
  fromKind?: CreateLinkPrefillKind;
  fromId?: string;
  toKind?: CreateLinkPrefillKind;
  toId?: string;
  relationHint?: TraceLinkRelation;
};

const gapTypeToLabel: Record<TraceabilityGapType, string> = {
  requirement_gap: "Requirement gap",
  design_orphan: "Design orphan",
  test_orphan: "Test orphan",
  evidence_orphan: "Evidence orphan",
  broken_link: "Broken link",
};

export function getGapTypeLabel(type: TraceabilityGapType): string {
  return gapTypeToLabel[type];
}

/**
 * Returns a stable, human-readable description of what is missing for
 * the given gap, independent of any free-form text in `issue`.
 */
export function deriveMissingTarget(gap: TraceabilityGap): string {
  switch (gap.type) {
    case "requirement_gap":
      return "No downstream design, feature, or evidence link";
    case "design_orphan":
      return "No upstream requirement link";
    case "test_orphan":
      return "No upstream requirement under test";
    case "evidence_orphan":
      return "No gate review or approval row references this evidence";
    case "broken_link":
      return "Trace link references a missing object";
    default: {
      const _exhaustive: never = gap.type;
      void _exhaustive;
      return "Unknown gap";
    }
  }
}

/** Human-readable broken / missing relationship line for the gap drawer. */
export function deriveBrokenRelationship(gap: TraceabilityGap): string {
  if (gap.type === "broken_link") {
    return gap.issue || "Trace link references a missing object";
  }
  return deriveMissingTarget(gap);
}

/** Short lifecycle risk copy derived from impact (no extra DB fields). */
export function deriveLifecycleRisk(gap: TraceabilityGap): string {
  const byImpact: Record<TraceabilityGap["impact"], string> = {
    low: "Low residual risk if left open through the next milestone; still worth tracking.",
    medium: "Medium risk: may block clean gate sign-off or inflate rework if not addressed before the next review.",
    high: "High risk: likely to surface as a gate finding or audit exception until resolved or formally accepted.",
    critical: "Critical risk: treat as release-blocking unless explicitly accepted with approver sign-off.",
  };
  return byImpact[gap.impact];
}

export type RecommendedFix = {
  text: string;
  ctaLabel: string;
  /**
   * `create-link` → open the Create Trace Link modal (default).
   * `open-source` → no link can be created automatically; jump to the
   *   source object in its native screen.
   */
  ctaKind: "create-link" | "open-source";
};

/**
 * Returns a recommended fix per gap type. Used to render both the
 * descriptive copy and the primary CTA in the drawer.
 */
export function deriveRecommendedFix(gap: TraceabilityGap): RecommendedFix {
  switch (gap.type) {
    case "requirement_gap":
      return {
        text: "Link this requirement to a feature, design, or evidence item that satisfies it.",
        ctaLabel: "Create trace link",
        ctaKind: "create-link",
      };
    case "design_orphan":
      return {
        text: "Link this feature back to the originating requirement.",
        ctaLabel: "Create trace link",
        ctaKind: "create-link",
      };
    case "test_orphan":
      return {
        text: "Link this test artifact to the requirement it validates.",
        ctaLabel: "Create trace link",
        ctaKind: "create-link",
      };
    case "evidence_orphan":
      return {
        text: "Attach this evidence to a gate review approval to close the loop.",
        ctaLabel: "Open evidence in workspace",
        ctaKind: "open-source",
      };
    case "broken_link":
      return {
        text: "The referenced object has been removed. Remove the link or recreate it pointing at a valid target.",
        ctaLabel: "Open in workspace",
        ctaKind: "open-source",
      };
    default: {
      const _exhaustive: never = gap.type;
      void _exhaustive;
      return { text: "", ctaLabel: "Open in workspace", ctaKind: "open-source" };
    }
  }
}

/**
 * Best-effort mapping from a gap row to a partial Create Trace Link
 * payload. Returns the source side only when unambiguous; the caller
 * is expected to let the user choose the target.
 *
 * Loader convention (matches `lib/server/traceability.ts`):
 * - requirement_gap rows have `objectId === requirement.localId`
 * - design_orphan rows have `objectId === feature.localId`
 * - test_orphan rows have `objectId === artifact.localId` (treated as the
 *   test artifact). We DO NOT prefill it as `fromKind: artifact` because
 *   the modal's source/target select uses internal ids; instead we set a
 *   `relationHint: "tests"` so the user can pick the artifact.
 * - evidence_orphan rows are evidence-side: not modelled as a TraceLink,
 *   so no prefill.
 * - broken_link rows have a Prisma `TraceLink.id` as `objectId`: not a
 *   from/to id and not safe to prefill.
 */
export function mapGapToCreateLinkPrefill(gap: TraceabilityGap): CreateLinkPrefill {
  switch (gap.type) {
    case "requirement_gap":
      return {
        fromKind: "requirement",
        fromId: gap.objectId,
        relationHint: "derives",
      };
    case "design_orphan":
      return {
        fromKind: "feature",
        fromId: gap.objectId,
        relationHint: "implements",
      };
    case "test_orphan":
      return {
        relationHint: "tests",
      };
    case "evidence_orphan":
    case "broken_link":
      return {};
    default: {
      const _exhaustive: never = gap.type;
      void _exhaustive;
      return {};
    }
  }
}
