"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { totalWeight } from "@/lib/score-matrix-ops";
import { cn } from "@/lib/utils";
import type { WizardScoreMatrix } from "@/types/template-wizard.types";

export type NewMatrixRow = {
  name: string;
  description: string;
  weight: number;
  scores: Record<string, number | undefined>;
  comment: string;
};

export function AddTableRowModal({
  open,
  matrix,
  onClose,
  onAdd,
}: {
  open: boolean;
  matrix: WizardScoreMatrix;
  onClose: () => void;
  onAdd: (row: NewMatrixRow) => void;
}) {
  const [draft, setDraft] = useState<NewMatrixRow>(() => emptyDraft(matrix));

  useEffect(() => {
    if (open) setDraft(emptyDraft(matrix));
  }, [open, matrix]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const currentTotal = useMemo(() => totalWeight(matrix), [matrix]);
  const projectedTotal = useMemo(
    () => currentTotal + (Number.isFinite(draft.weight) ? draft.weight : 0),
    [currentTotal, draft.weight],
  );

  const missingFields: string[] = [];
  if (!draft.name.trim()) missingFields.push("Name");
  if (!Number.isFinite(draft.weight) || draft.weight <= 0) missingFields.push("Weight > 0");

  const previewIssues: { tone: "warn" | "error"; message: string }[] = [];
  if (projectedTotal > 100) {
    previewIssues.push({
      tone: "warn",
      message: `Total weight will be ${projectedTotal}% (over 100%). Adjust other rows after adding.`,
    });
  } else if (projectedTotal < 100) {
    previewIssues.push({
      tone: "warn",
      message: `Total weight will be ${projectedTotal}% (under 100%). Add more rows or increase weights to reach 100%.`,
    });
  }
  for (const ok of matrix.optionKeys) {
    if (typeof draft.scores[ok] !== "number") {
      previewIssues.push({
        tone: "warn",
        message: `Score for ${matrix.optionLabels[ok] ?? ok} is empty; you can fill it in later in the matrix.`,
      });
    }
  }
  if (missingFields.length > 0) {
    previewIssues.unshift({
      tone: "error",
      message: `Missing required: ${missingFields.join(", ")}.`,
    });
  }

  const canSubmit = missingFields.length === 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="flex max-h-[min(820px,100vh-2rem)] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        data-testid="add-table-row-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-table-row-title"
      >
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="add-table-row-title" className="text-lg font-semibold text-foreground">
              Add row
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new evaluation criterion to the scoring matrix.
            </p>
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
              <span className="text-xs font-medium text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </span>
              <input
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                data-testid="add-row-name"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Weight (%) <span className="text-destructive">*</span>
              </span>
              <input
                type="number"
                min={0}
                max={100}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={Number.isFinite(draft.weight) ? draft.weight : ""}
                onChange={(e) =>
                  setDraft({ ...draft, weight: Number.parseInt(e.target.value, 10) })
                }
                data-testid="add-row-weight"
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
              Default scores
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
            <span className="text-xs font-medium text-muted-foreground">Comment / justification</span>
            <textarea
              rows={3}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={draft.comment}
              onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
            />
          </label>

          <div className="mt-4 rounded-xl border bg-muted/20 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Validation preview
            </p>
            <p className="mt-1 text-sm text-foreground">
              Total weight: <span className="font-semibold">{currentTotal}%</span> →{" "}
              <span className={cn(projectedTotal === 100 ? "text-[#15803d]" : "text-[#b45309]")}>
                {projectedTotal}%
              </span>
            </p>
            {previewIssues.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs">
                {previewIssues.map((issue, idx) => (
                  <li
                    key={idx}
                    className={
                      issue.tone === "error"
                        ? "text-[#b91c1c]"
                        : "text-[#92400e]"
                    }
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-[#15803d]">No issues detected.</p>
            )}
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="add-table-row-confirm"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              onAdd(draft);
            }}
          >
            Add row
          </Button>
        </footer>
      </div>
    </div>
  );
}

function emptyDraft(matrix: WizardScoreMatrix): NewMatrixRow {
  const scores: Record<string, number | undefined> = {};
  for (const ok of matrix.optionKeys) scores[ok] = undefined;
  return {
    name: "",
    description: "",
    weight: 0,
    scores,
    comment: "",
  };
}
