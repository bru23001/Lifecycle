import Link from "next/link";
import { Search } from "lucide-react";

import type { ArtifactListItem, ArtifactWorkflowStatus } from "@/types/artifact-library.types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In progress" },
];

function statusBadge(status: ArtifactWorkflowStatus): string {
  if (status === "approved") return "bg-emerald-50 text-emerald-800";
  if (status === "draft") return "bg-slate-100 text-slate-700";
  if (status === "in_review") return "bg-amber-50 text-amber-800";
  if (status === "changes_requested") return "bg-rose-50 text-rose-800";
  return "bg-blue-50 text-blue-800";
}

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
  totalArtifactCount,
}: {
  projectId: string;
  selectedArtifactId: string;
  search: string;
  onSearchChange: (v: string) => void;
  phaseFilter: string;
  onPhaseFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  items: ArtifactListItem[];
  totalArtifactCount: number;
}) {
  const phaseNumbers = [...new Set(items.map((i) => i.phaseNumber))].sort((a, b) => a - b);

  return (
    <section className="cc-card-standard flex max-h-[min(70vh,720px)] flex-col overflow-hidden p-0">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Artifact Library</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length} shown · {totalArtifactCount} total
        </p>
        <div className="mt-3 space-y-2">
          <label className="relative block">
            <span className="sr-only">Search artifacts</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by code, name, phase…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-xs outline-none ring-blue-600 focus-visible:ring-2"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <select
              value={phaseFilter}
              onChange={(e) => onPhaseFilterChange(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
              aria-label="Filter by phase"
            >
              <option value="all">All phases</option>
              {phaseNumbers.map((p) => (
                <option key={p} value={String(p)}>
                  Phase {p}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2" data-testid="artifact-library-list">
        {items.length === 0 ? (
          <li className="px-3 py-8 text-center text-sm text-muted-foreground">No artifacts match filters.</li>
        ) : (
          items.map((item) => {
            const active = item.id === selectedArtifactId;
            return (
              <li key={item.id} className="mb-1">
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-lg border px-3 py-2.5 text-left transition",
                    active
                      ? "border-[#2563eb] bg-blue-50/80 shadow-sm dark:bg-blue-950/40"
                      : "border-transparent hover:border-border hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-snug text-foreground">{item.name}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                        statusBadge(item.status),
                      )}
                    >
                      {item.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{item.artifactCode}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Phase {item.phaseNumber} · v{item.version} · {item.lastUpdatedLabel}
                  </p>
                </Link>
              </li>
            );
          })
        )}
      </ul>
      <footer className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
        <Link href={`/projects/${projectId}/workspace`} className="font-medium text-[#2563eb] hover:underline">
          Open lifecycle workspace
        </Link>
      </footer>
    </section>
  );
}
