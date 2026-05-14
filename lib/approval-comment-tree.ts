import type { ApproverComment } from "@/types/approval-center.types";

export function countCommentThreadNodes(comments: ApproverComment[]): number {
  let n = 0;
  function walk(list: ApproverComment[]) {
    for (const c of list) {
      n += 1;
      if (c.replies?.length) walk(c.replies);
    }
  }
  walk(comments);
  return n;
}

export function findCommentById(comments: ApproverComment[], id: string): ApproverComment | null {
  for (const c of comments) {
    if (c.id === id) return c;
    if (c.replies?.length) {
      const nested = findCommentById(c.replies, id);
      if (nested) return nested;
    }
  }
  return null;
}

export function addReplyToComment(
  comments: ApproverComment[],
  parentId: string,
  reply: ApproverComment,
): ApproverComment[] {
  return comments.map((c) => {
    if (c.id === parentId) return { ...c, replies: [...(c.replies ?? []), reply] };
    if (c.replies?.length) return { ...c, replies: addReplyToComment(c.replies, parentId, reply) };
    return c;
  });
}

export function updateCommentInTree(
  comments: ApproverComment[],
  id: string,
  patch: Partial<ApproverComment>,
): ApproverComment[] {
  return comments.map((c) => {
    if (c.id === id) return { ...c, ...patch };
    if (c.replies?.length) return { ...c, replies: updateCommentInTree(c.replies, id, patch) };
    return c;
  });
}

export function deleteCommentFromTree(comments: ApproverComment[], id: string): ApproverComment[] {
  return comments
    .filter((c) => c.id !== id)
    .map((c) =>
      c.replies?.length ? { ...c, replies: deleteCommentFromTree(c.replies, id) } : c,
    );
}
