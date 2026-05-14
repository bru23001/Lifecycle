"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { projectOverviewHref } from "@/lib/projects-url";
import type { ApprovalDetail, ApprovalRequiredInput } from "@/types/approval-center.types";

type Props = {
  open: boolean;
  onClose: () => void;
  row: ApprovalRequiredInput | null;
  detail: ApprovalDetail;
};

export function MissingInputRemediationDrawer({ open, onClose, row, detail }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && row) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, row]);

  if (!row) return null;

  const pid = detail?.projectId?.trim() ?? "";
  const hasValidProject = Boolean(pid && pid !== "none");
  const gateLabel = detail.gateCode ? `${detail.gateCode} gate review` : "this approval package";
  const why =
    row.status === "missing"
      ? "This input is required before reviewers can accept the package."
      : "This input is incomplete or needs updates before approval can proceed.";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="missing-input-remediation-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Missing input</p>
            <h2 id="missing-input-remediation-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              {row.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{row.inputCode}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <section>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Why it is required</p>
            <p className="mt-1 leading-relaxed">{why}</p>
          </section>
          <section>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocking rule</p>
            <p className="mt-1 leading-relaxed">Lifecycle evidence rules for {gateLabel}.</p>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Actions</p>
            {hasValidProject ? (
              <div className="flex flex-col gap-2">
                {detail.workspaceHref ? (
                  <Link
                    href={detail.workspaceHref}
                    onClick={onClose}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#2563eb] hover:bg-slate-50"
                  >
                    Open workspace (templates & checklist)
                  </Link>
                ) : null}
                <Link
                  href={`/projects/${pid}/artifacts`}
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#2563eb] hover:bg-slate-50"
                >
                  Create or open artifact
                </Link>
                <Link
                  href={`/projects/${pid}/evidence`}
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#2563eb] hover:bg-slate-50"
                >
                  Add evidence
                </Link>
                <Link
                  href={projectOverviewHref(pid)}
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#2563eb] hover:bg-slate-50"
                >
                  Open project (assign owner)
                </Link>
                {detail.gateReviewHref ? (
                  <Link
                    href={detail.gateReviewHref}
                    onClick={onClose}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-900 hover:bg-blue-100"
                  >
                    Open gate review
                  </Link>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Link a project to enable remediation shortcuts.</p>
            )}
          </section>

          <p className="text-xs text-slate-500">
            Reassign / escalate / structured owner assignment will use workflow APIs when connected.
          </p>
        </div>

        <footer className="shrink-0 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
