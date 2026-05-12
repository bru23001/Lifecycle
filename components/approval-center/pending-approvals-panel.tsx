"use client";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { approvalPriorityBadgeMap } from "@/lib/approval-status";
import type { ApprovalHistoryEvent, ApprovalQueueTab, PendingApproval } from "@/types/approval-center.types";
import { Badge } from "@/components/approval-center/approval-center-shared";
import { QUEUE_TABS } from "@/components/approval-center/approval-center-ui.types";
import type { QueueFilters } from "@/components/approval-center/approval-center-ui.types";

type PendingApprovalsPanelProps = {
  queueTab: ApprovalQueueTab;
  queueRows: PendingApproval[];
  selectedApprovalId: string;
  filters: QueueFilters;
  isLoading: boolean;
  mergedHistoryEvents: ApprovalHistoryEvent[];
  onQueueTabChange: (tab: ApprovalQueueTab) => void;
  onFilterChange: (next: QueueFilters) => void;
  onSelectApproval: (approvalId: string) => void;
  onClearFilters: () => void;
};

export function PendingApprovalsPanel({
  queueTab,
  queueRows,
  selectedApprovalId,
  filters,
  isLoading,
  mergedHistoryEvents,
  onQueueTabChange,
  onFilterChange,
  onSelectApproval,
  onClearFilters,
}: PendingApprovalsPanelProps) {
  return (
    <section
      data-pane="queue"
      className="pending-approvals-panel min-w-0 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm flex h-full min-h-0 flex-col overflow-hidden"
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111827]">Pending Approvals</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {queueTab === "history" ? mergedHistoryEvents.length : queueRows.length}
            </span>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Filter approvals">
            <Filter className="size-4" aria-hidden />
          </Button>
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
        <>
          <div className="relative">
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

          <div className="grid grid-cols-2 gap-1.5">
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px]"
              value={filters.type}
              onChange={(event) => onFilterChange({ ...filters, type: event.target.value as QueueFilters["type"] })}
              aria-label="Filter by approval type"
            >
              <option value="all">All Types</option>
              <option value="gate_review">Gate Review</option>
              <option value="artifact_review">Artifact Review</option>
              <option value="phase_approval">Phase Approval</option>
              <option value="exception_approval">Exception Approval</option>
              <option value="funding_approval">Funding Approval</option>
            </select>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px]"
              value={filters.status}
              onChange={(event) => onFilterChange({ ...filters, status: event.target.value as QueueFilters["status"] })}
              aria-label="Filter by approval status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="overdue">Overdue</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px]"
              value={filters.priority}
              onChange={(event) => onFilterChange({ ...filters, priority: event.target.value as QueueFilters["priority"] })}
              aria-label="Filter by approval priority"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px]"
              value={filters.sort}
              onChange={(event) => onFilterChange({ ...filters, sort: event.target.value as QueueFilters["sort"] })}
              aria-label="Sort approvals"
            >
              <option value="due">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="submitted">Sort: Submitted</option>
              <option value="project">Sort: Project</option>
            </select>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-500">Consolidated timeline from all approval packages below.</p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
                <li key={ev.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm">
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {ev.actorName}
                    {ev.actorRole ? ` · ${ev.actorRole}` : ""} · {ev.timestampLabel}
                  </p>
                  {ev.description ? <p className="mt-2 text-slate-600">{ev.description}</p> : null}
                  <span className="mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {ev.eventType.replaceAll("_", " ")}
                  </span>
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
              return (
                <li key={row.id}>
                  <div
                    role="option"
                    tabIndex={0}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400",
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
    </section>
  );
}
