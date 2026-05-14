"use client";

import { MessageSquare, Share2, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  addWizardCollaborationComment,
  assignArtifactReviewerRequest,
  listUsersForArtifactReview,
  recordWizardArtifactShare,
  searchWorkspaceUsersForWizard,
  setWizardCollaborationCommentResolved,
} from "@/app/actions/wizardCollaboration";
import { Button } from "@/components/ui/button";
import { useWizardDialog } from "@/components/template-wizard/template-wizard-flow-modals";
import { cn } from "@/lib/utils";
import type {
  WizardCollaborationCommentDto,
  WizardPopoverAnchorRect,
  WizardReviewRequestSummaryDto,
} from "@/types/template-wizard.types";

function CollabDrawer({
  open,
  title,
  onClose,
  children,
  footer,
  testId,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  testId: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[125] flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close drawer" onClick={onClose} />
      <div
        data-testid={testId}
        className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-[var(--app-bg)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">{children}</div>
        {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function WizardCollaborationSection({
  projectId,
  templateId,
  artifactId,
  comments,
  reviewRequests,
  fieldCommentDraft,
  onCloseFieldComment,
}: {
  projectId: string;
  templateId: string;
  artifactId?: string;
  comments: WizardCollaborationCommentDto[];
  reviewRequests: WizardReviewRequestSummaryDto[];
  fieldCommentDraft: {
    sectionId: string;
    sectionTitle: string;
    fieldName?: string;
    anchor: WizardPopoverAnchorRect;
  } | null;
  onCloseFieldComment: () => void;
}) {
  const router = useRouter();
  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/projects/${projectId}/templates/${encodeURIComponent(templateId)}`
      : "";

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center gap-2 px-5 pb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setCommentsOpen(true)}
          data-testid="wizard-collab-comments-open"
        >
          <MessageSquare className="size-3.5" aria-hidden />
          Comments
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setAssignOpen(true)}>
          <UserPlus className="size-3.5" aria-hidden />
          Assign reviewer
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setShareOpen(true)}>
          <Share2 className="size-3.5" aria-hidden />
          Share
        </Button>
      </div>

      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        projectId={projectId}
        templateId={templateId}
        artifactId={artifactId}
        comments={comments}
        reviewRequests={reviewRequests}
        onAfterChange={refresh}
      />

      <AssignReviewerModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        projectId={projectId}
        templateId={templateId}
        artifactId={artifactId}
        onAfterAssign={refresh}
      />

      <ShareArtifactModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        projectId={projectId}
        templateId={templateId}
        shareUrl={shareUrl}
      />

      <FieldCommentPopover
        draft={fieldCommentDraft}
        onClose={onCloseFieldComment}
        projectId={projectId}
        templateId={templateId}
        artifactId={artifactId}
        onAfterSubmit={refresh}
      />
    </>
  );
}

function CommentsDrawer({
  open,
  onClose,
  projectId,
  templateId,
  artifactId,
  comments,
  reviewRequests,
  onAfterChange,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  templateId: string;
  artifactId?: string;
  comments: WizardCollaborationCommentDto[];
  reviewRequests: WizardReviewRequestSummaryDto[];
  onAfterChange: () => void;
}) {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"internal" | "reviewers">("internal");
  const [busy, setBusy] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<{ id: string; name: string }[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      setBody("");
      setMentionOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!mentionOpen || mentionQuery.length < 1) {
      setMentionUsers([]);
      return;
    }
    const t = window.setTimeout(() => {
      void searchWorkspaceUsersForWizard(projectId, mentionQuery).then((res) => {
        if (res.ok) setMentionUsers(res.users.map((u) => ({ id: u.id, name: u.name })));
      });
    }, 200);
    return () => window.clearTimeout(t);
  }, [mentionQuery, mentionOpen, projectId]);

  function onComposerInput(v: string) {
    setBody(v);
    const m = /@([\w.-]{0,40})$/i.exec(v.slice(0, taRef.current?.selectionStart ?? v.length));
    if (m) {
      setMentionOpen(true);
      setMentionQuery(m[1] ?? "");
    } else {
      setMentionOpen(false);
    }
  }

  function insertMention(name: string) {
    const el = taRef.current;
    const v = body;
    if (!el) {
      setBody((prev) => `${prev.replace(/@[\w.-]*$/i, "")}@${name} `);
      setMentionOpen(false);
      return;
    }
    const pos = el.selectionStart ?? v.length;
    const head = v.slice(0, pos);
    const tail = v.slice(pos);
    const replaced = head.replace(/@[\w.-]*$/i, `@${name} `) + tail;
    setBody(replaced);
    setMentionOpen(false);
    window.setTimeout(() => {
      el.focus();
      const np = replaced.length - tail.length;
      el.setSelectionRange(np, np);
    }, 0);
  }

  async function submit() {
    const t = body.trim();
    if (!t) return;
    setBusy(true);
    try {
      const res = await addWizardCollaborationComment({
        projectId,
        templateId,
        artifactId: artifactId ?? null,
        body: t,
        visibility,
      });
      if (res.ok) {
        setBody("");
        onAfterChange();
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleResolved(c: WizardCollaborationCommentDto) {
    setBusy(true);
    try {
      const res = await setWizardCollaborationCommentResolved({
        projectId,
        commentId: c.id,
        resolved: !c.resolved,
      });
      if (res.ok) onAfterChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <CollabDrawer
      open={open}
      title="Artifact comments"
      onClose={onClose}
      testId="wizard-collaboration-comments-drawer"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {reviewRequests.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Recent review requests</p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {reviewRequests.slice(0, 5).map((r) => (
                <li key={r.id} className="rounded-lg border bg-muted/20 px-2 py-1.5">
                  <span className="font-medium">{r.assigneeName}</span> · {r.reviewScope}
                  {r.dueAt ? ` · due ${new Date(r.dueAt).toLocaleDateString()}` : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Thread</p>
          {comments.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No comments yet. Be the first to leave a note.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm",
                    c.resolved ? "border-border bg-muted/20 opacity-80" : "border-border bg-card",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {c.authorInitials} · {c.authorName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  {c.sectionId || c.fieldName ? (
                    <p className="mt-1 text-[11px] text-[#2563eb]">
                      {c.fieldName ? `Field: ${c.fieldName}` : null}
                      {c.sectionId && !c.fieldName ? `Section: ${c.sectionId}` : null}
                    </p>
                  ) : null}
                  <p className="mt-1 whitespace-pre-wrap text-foreground/90">{c.body}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void toggleResolved(c)}>
                      {c.resolved ? "Reopen" : "Resolve"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative space-y-2 border-t pt-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">New comment</span>
            <textarea
              ref={taRef}
              rows={4}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={body}
              onChange={(e) => onComposerInput(e.target.value)}
              placeholder="Use @ to mention someone…"
            />
          </label>
          {mentionOpen && mentionUsers.length > 0 ? (
            <ul className="absolute bottom-full left-0 z-10 mb-1 max-h-40 w-full overflow-auto rounded-lg border bg-popover py-1 text-sm shadow-md">
              {mentionUsers.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left hover:bg-muted"
                    onClick={() => insertMention(u.name.replace(/\s+/g, ""))}
                  >
                    {u.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <label className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Visibility</span>
            <select
              className="rounded border bg-background px-2 py-1"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "internal" | "reviewers")}
            >
              <option value="internal">Internal</option>
              <option value="reviewers">Reviewers</option>
            </select>
          </label>
          <Button type="button" size="sm" disabled={busy || !body.trim()} onClick={() => void submit()}>
            Post comment
          </Button>
        </div>
      </div>
    </CollabDrawer>
  );
}

function AssignReviewerModal({
  open,
  onClose,
  projectId,
  templateId,
  artifactId,
  onAfterAssign,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  templateId: string;
  artifactId?: string;
  onAfterAssign: () => void;
}) {
  const ref = useWizardDialog(open);
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [due, setDue] = useState("");
  const [scope, setScope] = useState("full");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    if (!open) return;
    void listUsersForArtifactReview(projectId).then((res) => {
      if (res.ok) setUsers(res.users.map((u) => ({ id: u.id, name: u.name, role: u.role })));
    });
  }, [open, projectId]);

  const filtered = useMemo(() => {
    const s = roleFilter.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => u.role.toLowerCase().includes(s) || u.name.toLowerCase().includes(s));
  }, [users, roleFilter]);

  async function submit() {
    if (!assigneeId) return;
    setBusy(true);
    try {
      const res = await assignArtifactReviewerRequest({
        projectId,
        templateId,
        artifactId: artifactId ?? null,
        assigneeUserId: assigneeId,
        dueAt: due || null,
        reviewScope: scope,
        instructions: instructions.trim() || null,
      });
      if (res.ok) {
        onAfterAssign();
        onClose();
        setInstructions("");
        setDue("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[135] w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="assign-reviewer-title"
      data-testid="wizard-assign-reviewer-modal"
    >
      <div className="flex max-h-[min(88vh,640px)] flex-col">
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="assign-reviewer-title" className="text-lg font-semibold text-foreground">
              Assign reviewer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Creates a review request record for this template.</p>
          </div>
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Reviewer</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-2 text-sm"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Select…</option>
              {filtered.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.role}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Role filter (optional)</span>
            <input
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="Filter list by role or name"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Due date</span>
            <input type="date" className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Review scope</span>
            <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="full">Full artifact</option>
              <option value="current_section">Current section only</option>
              <option value="validation">Validation / export readiness</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Instructions</span>
            <textarea
              rows={3}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={busy || !assigneeId} onClick={() => void submit()}>
            Assign
          </Button>
        </div>
      </div>
    </dialog>
  );
}

function ShareArtifactModal({
  open,
  onClose,
  projectId,
  templateId,
  shareUrl,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  templateId: string;
  shareUrl: string;
}) {
  const ref = useWizardDialog(open);
  const [perm, setPerm] = useState("viewer");
  const [exp, setExp] = useState("none");
  const [invite, setInvite] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    setBusy(true);
    try {
      await recordWizardArtifactShare({
        projectId,
        templateId,
        permissionLevel: perm,
        expirationChoice: exp,
      });
      await copy();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-[135] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="share-artifact-title"
      data-testid="wizard-share-artifact-modal"
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <h2 id="share-artifact-title" className="text-lg font-semibold text-foreground">
            Share template wizard
          </h2>
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Recipients must be able to sign in and open this project. The link opens this template in the wizard.
        </p>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Share link</span>
          <input readOnly className="h-9 w-full rounded-md border bg-muted/30 px-2 font-mono text-xs" value={shareUrl} />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Invite (optional note)</span>
          <textarea
            rows={2}
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            placeholder="Email addresses are not sent automatically in this build."
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Permission level</span>
          <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={perm} onChange={(e) => setPerm(e.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="commenter">Commenter</option>
            <option value="editor">Editor</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Link expiration</span>
          <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={exp} onChange={(e) => setExp(e.target.value)}>
            <option value="none">No automatic expiry</option>
            <option value="7d">7 days (policy reminder)</option>
            <option value="30d">30 days (policy reminder)</option>
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={() => void share()}>
            Share
          </Button>
        </div>
      </div>
    </dialog>
  );
}

const FIELD_COMMENT_POPOVER_WIDTH = 360;
const FIELD_COMMENT_POPOVER_MARGIN = 8;
const FIELD_COMMENT_POPOVER_VIEWPORT_PAD = 12;

/**
 * Compute viewport-fitted top/left coordinates that anchor a popover beneath
 * (or above) its trigger button rect. Falls back to above-anchor placement when
 * the popover would clip the bottom of the viewport.
 */
function computePopoverPosition(
  anchor: WizardPopoverAnchorRect,
  popoverHeight: number,
): { top: number; left: number; placement: "below" | "above" } {
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : anchor.left + FIELD_COMMENT_POPOVER_WIDTH;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : anchor.bottom + popoverHeight;

  const maxLeft = viewportWidth - FIELD_COMMENT_POPOVER_WIDTH - FIELD_COMMENT_POPOVER_VIEWPORT_PAD;
  const minLeft = FIELD_COMMENT_POPOVER_VIEWPORT_PAD;
  const desiredLeft = anchor.left;
  const left = Math.max(minLeft, Math.min(desiredLeft, maxLeft));

  const spaceBelow = viewportHeight - anchor.bottom;
  const fitsBelow = spaceBelow >= popoverHeight + FIELD_COMMENT_POPOVER_MARGIN;
  if (fitsBelow) {
    return { top: anchor.bottom + FIELD_COMMENT_POPOVER_MARGIN, placement: "below", left };
  }
  const top = Math.max(
    FIELD_COMMENT_POPOVER_VIEWPORT_PAD,
    anchor.top - popoverHeight - FIELD_COMMENT_POPOVER_MARGIN,
  );
  return { top, placement: "above", left };
}

function FieldCommentPopover({
  draft,
  onClose,
  projectId,
  templateId,
  artifactId,
  onAfterSubmit,
}: {
  draft: {
    sectionId: string;
    sectionTitle: string;
    fieldName?: string;
    anchor: WizardPopoverAnchorRect;
  } | null;
  onClose: () => void;
  projectId: string;
  templateId: string;
  artifactId?: string;
  onAfterSubmit: () => void;
}) {
  const open = Boolean(draft);
  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [vis, setVis] = useState<"internal" | "reviewers">("internal");
  const [busy, setBusy] = useState(false);
  // Approximate popover height; refined on mount so we can pick above/below
  // placement deterministically without relying on layout measurement.
  const [measuredHeight, setMeasuredHeight] = useState(260);

  useEffect(() => {
    if (!open) {
      setBody("");
      return;
    }
    // Focus the textarea after the popover mounts so typing starts immediately.
    const handle = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = popoverRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (Math.abs(r.height - measuredHeight) > 4) {
      setMeasuredHeight(r.height);
    }
  }, [open, body, measuredHeight]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onPointer(e: MouseEvent) {
      const node = popoverRef.current;
      if (!node) return;
      if (e.target instanceof Node && node.contains(e.target)) return;
      onClose();
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onClose]);

  async function submit() {
    if (!draft || !body.trim()) return;
    setBusy(true);
    try {
      const res = await addWizardCollaborationComment({
        projectId,
        templateId,
        artifactId: artifactId ?? null,
        sectionId: draft.sectionId,
        fieldName: draft.fieldName ?? null,
        body: body.trim(),
        visibility: vis,
      });
      if (res.ok) {
        onAfterSubmit();
        onClose();
      }
    } finally {
      setBusy(false);
    }
  }

  if (!draft) return null;

  const { top, left, placement } = computePopoverPosition(draft.anchor, measuredHeight);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={
        draft.fieldName
          ? `Comment on field ${draft.fieldName}`
          : `Comment on section ${draft.sectionTitle}`
      }
      data-testid="wizard-field-comment-popover"
      data-placement={placement}
      className="fixed z-[135] rounded-xl border border-border bg-card shadow-xl"
      style={{
        top,
        left,
        width: FIELD_COMMENT_POPOVER_WIDTH,
      }}
    >
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {draft.fieldName ? "Field comment" : "Section comment"}
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {draft.fieldName ?? draft.sectionTitle}
            </p>
            {draft.fieldName ? (
              <p className="truncate text-[11px] text-muted-foreground">
                in {draft.sectionTitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close comment popover"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          rows={4}
          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment for reviewers…"
          data-testid="wizard-field-comment-textarea"
        />
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Visibility</span>
          <select
            className="rounded border bg-background px-2 py-1"
            value={vis}
            onChange={(e) => setVis(e.target.value as "internal" | "reviewers")}
          >
            <option value="internal">Internal</option>
            <option value="reviewers">Reviewers</option>
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy || !body.trim()}
            onClick={() => void submit()}
            data-testid="wizard-field-comment-submit"
          >
            Add comment
          </Button>
        </div>
      </div>
    </div>
  );
}
