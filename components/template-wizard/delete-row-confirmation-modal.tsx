"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { totalWeight } from "@/lib/score-matrix-ops";
import type { WizardScoreMatrix } from "@/types/template-wizard.types";

export function DeleteRowConfirmationModal({
  open,
  matrix,
  criterionId,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  matrix: WizardScoreMatrix;
  criterionId: string | null;
  onCancel: () => void;
  onConfirm: (criterionId: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || !criterionId) return null;
  const criterion = matrix.criteria.find((c) => c.id === criterionId);
  if (!criterion) return null;

  const currentTotal = totalWeight(matrix);
  const projectedTotal = currentTotal - criterion.weight;
  const optionsAffected = matrix.optionKeys.length;
  const hadComment = (matrix.rowComments[criterionId] ?? "").trim().length > 0;
  const evidenceCount = (matrix.rowEvidence ?? {})[criterionId]?.length ?? 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        data-testid="delete-row-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-row-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="delete-row-title" className="text-lg font-semibold text-foreground">
              Delete row
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {criterion.name} <span className="text-xs">({criterionId})</span>
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[#991b1b]">
            <p className="font-medium">Deletion warning</p>
            <p className="mt-1 text-xs">
              This row, its scores, comment, and {evidenceCount} linked evidence{" "}
              {evidenceCount === 1 ? "item" : "items"} will be removed from the scoring matrix.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Affected calculations
            </p>
            <ul className="mt-1 space-y-0.5 text-xs">
              <li>
                Total weight: <span className="font-semibold">{currentTotal}%</span> →{" "}
                <span className="font-semibold">{projectedTotal}%</span>
                {projectedTotal !== 100 ? " (will require rebalancing)" : ""}
              </li>
              <li>
                {optionsAffected * 1} option score
                {optionsAffected === 1 ? "" : "s"} will be discarded.
              </li>
              {hadComment ? <li>The justification comment will be deleted.</li> : null}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            data-testid="delete-row-confirm"
            onClick={() => onConfirm(criterionId)}
          >
            Delete row
          </Button>
        </div>
      </div>
    </div>
  );
}
