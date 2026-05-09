import Link from "next/link";
import { ExternalLink } from "lucide-react";

import type { RequiredGateInput } from "@/types/gate-review.types";

import { inputStatusBadgeMap, StatusBadge } from "./badge-maps";

export function RequiredInputs({
  projectId,
  gateId,
  inputs,
}: {
  projectId: string;
  gateId: string;
  inputs: RequiredGateInput[];
}) {
  const viewAllHref = `/projects/${projectId}/gates/${gateId}/inputs`;

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Required Inputs</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-muted dark:text-foreground">
            {inputs.length}
          </span>
        </div>
        <Link href={viewAllHref} className="text-sm font-medium text-[#2563eb] hover:underline">
          View all inputs
        </Link>
      </header>

      {inputs.length === 0 ? (
        <div className="px-5 py-8">
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
            No required inputs configured for this gate.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:border-border dark:bg-muted/40 dark:text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Input
                </th>
                <th scope="col" className="px-5 py-3">
                  Description
                </th>
                <th scope="col" className="px-5 py-3">
                  Provided
                </th>
                <th scope="col" className="px-5 py-3">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-border">
              {inputs.map((row) => {
                const badge = inputStatusBadgeMap[row.status];
                return (
                  <tr key={row.id} className="bg-white dark:bg-card">
                    <td className="px-5 py-3 font-medium text-[#111827] dark:text-foreground">
                      <div className="flex flex-col">
                        <span className="text-xs font-normal text-[#64748b] dark:text-muted-foreground">
                          {row.inputCode}
                        </span>
                        {row.href ? (
                          <Link href={row.href} className="hover:underline">
                            {row.name}
                          </Link>
                        ) : (
                          <span>{row.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#475569] dark:text-muted-foreground">{row.description}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          row.provided
                            ? "font-medium text-emerald-700 dark:text-emerald-400"
                            : "font-medium text-red-700 dark:text-red-400"
                        }
                      >
                        {row.provided ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge label={badge.label} tone={badge.tone} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {row.href ? (
                        <Link
                          href={row.href}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#2563eb] hover:underline"
                          aria-label={`Open ${row.name}`}
                        >
                          Open
                          <ExternalLink className="size-3.5" aria-hidden />
                        </Link>
                      ) : (
                        <span className="text-sm text-[#64748b] dark:text-muted-foreground">—</span>
                      )}
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
