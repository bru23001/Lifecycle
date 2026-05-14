"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";

import {
  createEvidenceComment,
  deleteEvidenceComment,
  setEvidenceCommentResolved,
  updateEvidenceComment,
} from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceCommentRow, EvidenceCommentVisibility } from "@/types/evidence-center.types";

import { ConfirmEvidenceActionModal } from "./confirm-evidence-action-modal";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function visibilityLabel(v: EvidenceCommentVisibility): string {
  switch (v) {
    case "internal":
      return "Internal";
    case "reviewers":
      return "Reviewers only";
    default:
      return "Project team";
  }
}

function CommentComposerDialog({
  open,
  mode,
  projectId,
  evidenceId,
  initial,
  onClose,
  onMutationError,
}: {
  open: boolean;
  mode: "add" | "edit";
  projectId: string;
  evidenceId: string;
  initial: EvidenceCommentRow | null;
  onClose: () => void;
  onMutationError: (msg: string | null) => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<EvidenceCommentVisibility>("project");
  const [mentionsRaw, setMentionsRaw] = useState("");
  const [attachmentRef, setAttachmentRef] = useState("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setBody(initial.body);
      setVisibility(initial.visibility);
      setMentionsRaw(initial.mentions.join(", "));
      setAttachmentRef(initial.attachmentRef ?? "");
    } else {
      setBody("");
      setVisibility("project");
      setMentionsRaw("");
      setAttachmentRef("");
    }
    setError(null);
  }, [open, mode, initial]);

  const title = mode === "add" ? "Add comment" : "Edit comment";

  const save = () => {
    startTransition(async () => {
      onMutationError(null);
      if (mode === "add") {
        const res = await createEvidenceComment({
          projectId,
          evidenceId,
          body,
          visibility,
          mentionsRaw,
          attachmentRef: attachmentRef.trim() || null,
        });
        if (res.ok) {
          router.refresh();
          onClose();
        } else {
          setError(res.error);
          onMutationError(res.error);
        }
      } else if (initial) {
        const res = await updateEvidenceComment({
          projectId,
          evidenceId,
          commentId: initial.id,
          body,
          visibility,
          mentionsRaw,
          attachmentRef: attachmentRef.trim() || null,
        });
        if (res.ok) {
          router.refresh();
          onClose();
        } else {
          setError(res.error);
          onMutationError(res.error);
        }
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,480px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="evidence-comment-composer-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <h2 id="evidence-comment-composer-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Comment</span>
            <textarea
              className={cn(inputClass, "mt-1 min-h-[100px] resize-y")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={8000}
              data-testid="evidence-comment-body"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Visibility</span>
            <select
              className={cn(inputClass, "mt-1")}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as EvidenceCommentVisibility)}
              data-testid="evidence-comment-visibility"
            >
              <option value="project">Project team</option>
              <option value="internal">Internal</option>
              <option value="reviewers">Reviewers only</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Mention users (comma-separated)</span>
            <input
              className={cn(inputClass, "mt-1")}
              value={mentionsRaw}
              onChange={(e) => setMentionsRaw(e.target.value)}
              placeholder="e.g. Alex, Jordan"
              data-testid="evidence-comment-mentions"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Attach reference (URL or label)</span>
            <input
              className={cn(inputClass, "mt-1")}
              value={attachmentRef}
              onChange={(e) => setAttachmentRef(e.target.value)}
              maxLength={2000}
              data-testid="evidence-comment-attachment"
            />
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={pending || body.trim().length < 1} onClick={save}>
            {pending ? "Saving…" : mode === "add" ? "Save comment" : "Save changes"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function CommentActionsMenu({
  comment,
  disabled,
  onEdit,
  onToggleResolved,
  onDelete,
}: {
  comment: EvidenceCommentRow;
  disabled?: boolean;
  onEdit: () => void;
  onToggleResolved: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const itemClass =
    "block w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        aria-label="Comment actions"
        data-testid={`evidence-comment-actions-${comment.id}`}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
        >
          {comment.isViewerAuthor ? (
            <>
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                className={`${itemClass} text-red-700 hover:bg-red-50`}
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
              >
                Delete
              </button>
            </>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onToggleResolved();
            }}
          >
            {comment.resolved ? "Unresolve" : "Resolve"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function EvidenceCommentsBlock({
  projectId,
  evidenceId,
  comments,
  disabled,
  onMutationError,
}: {
  projectId: string;
  evidenceId: string;
  comments: EvidenceCommentRow[];
  disabled?: boolean;
  onMutationError?: (msg: string | null) => void;
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<EvidenceCommentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EvidenceCommentRow | null>(null);
  const [pendingResolveId, setPendingResolveId] = useState<string | null>(null);

  const report = (msg: string | null) => {
    onMutationError?.(msg);
  };

  const toggleResolved = (c: EvidenceCommentRow) => {
    setPendingResolveId(c.id);
    void (async () => {
      report(null);
      const res = await setEvidenceCommentResolved({
        projectId,
        evidenceId,
        commentId: c.id,
        resolved: !c.resolved,
      });
      setPendingResolveId(null);
      if (res.ok) router.refresh();
      else report(res.error);
    })();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">Discuss this evidence item with your team.</p>
        <Button
          type="button"
          size="sm"
          className="bg-[#2563eb] hover:bg-[#1d4ed8]"
          disabled={disabled}
          data-testid="evidence-add-comment"
          onClick={() => setAddOpen(true)}
        >
          Add comment
        </Button>
      </div>

      <ul className="space-y-2">
        {comments.length === 0 ? (
          <li className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No comments yet.</li>
        ) : (
          comments.map((c) => (
            <li
              key={c.id}
              className={cn(
                "rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700",
                c.resolved && "border-emerald-200 bg-emerald-50/40",
              )}
              data-testid={`evidence-comment-row-${c.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{c.author}</p>
                    {c.resolved ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        Resolved
                      </span>
                    ) : null}
                    <span className="text-xs text-slate-500">{visibilityLabel(c.visibility)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{c.body}</p>
                  {c.mentions.length > 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Mentions: {c.mentions.join(", ")}
                    </p>
                  ) : null}
                  {c.attachmentRef ? (
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-slate-600">Reference: </span>
                      <span className="break-all text-blue-600">{c.attachmentRef}</span>
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-400">
                    {c.createdAtLabel}
                    {c.updatedAtLabel !== c.createdAtLabel ? ` · Updated ${c.updatedAtLabel}` : ""}
                  </p>
                </div>
                <CommentActionsMenu
                  comment={c}
                  disabled={disabled || pendingResolveId === c.id}
                  onEdit={() => setEditing(c)}
                  onToggleResolved={() => toggleResolved(c)}
                  onDelete={() => setDeleteTarget(c)}
                />
              </div>
            </li>
          ))
        )}
      </ul>

      <CommentComposerDialog
        open={addOpen}
        mode="add"
        projectId={projectId}
        evidenceId={evidenceId}
        initial={null}
        onClose={() => setAddOpen(false)}
        onMutationError={report}
      />

      <CommentComposerDialog
        open={editing != null}
        mode="edit"
        projectId={projectId}
        evidenceId={evidenceId}
        initial={editing}
        onClose={() => setEditing(null)}
        onMutationError={report}
      />

      <ConfirmEvidenceActionModal
        open={deleteTarget != null}
        title="Delete comment?"
        description={
          deleteTarget ?
            `This permanently removes the comment starting with “${deleteTarget.body.slice(0, 80)}${deleteTarget.body.length > 80 ? "…" : ""}”.`
          : ""
        }
        confirmLabel="Delete"
        destructive
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          report(null);
          const res = await deleteEvidenceComment({
            projectId,
            evidenceId,
            commentId: deleteTarget.id,
          });
          if (res.ok) router.refresh();
          else report(res.error);
        }}
      />
    </div>
  );
}
