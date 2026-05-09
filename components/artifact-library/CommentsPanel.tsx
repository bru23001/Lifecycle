import type { ArtifactComment } from "@/types/artifact-library.types";

export function CommentsPanel({ comments }: { comments: ArtifactComment[] }) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <h3 className="text-lg font-semibold text-[#111827] dark:text-foreground">
        Comments ({comments.length})
      </h3>
      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-[#64748b] dark:text-muted-foreground">
          No comments yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-[#e5e7eb] p-3 dark:border-border">
              <p className="text-sm text-[#111827] dark:text-foreground">{comment.body}</p>
              <p className="mt-1 text-xs text-[#64748b] dark:text-muted-foreground">
                {comment.author} • {comment.createdOnLabel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
