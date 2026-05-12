/**
 * Structured G3 Business Field Report (A-4) waiver on `Project.applicabilityJson`.
 * Legacy: substring match on A-3.1 fields (`hasApprovedWaiverOnScorecard`) remains as fallback.
 */
export type G3StructuredWaiver = {
  gateId: string;
  rationale: string;
  approver?: string;
  grantedAt?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

/**
 * Parses `applicabilityJson.waiverGranted` when present and valid for G3.
 */
export function parseStructuredG3Waiver(applicabilityJson: unknown): G3StructuredWaiver | null {
  if (!isRecord(applicabilityJson)) return null;
  const raw = applicabilityJson.waiverGranted;
  if (!isRecord(raw)) return null;

  const granted = raw.granted === true || String(raw.status ?? "").toLowerCase() === "approved";
  if (!granted) return null;

  const gateId = String(raw.gateId ?? "G3").trim().toUpperCase();
  if (gateId !== "G3" && gateId !== "*") return null;

  const rationale = String(raw.rationale ?? "").trim();
  if (rationale.length < 10) return null;

  const approver = String(raw.approver ?? "").trim();
  const grantedAt = String(raw.grantedAt ?? "").trim();

  return {
    gateId,
    rationale,
    ...(approver ? { approver } : {}),
    ...(grantedAt ? { grantedAt } : {}),
  };
}
