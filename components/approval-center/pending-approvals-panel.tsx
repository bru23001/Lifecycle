"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { approvalPriorityBadgeMap } from "@/lib/approval-status";
import type { ApprovalHistoryEvent, ApprovalQueueTab, PendingApproval } from "@/types/approval-center.types";
import { Badge } from "@/components/approval-center/approval-center-shared";
import { APPROVAL_SORT_OPTIONS, QUEUE_TABS } from "@/components/approval-center/approval-center-ui.types";
import type { QueueFilters } from "@/components/approval-center/approval-center-ui.types";
import { ApprovalFiltersDrawer } from "@/components/approval-center/approval-filters-drawer";

type PendingApprovalsPanelProps = {
  queueTab: ApprovalQueueTab;
  queueRows: PendingApproval[];
  unfilteredTabRows: PendingApproval[];
  selectedApprovalId: string;
  filters: QueueFilters;
  isLoading: boolean;
  mergedHistoryEvents: ApprovalHistoryEvent[];
  /** Deep link to full history for the currently selected approval (history tab). */
  fullHistoryHref?: string;
  onQueueTabChange: (tab: ApprovalQueueTab) => void;
  onFilterChange: (next: QueueFilters) => void;
  onSelectApproval: (approvalId: string) => void;
  onClearFilters: () => void;
  onHistoryEventClick: (event: ApprovalHistoryEvent) => void;
  /** When true, queue rows show bulk checkboxes (non-history tabs). */
  bulkSelectEnabled?: boolean;
  bulkSelectedIds?: ReadonlySet<string>;
  onToggleBulkSelect?: (approvalId: string) => void;
  onSelectAllBulkVisible?: () => void;
};

function queueFiltersActive(f: QueueFilters): boolean {
  return (
    f.type !== "all" ||
    f.status !== "all" ||
    f.priority !== "all" ||
    f.projectId !== "all" ||
    f.phase !== "all" ||
    f.gate !== "all" ||
    f.submitterContains.trim() !== "" ||
    f.approverContains.trim() !== "" ||
    f.dueFrom.trim() !== "" ||
    f.dueTo.trim() !== "" ||
    f.overdueOnly ||
    f.blockedOnly ||
    f.search.trim() !== ""
  );
}

