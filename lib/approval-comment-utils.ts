import type { ApproverComment } from "@/types/approval-center.types";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";

export function formatApproverCommentTimestamp(d = new Date()) {
  return formatDateTimeAbsolute(d);
}

export function buildApproverComment(opts: {
  body: string;
  visibility: ApproverComment["visibility"];
  user: { name: string; role: string; initials: string };
  statusAtComment?: ApproverComment["statusAtComment"];
  relatedInputCode?: string;
  mentionPreview?: string;
}): ApproverComment {
  const ts = Date.now();
  return {
    id: `comment-${ts}-${Math.random().toString(36).slice(2, 7)}`,
    authorName: opts.user.name,
    authorRole: opts.user.role,
    authorInitials: opts.user.initials,
    statusAtComment: opts.statusAtComment ?? "in_review",
    createdOnLabel: formatApproverCommentTimestamp(),
    body: opts.body.trim(),
    visibility: opts.visibility,
    relatedInputCode: opts.relatedInputCode,
    mentionPreview: opts.mentionPreview?.trim() || undefined,
  };
}

export function buildReplyComment(opts: {
  body: string;
  visibility: ApproverComment["visibility"];
  user: { name: string; role: string; initials: string };
}): ApproverComment {
  const ts = Date.now();
  return {
    id: `reply-${ts}-${Math.random().toString(36).slice(2, 7)}`,
    authorName: opts.user.name,
    authorRole: opts.user.role,
    authorInitials: opts.user.initials,
    createdOnLabel: formatApproverCommentTimestamp(),
    body: opts.body.trim(),
    visibility: opts.visibility,
  };
}
