import Link from "next/link";

import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import type { ArtifactGateCoverage } from "@/types/traceability.types";

import { CardShell, CoverageProgressBar, EmptyState, StatusBadge, tableRowClass } from "./traceability-shared";

export function ArtifactGateLinksCard({
  rows,
  isLoading,
  projectId,
}: {
  rows: ArtifactGateCoverage[];
  isLoading: boolean;
  projectId: string;
}) {
  return (
    <CardShell
      title="Artifact → Gate readiness"
      count={rows.length}
      viewAllHref={`/projects/${projectId}/traceability`}
      showViewAll={false}
    >
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          message="No artifact rows in this filtered view."
          ctaLabel="Open workspace"
          ctaHref={`/projects/${projectId}/workspace`}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Artifact</th>
                <th className="pb-2">Gate</th>
                <th className="pb-2">Coverage</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={tableRowClass()}>
                  <td className="py-2 font-medium text-slate-800">
                    <Link
                      href={row.href}
                      className="text-slate-800 hover:text-[#2563eb] hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      {row.artifactTitle}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-700">
                    <Link
                      href={row.reviewHref}
                      className="hover:text-[#2563eb] hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      {row.gateCode} — {row.gateName}
                    </Link>
                  </td>
                  <td className="py-2">
                    <CoverageProgressBar value={row.status === "complete" ? 100 : row.status === "partial" ? 50 : 0} label="Readiness" />
                  </td>
                  <td className="py-2">
                    <StatusBadge {...coverageStatusBadgeMap[row.status]} />
                  </td>
                  <td className="py-2">
                    <Link
                      href={row.detailHref}
                      className="rounded text-sm font-semibold text-[#2563eb] hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      Detail
                    </Link>
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
