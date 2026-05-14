"use client";

import Link from "next/link";
import { useEffect, useState, type RefObject } from "react";
import { MessageSquarePlus } from "lucide-react";

import { AddApproverCommentModal } from "@/components/approval-center/add-approver-comment-modal";
import { Badge } from "@/components/approval-center/approval-center-shared";
import { CommentThreadDrawer } from "@/components/approval-center/comment-thread-drawer";
import { CommentActionsDropdown } from "@/components/approval-center/comment-actions-dropdown";
import { LinkCommentToEvidenceModal } from "@/components/approval-center/link-comment-to-evidence-modal";
import { Button } from "@/components/ui/button";
import { approvalStatusBadgeMap } from "@/lib/approval-status";
import {
  addReplyToComment,
  countCommentThreadNodes,
  deleteCommentFromTree,
  updateCommentInTree,
} from "@/lib/approval-comment-tree";
import type { ApprovalDetail, ApprovalRequiredInput, ApproverComment } from "@/types/approval-center.types";

type User = { name: string; role: string; initials: string };

type Props = {
  approvalId: string;
  detail: ApprovalDetail;
  comments: ApproverComment[];
  requiredInputs: ApprovalRequiredInput[];
  isLoading: boolean;
  currentUser: User;
  commentDraft: string;
  commentVisibility: ApproverComment["visibility"];
  commentBoxRef: RefObject<HTMLTextAreaElement | null>;
  onCommentDraftChange: (value: string) => void;
  onCommentVisibilityChange: (value: ApproverComment["visibility"]) => void;
  onAddComment: () => void;
  onAppendComment: (comment: ApproverComment) => void;
  onReplaceComments: (next: ApproverComment[]) => void;
};

export function ApproverCommentsSection({
  approvalId,
  detail,
  comments,
  requiredInputs,
  isLoading,
  currentUser,
  commentDraft,
  commentVisibility,
  commentBoxRef,
  onCommentDraftChange,
  onCommentVisibilityChange,
  onAddComment,
  onAppendComment,
  onReplaceComments,
}: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [threadRoot, setThreadRoot] = useState<ApproverComment | null>(null);
  const [linkTarget, setLinkTarget] = useState<ApproverComment | null>(null);

  const totalNodes = countCommentThreadNodes(comments);

  useEffect(() => {
    if (threadRoot && !comments.some((c) => c.id === threadRoot.id)) {
      setThreadRoot(null);
    }
  }, [comments, threadRoot]);

  const copyDeepLink = async (commentId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = `/approvals/${approvalId}#comment-${commentId}`;
    const url = origin ? `${origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <article className="flex min-h-0 flex-col rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <AddApproverCommentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        user={currentUser}
        requiredInputs={requiredInputs}
        onSubmit={(c) => onAppendComment(c)}
      />
      <LinkCommentToEvidenceModal
        open={Boolean(linkTarget)}
        onClose={() => setLinkTarget(null)}
        detail={detail}
        requiredInputs={requiredInputs}
        comment={linkTarget}
        onSave={(commentId, href, label) => {
          onReplaceComments(updateCommentInTree(comments, commentId, { linkedEvidenceHref: href, linkedEvidenceLabel: label }));
        }}
      />
      <CommentThreadDrawer
        open={Boolean(threadRoot)}
        onClose={() => setThreadRoot(null)}
        root={threadRoot}
        allComments={comments}
        currentUser={currentUser}
        onAddReply={(parentId, reply) => onReplaceComments(addReplyToComment(comments, parentId, reply))}
        onPatchComment={(id, patch) => onReplaceComments(updateCommentInTree(comments, id, patch))}
        onDeleteComment={(id) => {
          const next = deleteCommentFromTree(comments, id);
          onReplaceComments(next);
          if (threadRoot?.id === id) setThreadRoot(null);
        }}
        onOpenLinkEvidence={(c) => setLinkTarget(c)}
        onCopyCommentDeepLink={(commentId) => void copyDeepLink(commentId)}
      />

      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-[#111827]">Approver Comments</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{totalNodes}</span>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setAddModalOpen(true)}>
          <MessageSquarePlus className="size-3.5" aria-hidden />
          Add Comment
        </Button>
      </header>

      {comments.length === 0 ? (
        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p>No approver comments yet.</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <li key={comment.id}>
              <div
                className="cursor-pointer rounded-xl border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50/80"
                onClick={() => setThreadRoot(comment)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setThreadRoot(comment);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open thread for comment by ${comment.authorName}`}
              >
                <div className="flex items-start gap-2">
                  <div className="grid size-8 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {comment.authorInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {comment.authorName} ({comment.authorRole})
                      </p>
                      {comment.statusAtComment ? <Badge {...approvalStatusBadgeMap[comment.statusAtComment]} /> : null}
                      {comment.resolved ? (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                          Resolved
                        </span>
                      ) : null}
                      <p className="text-xs text-slate-500">{comment.createdOnLabel}</p>
                    </div>
                    {comment.mentionPreview ? <p className="mt-1 text-xs text-slate-500">Mention: {comment.mentionPreview}</p> : null}
                    <p className="mt-1 line-clamp-3 text-sm text-slate-700">{comment.body}</p>
                    {comment.linkedEvidenceHref ? (
                      <p className="mt-2 text-xs" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <Link href={comment.linkedEvidenceHref} className="font-semibold text-[#2563eb] hover:underline">
                          {comment.linkedEvidenceLabel ?? "Evidence link"}
                        </Link>
                      </p>
                    ) : null}
                    {comment.replies?.length ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {comment.replies.length} repl{comment.replies.length === 1 ? "y" : "ies"}
                      </p>
                    ) : null}
                  </div>
                  <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                    <CommentActionsDropdown
                      comment={comment}
                      onReply={() => {
                        setThreadRoot(comment);
                      }}
                      onEdit={() => setThreadRoot(comment)}
                      onDelete={() => {
                        if (typeof window !== "undefined" && !window.confirm("Delete this comment?")) return;
                        onReplaceComments(deleteCommentFromTree(comments, comment.id));
                      }}
                      onCopyLink={() => void copyDeepLink(comment.id)}
                      onToggleResolved={() =>
                        onReplaceComments(updateCommentInTree(comments, comment.id, { resolved: !comment.resolved }))
                      }
                      onLinkEvidence={() => setLinkTarget(comment)}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="approval-comment-composer" className="text-sm font-semibold text-slate-800">
            Quick comment
          </label>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => commentBoxRef.current?.focus()}>
            Focus composer
          </Button>
        </div>
        <textarea
          id="approval-comment-composer"
          ref={commentBoxRef}
          value={commentDraft}
          disabled={isLoading}
          onChange={(event) => onCommentDraftChange(event.target.value.slice(0, 1200))}
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Add review comments…"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <select
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
            value={commentVisibility}
            onChange={(event) => onCommentVisibilityChange(event.target.value as ApproverComment["visibility"])}
            aria-label="Comment visibility"
          >
            <option value="public_to_project">Visible to project</option>
            <option value="internal">Internal only</option>
          </select>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-500">{commentDraft.length}/1200 characters</p>
            <Button type="button" size="sm" disabled={commentDraft.trim().length === 0 || isLoading} onClick={onAddComment}>
              Add Comment
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
