/** Wide audit query row before gate scoping (see `lib/server/gate-audit-trail.ts`). */
export type WideGateAuditRow = {
  id: string;
  action: string;
  subjectKind: string;
  subjectId: string;
  metadata: unknown;
  createdAt: Date;
  actorId: string | null;
};

function metadataRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

/**
 * Keeps audit rows for a gate: `metadata.gateId` match, or `gate_decision` subjects for this gate’s decisions.
 */
export function filterWideAuditRowsForGate(
  rows: WideGateAuditRow[],
  gate: string,
  decisionIds: Set<string>,
  maxRows = 200,
): WideGateAuditRow[] {
  return rows
    .filter((r) => {
      const m = metadataRecord(r.metadata);
      if (m.gateId === gate) return true;
      if (r.subjectKind === "gate_decision" && decisionIds.has(r.subjectId)) return true;
      return false;
    })
    .slice(0, maxRows);
}
