import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import { coverageReportMetricHref } from "@/lib/traceability-coverage-metrics";
import type { CoverageSummary } from "@/types/traceability.types";

import { CoverageRing, MetricTile, StatusBadge } from "./traceability-shared";

export function CoverageSummaryCard({
  coverageSummary,
  isLoading,
  projectId,
}: {
  coverageSummary: CoverageSummary;
  isLoading: boolean;
  /** When set, coverage status rows deep-link into the coverage report metric drawer. */
  projectId?: string;
}) {
  return (
    <section className="traceability-card flex h-full min-h-0 min-w-0 flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="shrink-0 border-b border-[#eef2f7] px-4 py-3">
        <h2 className="text-[15px] font-semibold text-slate-900">Coverage Summary</h2>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-28 animate-pulse rounded bg-slate-100" />
            <div className="h-24 animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              {projectId ? (
                <Link
                  href={coverageReportMetricHref(projectId, "overall")}
                  className="rounded-lg focus-visible:outline-2 focus-visible:outline-blue-600"
                  aria-label="Open overall coverage metric detail"
                >
                  <CoverageRing percent={coverageSummary.overallCoveragePercent} />
                </Link>
              ) : (
                <CoverageRing percent={coverageSummary.overallCoveragePercent} />
              )}
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <StatusBadge {...coverageStatusBadgeMap.complete} />
                  {projectId ? (
                    <Link
                      href={coverageReportMetricHref(projectId, "complete")}
                      className="hover:text-blue-800 hover:underline"
                    >
                      {coverageSummary.complete.percent}% ({coverageSummary.complete.count})
                    </Link>
                  ) : (
                    <span>
                      {coverageSummary.complete.percent}% ({coverageSummary.complete.count})
                    </span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <StatusBadge {...coverageStatusBadgeMap.partial} />
                  {projectId ? (
                    <Link
                      href={coverageReportMetricHref(projectId, "partial")}
                      className="hover:text-blue-800 hover:underline"
                    >
                      {coverageSummary.partial.percent}% ({coverageSummary.partial.count})
                    </Link>
                  ) : (
                    <span>
                      {coverageSummary.partial.percent}% ({coverageSummary.partial.count})
                    </span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <StatusBadge {...coverageStatusBadgeMap.missing} />
                  {projectId ? (
                    <Link
                      href={coverageReportMetricHref(projectId, "missing")}
                      className="hover:text-blue-800 hover:underline"
                    >
                      {coverageSummary.missing.percent}% ({coverageSummary.missing.count})
                    </Link>
                  ) : (
                    <span>
                      {coverageSummary.missing.percent}% ({coverageSummary.missing.count})
                    </span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <StatusBadge {...coverageStatusBadgeMap.orphaned} />
                  {projectId ? (
                    <Link href={coverageReportMetricHref(projectId, "gaps")} className="hover:text-blue-800 hover:underline">
                      ({coverageSummary.orphaned.count})
                    </Link>
                  ) : (
                    <span>({coverageSummary.orphaned.count})</span>
                  )}
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm min-[901px]:grid-cols-3">
              <MetricTile label="Total Requirements" value={coverageSummary.totals.requirements} />
              <MetricTile label="Total Designs" value={coverageSummary.totals.designs} />
              <MetricTile label="Total Tests" value={coverageSummary.totals.tests} />
              <MetricTile label="Total Evidence Items" value={coverageSummary.totals.evidenceItems} />
              <MetricTile label="Total Gates" value={coverageSummary.totals.gates} />
              <MetricTile label="Total Artifacts" value={coverageSummary.totals.artifacts} />
            </div>

            <Link href={coverageSummary.reportHref} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline">
              View Coverage Report
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
