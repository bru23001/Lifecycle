"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

import { useRouter } from "next/navigation";

import { sendGateApproverReminders } from "@/app/actions/sendGateApproverReminders";
import { Button } from "@/components/ui/button";
import type { GateId } from "@/lib/gateRules";
import type {
  GateApprover,
  GateApproverComment,
  GateApproverHistoryEntry,
} from "@/types/gate-review.types";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

import { ApproverWorkflowBadge, formatEvidenceAddedOn } from "./gate-review-shared-widgets";

function useDialogOpen(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);
  return ref;
}

function DrawerShell({
  ref,
  titleId,
  title,
  subtitle,
  onClose,
  widthClassName,
  children,
  footer,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  widthClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cn(
        "fixed inset-y-0 right-0 z-50 m-0 flex max-w-[100vw] flex-col border-0 border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card",
        widthClassName ?? "w-[min(100vw-0.5rem,28rem)]",
      )}
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
        <div className="min-w-0">
          {subtitle ? (
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>
      <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer ? (
        <footer className="shrink-0 border-t border-slate-200 px-5 py-3 dark:border-border">{footer}</footer>
      ) : null}
    </dialog>
  );
}

function ModalShell({
  ref,
  titleId,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <div className="flex max-h-[min(85vh,720px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            {subtitle ? (
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-slate-200 px-5 py-3 dark:border-border">{footer}</footer>
        ) : null}
      </div>
    </dialog>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0 dark:border-border/60">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-slate-800 dark:text-foreground/90">{children}</div>
    </div>
  );
}

function decisionLabelForApprover(a: GateApprover): string {
  if (a.decisionLabel) return a.decisionLabel;
  switch (a.status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "reviewed":
      return "Reviewed";
    case "in_review":
      return "In review";
    case "pending":
    default:
      return "—";
  }
}

export function ApproverReviewDetailDrawer({
  open,
  onClose,
  approver,
}: {
  open: boolean;
  onClose: () => void;
  approver: GateApprover | null;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);

  if (!approver) return null;

  const history: GateApproverHistoryEntry[] = approver.approvalHistory ?? [];

  return (
    <DrawerShell
      ref={ref}
      titleId={titleId}
      subtitle="Approver review"
      title={approver.name}
      onClose={onClose}
      widthClassName="w-[min(100vw-0.5rem,32rem)]"
      footer={
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      }
    >
      <FieldBlock label="Role">{approver.role}</FieldBlock>
      <FieldBlock label="Review status">
        <ApproverWorkflowBadge status={approver.status} />
      </FieldBlock>
      <FieldBlock label="Reviewed on">
        {approver.reviewedOnLabel ? formatEvidenceAddedOn(approver.reviewedOnLabel) : "—"}
      </FieldBlock>
      <FieldBlock label="Comments summary">{approver.comments?.trim() ? approver.comments : "—"}</FieldBlock>
      <FieldBlock label="Decision">{decisionLabelForApprover(approver)}</FieldBlock>
      <FieldBlock label="Related approval history">
        {history.length ? (
          <ol className="space-y-3">
            {history.map((h) => (
              <li key={h.id} className="rounded-lg border border-slate-100 p-3 text-sm dark:border-border">
                <p className="font-semibold text-foreground">{h.label}</p>
                <p className="mt-1 text-muted-foreground">{h.detail}</p>
                <p className="mt-2 text-xs text-muted-foreground">{h.atLabel}</p>
              </li>
            ))}
          </ol>
        ) : (
          <span className="text-muted-foreground">No history entries yet.</span>
        )}
      </FieldBlock>
    </DrawerShell>
  );
}

const VISIBILITY_OPTIONS: { value: GateApproverComment["visibility"]; label: string }[] = [
  { value: "reviewers", label: "Reviewers" },
  { value: "internal", label: "Internal" },
  { value: "project_team", label: "Project team" },
];

function buildInitialThread(approver: GateApprover): GateApproverComment[] {
  if (approver.commentThread?.length) return [...approver.commentThread];
  if (approver.comments?.trim()) {
    return [
      {
        id: `${approver.id}-note`,
        author: approver.name,
        role: approver.role,
        timestampLabel: approver.reviewedOnLabel ?? "Recorded",
        visibility: "reviewers",
        body: approver.comments.trim(),
      },
    ];
  }
  return [];
}

