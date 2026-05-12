import Link from "next/link";

import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import type { PhaseArtifactCoverage } from "@/types/traceability.types";

import { CardShell, CoverageProgressBar, EmptyState, StatusBadge, tableRowClass } from "./traceability-shared";

export function PhaseArtifactLinksCard({
  rows,
  isLoading,
  projectId,
}: {
  rows: PhaseArtifactCoverage[];
  isLoading: boolean;
  projectId: string;
}) {
  return (
    <CardShell title="Phase -> Artifact Links" count={rows.length} viewAllHref={`/projects/${projectId}/traceability/phase-artifacts`}>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          message="No phase-to-artifact links found."
          ctaLabel="Open Artifact Library"
          ctaHref={`/projects/${projectId}/workspace`}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Phase</th>
                <th className="pb-2">Linked</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Coverage</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.phaseId} className={tableRowClass()}>
                  <td className="py-2">
                    <Link href={row.href} className="rounded font-medium text-slate-800 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
                      {row.phaseNumber} {row.phaseName}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-700">{row.artifactsLinked}</td>
                  <td className="py-2 text-slate-700">{row.totalArtifactsRequired}</td>
                  <td className="py-2">
                    <CoverageProgressBar value={row.coveragePercent} label={`${row.phaseName} artifact coverage`} />
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
