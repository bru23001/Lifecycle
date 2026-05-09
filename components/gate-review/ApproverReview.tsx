"use client";

import { MessageSquare } from "lucide-react";

import type { GateApprover } from "@/types/gate-review.types";
import { Button } from "@/components/ui/button";

import { approverStatusBadgeMap, StatusBadge } from "./badge-maps";

export function ApproverReview({
  projectId,
  gateId,
  approvers,
  onOpenComments,
}: {
  projectId: string;
  gateId: string;
  approvers: GateApprover[];
  onOpenComments: (approver: GateApprover) => void;
}) {
  const viewHref = `/projects/${projectId}/gates/${gateId}/approvers`;

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Approver Review</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-muted dark:text-foreground">
            {approvers.length}
          </span>
        </div>
        <a href={viewHref} className="text-sm font-medium text-[#2563eb] hover:underline">
          View approvers
        </a>
      </header>

      {approvers.length === 0 ? (
        <div className="px-5 py-8">
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
            No approvers assigned.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:border-border dark:bg-muted/40 dark:text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Approver
                </th>
                <th scope="col" className="px-5 py-3">
                  Role
                </th>
                <th scope="col" className="px-5 py-3">
                  Status
                </th>
                <th scope="col" className="px-5 py-3">
                  Reviewed On
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-border">
              {approvers.map((row) => {
                const badge = approverStatusBadgeMap[row.status];
                return (
                  <tr key={row.id}>
                    <td className="px-5 py-3 font-medium text-[#111827] dark:text-foreground">{row.name}</td>
                    <td className="px-5 py-3 text-[#475569] dark:text-muted-foreground">{row.role}</td>
                    <td className="px-5 py-3">
                      <StatusBadge label={badge.label} tone={badge.tone} />
                    </td>
                    <td className="px-5 py-3 text-[#475569] dark:text-muted-foreground">
                      {row.reviewedOnLabel ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`View comments from ${row.name}`}
                        disabled={!row.comments}
                        onClick={() => onOpenComments(row)}
                      >
                        <MessageSquare className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
