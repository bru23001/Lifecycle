"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  EvidenceApprovalStatus,
  GateTraceStatus,
  TraceabilityGapObjectKind,
  TraceabilityLinkTypeKey,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

type FilterState = TraceabilityMatrixData["filters"];

const LINK_TYPE_OPTIONS: { id: TraceabilityLinkTypeKey; label: string }[] = [
  { id: "phase_artifact", label: "Phase → Artifact" },
  { id: "requirement_design", label: "Requirement → Design" },
  { id: "requirement_test", label: "Requirement → Test" },
  { id: "gate_evidence", label: "Gate → Evidence" },
  { id: "artifact_evidence", label: "Artifact → Evidence" },
  { id: "gate_decision_record", label: "Gate → Decision Record" },
];

const OBJECT_KIND_OPTIONS: { id: TraceabilityGapObjectKind; label: string }[] = [
  { id: "phase", label: "Phase" },
  { id: "artifact", label: "Artifact" },
  { id: "requirement", label: "Requirement" },
  { id: "design", label: "Design" },
  { id: "test", label: "Test" },
  { id: "gate", label: "Gate" },
  { id: "evidence", label: "Evidence" },
];

const COVERAGE_OPTIONS: { id: NonNullable<FilterState["status"]>; label: string }[] = [
  { id: "all", label: "All" },
  { id: "complete", label: "Complete" },
  { id: "partial", label: "Partial" },
  { id: "missing", label: "Missing" },
  { id: "orphaned", label: "Orphaned" },
];

const IMPACT_OPTIONS = [
  { id: "critical" as const, label: "Critical" },
  { id: "high" as const, label: "High" },
  { id: "medium" as const, label: "Medium" },
  { id: "low" as const, label: "Low" },
];

const GATE_STATUS_OPTIONS: { id: GateTraceStatus; label: string }[] = [
  { id: "not_reached", label: "Not reached" },
  { id: "not_submitted", label: "Not submitted" },
  { id: "pending_decision", label: "Pending decision" },
  { id: "approved", label: "Approved" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "rejected", label: "Rejected" },
];

const EVIDENCE_STATUS_OPTIONS: { id: EvidenceApprovalStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "changes_requested", label: "Changes requested" },
];

function toggleInList<T extends string>(list: T[] | undefined, id: T, checked: boolean): T[] {
  const cur = list ?? [];
  if (checked) return cur.includes(id) ? cur : [...cur, id];
  return cur.filter((x) => x !== id);
}

function advancedDraftFromFilters(f: FilterState): AdvancedDraft {
  return {
    linkTypes: f.linkTypes ?? [],
    objectTypes: f.objectTypes ?? [],
    impactLevels: f.impactLevels ?? [],
    ownerAssigneeContains: f.ownerAssigneeContains ?? "",
    updatedFrom: f.updatedFrom ?? "",
    updatedTo: f.updatedTo ?? "",
    gateStatuses: f.gateStatuses ?? [],
    evidenceStatuses: f.evidenceStatuses ?? [],
    status: f.status ?? "all",
  };
}

export type AdvancedDraft = {
  linkTypes: TraceabilityLinkTypeKey[];
  objectTypes: TraceabilityGapObjectKind[];
  impactLevels: Array<"low" | "medium" | "high" | "critical">;
  ownerAssigneeContains: string;
  updatedFrom: string;
  updatedTo: string;
  gateStatuses: GateTraceStatus[];
  evidenceStatuses: EvidenceApprovalStatus[];
  status: NonNullable<FilterState["status"]>;
};

const EMPTY_DRAFT: AdvancedDraft = {
  linkTypes: [],
  objectTypes: [],
  impactLevels: [],
  ownerAssigneeContains: "",
  updatedFrom: "",
  updatedTo: "",
  gateStatuses: [],
  evidenceStatuses: [],
  status: "all",
};

export function TraceabilityAdvancedFiltersDrawer({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean;
  filters: FilterState;
  onClose: () => void;
  onApply: (patch: Partial<FilterState>) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const [draft, setDraft] = useState<AdvancedDraft>(() => advancedDraftFromFilters(filters));

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) {
        setDraft(advancedDraftFromFilters(filters));
      }
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open, filters]);

  const handleReset = () => {
    setDraft(EMPTY_DRAFT);
  };

  const handleApply = () => {
    onApply({
      linkTypes: draft.linkTypes.length > 0 ? draft.linkTypes : undefined,
      objectTypes: draft.objectTypes.length > 0 ? draft.objectTypes : undefined,
      impactLevels: draft.impactLevels.length > 0 ? draft.impactLevels : undefined,
      ownerAssigneeContains: draft.ownerAssigneeContains.trim() || undefined,
      updatedFrom: draft.updatedFrom.trim() || undefined,
      updatedTo: draft.updatedTo.trim() || undefined,
      gateStatuses: draft.gateStatuses.length > 0 ? draft.gateStatuses : undefined,
      evidenceStatuses: draft.evidenceStatuses.length > 0 ? draft.evidenceStatuses : undefined,
      status: draft.status,
      objectType: "all",
    });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,480px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="traceability-advanced-filters-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Filters</p>
            <h2 id="traceability-advanced-filters-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Advanced traceability filters
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close advanced filters"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5 text-sm">
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Object type (gaps)</legend>
            <div className="flex flex-wrap gap-2">
              {OBJECT_KIND_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.objectTypes.includes(opt.id)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        objectTypes: toggleInList(d.objectTypes, opt.id, e.target.checked),
                      }))
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link type</legend>
            <p className="text-xs text-slate-500">Leave empty to show every link family.</p>
            <div className="flex flex-col gap-1.5">
              {LINK_TYPE_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-slate-800">
                  <input
                    type="checkbox"
                    checked={draft.linkTypes.includes(opt.id)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        linkTypes: toggleInList(d.linkTypes, opt.id, e.target.checked),
                      }))
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coverage state</legend>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              value={draft.status}
              onChange={(e) =>
                setDraft((d) => ({ ...d, status: e.target.value as NonNullable<FilterState["status"]> }))
              }
            >
              {COVERAGE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Impact level (gaps)</legend>
            <div className="flex flex-wrap gap-2">
              {IMPACT_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.impactLevels.includes(opt.id)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        impactLevels: toggleInList(d.impactLevels, opt.id, e.target.checked),
                      }))
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Owner / assignee (gaps)</span>
            <input
              type="search"
              value={draft.ownerAssigneeContains}
              onChange={(e) => setDraft((d) => ({ ...d, ownerAssigneeContains: e.target.value }))}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              placeholder="Match object id, name, or issue text"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last updated (artifact & evidence rows)</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                From
                <input
                  type="date"
                  value={draft.updatedFrom}
                  onChange={(e) => setDraft((d) => ({ ...d, updatedFrom: e.target.value }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                To
                <input
                  type="date"
                  value={draft.updatedTo}
                  onChange={(e) => setDraft((d) => ({ ...d, updatedTo: e.target.value }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gate status (gate → evidence)</legend>
            <div className="flex flex-col gap-1.5">
              {GATE_STATUS_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-slate-800">
                  <input
                    type="checkbox"
                    checked={draft.gateStatuses.includes(opt.id)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        gateStatuses: toggleInList(d.gateStatuses, opt.id, e.target.checked),
                      }))
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence status (decision records)</legend>
            <div className="flex flex-wrap gap-2">
              {EVIDENCE_STATUS_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.evidenceStatuses.includes(opt.id)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        evidenceStatuses: toggleInList(d.evidenceStatuses, opt.id, e.target.checked),
                      }))
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-border dark:bg-muted/30">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
