"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, ListFilter } from "lucide-react";

import {
  parseProjectsListQuery,
  type ParsedProjectsListQuery,
  type ProjectListSortKey,
} from "@/lib/projects-list-query";
import { projectsListHref } from "@/lib/projects-url";
import type { ProjectDetailTab, ProjectStatus } from "@/types/projects.types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<ProjectStatus | ""> = [
  "",
  "In Progress",
  "Blocked",
  "Pending",
  "Not Started",
];

const SORT_OPTIONS: Array<{ id: ProjectListSortKey; label: string }> = [
  { id: "updated", label: "Last updated" },
  { id: "created", label: "Created date" },
  { id: "name", label: "Project name" },
  { id: "progress", label: "Lifecycle progress" },
  { id: "gate", label: "Gate status" },
  { id: "missing", label: "Missing evidence count" },
];

function mergeListQuery(
  base: ParsedProjectsListQuery,
  patch: Partial<ParsedProjectsListQuery>,
): ParsedProjectsListQuery {
  return { ...base, ...patch };
}

export function ProjectListToolbar({
  selectedProjectId,
  selectedTab,
  currentPage,
}: {
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listQuery = useMemo(
    () => parseProjectsListQuery(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const [searchDraft, setSearchDraft] = useState(listQuery.q);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchDraft(listQuery.q);
  }, [listQuery.q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sortRef.current && !sortRef.current.contains(t)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(t)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const navigate = useCallback(
    (next: ParsedProjectsListQuery, page: number) => {
      router.push(
        projectsListHref({
          selectedProjectId: selectedProjectId || undefined,
          selectedTab,
          currentPage: page,
          listFilters: next,
        }),
      );
    },
    [router, selectedProjectId, selectedTab],
  );

  useEffect(() => {
    const trimmed = searchDraft.trim();
    if (trimmed === listQuery.q) return;
    const id = window.setTimeout(() => {
      navigate(mergeListQuery(listQuery, { q: trimmed }), 1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [searchDraft, listQuery, navigate]);

  const [draftFilter, setDraftFilter] = useState({
    status: "" as ProjectStatus | "",
    owner: "",
    phase: "" as string,
    gatePending: false,
    missingOnly: false,
    from: "",
    to: "",
  });

  useEffect(() => {
    setDraftFilter({
      status: listQuery.status,
      owner: listQuery.ownerContains,
      phase: listQuery.phase != null ? String(listQuery.phase) : "",
      gatePending: listQuery.gatePendingOnly,
      missingOnly: listQuery.missingEvidenceOnly,
      from: listQuery.updatedFrom != null ? listQuery.updatedFrom.toISOString().slice(0, 10) : "",
      to:
        listQuery.updatedToExclusive != null
          ? new Date(listQuery.updatedToExclusive.getTime() - 86400000).toISOString().slice(0, 10)
          : "",
    });
  }, [listQuery]);

  return (
    <div className="border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Search projects…"
          className="cc-card-meta min-h-9 flex-1 rounded-md border border-slate-200 bg-[var(--app-bg)] px-3 py-2 text-[11px] text-slate-800 outline-none focus:border-[#2563eb]"
          aria-label="Search projects"
        />
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border text-slate-500 hover:bg-slate-50",
              filterOpen ? "border-[#2563eb] bg-blue-50 text-[#1d4ed8]" : "border-slate-200",
            )}
            aria-expanded={filterOpen}
            aria-label="Filter projects"
          >
            <ListFilter className="size-4" />
          </button>
          {filterOpen ? (
            <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-card">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Filters</p>
              <div className="mt-3 space-y-3">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Status
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px]"
                    value={draftFilter.status}
                    onChange={(e) => setDraftFilter((d) => ({ ...d, status: e.target.value as ProjectStatus | "" }))}
                  >
                    <option value="">Any</option>
                    {STATUS_OPTIONS.filter(Boolean).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Owner contains
                  <input
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]"
                    value={draftFilter.owner}
                    onChange={(e) => setDraftFilter((d) => ({ ...d, owner: e.target.value }))}
                    placeholder="Name substring"
                  />
                </label>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Phase (1–14)
                  <input
                    type="number"
                    min={1}
                    max={14}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]"
                    value={draftFilter.phase}
                    onChange={(e) => setDraftFilter((d) => ({ ...d, phase: e.target.value }))}
                    placeholder="Any"
                  />
                </label>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={draftFilter.gatePending}
                    onChange={(e) => setDraftFilter((d) => ({ ...d, gatePending: e.target.checked }))}
                  />
                  Pending gate approvals
                </label>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={draftFilter.missingOnly}
                    onChange={(e) => setDraftFilter((d) => ({ ...d, missingOnly: e.target.checked }))}
                  />
                  Missing / incomplete evidence
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Updated from
                    <input
                      type="date"
                      className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]"
                      value={draftFilter.from}
                      onChange={(e) => setDraftFilter((d) => ({ ...d, from: e.target.value }))}
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-slate-600">
                    Updated to
                    <input
                      type="date"
                      className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px]"
                      value={draftFilter.to}
                      onChange={(e) => setDraftFilter((d) => ({ ...d, to: e.target.value }))}
                    />
                  </label>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex h-8 items-center rounded-md bg-[#2563eb] px-3 text-[11px] font-semibold text-white"
                  onClick={() => {
                    const phaseNum = draftFilter.phase.trim() ? Number.parseInt(draftFilter.phase, 10) : null;
                    const next = mergeListQuery(listQuery, {
                      status: draftFilter.status,
                      ownerContains: draftFilter.owner.trim(),
                      phase:
                        phaseNum != null && Number.isFinite(phaseNum) && phaseNum >= 1 && phaseNum <= 14
                          ? phaseNum
                          : null,
                      gatePendingOnly: draftFilter.gatePending,
                      missingEvidenceOnly: draftFilter.missingOnly,
                      updatedFrom: draftFilter.from ? new Date(`${draftFilter.from}T00:00:00.000Z`) : null,
                      updatedToExclusive: draftFilter.to
                        ? new Date(new Date(`${draftFilter.to}T00:00:00.000Z`).getTime() + 86400000)
                        : null,
                    });
                    navigate(next, 1);
                    setFilterOpen(false);
                  }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setDraftFilter({
                      status: "",
                      owner: "",
                      phase: "",
                      gatePending: false,
                      missingOnly: false,
                      from: "",
                      to: "",
                    });
                    navigate(
                      mergeListQuery(listQuery, {
                        status: "",
                        ownerContains: "",
                        phase: null,
                        gatePendingOnly: false,
                        missingEvidenceOnly: false,
                        updatedFrom: null,
                        updatedToExclusive: null,
                      }),
                      1,
                    );
                  }}
                >
                  Reset filters
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border text-slate-500 hover:bg-slate-50",
              sortOpen ? "border-[#2563eb] bg-blue-50 text-[#1d4ed8]" : "border-slate-200",
            )}
            aria-expanded={sortOpen}
            aria-label="Sort projects"
          >
            <ArrowUpDown className="size-4" />
          </button>
          {sortOpen ? (
            <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-card">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    "block w-full px-3 py-2 text-left text-[11px] font-medium hover:bg-slate-50",
                    listQuery.sort === opt.id ? "text-[#1d4ed8]" : "text-slate-700",
                  )}
                  onClick={() => {
                    navigate(mergeListQuery(listQuery, { sort: opt.id }), currentPage);
                    setSortOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
