"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { linkEvidenceToPhases } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { ALL_GATES } from "@/lib/gate-constants";
import { cn } from "@/lib/utils";
import type { EvidencePhaseLinkOption } from "@/types/evidence-center.types";

import type { ArtifactPick } from "./link-evidence-artifact-modal";

function parsePhaseId(id: string): number | null {
  const m = /^phase-(\d{1,2})$/.exec(id.trim());
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  if (!Number.isFinite(n) || n < 1 || n > 14) return null;
  return n;
}

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LinkEvidencePhaseModal({
  open,
  projectId,
  evidenceId,
  evidenceSummary,
  phaseLinkOptions,
  linkedPhaseIds,
  artifacts,
  onClose,
}: {
  open: boolean;
  projectId: string;
  evidenceId: string;
  evidenceSummary: string;
  phaseLinkOptions: EvidencePhaseLinkOption[];
  linkedPhaseIds: string[];
  artifacts: ArtifactPick[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [gateCode, setGateCode] = useState<string>("");
  const [artifactId, setArtifactId] = useState<string>("");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      const initial = new Set<number>();
      for (const id of linkedPhaseIds) {
        const n = parsePhaseId(id);
        if (n != null) initial.add(n);
      }
      setSelected(initial);
      setGateCode("");
      setArtifactId("");
      setRationale("");
      setError(null);
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, linkedPhaseIds]);

  const togglePhase = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const submit = () => {
    const r = rationale.trim();
    if (r.length < 1) {
      setError("Rationale is required.");
      return;
    }
    const phaseNumbers = [...selected].sort((a, b) => a - b);
    if (phaseNumbers.length < 1) {
      setError("Select at least one lifecycle phase.");
      return;
    }
    const gate = gateCode.trim() === "" ? null : gateCode.trim().toUpperCase();
    const art = artifactId.trim() === "" ? null : artifactId.trim();
    startTransition(async () => {
      const res = await linkEvidenceToPhases({
        projectId,
        evidenceId,
        phaseNumbers,
        gateCode: gate,
        artifactId: art,
        rationale: r,
      });
      if (res.ok) {
        router.refresh();
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
      className="w-[min(100vw-2rem,560px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="link-phase-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div>
            <h2 id="link-phase-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Link evidence to phases
            </h2>
            <p className="mt-1 text-sm text-slate-600">{evidenceSummary}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {error ? <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">{error}</p> : null}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-600">Lifecycle phases (multi-select)</legend>
            <p className="mt-1 text-xs text-slate-500">
              Saving replaces the phase link set for this evidence. Template counts indicate how many workspace templates map to each
              phase.
            </p>
            <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {phaseLinkOptions.map((opt) => {
                const checked = selected.has(opt.phaseNumber);
                return (
                  <li key={opt.phaseNumber}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 shrink-0 rounded border-slate-300"
                        checked={checked}
                        onChange={() => togglePhase(opt.phaseNumber)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-slate-900">
                          Phase {opt.phaseNumber} — {opt.phaseName}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {opt.requiredEvidence > 0
                            ? `${opt.requiredEvidence} template${opt.requiredEvidence === 1 ? "" : "s"}`
                            : "No templates"}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Gate (optional)</span>
            <select className={cn(inputClass, "mt-1")} value={gateCode} onChange={(e) => setGateCode(e.target.value)}>
              <option value="">— None —</option>
              {ALL_GATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Also link artifact (optional)</span>
            <select className={cn(inputClass, "mt-1")} value={artifactId} onChange={(e) => setArtifactId(e.target.value)}>
              <option value="">— None —</option>
              {artifacts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Rationale (required)</span>
            <textarea
              className={cn(inputClass, "mt-1 min-h-[88px]")}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why this evidence is linked to the selected lifecycle phase(s)…"
              maxLength={2000}
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={pending} onClick={submit}>
            {pending ? "Saving…" : "Save links"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
