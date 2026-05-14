import {
  EVIDENCE_PACKAGE_SCOPE_KEYS,
  EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS,
  type EvidencePackageScopes,
} from "@/lib/evidence-package-scopes";

export type ProjectPackageExportFormat = "zip";

export const PROJECT_PACKAGE_EXPORT_FORMATS: readonly ProjectPackageExportFormat[] = ["zip"];

export type BuildProjectPackageConfigureUrlInput = {
  projectId: string;
  scopes: EvidencePackageScopes;
  format?: ProjectPackageExportFormat;
};

/**
 * Builds the deep-link URL for the existing "Configure Evidence Package"
 * screen (`app/projects/[id]/reports/evidence-package/configure/page.tsx`)
 * with the modal's pre-selected scope toggles applied via the canonical
 * `pkg_*` query keys.
 *
 * Pure: no I/O, no React. Decisions:
 *   - Format is currently locked to ZIP (the only one the configure flow
 *     supports). The parameter exists so future formats can be added without
 *     a signature change.
 *   - Scope toggles serialize as `1`/`0` to match
 *     `parseEvidencePackageScopesFromSearchParams`.
 */
export function buildProjectPackageConfigureUrl(
  input: BuildProjectPackageConfigureUrlInput,
): string {
  const q = new URLSearchParams();
  for (const key of EVIDENCE_PACKAGE_SCOPE_KEYS) {
    q.set(EVIDENCE_PACKAGE_SCOPE_QUERY_KEYS[key], input.scopes[key] ? "1" : "0");
  }
  if (input.format) q.set("format", input.format);
  return `/projects/${encodeURIComponent(input.projectId)}/reports/evidence-package/configure?${q.toString()}`;
}
