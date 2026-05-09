"use client";

import Link from "next/link";
import { Funnel, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { artifactStatusBadgeMap } from "@/lib/artifact-status";
import type { ArtifactListItem } from "@/types/artifact-library.types";
import { cn } from "@/lib/utils";

import { StatusBadge } from "./status-badge";

export function ArtifactListPanel({
  projectId,
  selectedArtifactId,
  search,
  onSearchChange,
  phaseFilter,
  onPhaseFilterChange,
  statusFilter,
  onStatusFilterChange,
  items,
}: {
  projectId: string;
  selectedArtifactId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  phaseFilter: string;
  onPhaseFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  items: ArtifactListItem[];
}) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#111827] dark:text-foreground">
          Artifact List
        </h2>
        <Link
          href={`/projects/${projectId}/templates/a-3-2`}
          className={cn(buttonVariants({ size: "sm" }), "bg-[#2563eb] text-white hover:bg-blue-700")}
        >
          <Plus className="size-3.5" aria-hidden />
          New Artifact
        </Link>
      </header>

      <div className="space-y-3">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search artifacts..."
          className="h-9 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:bg-background"
          aria-label="Search artifacts"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={phaseFilter}
            onChange={(e) => onPhaseFilterChange(e.target.value)}
            className="h-9 rounded-lg border border-[#e5e7eb] px-2 text-xs outline-none dark:border-border dark:bg-background"
            aria-label="Phase filter"
          >
            <option value="all">All phases</option>
            <option value="2">Phase 2</option>
            <option value="3">Phase 3</option>
            <option value="4">Phase 4</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-9 rounded-lg border border-[#e5e7eb] px-2 text-xs outline-none dark:border-border dark:bg-background"
            aria-label="Status filter"
          >
            <option value="all">All status</option>
            <option value="in_progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="draft">Draft</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-[#64748b] dark:text-muted-foreground">
          <span>Showing {items.length} artifacts</span>
          <span className="inline-flex items-center gap-1">
            <Funnel className="size-3.5" aria-hidden />
            Last updated
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e5e7eb] p-4 text-sm text-[#64748b] dark:border-border dark:text-muted-foreground">
            No artifacts have been created for this project.
          </div>
        ) : (
          <ul
            role="listbox"
            aria-label="Artifact list"
            className="max-h-[calc(100vh-320px)] space-y-2 overflow-y-auto pr-1"
          >
            {items.map((item) => {
              const status = artifactStatusBadgeMap[item.status];
              const selected = item.id === selectedArtifactId;
              return (
                <li key={item.id} role="option" aria-selected={selected}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-xl border p-3 transition",
                      selected
                        ? "border-[#2563eb] bg-[#eff6ff] dark:border-blue-700 dark:bg-blue-950/30"
                        : "border-[#e5e7eb] hover:border-[#2563eb]/40 dark:border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#111827] dark:text-foreground">
                        {item.artifactCode} {item.name}
                      </p>
                      <StatusBadge label={status.label} tone={status.tone} />
                    </div>
                    <p className="mt-1 text-xs text-[#64748b] dark:text-muted-foreground">
                      Phase {item.phaseNumber} • {item.phaseName}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-[#64748b] dark:text-muted-foreground">
                      <span>{item.lastUpdatedLabel}</span>
                      <span>{item.version}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-2 text-xs text-[#64748b] dark:border-border dark:text-muted-foreground">
          <span>Page 1 of 3</span>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded border px-2 py-1 hover:bg-muted">
              1
            </button>
            <button type="button" className="rounded border px-2 py-1 hover:bg-muted">
              2
            </button>
            <button type="button" className="rounded border px-2 py-1 hover:bg-muted">
              3
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
