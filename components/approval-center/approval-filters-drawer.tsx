"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PendingApproval } from "@/types/approval-center.types";
import type { QueueFilters } from "@/components/approval-center/approval-center-ui.types";

/** Mirrors `ALL_GATES` in `lib/server/helpers` for client-safe filter UI. */
const GATE_OPTIONS = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"] as const;

const PHASE_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 1);

function draftFromFilters(f: QueueFilters): QueueFilters {
  return { ...f };
}

export function ApprovalFiltersDrawer({
  open,
  filters,
  tabRows,
  onClose,
  onApply,
  onReset,
}: {
  open: boolean;
  filters: QueueFilters;
  /** Rows in the current queue tab (before search / advanced filters) for project picklist. */
  tabRows: PendingApproval[];
  onClose: () => void;
  onApply: (next: QueueFilters) => void;
  onReset: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const [draft, setDraft] = useState<QueueFilters>(() => draftFromFilters(filters));

  const projectOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of tabRows) {
      if (r.id === "approval-none") continue;
      m.set(r.projectId, r.projectName);
    }
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [tabRows]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) {
        setDraft(draftFromFilters(filters));
      }
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open, filters]);

  const handleApply = () => {
    onApply({
      ...draft,
      search: filters.search,
      sort: filters.sort,
    });
    onClose();
  };

  const handleDrawerReset = () => {
    onReset();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,480px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="approval-filters-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Filters</p>
            <h2 id="approval-filters-drawer-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Approval filters
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Approval type</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as QueueFilters["type"] }))}
            >
              <option value="all">All types</option>
              <option value="gate_review">Gate review</option>
              <option value="artifact_review">Artifact review</option>
              <option value="phase_approval">Phase approval</option>
              <option value="exception_approval">Exception approval</option>
              <option value="funding_approval">Funding approval</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Approval status</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as QueueFilters["status"] }))}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In review</option>
              <option value="overdue">Overdue</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Priority</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={draft.priority}
              onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as QueueFilters["priority"] }))}
            >
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Project</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={draft.projectId}
              onChange={(e) => setDraft((d) => ({ ...d, projectId: e.target.value as QueueFilters["projectId"] }))}
            >
              <option value="all">All projects</option>
              {projectOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Phase</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={draft.phase}
              onChange={(e) => setDraft((d) => ({ ...d, phase: e.target.value as QueueFilters["phase"] }))}
            >
              <option value="all">All phases</option>
              {PHASE_OPTIONS.map((n) => (
                <option key={n} value={String(n)}>
                  Phase {n}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Gate</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={draft.gate}
              onChange={(e) => setDraft((d) => ({ ...d, gate: e.target.value as QueueFilters["gate"] }))}
            >
              <option value="all">All gates</option>
              {GATE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Submitter contains</span>
            <input
              type="text"
              value={draft.submitterContains}
              onChange={(e) => setDraft((d) => ({ ...d, submitterContains: e.target.value }))}
              placeholder="Name or role fragment"
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">Approver contains</span>
            <input
              type="text"
              value={draft.approverContains}
              onChange={(e) => setDraft((d) => ({ ...d, approverContains: e.target.value }))}
              placeholder="Not linked to queue data yet"
              disabled
              className="h-9 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
            />
            <span className="text-[11px] text-slate-500">Approver assignments will filter here when exposed on each row.</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Due from</span>
              <input
                type="date"
                value={draft.dueFrom}
                onChange={(e) => setDraft((d) => ({ ...d, dueFrom: e.target.value }))}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Due to</span>
              <input
                type="date"
                value={draft.dueTo}
                onChange={(e) => setDraft((d) => ({ ...d, dueTo: e.target.value }))}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-border dark:bg-muted/30">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={draft.overdueOnly}
                onChange={(e) => setDraft((d) => ({ ...d, overdueOnly: e.target.checked }))}
                className="size-4 rounded border-slate-300"
              />
              Overdue only
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={draft.blockedOnly}
                onChange={(e) => setDraft((d) => ({ ...d, blockedOnly: e.target.checked }))}
                className="size-4 rounded border-slate-300"
              />
              Blocked only
            </label>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" className="flex-1" onClick={handleDrawerReset}>
            Reset filters
          </Button>
          <Button type="button" className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={handleApply}>
            Apply
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
