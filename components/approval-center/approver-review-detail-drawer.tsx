"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/approval-center/approval-center-shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApprovalApprover } from "@/types/approval-center.types";

function reviewStatusBadge(status: ApprovalApprover["reviewStatus"]) {
  switch (status) {
    case "completed":
      return { label: "Completed", tone: "green" as const };
    case "declined":
      return { label: "Declined", tone: "red" as const };
    case "in_review":
      return { label: "In review", tone: "blue" as const };
    default:
      return { label: "Pending", tone: "gray" as const };
  }
}

export function ApproverReviewDetailDrawer({
  open,
  approver,
  packageTitle,
  dueDateLabel,
  onClose,
  onSendReminder,
  onReassignThisApprover,
}: {
  open: boolean;
  approver: ApprovalApprover | null;
  packageTitle: string;
  dueDateLabel?: string | null;
  onClose: () => void;
  onSendReminder: () => void;
  onReassignThisApprover: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && approver) {
      if (!prevOpen.current && !node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = Boolean(open && approver);
  }, [open, approver]);

  if (!approver) return null;

  const badge = reviewStatusBadge(approver.reviewStatus);
  const canRemind = approver.reviewStatus === "pending" || approver.reviewStatus === "in_review";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="approver-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Approver</p>
            <h2 id="approver-drawer-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              {approver.name}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">{approver.role}</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close drawer" onClick={onClose}>
            <X className="size-5" aria-hidden />
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-xl text-sm font-bold",
                "bg-slate-100 text-slate-800 dark:bg-muted dark:text-foreground",
              )}
              aria-hidden
            >
              {approver.initials}
            </div>
            <Badge {...badge} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Package</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-foreground">{packageTitle}</p>
            {dueDateLabel ? (
              <p className="mt-1 text-slate-600">
                Due: <span className="font-medium">{dueDateLabel}</span>
              </p>
            ) : null}
          </div>

          {approver.assignedInputLabels && approver.assignedInputLabels.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned inputs</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {approver.assignedInputLabels.map((label) => (
                  <li
                    key={label}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 dark:border-border dark:bg-muted"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {approver.reviewComments ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review notes</p>
              <p className="mt-1 text-slate-700 dark:text-foreground/90">{approver.reviewComments}</p>
            </div>
          ) : null}

          {approver.reviewedOnLabel ? (
            <p className="text-xs text-slate-500">Review activity: {approver.reviewedOnLabel}</p>
          ) : null}
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-[360px]:flex-none"
            disabled={!canRemind}
            onClick={() => {
              onSendReminder();
              onClose();
            }}
          >
            Send reminder
          </Button>
          <Button
            type="button"
            className="flex-1 min-[360px]:flex-none"
            onClick={() => {
              onReassignThisApprover();
              onClose();
            }}
          >
            Reassign
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
