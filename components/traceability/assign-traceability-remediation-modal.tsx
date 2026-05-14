"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { assignTraceabilityRemediation } from "@/app/actions/assignTraceabilityRemediation";
import { Button } from "@/components/ui/button";
import { getGapTypeLabel } from "@/lib/traceability-gap-details";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";
import type { TraceabilityGap } from "@/types/traceability.types";

export type AssignableTraceUser = {
  id: string;
  name: string | null;
  email: string;
};

type Props = {
  open: boolean;
  gap: TraceabilityGap | null;
  projectId: string;
  assignableUsers: AssignableTraceUser[];
  onClose: () => void;
};

function gapSummaryText(gap: TraceabilityGap): string {
  return `${gap.objectId} · ${gap.objectName}\n${gap.issue}`;
}

export function AssignTraceabilityRemediationModal({
  open,
  gap,
  projectId,
  assignableUsers,
  onClose,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ownerUserId, setOwnerUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && gap) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, gap]);

  useEffect(() => {
    if (!open || !gap) return;
    setError(null);
    setOwnerUserId(assignableUsers[0]?.id ?? "");
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().slice(0, 10));
    setPriority(gap.impact === "high" || gap.impact === "critical" ? "high" : "medium");
    setInstructions("");
  }, [open, gap, assignableUsers]);

  if (!gap) return null;

  const valid = ownerUserId.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dueDate);

  function submit() {
    if (!valid || pending || !gap) return;
    const g = gap;
    setError(null);
    startTransition(async () => {
      try {
        const res = await assignTraceabilityRemediation({
          projectId,
          gapId: g.id,
          gapSummary: gapSummaryText(g),
          ownerUserId,
          dueDate,
          priority,
          instructions: instructions.trim() || undefined,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onClose();
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="assign-trace-remediation-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Traceability</p>
            <h2
              id="assign-trace-remediation-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              Assign remediation owner
            </h2>
            <p className="mt-1 text-xs text-slate-500">{getGapTypeLabel(gap.type)}</p>
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5 text-sm">
          <Field label="Gap summary">
            <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
              {gapSummaryText(gap)}
            </pre>
          </Field>

          <Field label="Owner">
            <select
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              aria-label="Remediation owner"
            >
              {assignableUsers.length === 0 ? (
                <option value="">No users available</option>
              ) : (
                assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {(u.name?.trim() || u.email) + (u.name?.trim() ? ` · ${u.email}` : "")}
                  </option>
                ))
              )}
            </select>
          </Field>

          <Field label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              aria-label="Due date"
            />
          </Field>

          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              aria-label="Priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>

          <Field label="Instructions">
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Optional context for the assignee."
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              aria-label="Instructions"
            />
          </Field>

          {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}
        </div>

        <footer className={cn("flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border")}>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!valid || pending || assignableUsers.length === 0}>
            {pending ? "Assigning…" : "Assign"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
