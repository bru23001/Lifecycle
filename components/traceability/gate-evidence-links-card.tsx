import Link from "next/link";

import { gateTraceStatusBadgeMap } from "@/lib/coverage-status";
import { cn } from "@/lib/utils";
import type { GateEvidenceCoverage } from "@/types/traceability.types";

import { CardShell, CoverageProgressBar, EmptyState, StatusBadge, tableRowClass, traceabilityCountCellClass } from "./traceability-shared";

export function GateEvidenceLinksCard({
  rows,
  isLoading,
  projectId,
}: {
  rows: GateEvidenceCoverage[];
  isLoading: boolean;
  projectId: string;
}) {
  return (
    <CardShell title="Gate -> Evidence Links" count={rows.length} viewAllHref={`/projects/${projectId}/traceability/gate-evidence`}>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          message="No gate-to-evidence links found."
          ctaLabel="Gate ↔ Evidence"
          ctaHref={`/projects/${projectId}/traceability/gate-evidence`}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Gate</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Evidence</th>
                <th className="pb-2">Required</th>
                <th className="pb-2">Coverage</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.gateId} className={tableRowClass()}>
                  <td className="py-2 text-slate-800">
                    <Link href={row.href} className="font-medium text-[#2563eb] hover:underline">
                      {row.gateCode} - {row.gateName}
                    </Link>
                  </td>
                  <td className="py-2">
                    <StatusBadge {...gateTraceStatusBadgeMap[row.gateStatus]} />
                  </td>
                  <td className={cn("py-2", traceabilityCountCellClass)}>{row.evidenceLinked}</td>
                  <td className={cn("py-2", traceabilityCountCellClass)}>{row.requiredEvidence}</td>
                  <td className="py-2">
                    <CoverageProgressBar value={row.coveragePercent} label={`${row.gateCode} evidence coverage`} />
                  </td>
                  <td className="py-2">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={row.href}
                        className="rounded text-sm font-semibold text-[#2563eb] hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                      >
                        Coverage
                      </Link>
                      <Link
                        href={row.reviewHref}
                        className="rounded text-xs font-semibold text-slate-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                      >
                        Review
                      </Link>
                    </div>
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
