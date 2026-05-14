"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildAuditTrailExportUrl } from "@/lib/audit-trail-export-url";
import { humanizeAction } from "@/lib/audit-event-details";
import { cn } from "@/lib/utils";
import type { ProjectScreenAuditEntry } from "@/types/projects.types";

type ExportFormat = "csv" | "json" | "pdf";

type Props = {
  open: boolean;
  projectId: string;
  projectCode: string;
  entries: ProjectScreenAuditEntry[];
  onClose: () => void;
};

/**
 * "Export Audit Trail" modal (`projects-list-new-screens.md` §8).
 *
 * UI-only — server validation + side-effects live in
 * `app/api/projects/[id]/audit/export/route.ts`. Submission opens the
 * generated URL in the current tab so the browser handles the download via
 * the `Content-Disposition: attachment` response header.
 */
export function ExportAuditTrailModal({
  open,
  projectId,
  projectCode,
  entries,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [actions, setActions] = useState<Set<string>>(new Set());
  const [actorIds, setActorIds] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<ExportFormat>("csv");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setFrom("");
    setTo("");
    setActions(new Set());
    setActorIds(new Set());
    setFormat("csv");
  }, [open]);

  const actionOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of entries) {
      if (seen.has(e.action)) continue;
      seen.add(e.action);
      out.push(e.action);
    }
    return out.sort();
  }, [entries]);

  // Actor options keyed by the value we'll send to the server. `actorId` is
  // not surfaced on `ProjectScreenAuditEntry` (rows are pre-rendered), so we
  // fall back to the actor label and let the user filter by label.
  // For the server-side filter we use the same label; the route still
  // restricts by `projectId` so this remains a project-scoped filter.
  const actorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of entries) {
      const label = e.actorLabel ?? "System";
      if (!seen.has(label)) seen.set(label, label);
    }
    return Array.from(seen.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [entries]);

  const validDateRange = useMemo(() => {
    if (!from || !to) return true;
    return new Date(from).getTime() <= new Date(to).getTime();
  }, [from, to]);

  const url = useMemo(
    () =>
      buildAuditTrailExportUrl({
        projectId,
        from: from || null,
        to: to || null,
        actions: actions.size > 0 ? Array.from(actions) : null,
        actorIds: actorIds.size > 0 ? Array.from(actorIds) : null,
        format,
      }),
    [projectId, from, to, actions, actorIds, format],
  );

  function handleExport() {
    if (!validDateRange) return;
    onClose();
    if (typeof window !== "undefined") {
      window.location.assign(url);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,600px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="export-audit-trail-modal-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Audit Trail · {projectCode}
            </p>
            <h2
              id="export-audit-trail-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              Export Audit Trail
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Exporting an audit trail is itself recorded as an audit event.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 text-sm">
          <Section title="Date range">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex w-full flex-col gap-1 text-xs text-slate-600">
                From
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="flex w-full flex-col gap-1 text-xs text-slate-600">
                To
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
            </div>
            {!validDateRange ? (
              <p className="mt-1 text-xs text-red-700">From date must be on or before To date.</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Leave blank to include the full history.</p>
            )}
          </Section>

          <Section title="Event type filter">
            <FilterChipList
              options={actionOptions.map((a) => ({ id: a, label: humanizeAction(a) }))}
              selected={actions}
              onToggle={(id) =>
                setActions((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
              emptyLabel="No event types available"
            />
          </Section>

          <Section title="Actor filter">
            <FilterChipList
              options={actorOptions}
              selected={actorIds}
              onToggle={(id) =>
                setActorIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
              emptyLabel="No actors available"
            />
          </Section>

          <Section title="Format">
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">Export format</legend>
              {(["csv", "json", "pdf"] as const).map((f) => (
                <label
                  key={f}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1 text-sm",
                    format === f
                      ? "border-blue-300 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="audit-export-format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="size-3"
                  />
                  {f.toUpperCase()}
                </label>
              ))}
            </fieldset>
          </Section>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={handleExport}
            disabled={!validDateRange}
          >
            <Download className="size-4" aria-hidden />
            Export
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function FilterChipList({
  options,
  selected,
  onToggle,
  emptyLabel,
}: {
  options: { id: string; label: string }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  emptyLabel: string;
}) {
  if (options.length === 0) {
    return <p className="text-xs italic text-slate-500">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.has(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium",
              active
                ? "border-blue-300 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
