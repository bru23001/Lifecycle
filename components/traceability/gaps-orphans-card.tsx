import { impactBadgeMap } from "@/lib/coverage-status";
import { deriveRecommendedFix } from "@/lib/traceability-gap-details";
import { cn } from "@/lib/utils";
import type { TraceabilityGap } from "@/types/traceability.types";

import type { GapTabId } from "./traceability-filtering";
import { gapTabConfig } from "./traceability-filtering";
import { CardShell, EmptyState, StatusBadge, tableRowClass } from "./traceability-shared";

export function GapsOrphansCard({
  rows,
  isLoading,
  reportHref,
  viewAllHref,
  showViewAll = true,
  activeGapTab,
  onActiveGapTabChange,
  onSelectGap,
}: {
  rows: TraceabilityGap[];
  isLoading: boolean;
  reportHref: string;
  /** Defaults to `reportHref` when omitted (legacy matrix card). */
  viewAllHref?: string;
  showViewAll?: boolean;
  activeGapTab: GapTabId;
  onActiveGapTabChange: (tab: GapTabId) => void;
  onSelectGap?: (gap: TraceabilityGap) => void;
}) {
  return (
    <CardShell
      title="Gaps / Orphans"
      count={rows.length}
      viewAllHref={viewAllHref ?? reportHref}
      showViewAll={showViewAll}
    >
      <div role="tablist" aria-label="Gap categories" className="mb-3 flex flex-wrap gap-2">
        {gapTabConfig.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeGapTab === tab.id}
            aria-controls={`gap-tab-${tab.id}`}
            id={`gap-tab-button-${tab.id}`}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-semibold",
              activeGapTab === tab.id
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
            onClick={() => onActiveGapTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`gap-tab-${activeGapTab}`} aria-labelledby={`gap-tab-button-${activeGapTab}`}>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 animate-pulse rounded bg-slate-100" />
            <div className="h-8 animate-pulse rounded bg-slate-100" />
            <div className="h-8 animate-pulse rounded bg-slate-100" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState message="No gaps or orphan records found." ctaLabel="Open Coverage Report" ctaHref={reportHref} tone="success" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">ID / Name</th>
                  <th className="pb-2">Issue</th>
                  <th className="pb-2">Recommended fix</th>
                  <th className="pb-2">Impact</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const interactive = Boolean(onSelectGap);
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        tableRowClass(),
                        interactive && "cursor-pointer hover:bg-slate-50 focus-within:bg-slate-50",
                      )}
                      onClick={interactive ? () => onSelectGap?.(row) : undefined}
                    >
                      <td className="py-2 capitalize text-slate-700">{row.type.replaceAll("_", " ")}</td>
                      <td className="py-2">
                        {interactive ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectGap?.(row);
                            }}
                            className="rounded text-left font-medium text-slate-800 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                            aria-label={`Open gap details for ${row.objectId}`}
                          >
                            {row.objectId}
                          </button>
                        ) : (
                          <span className="font-medium text-slate-800">{row.objectId}</span>
                        )}
                        <p className="text-xs text-slate-500">{row.objectName}</p>
                      </td>
                      <td className="py-2 text-slate-700">{row.issue}</td>
                      <td className="max-w-[220px] py-2 text-slate-600" title={deriveRecommendedFix(row).text}>
                        <span className="line-clamp-2 text-xs">{deriveRecommendedFix(row).text}</span>
                      </td>
                      <td className="py-2">
                        <StatusBadge {...impactBadgeMap[row.impact]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CardShell>
  );
}
