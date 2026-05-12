import {
  Download,
  FolderOpen,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Link2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import type { EvidenceAttachment } from "@/components/lifecycle-workspace/evidence-attachments-types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TypeIcon({ type }: { type: EvidenceAttachment["type"] }) {
  const common = "size-4 shrink-0";
  if (type === "pdf") return <FileText className={cn(common, "text-red-600")} />;
  if (type === "spreadsheet")
    return <FileSpreadsheet className={cn(common, "text-emerald-600")} />;
  if (type === "document") return <FileText className={cn(common, "text-blue-600")} />;
  return <FileText className={common} />;
}

function EvidenceRowActions({ row }: { row: EvidenceAttachment }) {
  const iconLinkClass = cn(
    buttonVariants({ variant: "ghost", size: "icon-xs" }),
    "text-muted-foreground",
  );
  const downloadHref = `${row.href}${row.href.includes("?") ? "&" : "?"}download=1`;

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-0.5"
      role="group"
      aria-label={`Actions for ${row.name}`}
    >
      <Link href={row.href} className={iconLinkClass} aria-label={`Open ${row.name}`}>
        <ExternalLink className="size-4" />
      </Link>
      <Link href={downloadHref} className={iconLinkClass} aria-label={`Download ${row.name}`}>
        <Download className="size-4" />
      </Link>
      <Link
        href={`${row.href}${row.href.includes("?") ? "&" : "?"}action=relink`}
        className={iconLinkClass}
        aria-label={`Relink ${row.name}`}
      >
        <Link2 className="size-4" />
      </Link>
      <Link
        href={`${row.href}${row.href.includes("?") ? "&" : "?"}action=replace`}
        className={iconLinkClass}
        aria-label={`Replace ${row.name}`}
      >
        <RefreshCw className="size-4" />
      </Link>
      <Link
        href={`${row.href}${row.href.includes("?") ? "&" : "?"}action=remove`}
        className={iconLinkClass}
        aria-label={`Remove ${row.name}`}
      >
        <Trash2 className="size-4" />
      </Link>
      <Link href={row.href} className={iconLinkClass} aria-label={`More options for ${row.name}`}>
        <MoreHorizontal className="size-4" />
      </Link>
    </div>
  );
}

export type EvidenceAttachmentsProps = {
  attachments: EvidenceAttachment[];
};

export function EvidenceAttachments({ attachments }: EvidenceAttachmentsProps) {
  const count = attachments.length;

  return (
    <section
      id="evidence-attachments"
      aria-labelledby="evidence-attachments-heading"
      className="evidence-attachments rounded-lg border bg-card shadow-sm"
    >
      <div className="card-header flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="evidence-attachments-heading" className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
              <FolderOpen className="size-3.5 text-[#2563eb]" aria-hidden />
            </span>
            Evidence attachments
          </h3>
          <span
            className="count-badge rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground"
            aria-label={`${count} attachments`}
          >
            {count}
          </span>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" type="button">
          <Plus className="size-3.5" />
          Add evidence
        </Button>
      </div>
      <div className="card-scroll-area">
        <table className="evidence-table w-full min-w-[720px] text-[13px]">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-[11px] font-semibold text-muted-foreground">
              <th className="px-4 py-2.5">Evidence</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Linked to</th>
              <th className="px-4 py-2.5">Added by</th>
              <th className="px-4 py-2.5">Added on</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attachments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No evidence attached yet.
                </td>
              </tr>
            ) : (
              attachments.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <TypeIcon type={row.type} />
                      <Link href={row.href} className="text-[#2563eb] hover:underline">
                        {row.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{row.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.linkedTo.map((code) => (
                        <code
                          key={code}
                          className="rounded bg-muted px-1.5 py-0.5 text-xs"
                        >
                          {code}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.addedBy}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {row.addedOnLabel}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <EvidenceRowActions row={row} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
