"use client";

import Link from "next/link";

import type { GateEvidenceItem } from "@/types/gate-review.types";

import {
  EvidenceFileIcon,
  EvidencePreviewDownloadActions,
  evidenceToneForIndex,
  evidenceTypeLabel,
  formatEvidenceAddedOn,
  GateCountBadge,
} from "./gate-review-shared-widgets";

export function CompletionEvidence({
  projectId,
  gateId,
  evidence,
  onPreview,
}: {
  projectId: string;
  gateId: string;
  evidence: GateEvidenceItem[];
  onPreview: (item: GateEvidenceItem) => void;
}) {
  const viewAllHref = `/projects/${projectId}/gates/${gateId}/evidence`;

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="mb-0 shrink-0 border-b border-slate-100 px-8 pb-4 pt-8 dark:border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Completion Evidence</h2>
            <GateCountBadge count={evidence.length} />
          </div>

          <Link
            href={viewAllHref}
            className="text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all evidence
          </Link>
        </div>
      </header>

      {evidence.length === 0 ? (
        <div className="px-8 pb-8 pt-4">
          <p className="text-sm text-slate-600 dark:text-muted-foreground">No completion evidence attached.</p>
        </div>
      ) : (
        <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pb-8 pt-4">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-900 dark:border-border dark:text-foreground">
                <th className="pb-4 pr-8">Evidence Name</th>
                <th className="pb-4 pr-8">Type</th>
                <th className="pb-4 pr-8">Linked To</th>
                <th className="pb-4 pr-8">Added By</th>
                <th className="pb-4 pr-8">Added On</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {evidence.map((row, index) => {
                const tone = evidenceToneForIndex(index);
                const typeLabel = evidenceTypeLabel(row.type);
                return (
                  <tr key={row.id} className="border-b border-slate-100 text-base last:border-b-0 dark:border-border">
                    <td className="py-5 pr-8">
                      <div className="flex items-center gap-5">
                        <EvidenceFileIcon type={row.type} tone={tone} />

                        <Link
                          href={row.href}
                          className="font-semibold text-slate-950 hover:text-blue-600 hover:underline dark:text-foreground dark:hover:text-blue-400"
                        >
                          {row.name}
                        </Link>
                      </div>
                    </td>

                    <td className="py-5 pr-8 font-medium text-slate-700 dark:text-foreground/90">{typeLabel}</td>

                    <td className="py-5 pr-8 text-slate-700 dark:text-foreground/90">{row.linkedTo.join(", ")}</td>

                    <td className="py-5 pr-8 text-slate-700 dark:text-foreground/90">{row.addedBy}</td>

                    <td className="whitespace-pre-line py-5 pr-8 text-slate-700 dark:text-foreground/90">
                      {formatEvidenceAddedOn(row.addedOnLabel)}
                    </td>

                    <td className="py-5">
                      <EvidencePreviewDownloadActions
                        name={row.name}
                        onPreview={() => onPreview(row)}
                        downloadHref={row.downloadHref ?? row.href}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
