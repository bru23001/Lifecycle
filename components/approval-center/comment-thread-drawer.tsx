"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { CommentActionsDropdown } from "@/components/approval-center/comment-actions-dropdown";
import { Badge } from "@/components/approval-center/approval-center-shared";
import { Button } from "@/components/ui/button";
import { approvalStatusBadgeMap } from "@/lib/approval-status";
import { buildReplyComment } from "@/lib/approval-comment-utils";
import { findCommentById } from "@/lib/approval-comment-tree";
import type { ApproverComment } from "@/types/approval-center.types";

type User = { name: string; role: string; initials: string };

type Props = {
  open: boolean;
  onClose: () => void;
  /** Top-level thread root (re-rendered from parent `comments` when props change). */
  root: ApproverComment | null;
  allComments: ApproverComment[];
  currentUser: User;
  onAddReply: (parentId: string, reply: ApproverComment) => void;
  onPatchComment: (id: string, patch: Partial<ApproverComment>) => void;
  onDeleteComment: (id: string) => void;
  onOpenLinkEvidence: (comment: ApproverComment) => void;
  onCopyCommentDeepLink: (commentId: string) => void;
};

function CommentTreeNode({
  node,
  depth,
  setReplyParentId,
  editingId,
  setEditingId,
  editDraft,
  setEditDraft,
  onPatchComment,
  onDeleteComment,
  onOpenLinkEvidence,
  onCopyCommentDeepLink,
}: {
  node: ApproverComment;
  depth: number;
  setReplyParentId: (id: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editDraft: string;
  setEditDraft: (v: string) => void;
  onPatchComment: (id: string, patch: Partial<ApproverComment>) => void;
  onDeleteComment: (id: string) => void;
  onOpenLinkEvidence: (comment: ApproverComment) => void;
  onCopyCommentDeepLink: (commentId: string) => void;
}) {
  const isEditing = editingId === node.id;
  const pad = depth === 0 ? 0 : Math.min(depth * 12, 36);

  return (
    <div style={{ marginLeft: pad }} className="border-l border-slate-100 pl-3">
      <div
        className="rounded-xl border border-slate-200 bg-white p-3 dark:border-border"
        onClick={() => setReplyParentId(node.id)}
        role="presentation"
      >
        <div className="flex items-start gap-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {node.authorInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {node.authorName} ({node.authorRole})
              </p>
              {node.statusAtComment ? <Badge {...approvalStatusBadgeMap[node.statusAtComment]} /> : null}
              {node.resolved ? (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                  Resolved
                </span>
              ) : null}
              <p className="text-xs text-slate-500">{node.createdOnLabel}</p>
              <span className="text-[10px] text-slate-400">{node.visibility === "internal" ? "Internal" : "Project"}</span>
            </div>
            {node.mentionPreview ? <p className="mt-1 text-xs text-slate-500">Mention: {node.mentionPreview}</p> : null}
            {node.relatedInputCode ? (
              <p className="mt-0.5 text-xs text-slate-500">
                Related input: <span className="font-mono">{node.relatedInputCode}</span>
              </p>
            ) : null}
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value.slice(0, 4000))}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const t = editDraft.trim();
                      if (!t) return;
                      onPatchComment(node.id, { body: t });
                      setEditingId(null);
                    }}
                  >
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{node.body}</p>
            )}
            {node.linkedEvidenceHref ? (
              <p className="mt-2 text-xs">
                <span className="text-slate-500">Evidence: </span>
                <Link href={node.linkedEvidenceHref} className="font-semibold text-[#2563eb] hover:underline" onClick={(e) => e.stopPropagation()}>
                  {node.linkedEvidenceLabel ?? "Open link"}
                </Link>
              </p>
            ) : null}
          </div>
          <CommentActionsDropdown
            comment={node}
            onReply={() => setReplyParentId(node.id)}
            onEdit={() => {
              setEditingId(node.id);
              setEditDraft(node.body);
            }}
            onDelete={() => {
              if (typeof window !== "undefined" && !window.confirm("Delete this comment?")) return;
              onDeleteComment(node.id);
            }}
            onCopyLink={() => onCopyCommentDeepLink(node.id)}
            onToggleResolved={() => onPatchComment(node.id, { resolved: !node.resolved })}
            onLinkEvidence={() => onOpenLinkEvidence(node)}
          />
        </div>
      </div>
      {node.replies?.length ? (
        <ul className="mt-2 space-y-2">
          {node.replies.map((r) => (
            <li key={r.id}>
              <CommentTreeNode
                node={r}
                depth={depth + 1}
                setReplyParentId={setReplyParentId}
                editingId={editingId}
                setEditingId={setEditingId}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                onPatchComment={onPatchComment}
                onDeleteComment={onDeleteComment}
                onOpenLinkEvidence={onOpenLinkEvidence}
                onCopyCommentDeepLink={onCopyCommentDeepLink}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CommentThreadDrawer({
  open,
  onClose,
  root,
  allComments,
  currentUser,
  onAddReply,
  onPatchComment,
  onDeleteComment,
  onOpenLinkEvidence,
  onCopyCommentDeepLink,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyParentId, setReplyParentId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const liveRoot = root?.id ? findCommentById(allComments, root.id) : null;
  const prevOpenRef = useRef(false);
  const prevRootIdRef = useRef<string | null>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const rid = liveRoot?.id ?? null;
    if (open && liveRoot) {
      const justOpened = !prevOpenRef.current;
      const rootChanged = prevRootIdRef.current !== rid;
      if (justOpened || rootChanged) {
        setReplyParentId(liveRoot.id);
        setReplyBody("");
        setEditingId(null);
      }
      if (!node.open) node.showModal();
      prevOpenRef.current = true;
      prevRootIdRef.current = rid;
    } else {
      prevOpenRef.current = false;
      prevRootIdRef.current = null;
      if (node.open) node.close();
    }
  }, [open, liveRoot?.id, liveRoot]);

  const parentLabel = liveRoot && replyParentId ? findCommentById(allComments, replyParentId)?.authorName ?? "Comment" : "";

  const submitReply = () => {
    if (!liveRoot) return;
    const t = replyBody.trim();
    if (!t || !replyParentId) return;
    const reply = buildReplyComment({
      body: t,
      visibility: findCommentById(allComments, replyParentId)?.visibility ?? liveRoot.visibility,
      user: currentUser,
    });
    onAddReply(replyParentId, reply);
    setReplyBody("");
  };

  if (!liveRoot) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,480px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="comment-thread-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Comment thread</p>
            <h2 id="comment-thread-title" className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-foreground">
              {liveRoot.authorName}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{liveRoot.createdOnLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <CommentTreeNode
            node={liveRoot}
            depth={0}
            setReplyParentId={setReplyParentId}
            editingId={editingId}
            setEditingId={setEditingId}
            editDraft={editDraft}
            setEditDraft={setEditDraft}
            onPatchComment={onPatchComment}
            onDeleteComment={onDeleteComment}
            onOpenLinkEvidence={onOpenLinkEvidence}
            onCopyCommentDeepLink={onCopyCommentDeepLink}
          />
        </div>

        <footer className="border-t border-slate-200 px-5 py-4 dark:border-border">
          <p className="text-xs text-slate-500">
            Replying to <span className="font-semibold text-slate-700">{parentLabel}</span>
          </p>
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value.slice(0, 2000))}
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Write a reply…"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReplyBody("")}>
              Clear
            </Button>
            <Button type="button" size="sm" disabled={replyBody.trim().length === 0} onClick={submitReply}>
              Add reply
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
