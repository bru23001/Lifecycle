/**
 * Stable routes for traceability drill-down (§11 object interactions).
 * Keep paths aligned with `app/projects/[id]/…` routes.
 */

export function requirementDetailPath(projectId: string, requirementId: string): string {
  return `/projects/${projectId}/requirements/${requirementId}`;
}

export function featureRegisterPath(projectId: string, focusFeatureId?: string): string {
  const base = `/projects/${projectId}/features`;
  if (!focusFeatureId?.trim()) return base;
  return `${base}?focus=${encodeURIComponent(focusFeatureId.trim())}`;
}

export function artifactDetailPath(projectId: string, artifactId: string): string {
  return `/projects/${projectId}/artifacts/${artifactId}`;
}

export function evidenceDetailPath(projectId: string, evidenceId: string): string {
  return `/projects/${projectId}/evidence/${evidenceId}`;
}

export function gateReviewPath(projectId: string, gateCode: string): string {
  const g = gateCode.trim().toLowerCase();
  return `/projects/${projectId}/gates/${g}/review`;
}

export function traceLinkDetailPath(projectId: string, linkId: string): string {
  return `/projects/${projectId}/traceability/${encodeURIComponent(linkId)}`;
}
