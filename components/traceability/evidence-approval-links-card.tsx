import Link from "next/link";

import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import type { EvidenceApprovalCoverage } from "@/types/traceability.types";

import { CardShell, EmptyState, StatusBadge, tableRowClass } from "./traceability-shared";

const approvalTone: Record<EvidenceApprovalCoverage["approvalStatus"], "green" | "amber" | "red" | "gray"> = {
  approved: "green",
  pending: "amber",
  changes_requested: "amber",
  rejected: "red",
};

export function EvidenceApprovalLinksCard({
  rows,
  isLoading,
  projectId,
}: {
  rows: EvidenceApprovalCoverage[];
  isLoading: boolean;
  projectId: string;
}) {
  return (
    <CardShell
      title="Evidence → Decision record"
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
          message="No evidence–approval link rows in this filtered view."
          ctaLabel="Open evidence center"
          ctaHref={`/projects/${projectId}/evidence`}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Evidence</th>
                <th className="pb-2">Approval</th>
                <th className="pb-2">Decision</th>
                <th className="pb-2">Link health</th>
                <th className="pb-2">Action</th>
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
                      {row.evidenceLabel}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-700">{row.approvalTitle}</td>
                  <td className="py-2">
                    <StatusBadge
                      label={row.approvalStatus.replace(/_/g, " ")}
                      tone={approvalTone[row.approvalStatus]}
                    />
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
