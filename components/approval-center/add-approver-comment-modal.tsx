"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildApproverComment } from "@/lib/approval-comment-utils";
import type { ApprovalRequiredInput, ApproverComment } from "@/types/approval-center.types";

type User = { name: string; role: string; initials: string };

type Props = {
  open: boolean;
  onClose: () => void;
  user: User;
  requiredInputs: ApprovalRequiredInput[];
  onSubmit: (comment: ApproverComment) => void;
};

export function AddApproverCommentModal({ open, onClose, user, requiredInputs, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<ApproverComment["visibility"]>("public_to_project");
  const [mention, setMention] = useState("");
  const [relatedInputCode, setRelatedInputCode] = useState("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) {
        setBody("");
        setVisibility("public_to_project");
        setMention("");
        setRelatedInputCode("");
      }
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open]);

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const comment = buildApproverComment({
      body: trimmed,
      visibility,
      user,
      relatedInputCode: relatedInputCode || undefined,
      mentionPreview: mention.trim() || undefined,
    });
    onSubmit(comment);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="add-approver-comment-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div>
            <h2 id="add-approver-comment-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Add approver comment
            </h2>
            <p className="mt-1 text-sm text-slate-600">Long-form note with visibility and optional references.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label htmlFor="add-comment-body" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Comment
            </label>
            <textarea
              id="add-comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 4000))}
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Explain the review note, risk, or follow-up…"
            />
            <p className="mt-1 text-xs text-slate-500">{body.length}/4000 characters</p>
          </div>

          <div>
            <label htmlFor="add-comment-visibility" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Visibility
            </label>
            <select
              id="add-comment-visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ApproverComment["visibility"])}
              className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="public_to_project">Visible to project</option>
              <option value="internal">Internal only</option>
            </select>
          </div>

          <div>
            <label htmlFor="add-comment-mention" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mention (optional)
            </label>
            <input
              id="add-comment-mention"
              value={mention}
              onChange={(e) => setMention(e.target.value)}
              placeholder="@Name or email hint"
              className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="add-comment-input" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Related required input (optional)
            </label>
            <select
              id="add-comment-input"
              value={relatedInputCode}
              onChange={(e) => setRelatedInputCode(e.target.value)}
              className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="">— None —</option>
              {requiredInputs.map((row) => (
                <option key={row.id} value={row.inputCode}>
                  {row.inputCode} — {row.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={body.trim().length === 0} onClick={handleSubmit}>
            Add comment
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
