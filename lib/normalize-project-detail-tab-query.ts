/**
 * Maps spec / legacy query values to canonical `ProjectDetailTab` ids used in `/projects?tab=…`.
 */
export function normalizeProjectDetailTabQueryParam(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  if (raw === "audit_trail") return "audit-trail";
  return raw;
}
