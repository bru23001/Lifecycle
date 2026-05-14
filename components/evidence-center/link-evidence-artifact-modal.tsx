"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { linkEvidenceToArtifacts } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence, EvidenceLinkableArtifact } from "@/types/evidence-center.types";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const taClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Minimal `{ id, label }` for phase modal artifact dropdowns. */
export type ArtifactPick = { id: string; label: string };

export function LinkEvidenceArtifactModal({
  open,
  evidenceId,
  selectedEvidence,
  linkableArtifacts,
  linkedArtifactIds,
  onClose,
}: {
  open: boolean;
  evidenceId: string;
  selectedEvidence: EvidenceCenterSelectedEvidence;
  linkableArtifacts: EvidenceLinkableArtifact[];
  linkedArtifactIds: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const linkedSet = useMemo(() => new Set(linkedArtifactIds), [linkedArtifactIds]);

  const statusOptions = useMemo(() => {
    const s = new Set<string>();
    for (const a of linkableArtifacts) {
      if (a.status?.trim()) s.add(a.status);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [linkableArtifacts]);

  const filteredArtifacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return linkableArtifacts.filter((a) => {
      if (linkedSet.has(a.id)) return false;
      if (phaseFilter !== "all") {
        const want = Number.parseInt(phaseFilter, 10);
        if (a.phaseNumber !== want) return false;
      }
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      const blob = `${a.label} ${a.templateId} ${a.localId}`.toLowerCase();
      return blob.includes(q);
    });
  }, [linkableArtifacts, linkedSet, phaseFilter, statusFilter, search]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      setSearch("");
      setPhaseFilter("all");
      setStatusFilter("all");
      setSelectedIds(new Set());
      setRationale("");
      setError(null);
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const d = selectedEvidence.detail;
  const phaseLine =
    d.phaseNumber && d.phaseName ? `${d.phaseNumber}. ${d.phaseName}` : d.phaseNumber ? `Phase ${d.phaseNumber}` : "—";
  const gateLine =
    d.gateCode && d.gateName ? `${d.gateCode} — ${d.gateName}` : d.gateCode ? String(d.gateCode) : "—";

  const submit = () => {
    const r = rationale.trim();
    if (selectedIds.size === 0) {
      setError("Select at least one artifact to link.");
      return;
    }
    if (r.length < 1) {
      setError("Rationale is required.");
      return;
    }
    startTransition(async () => {
      const res = await linkEvidenceToArtifacts({
        evidenceId,
        artifactIds: Array.from(selectedIds),
        rationale: r,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.linkedCount === 0) {
        setError("No new links were created. Those artifacts may already be linked.");
        return;
      }
      router.refresh();
      onClose();
    });
  };

  const selectedList = useMemo(
    () => linkableArtifacts.filter((a) => selectedIds.has(a.id)),
    [linkableArtifacts, selectedIds],
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,560px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="link-artifact-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <h2 id="link-artifact-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Link evidence to artifact(s)
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
            <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-500">Phase</dt>
                <dd>{phaseLine}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Gate</dt>
                <dd>{gateLine}</dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-xs font-semibold text-slate-600">Search</span>
              <input
                type="search"
                className={cn(inputClass, "mt-1")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Template, local ID, label…"
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
              <span className="text-xs font-semibold text-slate-600">Status</span>
              <select className={cn(inputClass, "mt-1")} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedList.length > 0 ? (
            <div>
              <span className="text-xs font-semibold text-slate-600">Selected ({selectedList.length})</span>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {selectedList.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-900 hover:bg-blue-100"
                      onClick={() => toggleId(a.id)}
                    >
                      <span className="truncate">{a.label}</span>
                      <span aria-hidden>×</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <span className="text-xs font-semibold text-slate-600">Artifacts</span>
            <p className="mt-0.5 text-xs text-slate-500">Already-linked artifacts are hidden. Select one or more rows to link in one step.</p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 dark:border-border">
              {filteredArtifacts.length === 0 ? (
                <li className="px-3 py-4 text-center text-slate-500">No artifacts match your filters.</li>
              ) : (
                filteredArtifacts.map((a) => (
                  <li key={a.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedIds.has(a.id)}
                        onChange={() => toggleId(a.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-slate-900">{a.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {a.phaseNumber != null ? `Phase ${a.phaseNumber}` : "Phase unknown"} · {a.status}
                        </span>
                      </span>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Rationale (required)</span>
            <textarea
              className={taClass}
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why are you linking this evidence to the selected artifact(s)?"
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
            disabled={pending || selectedIds.size === 0}
            onClick={submit}
          >
            {pending ? "Saving…" : "Save links"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
