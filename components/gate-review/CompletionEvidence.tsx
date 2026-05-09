"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { Download, Eye, FileSpreadsheet, FileText, ImageIcon, Link2 } from "lucide-react";

import type { GateEvidenceItem } from "@/types/gate-review.types";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconForType: Record<GateEvidenceItem["type"], ComponentType<{ className?: string }>> = {
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  image: ImageIcon,
  link: Link2,
  json: FileText,
};

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
    <section className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Completion Evidence</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-muted dark:text-foreground">
            {evidence.length}
          </span>
        </div>
        <Link href={viewAllHref} className="text-sm font-medium text-[#2563eb] hover:underline">
          View all evidence
        </Link>
      </header>

      {evidence.length === 0 ? (
        <div className="space-y-4 px-5 py-8">
          <p className="text-sm text-[#475569] dark:text-muted-foreground">No completion evidence attached.</p>
          <Link
            href={`/projects/${projectId}/workspace`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Return to Lifecycle Workspace
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:border-border dark:bg-muted/40 dark:text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Evidence
                </th>
                <th scope="col" className="px-5 py-3">
                  Type
                </th>
                <th scope="col" className="px-5 py-3">
                  Linked To
                </th>
                <th scope="col" className="px-5 py-3">
                  Added By
                </th>
                <th scope="col" className="px-5 py-3">
                  Added On
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-border">
              {evidence.map((row) => {
                const Icon = iconForType[row.type];
                return (
                  <tr key={row.id} className="bg-white dark:bg-card">
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Icon className="size-4 shrink-0 text-[#64748b]" aria-hidden />
                        <Link href={row.href} className="min-w-0 truncate font-medium text-[#2563eb] hover:underline">
                          {row.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-[#475569] dark:text-muted-foreground">{row.type}</td>
                    <td className="px-5 py-3 text-[#475569] dark:text-muted-foreground">{row.linkedTo.join(", ")}</td>
                    <td className="px-5 py-3">{row.addedBy}</td>
                    <td className="px-5 py-3 text-[#475569] dark:text-muted-foreground">{row.addedOnLabel}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Preview ${row.name}`}
                          onClick={() => onPreview(row)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <a
                          href={row.downloadHref ?? row.href}
                          download
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "text-muted-foreground hover:text-foreground",
                          )}
                          aria-label={`Download ${row.name}`}
                        >
                          <Download className="size-4" />
                        </a>
                      </div>
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
