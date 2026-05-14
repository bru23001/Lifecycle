"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { linkEvidenceToGate } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { ALL_GATES } from "@/lib/server/helpers";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LinkEvidenceGateModal({
  open,
  projectId,
  evidenceId,
  onClose,
}: {
  open: boolean;
  projectId: string;
  evidenceId: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [gateCode, setGateCode] = useState("G1");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      setGateCode("G1");
      setRationale("");
      setError(null);
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const submit = () => {
    const r = rationale.trim();
    if (r.length < 1) {
      setError("Rationale is required.");
      return;
    }
    startTransition(async () => {
      const res = await linkEvidenceToGate({ projectId, evidenceId, gateCode, rationale: r });
      if (res.ok) {
        onClose();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,480px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="link-gate-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <h2 id="link-gate-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Link evidence to gate
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm">
          {error ? <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">{error}</p> : null}
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Gate</span>
            <select className={cn(inputClass, "mt-1")} value={gateCode} onChange={(e) => setGateCode(e.target.value)}>
              {ALL_GATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Rationale</span>
            <textarea
              className={cn(inputClass, "mt-1 min-h-[88px]")}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why this evidence belongs to the selected gate…"
              maxLength={2000}
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={pending} onClick={submit}>
            {pending ? "Saving…" : "Link gate"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
