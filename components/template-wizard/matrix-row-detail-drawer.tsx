"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getRowValidation } from "@/lib/score-matrix-ops";
import { cn } from "@/lib/utils";
import type { WizardScoreMatrix } from "@/types/template-wizard.types";

export type RowDetailPatch = {
  name: string;
  description: string;
  weight: number;
  scores: Record<string, number | undefined>;
  comment: string;
  evidence: string[];
};

export function MatrixRowDetailDrawer({
  open,
  matrix,
  criterionId,
  onClose,
  onSave,
}: {
  open: boolean;
  matrix: WizardScoreMatrix;
  criterionId: string | null;
  onClose: () => void;
  onSave: (criterionId: string, patch: RowDetailPatch) => void;
}) {
  const [draft, setDraft] = useState<RowDetailPatch | null>(null);
  const [newEvidence, setNewEvidence] = useState("");

  useEffect(() => {
    if (!open || !criterionId) {
      setDraft(null);
      return;
    }
    const c = matrix.criteria.find((x) => x.id === criterionId);
    if (!c) {
      setDraft(null);
      return;
    }
    setDraft({
      name: c.name,
      description: c.description,
      weight: c.weight,
      scores: { ...(matrix.scores[criterionId] ?? {}) },
      comment: matrix.rowComments[criterionId] ?? "",
      evidence: [...((matrix.rowEvidence ?? {})[criterionId] ?? [])],
    });
    setNewEvidence("");
  }, [open, criterionId, matrix]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const previewMatrix: WizardScoreMatrix | null = useMemo(() => {
    if (!criterionId || !draft) return null;
    return {
      ...matrix,
      criteria: matrix.criteria.map((c) =>
        c.id === criterionId
          ? { ...c, name: draft.name, description: draft.description, weight: draft.weight }
          : c,
      ),
      scores: { ...matrix.scores, [criterionId]: draft.scores },
      rowComments: { ...matrix.rowComments, [criterionId]: draft.comment },
      rowEvidence: { ...(matrix.rowEvidence ?? {}), [criterionId]: draft.evidence },
    };
  }, [criterionId, draft, matrix]);

  const validation = useMemo(() => {
    if (!previewMatrix || !criterionId) return null;
    return getRowValidation(previewMatrix, criterionId);
  }, [previewMatrix, criterionId]);

  if (!open || !criterionId || !draft) return null;

  const toneClasses =
    validation?.tone === "error"
      ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
      : validation?.tone === "warn"
        ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
        : "border-[#86efac] bg-[#f0fdf4] text-[#166534]";

  function addEvidence() {
    const id = newEvidence.trim();
    if (!id) return;
    setDraft((prev) =>
      prev ? { ...prev, evidence: prev.evidence.includes(id) ? prev.evidence : [...prev.evidence, id] } : prev,
    );
    setNewEvidence("");
  }

  function removeEvidence(id: string) {
    setDraft((prev) =>
      prev ? { ...prev, evidence: prev.evidence.filter((e) => e !== id) } : prev,
    );
  }

  return (
    <div className="fixed inset-0 z-[55] flex" role="presentation">
      <button
        type="button"
        className="flex-1 bg-black/40"
        aria-label="Close row detail"
        onClick={onClose}
      />
      <aside
        className="flex w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="row-detail-title"
        data-testid="matrix-row-detail-drawer"
      >
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Matrix row
            </p>
            <h2 id="row-detail-title" className="text-lg font-semibold text-foreground">
              {draft.name || "(unnamed row)"}
            </h2>
            <p className="text-xs text-muted-foreground">{criterionId}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Name</span>
              <input
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Weight (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={Number.isFinite(draft.weight) ? draft.weight : ""}
                onChange={(e) =>
                  setDraft({ ...draft, weight: Number.parseInt(e.target.value, 10) })
                }
              />
            </label>
          </div>

          <label className="mt-3 block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Description</span>
            <input
              type="text"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </label>

          <fieldset className="mt-4 rounded-xl border p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scores
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {matrix.optionKeys.map((ok) => (
                <label key={ok} className="block space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {matrix.optionLabels[ok] ?? ok}
                  </span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={draft.scores[ok] ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        scores: {
                          ...draft.scores,
                          [ok]: e.target.value === "" ? undefined : Number.parseInt(e.target.value, 10),
                        },
                      })
                    }
                  >
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-3 block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Comments</span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={draft.comment}
              onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
            />
          </label>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Evidence links
            </p>
            {draft.evidence.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">No evidence linked.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {draft.evidence.map((id) => (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-md border bg-background px-2 py-1 text-sm"
                  >
                    <code className="text-xs">{id}</code>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeEvidence(id)}
                      aria-label={`Remove evidence ${id}`}
                    >
                      <Trash2 className="size-3" /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="EV-XXXX-XXXX"
                className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEvidence();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addEvidence}>
                <Plus className="size-3.5" /> Link
              </Button>
            </div>
          </div>

          {validation ? (
            <div className={cn("mt-4 rounded-xl border px-3 py-2 text-xs", toneClasses)}>
              <p className="font-semibold uppercase tracking-wide">Validation status</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {validation.messages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="matrix-row-detail-save"
            onClick={() => onSave(criterionId, draft)}
          >
            Save
          </Button>
        </footer>
      </aside>
    </div>
  );
}