export function PendingApprovalsPanel({
  queueTab,
  queueRows,
  unfilteredTabRows,
  selectedApprovalId,
  filters,
  isLoading,
  mergedHistoryEvents,
  fullHistoryHref,
  onQueueTabChange,
  onFilterChange,
  onSelectApproval,
  onClearFilters,
  onHistoryEventClick,
  bulkSelectEnabled = false,
  bulkSelectedIds,
  onToggleBulkSelect,
  onSelectAllBulkVisible,
}: PendingApprovalsPanelProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const filtersActive = queueFiltersActive(filters);
  const sortLabel = APPROVAL_SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? "Sort";

  return (
    <section
      data-pane="queue"
      className="pending-approvals-panel min-w-0 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm flex h-full min-h-0 flex-col overflow-hidden"
    >
      <ApprovalFiltersDrawer
        open={filtersOpen}
        filters={filters}
        tabRows={unfilteredTabRows}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => onFilterChange(next)}
        onReset={onClearFilters}
      />

      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="truncate text-base font-semibold text-[#111827]">Pending Approvals</h2>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {queueTab === "history" ? mergedHistoryEvents.length : queueRows.length}
            </span>
            {bulkSelectEnabled && queueRows.length > 0 ? (
              <button
                type="button"
                className="shrink-0 text-[11px] font-semibold text-[#2563eb] hover:underline"
                onClick={() => onSelectAllBulkVisible?.()}
              >
                Select all
              </button>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortMenuOpen((o) => !o)}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-expanded={sortMenuOpen}
                aria-haspopup="listbox"
                aria-label="Sort approvals"
              >
                {sortLabel}
                <ChevronDown className="size-3.5 opacity-70" aria-hidden />
              </button>
              {sortMenuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default bg-transparent"
                    aria-label="Dismiss sort menu"
                    onClick={() => setSortMenuOpen(false)}
                  />
                  <ul
                    role="listbox"
                    aria-label="Sort by"
                    className="absolute right-0 z-20 mt-1 max-h-64 min-w-[11rem] overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
                  >
                    {APPROVAL_SORT_OPTIONS.map((opt) => {
                      const active = filters.sort === opt.value;
                      return (
                        <li key={opt.value}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className={cn(
                              "flex w-full px-3 py-2 text-left text-[13px] outline-none hover:bg-slate-50 focus-visible:bg-slate-50",
                              active ? "bg-blue-50 font-semibold text-blue-900" : "text-slate-800",
                            )}
                            onClick={() => {
                              onFilterChange({ ...filters, sort: opt.value });
                              setSortMenuOpen(false);
                            }}
                          >
                            {opt.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Open approval filters"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(true)}
              className={cn(filtersActive && "ring-2 ring-blue-400 ring-offset-1")}
            >
              <Filter className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
        <div role="tablist" aria-label="Approval queues" className="flex flex-wrap gap-1.5">
          {QUEUE_TABS.map((tab) => {
            const active = queueTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400",
                  active ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
                onClick={() => onQueueTabChange(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {queueTab !== "history" ? (
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange({ ...filters, search: event.target.value })}
            placeholder="Search approvals..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search approvals"
          />
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Consolidated timeline from all approval packages below.</p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 mt-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : queueTab === "history" ? (
          mergedHistoryEvents.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>No history events recorded yet.</p>
            </div>
          ) : (
            <ul className="space-y-2" aria-label="Approval history timeline">
              {mergedHistoryEvents.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm shadow-sm outline-none transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-blue-400"
                    onClick={() => onHistoryEventClick(ev)}
                  >
                    <p className="font-semibold text-slate-800">{ev.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {ev.actorName}
                      {ev.actorRole ? ` · ${ev.actorRole}` : ""} · {ev.timestampLabel}
                    </p>
                    {ev.description ? <p className="mt-2 text-slate-600">{ev.description}</p> : null}
                    <span className="mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      {ev.eventType.replaceAll("_", " ")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : queueRows.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>No approvals in this queue match your filters.</p>
            <button type="button" className="mt-2 inline-block font-semibold text-[#2563eb] hover:underline" onClick={onClearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="space-y-2" role="listbox" aria-label="Approval queue">
            {queueRows.map((row) => {
              const selected = row.id === selectedApprovalId;
              const bulkOn = bulkSelectEnabled && bulkSelectedIds && onToggleBulkSelect;
              const isBulkChecked = bulkOn ? bulkSelectedIds.has(row.id) : false;
              return (
                <li key={row.id} className="flex gap-1.5">
                  {bulkOn ? (
                    <label className="flex shrink-0 cursor-pointer items-start pt-3">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-slate-300"
                        checked={isBulkChecked}
                        onChange={() => onToggleBulkSelect(row.id)}
                        aria-label={`Select ${row.title} for bulk actions`}
                      />
                    </label>
                  ) : null}
                  <div
                    role="option"
                    tabIndex={0}
                    className={cn(
                      "min-w-0 flex-1 rounded-xl border px-3 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400",
                      selected ? "border-blue-300 bg-blue-50 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]" : "border-slate-200 bg-white hover:bg-slate-50",
                    )}
                    aria-selected={selected}
                    onClick={() => onSelectApproval(row.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectApproval(row.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0f172a]">{row.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {row.approvalType.replaceAll("_", " ")} • {row.projectName}
                        </p>
                      </div>
                      {row.dueDateLabel ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          {row.dueDateLabel}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">Submitted {row.submittedOnLabel}</p>
                      <Badge {...approvalPriorityBadgeMap[row.priority]} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {queueTab !== "history" ? (
        <footer className="mt-2 shrink-0 border-t border-slate-100 pt-2">
          <Link
            href="/approvals"
            className="block w-full rounded-lg py-2 text-center text-[13px] font-semibold text-[#2563eb] hover:bg-blue-50/80 hover:underline"
          >
            View all approvals
          </Link>
        </footer>
      ) : fullHistoryHref ? (
        <footer className="mt-2 shrink-0 border-t border-slate-100 pt-2">
          <Link
            href={fullHistoryHref}
            className="block w-full rounded-lg py-2 text-center text-[13px] font-semibold text-[#2563eb] hover:bg-blue-50/80 hover:underline"
          >
            View full history
          </Link>
        </footer>
      ) : null}
    </section>
  );
}
