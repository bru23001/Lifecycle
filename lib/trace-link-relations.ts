import { z } from "zod";

/** Stored on `TraceLink.relation` — includes legacy + spec §9 link types. */
export const TRACE_LINK_RELATIONS = [
  "informs",
  "derives",
  "validates",
  "implements",
  "tests",
  "satisfies",
  "verifies",
  "evidences",
  "depends_on",
  "blocks",
] as const;

export type TraceLinkRelation = (typeof TRACE_LINK_RELATIONS)[number];

export const traceLinkRelationSchema = z.enum(TRACE_LINK_RELATIONS);

export const TRACE_LINK_CONFIDENCE = ["low", "medium", "high"] as const;
export type TraceLinkConfidence = (typeof TRACE_LINK_CONFIDENCE)[number];
export const traceLinkConfidenceSchema = z.enum(TRACE_LINK_CONFIDENCE);

export const RELATION_HELP: Record<TraceLinkRelation, string> = {
  informs: "Source provides context that shapes the target.",
  derives: "Target is derived from the source (parent → child).",
  validates: "Target validates that the source is met.",
  implements: "Target implements the source requirement or feature.",
  tests: "Target exercises the source under test.",
  satisfies: "Target satisfies the intent or acceptance criteria of the source.",
  verifies: "Target verifies the source (e.g. verification evidence).",
  evidences: "Target evidences the source for audit or gate readiness.",
  depends_on: "Source depends on the target being available or complete.",
  blocks: "Source blocks progress on the target until resolved.",
};
