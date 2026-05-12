import Link from "next/link";

import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import type { RequirementTestCoverage } from "@/types/traceability.types";

import { CardShell, CoverageProgressBar, EmptyState, StatusBadge, tableRowClass } from "./traceability-shared";

export function RequirementTestLinksCard({
  rows,
  isLoading,
  projectId,
}: {
  rows: RequirementTestCoverage[];
  isLoading: boolean;
  projectId: string;
}) {
  return (
    <CardShell title="Requirement -> Test Links" count={rows.length} viewAllHref={`/projects/${projectId}/traceability/requirements-tests`}>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState message="No requirement-to-test links found." ctaLabel="Open Test Coverage" ctaHref={`/projects/${projectId}/traceability/requirements-tests`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Requirement Type</th>
                <th className="pb-2">Requirements</th>
                <th className="pb-2">Test Links</th>
                <th className="pb-2">Coverage</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.requirementType} className={tableRowClass()}>
                  <td className="py-2">
                    <Link href={row.href} className="rounded font-medium text-slate-800 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
                      {row.label}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-700">{row.requirementsTotal}</td>
                  <td className="py-2 text-slate-700">{row.testLinksTotal}</td>
                  <td className="py-2">
                    <CoverageProgressBar value={row.coveragePercent} label={`${row.label} test coverage`} />
                  </td>
                  <td className="py-2">
                    <StatusBadge {...coverageStatusBadgeMap[row.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}