export function ApproverCommentsModal({
  open,
  onClose,
  approver,
  sessionComments,
  onAddComment,
}: {
  open: boolean;
  onClose: () => void;
  approver: GateApprover | null;
  /** Appended in-session notes (until refresh). */
  sessionComments: GateApproverComment[];
  onAddComment: (body: string, visibility: GateApproverComment["visibility"]) => void;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const [draft, setDraft] = useState("");
  const [visibility, setVisibility] = useState<GateApproverComment["visibility"]>("reviewers");

  useEffect(() => {
    if (open) {
      setDraft("");
      setVisibility("reviewers");
    }
  }, [open, approver?.id]);

  const thread = useMemo(() => {
    if (!approver) return [];
    return [...buildInitialThread(approver), ...sessionComments];
  }, [approver, sessionComments]);

  if (!approver) return null;

  function submit() {
    const body = draft.trim();
    if (!body) return;
    onAddComment(body, visibility);
    setDraft("");
  }

  return (
    <ModalShell
      ref={ref}
      titleId={titleId}
      subtitle="Approver comments"
      title={`Thread — ${approver.name}`}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {thread.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Add the first note below.</p>
          ) : (
            thread.map((c) => (
              <article
                key={c.id}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-border dark:bg-muted/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{c.author}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:border-border dark:bg-card dark:text-muted-foreground">
                    {c.visibility.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.role} · {c.timestampLabel}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{c.body}</p>
              </article>
            ))
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-3 dark:border-border">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Add comment</p>
          <label className="mt-2 block text-xs font-medium text-muted-foreground" htmlFor={`${titleId}-vis`}>
            Visibility
          </label>
          <select
            id={`${titleId}-vis`}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as GateApproverComment["visibility"])}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border dark:bg-background"
          >
            {VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Write a comment…"
            className="mt-2 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-border dark:bg-background"
          />
          <div className="mt-2 flex justify-end">
            <Button type="button" onClick={submit} disabled={!draft.trim()}>
              Post comment
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            New posts are kept in this session until comment persistence is enabled for assignments.
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

export function ApproverAssignmentDrawer({
  open,
  onClose,
  approvers,
  requiredRoles,
  onRequestAdd,
  onRemoveApprover,
  removePending = false,
}: {
  open: boolean;
  onClose: () => void;
  approvers: GateApprover[];
  requiredRoles: string[];
  onRequestAdd: () => void;
  onRemoveApprover: (approver: GateApprover) => void;
  removePending?: boolean;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const rolesCovered = useMemo(() => new Set(approvers.map((a) => a.role)), [approvers]);

  return (
    <DrawerShell
      ref={ref}
      titleId={titleId}
      subtitle="Gate approvers"
      title="Approver assignments"
      onClose={onClose}
      widthClassName="w-[min(100vw-0.5rem,36rem)]"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button type="button" className="flex-1 bg-[#2563eb] text-white hover:bg-[#1d4ed8]" onClick={onRequestAdd}>
            Add approver
          </Button>
        </div>
      }
    >
      <FieldBlock label="Required approver roles">
        <ul className="flex flex-wrap gap-1.5">
          {requiredRoles.map((r) => (
            <li key={r}>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  rolesCovered.has(r)
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground",
                )}
              >
                {r}
              </span>
            </li>
          ))}
        </ul>
      </FieldBlock>

      <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">Assigned approvers</p>
      {approvers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No approvers assigned yet.</p>
      ) : (
        <ul className="space-y-2">
          {approvers.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 dark:border-border sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.role}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ApproverWorkflowBadge status={a.status} />
                  <span className="text-xs text-muted-foreground">
                    Due: {a.dueDateLabel?.trim() ? a.dueDateLabel : "—"}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={removePending}
                onClick={() => onRemoveApprover(a)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </DrawerShell>
  );
}

export function SendApproverReminderModal({
  open,
  onClose,
  projectId,
  gateId,
  pendingApprovers,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  gateId: GateId;
  pendingApprovers: GateApprover[];
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const router = useRouter();
  const [message, setMessage] = useState(
    "Friendly reminder: your gate review response is still outstanding. Please complete your review when you can.",
  );
  const [includeDueDate, setIncludeDueDate] = useState(true);
  const [includeReviewLink, setIncludeReviewLink] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const ids = useMemo(() => pendingApprovers.map((a) => a.id), [pendingApprovers]);

  return (
    <ModalShell
      ref={ref}
      titleId={titleId}
      subtitle="Notifications"
      title="Send reminder"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
            disabled={pending || pendingApprovers.length === 0}
            onClick={() => {
              if (pendingApprovers.length === 0) return;
              setError(null);
              startTransition(async () => {
                try {
                  const res = await sendGateApproverReminders({
                    projectId,
                    gateId,
                    assignmentIds: ids,
                    message,
                    includeDueDate,
                    includeReviewLink,
                  });
                  if (!res.ok) {
                    setError(toUserMessage(res.error));
                    return;
                  }
                  router.refresh();
                  onClose();
                } catch (e) {
                  setError(toUserMessage(e));
                }
              });
            }}
          >
            {pending ? "Sending…" : "Send reminder"}
          </Button>
        </div>
      }
    >
      <FieldBlock label="Pending approvers">
        {pendingApprovers.length ? (
          <ul className="space-y-1">
            {pendingApprovers.map((a) => (
              <li key={a.id} className="text-sm">
                <span className="font-medium">{a.name}</span>
                <span className="text-muted-foreground"> — {a.role}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-muted-foreground">No pending approvers.</span>
        )}
      </FieldBlock>

      <label className="mt-4 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reminder message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>

      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeDueDate}
            onChange={(e) => setIncludeDueDate(e.target.checked)}
            className="size-4 rounded border-slate-300"
          />
          Include due date in reminder metadata
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeReviewLink}
            onChange={(e) => setIncludeReviewLink(e.target.checked)}
            className="size-4 rounded border-slate-300"
          />
          Include review link flag in reminder metadata
        </label>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </div>
      ) : null}
    </ModalShell>
  );
}
