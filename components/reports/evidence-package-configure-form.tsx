"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  applyEvidencePackageScopesToReport,
  buildEvidencePackageConfigureHref,
  buildEvidencePackageExportHref,
  clampEvidencePackageScopesToAvailability,
  type EvidencePackageScopeKey,
  type EvidencePackageScopes,
  hasAnyEvidencePackageScope,
} from "@/lib/evidence-package-scopes";
import { reportsFiltersToSearchParams } from "@/lib/reports-url";
import type { FullProjectEvidencePackageSummary, ReportsFilters } from "@/types/reports.types";

const ROWS: { key: EvidencePackageScopeKey; label: string }[] = [
  { key: "artifacts", label: "Markdown artifacts" },
  { key: "evidence", label: "JSON evidence files" },
  { key: "gateDecisions", label: "Gate decisions" },
  { key: "traceability", label: "Traceability links" },
  { key: "approvals", label: "Approval records" },
  { key: "auditManifest", label: "Audit manifest" },
];

function scopeAvailable(
  key: EvidencePackageScopeKey,
  summary: FullProjectEvidencePackageSummary,
): boolean {
  switch (key) {
    case "artifacts":
      return summary.includesArtifacts;
    case "evidence":
      return summary.includesEvidenceFiles;
    case "gateDecisions":
      return summary.includesGateDecisions;
    case "traceability":
      return summary.includesTraceabilityLinks;
    case "approvals":
      return summary.includesApprovalRecords;
    case "auditManifest":
      return summary.includesAuditManifest;
    default:
      return false;
  }
}

function countForScope(
  key: EvidencePackageScopeKey,
  summary: FullProjectEvidencePackageSummary,
): number {
  const c = summary.sectionCounts;
  switch (key) {
    case "artifacts":
      return c.artifacts;
    case "evidence":
      return c.evidenceFiles;
    case "gateDecisions":
      return c.gateDecisions;
    case "traceability":
      return c.traceabilityLinks;
    case "approvals":
      return c.approvalRecords;
    case "auditManifest":
      return c.auditEntries;
    default:
      return 0;
  }
}

export function EvidencePackageConfigureForm({
  projectId,
  filters,
  initial,
  initialScopes,
  initialScopesKey,
}: {
  projectId: string;
  filters: ReportsFilters;
  initial: FullProjectEvidencePackageSummary;
  initialScopes: EvidencePackageScopes;
  initialScopesKey: string;
}) {
  const router = useRouter();
  const [scopes, setScopes] = useState<EvidencePackageScopes>(initialScopes);

  useEffect(() => {
    setScopes(initialScopes);
  }, [initialScopesKey, initialScopes]);

  const exportJsonHref = buildEvidencePackageExportHref(projectId, filters, scopes, "json");
  const exportZipHref = buildEvidencePackageExportHref(projectId, filters, scopes, "zip");
  const reportsFiltersQuery = reportsFiltersToSearchParams(filters).toString();
  const reportsFilteredHref = reportsFiltersQuery
    ? `/projects/${projectId}/reports?${reportsFiltersQuery}`
    : `/projects/${projectId}/reports`;

  const preview = applyEvidencePackageScopesToReport(initial, scopes);
  const canExport = hasAnyEvidencePackageScope(scopes);

  const setScope = (key: EvidencePackageScopeKey, nextVal: boolean) => {
    if (!scopeAvailable(key, initial)) return;
    setScopes((prev) => {
      const draft = { ...prev, [key]: nextVal };
      const clamped = clampEvidencePackageScopesToAvailability(draft, initial);
      router.replace(buildEvidencePackageConfigureHref(projectId, filters, clamped));
      return clamped;
    });
  };

  return (
    <div className="space-y-6" data-testid="evidence-package-configure">
      <p className="text-sm text-slate-600">
        Choose what goes into the lifecycle export bundle. Filters from the reports hub apply; adjust
        them there or{" "}
        <Link href={reportsFilteredHref} className="font-semibold text-[#2563eb] hover:underline">
          open reports with the same scope
        </Link>
        .
      </p>

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <legend className="text-lg font-semibold text-slate-900">Include in export</legend>
        <ul className="mt-4 space-y-3 text-sm">
          {ROWS.map(({ key, label }) => {
            const available = scopeAvailable(key, initial);
            const count = countForScope(key, initial);
            const checked = scopes[key];
            return (
              <li key={key}>
                <label
                  className={`flex cursor-pointer items-start gap-3 ${!available ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-slate-300"
                    checked={checked}
                    disabled={!available}
                    onChange={() => setScope(key, !checked)}
                  />
                  <span className="text-slate-800">
                    {label}
                    <span className="ml-1 text-slate-500">
                      ({available ? count : 0}{" "}
                      {count === 1 ? "item" : "items"})
                    </span>
                    {!available ? (
                      <span className="ml-2 text-xs text-amber-700">No data in current filters</span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Manifest preview</h2>
        <p className="mt-1 text-xs text-slate-600">
          Snapshot fields sent with{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[11px]">packageScopes</code> on export.
        </p>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-800">
          {JSON.stringify({ packageScopes: scopes, report: preview }, null, 2)}
        </pre>
      </section>

      <section
        className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5"
        data-testid="evidence-package-export-actions"
        aria-label="Evidence package export"
      >
        <h2 className="text-sm font-semibold text-slate-900">Download</h2>
        <p className="mt-1 text-xs text-slate-600">
          Exports are JSON snapshots today (ZIP label reserved for a future binary bundle).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            href={canExport ? exportJsonHref : undefined}
            aria-disabled={!canExport}
            className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-semibold text-white ${
              canExport ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : "cursor-not-allowed bg-slate-400"
            }`}
            {...(canExport ? { download: "evidence-package-export.json" } : {})}
            onClick={(e) => {
              if (!canExport) e.preventDefault();
            }}
          >
            Download JSON snapshot
          </a>
          <a
            href={canExport ? exportZipHref : undefined}
            aria-disabled={!canExport}
            className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-semibold ${
              canExport
                ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            }`}
            {...(canExport ? { download: "evidence-package-export.zip" } : {})}
            onClick={(e) => {
              if (!canExport) e.preventDefault();
            }}
          >
            Download ZIP manifest (stub)
          </a>
          <Link
            href={`/projects/${projectId}/reports/evidence-package`}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to package
          </Link>
        </div>
        {!canExport ? (
          <p className="mt-2 text-xs font-medium text-amber-900">
            Select at least one section with data to enable download.
          </p>
        ) : null}
      </section>
    </div>
  );
}
