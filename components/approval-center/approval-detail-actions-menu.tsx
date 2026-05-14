"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { projectAuditTrailListHref, projectGatePackagePreviewHref, projectOverviewHref } from "@/lib/projects-url";
import type { ApprovalDetail } from "@/types/approval-center.types";

type Props = {
  detail: ApprovalDetail;
  /** Opens export options modal from the detail panel (when set, replaces direct gate preview link for this action). */
  onOpenDownloadPackage?: () => void;
  /** When set, approver quick actions call these handlers (detail panel owns modals). */
  approverQuickActions?: {
    onAddApprover: () => void;
    onReassign: () => void;
    onEscalate: () => void;
  };
};

function DisabledRow({ children }: { children: ReactNode }) {
  return (
    <span role="menuitem" className="block cursor-not-allowed px-3 py-2 text-slate-400" title="Not available in local mode">
      {children}
    </span>
  );
}

export function ApprovalDetailActionsMenu({ detail, onOpenDownloadPackage, approverQuickActions }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pid = detail.projectId;
  const hasProject = Boolean(pid);
  const gateLower = detail.gateCode?.trim().toLowerCase();

  return (
    <div className="relative" ref={wrapRef}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </Button>
      {open ? (
        <div
          role="menu"
          aria-label="Approval package actions"
          className="absolute right-0 z-30 mt-1 min-w-[14rem] rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-border dark:bg-card"
        >
          {detail.gateReviewHref ? (
            <Link
              role="menuitem"
              href={detail.gateReviewHref}
              className="block px-3 py-2 text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Open gate review
            </Link>
          ) : null}
          {hasProject ? (
            <Link
              role="menuitem"
              href={projectOverviewHref(pid)}
              className="block px-3 py-2 text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Open project
            </Link>
          ) : null}
          {onOpenDownloadPackage ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
              onClick={() => {
                setOpen(false);
                onOpenDownloadPackage();
              }}
            >
              Download review package
            </button>
          ) : hasProject && gateLower ? (
            <Link
              role="menuitem"
              href={projectGatePackagePreviewHref(pid, gateLower)}
              className="block px-3 py-2 text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Download review package
            </Link>
          ) : (
            <span
              role="menuitem"
              className="block cursor-not-allowed px-3 py-2 text-slate-400"
              title="Available for gate reviews with a package preview"
            >
              Download review package
            </span>
          )}
          {approverQuickActions ? (
            <>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  approverQuickActions.onReassign();
                }}
              >
                Reassign approval
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  approverQuickActions.onAddApprover();
                }}
              >
                Add approver
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  approverQuickActions.onEscalate();
                }}
              >
                Escalate
              </button>
            </>
          ) : (
            <>
              <DisabledRow>Reassign approval</DisabledRow>
              <DisabledRow>Add approver</DisabledRow>
              <DisabledRow>Escalate</DisabledRow>
            </>
          )}
          <DisabledRow>Mark blocked</DisabledRow>
          <DisabledRow>Cancel approval request</DisabledRow>
          {hasProject ? (
            <Link
              role="menuitem"
              href={projectAuditTrailListHref(pid)}
              className="block px-3 py-2 text-slate-800 hover:bg-slate-50 dark:hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              View audit trail
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
