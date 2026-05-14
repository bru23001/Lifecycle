"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, X } from "lucide-react";

import { assignGateApprovers } from "@/app/actions/assignGateApprovers";
import { Button } from "@/components/ui/button";
import type { GateId } from "@/lib/gateRules";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

/**
 * Defaults from `cybercube-authz-directives` / Lifecycle governance vocabulary.
 * Surfaced as both the "Role filter" and the "Required approver roles" chips.
 */
const DEFAULT_REQUIRED_ROLES = [
  "Governance",
  "Engineering",
  "Security",
  "Product",
  "Operations",
] as const;

export type AssignableApprover = {
  /** Soft reference to `User.id`; may be empty if the directory entry is role-only. */
  userId?: string | null;
  name: string;
  role: string;
};

type Props = {
  open: boolean;
  projectId: string;
  gateId: GateId;
  gateLabel: string;
  candidates: AssignableApprover[];
  initialSelection: AssignableApprover[];
  initialDueAtIso?: string | null;
  requiredRoles?: readonly string[];
  onClose: () => void;
};

export function AssignApproversModal({
  open,
  projectId,
  gateId,
  gateLabel,
  candidates,
  initialSelection,
  initialDueAtIso,
  requiredRoles = DEFAULT_REQUIRED_ROLES,
  onClose,
}: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AssignableApprover[]>(initialSelection);
  const [dueAt, setDueAt] = useState<string>(toDateInputValue(initialDueAtIso));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setSelected(initialSelection);
      setDueAt(toDateInputValue(initialDueAtIso));
      setQuery("");
      setRoleFilter("all");
      setError(null);
    }
  }, [open, initialSelection, initialDueAtIso]);

  const visibleCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      if (roleFilter !== "all" && c.role !== roleFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
      );
    });
  }, [candidates, query, roleFilter]);

  const selectedIds = useMemo(
    () => new Set(selected.map((s) => keyForApprover(s))),
    [selected],
  );

  const rolesCovered = useMemo(
    () => new Set(selected.map((s) => s.role)),
    [selected],
  );

  function add(approver: AssignableApprover) {
    if (selectedIds.has(keyForApprover(approver))) return;
    setSelected((prev) => [...prev, approver]);
  }

  function remove(approver: AssignableApprover) {
    setSelected((prev) =>
      prev.filter((s) => keyForApprover(s) !== keyForApprover(approver)),
    );
  }

  function handleSave() {
    if (pending) return;
    if (selected.length === 0) {
      setError("Select at least one approver.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await assignGateApprovers({
          projectId,
          gateId,
          approvers: selected.map((s) => ({
            userId: s.userId ?? null,
            name: s.name,
            role: s.role,
          })),
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        router.refresh();
        onClose();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,720px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="assign-approvers-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Assign approvers
            </p>
            <h2
              id="assign-approvers-title"
              className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground"
            >
              {gateId} — {gateLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assign approvers dialog"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[1.2fr_1fr]">
          <div className="flex min-h-0 flex-col overflow-y-auto border-b border-slate-200 px-6 py-4 md:border-b-0 md:border-r dark:border-border">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Approver search
            </p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or role"
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-border dark:bg-background"
                aria-label="Approver search"
              />
            </div>

            <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Role filter
            </p>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-border dark:bg-background"
              aria-label="Filter by role"
            >
              <option value="all">All roles</option>
              {requiredRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Required approver roles
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {requiredRoles.map((r) => (
                <li key={r}>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      rolesCovered.has(r)
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground",
                    )}
                  >
                    {r}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-5 mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Directory ({visibleCandidates.length})
            </p>
            <ul className="space-y-1.5">
              {visibleCandidates.length === 0 ? (
                <li className="text-sm text-slate-500 italic">No matches.</li>
              ) : (
                visibleCandidates.map((c) => {
                  const isSelected = selectedIds.has(keyForApprover(c));
                  return (
                    <li
                      key={keyForApprover(c)}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 dark:border-border"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900 dark:text-foreground">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">{c.role}</p>
                      </div>
                      <Button
                        type="button"
                        variant={isSelected ? "outline" : "default"}
                        size="sm"
                        onClick={() => add(c)}
                        disabled={isSelected}
                      >
                        {isSelected ? "Selected" : "Add"}
                      </Button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="flex min-h-0 flex-col overflow-y-auto px-6 py-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Selected approvers ({selected.length})
            </p>
            {selected.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No approvers selected yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {selected.map((s) => (
                  <li
                    key={keyForApprover(s)}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 dark:border-border"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-foreground">
                        {s.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">{s.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(s)}
                      aria-label={`Remove ${s.name}`}
                      className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-muted"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="mt-5 block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Due date
              </span>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-border dark:bg-background"
              />
            </label>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
              >
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending || selected.length === 0}
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          >
            {pending ? "Saving…" : "Save assignments"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function keyForApprover(a: AssignableApprover): string {
  return a.userId ? `u:${a.userId}` : `nr:${a.name}::${a.role}`;
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
