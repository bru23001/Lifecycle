"use client";

import { useMemo, useState } from "react";
import { FileDown, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { addRow, removeRow, totalWeight, updateRow } from "@/lib/score-matrix-ops";
import { cn } from "@/lib/utils";
import type { WizardScoreMatrix } from "@/types/template-wizard.types";

import {
  AddTableRowModal,
  type NewMatrixRow,
} from "@/components/template-wizard/add-table-row-modal";
import { DeleteRowConfirmationModal } from "@/components/template-wizard/delete-row-confirmation-modal";
import { ImportRowsModal, type ImportRowDraft } from "@/components/template-wizard/import-rows-modal";
import {
  MatrixRowDetailDrawer,
  type RowDetailPatch,
} from "@/components/template-wizard/matrix-row-detail-drawer";

export function ScoreMatrixField({
  value,
  onChange,
  idPrefix,
}: {
  value: WizardScoreMatrix;
  onChange: (next: WizardScoreMatrix) => void;
  idPrefix: string;
}) {
  const tw = useMemo(() => totalWeight(value), [value]);
  const balanced = tw >= 99 && tw <= 101;

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function setWeight(idx: number, weight: number) {
    const target = value.criteria[idx];
    if (!target) return;
    onChange(updateRow(value, target.id, { weight: Number.isFinite(weight) ? weight : 0 }));
  }

  function setComment(criterionId: string, comment: string) {
    onChange(updateRow(value, criterionId, { comment }));
  }

  function setScore(criterionId: string, optionKey: string, score: number) {
    onChange(updateRow(value, criterionId, { scores: { [optionKey]: score } }));
  }

  function handleAddRow(row: NewMatrixRow) {
    onChange(
      addRow(value, {
        name: row.name,
        description: row.description,
        weight: row.weight,
        scores: row.scores,
        comment: row.comment,
      }),
    );
    setAddOpen(false);
  }

  function handleSaveDetail(criterionId: string, patch: RowDetailPatch) {
    onChange(updateRow(value, criterionId, patch));
    setDetailId(null);
  }

  function handleDelete(criterionId: string) {
    onChange(removeRow(value, criterionId));
    setDeleteId(null);
  }

  function handleImport(drafts: ImportRowDraft[]) {
    let next = value;
    for (const draft of drafts) {
      next = addRow(next, {
        name: draft.name,
        description: draft.description,
        weight: draft.weight,
        scores: draft.scores,
        comment: draft.comment,
        evidence: draft.evidence,
      });
    }
    onChange(next);
    setImportOpen(false);
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby={`${idPrefix}-weighting-heading`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 id={`${idPrefix}-weighting-heading`} className="text-base font-semibold text-foreground">
              2.1 Evaluation Criteria Weighting
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust weights so priorities reflect your evaluation goals (must total 100%).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="score-matrix-add-row"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-3.5" /> Add row
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="score-matrix-import-rows"
              onClick={() => setImportOpen(true)}
            >
              <FileDown className="size-3.5" /> Import rows
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">#</th>
                <th className="px-3 py-2.5 font-medium">Criteria</th>
                <th className="px-3 py-2.5 font-medium">Description</th>
                <th className="px-3 py-2.5 font-medium">Weight (%)</th>
                <th className="px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {value.criteria.map((c, idx) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-left font-medium text-[#2563eb] hover:underline"
                      data-testid="matrix-row-identity"
                      onClick={() => setDetailId(c.id)}
                    >
                      {c.name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{c.description}</td>
                  <td className="px-3 py-2">
                    <label htmlFor={`${idPrefix}-w-${c.id}`} className="sr-only">
                      Weight for {c.name}
                    </label>
                    <input
                      id={`${idPrefix}-w-${c.id}`}
                      type="number"
                      min={0}
                      max={100}
                      className="h-9 w-20 rounded-lg border bg-background px-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      value={c.weight}
                      onChange={(e) => setWeight(idx, Number.parseInt(e.target.value, 10))}
                      aria-required="true"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-testid="matrix-row-delete"
                      aria-label={`Delete row ${c.name}`}
                      onClick={() => setDeleteId(c.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
          <p
            className={cn(
              "text-sm font-semibold",
              balanced ? "text-[#16a34a]" : "text-[#f59e0b]",
            )}
            role="status"
          >
            Total Weight: {tw}%
            {!balanced ? " (target 100%)" : ""}
          </p>
        </div>
      </section>

      <section aria-labelledby={`${idPrefix}-options-heading`}>
        <h4 id={`${idPrefix}-options-heading`} className="text-base font-semibold text-foreground">
          2.2 Solution Options
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Options compared in the scoring grid (aligned to your shortlist).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {value.optionKeys.map((k) => (
            <span
              key={k}
              className="inline-flex items-center rounded-full border border-[#2563eb]/25 bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1d4ed8]"
            >
              {value.optionLabels[k] ?? k}
            </span>
          ))}
        </div>
      </section>

      <section aria-labelledby={`${idPrefix}-matrix-heading`}>
        <h4 id={`${idPrefix}-matrix-heading`} className="text-base font-semibold text-foreground">
          2.3 Scoring Matrix
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Score each option from 1 (low) to 5 (high) for every criterion. Click a row name to open its detail drawer.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Criteria (Weight)</th>
                {value.optionKeys.map((ok) => (
                  <th key={ok} className="px-3 py-2.5 font-medium">
                    {value.optionLabels[ok]?.replace(/^Option [A-C] — /, "") ?? ok}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium">Comments (Optional)</th>
              </tr>
            </thead>
            <tbody>
              {value.criteria.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      className="block text-left font-medium text-[#2563eb] hover:underline"
                      onClick={() => setDetailId(c.id)}
                    >
                      {c.name}
                    </button>
                    <div className="text-xs text-muted-foreground">({c.weight}%)</div>
                  </td>
                  {value.optionKeys.map((ok) => {
                    const sid = `${idPrefix}-s-${c.id}-${ok}`;
                    return (
                      <td key={ok} className="px-3 py-2 align-top">
                        <label htmlFor={sid} className="sr-only">
                          Score for {c.name}, {value.optionLabels[ok]}
                        </label>
                        <select
                          id={sid}
                          className="h-9 w-full min-w-[72px] rounded-lg border bg-background px-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                          value={value.scores[c.id]?.[ok] ?? ""}
                          onChange={(e) =>
                            setScore(c.id, ok, Number.parseInt(e.target.value, 10))
                          }
                          aria-required="true"
                        >
                          <option value="">—</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 align-top">
                    <label htmlFor={`${idPrefix}-co-${c.id}`} className="sr-only">
                      Comment for {c.name}
                    </label>
                    <textarea
                      id={`${idPrefix}-co-${c.id}`}
                      rows={2}
                      className="w-full min-w-[160px] resize-y rounded-lg border bg-background px-2 py-1.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Justification…"
                      value={value.rowComments[c.id] ?? ""}
                      onChange={(e) => setComment(c.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AddTableRowModal
        open={addOpen}
        matrix={value}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddRow}
      />

      <MatrixRowDetailDrawer
        open={detailId != null}
        matrix={value}
        criterionId={detailId}
        onClose={() => setDetailId(null)}
        onSave={handleSaveDetail}
      />

      <DeleteRowConfirmationModal
        open={deleteId != null}
        matrix={value}
        criterionId={deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <ImportRowsModal
        open={importOpen}
        matrix={value}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
