/** One row in the gate-scoped audit trail (§10). */
export type GateAuditTrailEvent = {
  id: string;
  /** Raw action key, e.g. `gate_review.recorded`. */
  action: string;
  /** Display bucket for the trail table. */
  eventCategory:
    | "submission"
    | "evidence"
    | "criteria"
    | "approver"
    | "decision"
    | "other";
  subjectKind: string;
  subjectId: string;
  actorLabel: string;
  timestampIso: string;
  timestampLabel: string;
  summary: string;
  /** Stable reference shown in list + detail (entry id). */
  auditReference: string;
  metadata: Record<string, unknown>;
};

export type GateAuditTrailViewData = {
  projectId: string;
  projectName: string;
  gateId: string;
  gateCode: string;
  gateName: string;
  events: GateAuditTrailEvent[];
};
