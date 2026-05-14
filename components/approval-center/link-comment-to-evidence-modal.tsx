"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ApprovalDetail, ApprovalRequiredInput, ApproverComment } from "@/types/approval-center.types";

type EvidenceOption = { label: string; href: string };

function buildEvidenceOptions(detail: ApprovalDetail, requiredInputs: ApprovalRequiredInput[]): EvidenceOption[] {
  const out: EvidenceOption[] = [];
  if (detail.primaryEvidenceDetailHref) {
    out.push({ label: "Primary linked evidence", href: detail.primaryEvidenceDetailHref });
  }
  if (detail.evidenceListHref) {
    out.push({ label: "Evidence library", href: detail.evidenceListHref });
  }
  for (const row of requiredInputs) {
    if (row.linkedObjectHref?.trim()) {
      out.push({ label: `${row.inputCode}: ${row.name}`, href: row.linkedObjectHref.trim() });
    }
  }
  const seen = new Set<string>();
  return out.filter((o) => {
    if (seen.has(o.href)) return false;
    seen.add(o.href);
    return true;
  });
}

type Props = {
  open: boolean;
  onClose: () => void;
  detail: ApprovalDetail;
  requiredInputs: ApprovalRequiredInput[];
  comment: ApproverComment | null;
  onSave: (commentId: string, href: string, label: string) => void;
};

export function LinkCommentToEvidenceModal({ open, onClose, detail, requiredInputs, comment, onSave }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const options = useMemo(() => buildEvidenceOptions(detail, requiredInputs), [detail, requiredInputs]);
  const [selectedHref, setSelectedHref] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");
  const prevOpen = useRef(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && comment) {
      if (!prevOpen.current) {
        const initial = options[0]?.href ?? comment.linkedEvidenceHref ?? "";
        setSelectedHref(initial);
        setCustomLabel(comment.linkedEvidenceLabel ?? "");
        setCustomHref(
          comment.linkedEvidenceHref && !options.some((o) => o.href === comment.linkedEvidenceHref)
            ? comment.linkedEvidenceHref
            : "",
        );
      }
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open, comment, options]);

  if (!comment) return null;

  const useCustom = customHref.trim().length > 0;
  const href = useCustom ? customHref.trim() : selectedHref;
  const label =
    (useCustom ? customLabel.trim() : options.find((o) => o.href === selectedHref)?.label) ||
    customLabel.trim() ||
    "Linked evidence";

  const save = () => {
    if (!href) return;
    onSave(comment.id, href, label);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,480px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="link-comment-evidence-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <h2 id="link-comment-evidence-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Link comment to evidence
            </h2>
            <p className="mt-1 truncate text-xs text-slate-500" title={comment.body}>
              {comment.authorName} · {comment.createdOnLabel}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {options.length > 0 ? (
            <div>
              <label htmlFor="link-evidence-pick" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Known evidence links
              </label>
              <select
                id="link-evidence-pick"
                value={selectedHref}
                onChange={(e) => setSelectedHref(e.target.value)}
                className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
              >
                {options.map((o) => (
                  <option key={o.href} value={o.href}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-slate-600">No catalogued evidence links on this package. Use a custom URL below.</p>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Custom URL (optional)</p>
            <input
              value={customHref}
              onChange={(e) => setCustomHref(e.target.value)}
              placeholder="https://…"
              className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Display label"
              className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={!href} onClick={save}>
            Save link
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
