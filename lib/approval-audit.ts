import type { ApprovalAuditRecord, ApprovalHistoryEvent } from "@/types/approval-center.types";

/** Deterministic display hash for UI (not a cryptographic guarantee). */
function integrityDisplayHash(parts: string[]): string {
  const s = parts.join("|");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `cc-audit-${hex}${(h ^ 0x9e3779b9).toString(16).padStart(8, "0")}`;
}

export function approvalAuditFromHistoryEvent(event: ApprovalHistoryEvent): ApprovalAuditRecord {
  const id = event.auditRecordId ?? `aud:${event.id}`;
  return {
    id,
    eventType: `audit.${event.eventType}`,
    actorName: event.actorName,
    actorRole: event.actorRole,
    timestampLabel: event.timestampLabel,
    objectChangedLabel: event.relatedObjectLabel ?? "Approval record",
    objectChangedHref: event.relatedObjectHref,
    beforeValue: event.beforeValue,
    afterValue: event.afterValue,
    integrityHash: integrityDisplayHash([id, event.timestampLabel, event.eventType]),
  };
}
