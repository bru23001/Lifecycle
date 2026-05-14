/**
 * Parses `phase` query values for project-scoped screens (workspace phases 1–14).
 */
export function parseWorkspacePhaseQueryParam(value: string | undefined | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number.parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n) || n < 1 || n > 14) return undefined;
  return n;
}
