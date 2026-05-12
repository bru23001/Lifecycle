"use client";

import type { ReactNode } from "react";
import { FileText, MoreVertical, Share2, Star } from "lucide-react";

import { artifactStatusBadgeMap } from "@/lib/artifact-status";
import { cn } from "@/lib/utils";
import type { ArtifactDetail, ArtifactWorkflowStatus } from "@/types/artifact-library.types";

type MetadataItem = {
  id: string;
  label: string;
  value: ReactNode;
};

const workflowStatusPillClass: Record<ArtifactWorkflowStatus, string> = {
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  not_started: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  in_review: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200",
  changes_requested: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

function WorkflowStatusPill({
  status,
  size = "sm",
}: {
  status: ArtifactWorkflowStatus;
  size?: "lg" | "sm";
}) {
  const { label } = artifactStatusBadgeMap[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full font-semibold",
        size === "lg" ? "px-2 py-1 text-sm" : "px-2 py-0.5 text-xs",
        workflowStatusPillClass[status],
      )}
    >
      {label}
    </span>
  );
}

function MetadataGrid({ items }: { items: MetadataItem[] }) {
  const colClass =
    items.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-5";

  return (
    <div className={cn("grid grid-cols-1 gap-y-3 gap-x-3", colClass)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "min-w-0",
            index !== 0 && "xl:border-l xl:border-slate-200 xl:pl-4 dark:xl:border-slate-700",
          )}
        >
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">
            {item.label}
          </p>

          <div className="mt-1.5 text-sm font-semibold text-slate-950 dark:text-foreground">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function buildPrimaryMetadata(detail: ArtifactDetail): MetadataItem[] {
  return [
    {
      id: "project",
      label: "Project",
      value: `${detail.projectName} (${detail.projectId.toUpperCase()})`,
    },
    {
      id: "phase",
      label: "Phase",
      value: `${detail.phaseNumber}. ${detail.phaseName}`,
    },
    {
      id: "template",
      label: "Template",
      value: detail.templateName,
    },
    {
      id: "owner",
      label: "Owner",
      value: detail.ownerName,
    },
  ];
}

function buildSecondaryMetadata(detail: ArtifactDetail): MetadataItem[] {
  return [
    {
      id: "status",
      label: "Status",
      value: <WorkflowStatusPill status={detail.status} size="sm" />,
    },
    {
      id: "version",
      label: "Version",
      value: detail.artifactVersionLabel,
    },
    {
      id: "last-updated",
      label: "Last Updated",
      value: detail.lastUpdatedLabel,
    },
    {
      id: "artifact-id",
      label: "Artifact ID",
      value: detail.id,
    },
    {
      id: "created-on",
      label: "Created On",
      value: detail.createdOnLabel,
    },
  ];
}

export function ArtifactDetailHeader({ detail }: { detail: ArtifactDetail }) {
  const title = `${detail.artifactCode} ${detail.name}`;
  const primaryMetadata = buildPrimaryMetadata(detail);
  const secondaryMetadata = buildSecondaryMetadata(detail);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-border dark:bg-card">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-950 dark:text-foreground">
          Artifact Detail
        </h2>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Favorite artifact"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-50 dark:text-foreground dark:hover:bg-muted/60",
              detail.isStarred && "text-amber-500 hover:text-amber-600",
            )}
          >
            <Star
              className="h-4 w-4 stroke-[2]"
              fill={detail.isStarred ? "currentColor" : "none"}
              aria-hidden
            />
          </button>

          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:gap-2 sm:px-3 sm:text-sm dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/50"
          >
            <Share2 className="h-3.5 w-3.5 shrink-0 stroke-[2.2]" aria-hidden />
            Share
          </button>

          <button
            type="button"
            aria-label="More options"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/50"
          >
            <MoreVertical className="h-4 w-4 stroke-[2]" aria-hidden />
          </button>
        </div>
      </header>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm sm:h-12 sm:w-12">
          <FileText className="h-5 w-5 stroke-[2] sm:h-6 sm:w-6" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl dark:text-foreground">
              {title}
            </h1>

            <WorkflowStatusPill status={detail.status} size="lg" />
          </div>

          <p className="mt-2 text-sm leading-snug text-slate-600 sm:text-base dark:text-muted-foreground">
            {detail.description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <MetadataGrid items={primaryMetadata} />
      </div>

      <hr className="my-4 border-slate-200 dark:border-border" />

      <MetadataGrid items={secondaryMetadata} />
    </section>
  );
}
