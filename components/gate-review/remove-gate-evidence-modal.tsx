"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";

import { removeGateEvidence } from "@/app/actions/removeGateEvidence";
import { Button } from "@/components/ui/button";
import type { GateEvidenceItem } from "@/types/gate-review.types";
import { toUserMessage } from "@/lib/toUserMessage";
import type { GateId } from "@/lib/gateRules";

type Mode = "unlink" | "delete";

export function RemoveGateEvidenceModal({
  open,
  onClose,
  projectId,
  gateId,
  item,
  onRemoved,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  gateId: GateId;
  item: GateEvidenceItem | null;
  onRemoved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [mode, setMode] = useState<Mode>("unlink");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && item) {
      if (!node.open) node.showModal();
      setMode("unlink");
      setError(null);
    } else if (node.open) {
      node.close();
    }
  }, [open, item]);

  if (!item) return null;

  function onConfirm() {
    if (!item) return;
    const evidenceId = item.id;
    setError(null);
    startTransition(async () => {
      const res = await removeGateEvidence({
        projectId,
        gateId,
        evidenceId,
        mode,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onRemoved();
      onClose();
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="text-lg font-semibold text-foreground">
        Remove from gate package?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{item.name}</span> is currently linked to{" "}
        <span className="font-mono">{gateId}</span>.
      </p>
      <p className="mt-3 text-sm font-medium text-amber-800 dark:text-amber-200">
        Impact: unlinking removes this item from the gate submission view; deleting removes the evidence record
        entirely (artifact links are removed).
      </p>

      <fieldset className="mt-4 space-y-2 border-0 p-0">
        <legend className="sr-only">Removal mode</legend>
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="radio"
            name="remove-evidence-mode"
            checked={mode === "unlink"}
            onChange={() => setMode("unlink")}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-foreground">Remove link only</span>
            <span className="mt-0.5 block text-muted-foreground">Keep the evidence item in the project catalog.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="radio"
            name="remove-evidence-mode"
            checked={mode === "delete"}
            onChange={() => setMode("delete")}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-foreground">Remove evidence entirely</span>
            <span className="mt-0.5 block text-muted-foreground">Deletes the record; cannot be undone here.</span>
          </span>
        </label>
      </fieldset>

      {error ? (
        <div role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {toUserMessage(error)}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" disabled={pending} onClick={onConfirm}>
          {pending ? "Working…" : "Confirm"}
        </Button>
      </div>
    </dialog>
  );
}
