import {
  BookOpen,
  Braces,
  Eye,
  FileText,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react";
import Link from "next/link";

import type { RequiredTemplate } from "@/components/lifecycle-workspace/required-templates-types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function templateStatusLabel(status: RequiredTemplate["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
    case "changes_requested":
      return "Changes Requested";
  }
}

function TemplateStatusBadge({ status }: { status: RequiredTemplate["status"] }) {
  const label = templateStatusLabel(status);
  const cls =
    status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
      : status === "in_progress"
        ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
        : status === "changes_requested"
          ? "border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
          : "border-border bg-muted text-muted-foreground";

  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}

function TemplateRowActions({ row }: { row: RequiredTemplate }) {
  const previewHref = `${row.href}${row.href.includes("?") ? "&" : "?"}preview=markdown`;
  const jsonHref = `${row.href}${row.href.includes("?") ? "&" : "?"}evidence=json`;
  const iconLinkClass = cn(
    buttonVariants({ variant: "ghost", size: "icon-xs" }),
    "text-muted-foreground",
  );

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-0.5"
      role="group"
      aria-label={`Actions for ${row.templateCode}`}
    >
      <Link href={row.href} className={iconLinkClass} aria-label={`Open ${row.templateCode}`}>
        <Eye className="size-4" />
      </Link>
      <Link href={row.href} className={iconLinkClass} aria-label={`Edit ${row.templateCode}`}>
        <Pencil className="size-4" />
      </Link>
      <Link href={previewHref} className={iconLinkClass} aria-label={`Preview Markdown for ${row.templateCode}`}>
        <BookOpen className="size-4" />
      </Link>
      <Link href={jsonHref} className={iconLinkClass} aria-label={`View JSON evidence for ${row.templateCode}`}>
        <Braces className="size-4" />
      </Link>
      <Link href={row.href} className={iconLinkClass} aria-label={`More options for ${row.templateCode}`}>
        <MoreHorizontal className="size-4" />
      </Link>
    </div>
  );
}

function TemplateTable({ rows }: { rows: RequiredTemplate[] }) {
  return (
    <div>
      <table className="template-table w-full min-w-[720px] text-[13px]">
        <thead>
          <tr className="border-b bg-muted/30 text-left text-[11px] font-semibold text-muted-foreground">
            <th className="px-4 py-2.5">Template</th>
            <th className="px-4 py-2.5">Description</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Progress</th>
            <th className="px-4 py-2.5">Last updated</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3">
                <div className="flex items-start gap-2 font-medium">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-foreground">
                      {row.templateCode}
                    </code>
                    <div className="mt-0.5 truncate text-sm">
                      <Link href={row.href} className="text-[#2563eb] hover:underline">
                        {row.name}
                      </Link>
                    </div>
                  </div>
                </div>
              </td>
              <td className="max-w-xs px-4 py-3 text-muted-foreground">{row.description}</td>
              <td className="px-4 py-3">
                <TemplateStatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#2563eb]"
                      style={{ width: `${row.progressPercent}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {row.progressPercent}%
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {row.lastUpdatedLabel ?? "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <TemplateRowActions row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type RequiredTemplatesProps = {
  templates: RequiredTemplate[];
};

export function RequiredTemplates({ templates }: RequiredTemplatesProps) {
  const count = templates.length;

  return (
    <section
      id="required-templates"
      aria-labelledby="required-templates-heading"
      className="required-templates rounded-lg border bg-card shadow-sm"
    >
      <div className="card-header flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="required-templates-heading" className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
              <ListChecks className="size-3.5 text-[#2563eb]" aria-hidden />
            </span>
            Required templates
          </h3>
          <span
            className="count-badge rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground"
            aria-label={`${count} templates`}
          >
            {count}
          </span>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" type="button">
          <Plus className="size-3.5" />
          Create from template
        </Button>
      </div>
      <div className="card-scroll-area">
        <TemplateTable rows={templates} />
      </div>
    </section>
  );
}
