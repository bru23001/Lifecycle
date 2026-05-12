"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import type { GateApprover } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

import { ApproverWorkflowBadge, formatEvidenceAddedOn, GateCountBadge } from "./gate-review-shared-widgets";

export function ApproverReview({
  projectId,
  gateId,
  approvers,
  onOpenComments,
  embedded = false,
}: {
  projectId: string;
  gateId: string;
  approvers: GateApprover[];
  onOpenComments: (approver: GateApprover) => void;
  /** When true, render without outer card chrome (used inside combined decision card). */
  embedded?: boolean;
}) {
  const viewHref = `/projects/${projectId}/gates/${gateId}/approvers`;

  const header = (
    <header
      className={cn(
        "shrink-0 border-b border-slate-100 dark:border-border",
        embedded ? "mb-6 mt-8 pb-4" : "px-8 pb-4 pt-8",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Approver Review</h2>
          <GateCountBadge count={approvers.length} />
        </div>

        <Link
          href={viewHref}
          className="text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View approvers
        </Link>
      </div>
    </header>
  );

  const body =
    approvers.length === 0 ? (
      <div className={cn(!embedded && "px-8 pb-8 pt-4")} role="alert">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
          No approvers assigned.
        </div>
      </div>
    ) : (
      <div className={cn(!embedded && "min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pb-8 pt-4", embedded && "overflow-x-auto")}>
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm font-semibold text-slate-900 dark:border-border dark:text-foreground">
              <th className="pb-4 pr-8">Approver</th>
              <th className="pb-4 pr-8">Role</th>
              <th className="pb-4 pr-8">Status</th>
              <th className="pb-4 pr-8">Reviewed On</th>
              <th className="pb-4 text-right" />
            </tr>
          </thead>
          <tbody>
            {approvers.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 text-base last:border-b-0 dark:border-border">
                <td className="py-5 pr-8 font-semibold text-slate-950 dark:text-foreground">{row.name}</td>

                <td className="py-5 pr-8 text-slate-700 dark:text-foreground/90">{row.role}</td>

                <td className="py-5 pr-8">
                  <ApproverWorkflowBadge status={row.status} />
                </td>

                <td className="whitespace-pre-line py-5 pr-8 text-slate-700 dark:text-foreground/90">
                  {row.reviewedOnLabel ? formatEvidenceAddedOn(row.reviewedOnLabel) : "—"}
                </td>

                <td className="py-5 text-right">
                  <button
                    type="button"
                    aria-label={`View comments from ${row.name}`}
                    disabled={!row.comments}
                    onClick={() => onOpenComments(row)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-40 dark:text-blue-400 dark:hover:bg-blue-950/40"
                  >
                    <MessageSquare className="h-5 w-5" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  if (embedded) {
    return (
      <div className="flex flex-col" role="region" aria-label="Approver review">
        {header}
        {body}
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      {header}
      {body}
    </section>
  );
}
