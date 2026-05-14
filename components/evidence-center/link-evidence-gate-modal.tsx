"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { linkEvidenceToGates } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence, EvidenceGateLinkOption } from "@/types/evidence-center.types";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const taClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LinkEvidenceGateModal({
  open,
  projectId,
  evidenceId,
  selectedEvidence,
  gateLinkOptions,
  linkedGateIds,
  onClose,
}: {
  open: boolean;
  projectId: string;
  evidenceId: string;
  selectedEvidence: EvidenceCenterSelectedEvidence;
  gateLinkOptions: EvidenceGateLinkOption[];
  linkedGateIds: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [ruleStatusFilter, setRuleStatusFilter] = useState<string>("all");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(() => new Set());
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const linkedSet = useMemo(() => new Set(linkedGateIds.map((c) => c.toUpperCase())), [linkedGateIds]);

  const ruleStatusValues = useMemo(() => {
    const s = new Set<string>();
    for (const g of gateLinkOptions) {
      if (g.ruleStatus?.trim()) s.add(g.ruleStatus);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [gateLinkOptions]);

  const filteredGates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gateLinkOptions.filter((g) => {
      if (linkedSet.has(g.gateCode.toUpperCase())) return false;
      if (phaseFilter !== "all") {
        const want = Number.parseInt(phaseFilter, 10);
        if (g.phaseNumber !== want) return false;
      }
      if (ruleStatusFilter !== "all" && g.ruleStatus !== ruleStatusFilter) return false;
      if (!q) return true;
      const blob = `${g.gateCode} ${g.gateName}`.toLowerCase();
      return blob.includes(q);
    });
  }, [gateLinkOptions, linkedSet, phaseFilter, ruleStatusFilter, search]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      setSearch("");
      setPhaseFilter("all");
      setRuleStatusFilter("all");
      setSelectedCodes(new Set());
      setRationale("");
      setError(null);
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const toggleCode = (code: string) => {
    const up = code.toUpperCase();
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(up)) next.delete(up);
      else next.add(up);
      return next;
    });
  };

  const d = selectedEvidence.detail;
  const phaseLine =
    d.phaseNumber && d.phaseName ? `${d.phaseNumber}. ${d.phaseName}` : d.phaseNumber ? `Phase ${d.phaseNumber}` : "—";

  const selectedList = useMemo(
    () => gateLinkOptions.filter((g) => selectedCodes.has(g.gateCode.toUpperCase())),
    [gateLinkOptions, selectedCodes],
  );

  const submit = () => {
    const r = rationale.trim();
    if (selectedCodes.size === 0) {
      setError("Select at least one gate to link.");
      return;
    }
    if (r.length < 1) {
      setError("Rationale is required.");
      return;
    }
    startTransition(async () => {
      const res = await linkEvidenceToGates({
        projectId,
        evidenceId,
        gateCodes: Array.from(selectedCodes),
        rationale: r,
        syncPrimaryWorkspace: false,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.linkedCount === 0) {
        setError("No new gate links were created. Those gates may already be linked.");
        return;
      }
      router.refresh();
      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,560px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="link-gate-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <h2 id="link-gate-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Link evidence to gate(s)
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="max-h-[min(70vh,640px)] space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {error ? <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">{error}</p> : null}

          <section className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-border dark:bg-muted/30">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence</h3>
            <p className="mt-1 font-medium text-slate-900 dark:text-foreground">
              {d.evidenceCode} · {d.name}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              <span className="font-medium text-slate-500">Workspace phase</span> · {phaseLine}
            </p>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-xs font-semibold text-slate-600">Search</span>
              <input
                type="search"
                className={cn(inputClass, "mt-1")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Gate code or name…"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Phase</span>
              <select className={cn(inputClass, "mt-1")} value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)}>
                <option value="all">All phases</option>
                {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    Phase {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Rule status</span>
              <select
                className={cn(inputClass, "mt-1")}
                value={ruleStatusFilter}
                onChange={(e) => setRuleStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {ruleStatusValues.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedList.length > 0 ? (
            <div>
              <span className="text-xs font-semibold text-slate-600">Selected gates ({selectedList.length})</span>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {selectedList.map((g) => (
                  <li key={g.gateCode}>
                    <button
                      type="button"
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-900 hover:bg-blue-100"
                      onClick={() => toggleCode(g.gateCode)}
                    >
                      <span className="truncate">
                        {g.gateCode} — {g.gateName}
                      </span>
                      <span aria-hidden>×</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <span className="text-xs font-semibold text-slate-600">Gates</span>
            <p className="mt-0.5 text-xs text-slate-500">
              Already-linked gates are hidden. Links are stored in addition to the workspace phase; they do not move the item to another
              phase unless you use &quot;Link to phase&quot;.
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 dark:border-border">
              {filteredGates.length === 0 ? (
                <li className="px-3 py-4 text-center text-slate-500">No gates match your filters.</li>
              ) : (
                filteredGates.map((g) => (
                  <li key={g.gateCode}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedCodes.has(g.gateCode.toUpperCase())}
                        onChange={() => toggleCode(g.gateCode)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-slate-900">
                          {g.gateCode} — {g.gateName}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Phase {g.phaseNumber}</span>
                          <span>·</span>
                          <span>Rule: {g.ruleStatus}</span>
                          {g.requiredEvidence > 0 ? (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900">
                              Required evidence: {g.requiredEvidence}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Link rationale (required)</span>
            <textarea
              className={taClass}
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why are you linking this evidence to the selected gate(s)?"
              maxLength={2000}
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            disabled={pending || selectedCodes.size === 0}
            onClick={submit}
          >
            {pending ? "Saving…" : "Save links"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
