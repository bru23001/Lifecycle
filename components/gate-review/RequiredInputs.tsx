import Link from "next/link";

import type { RequiredGateInput } from "@/types/gate-review.types";

import { GateCountBadge, RequiredInputStatusPill } from "./gate-review-shared-widgets";

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
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="mb-0 shrink-0 border-b border-slate-100 px-8 pb-4 pt-8 dark:border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Required Inputs</h2>
            <GateCountBadge count={inputs.length} />
          </div>

          <Link
            href={viewAllHref}
            className="text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all inputs
          </Link>
        </div>
      </header>

      {inputs.length === 0 ? (
        <div className="px-8 pb-8 pt-4" role="alert">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
            No required inputs configured for this gate.
          </div>
        </div>
      ) : (
        <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pb-8 pt-4">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-900 dark:border-border dark:text-foreground">
                <th className="pb-4 pr-8">Input</th>
                <th className="pb-4 pr-8">Description</th>
                <th className="pb-4 pr-8">Provided</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {inputs.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 text-base last:border-b-0 dark:border-border">
                  <td className="py-5 pr-8 font-semibold text-slate-950 dark:text-foreground">
                    {row.href ? (
                      <Link href={row.href} className="hover:text-blue-600 hover:underline dark:hover:text-blue-400">
                        {row.inputCode} {row.name}
                      </Link>
                    ) : (
                      <span>
                        {row.inputCode} {row.name}
                      </span>
                    )}
                  </td>

                  <td className="py-5 pr-8 text-slate-600 dark:text-muted-foreground">{row.description}</td>

                  <td className="py-5 pr-8 font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.provided ? "Yes" : "No"}
                  </td>

                  <td className="py-5">
                    <RequiredInputStatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
