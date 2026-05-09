"use client";

import { FileText, MoreHorizontal, Share2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { artifactStatusBadgeMap } from "@/lib/artifact-status";
import type { ArtifactDetail } from "@/types/artifact-library.types";

import { StatusBadge } from "./status-badge";

export function ArtifactDetailHeader({ detail }: { detail: ArtifactDetail }) {
  const status = artifactStatusBadgeMap[detail.status];

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#2563eb] text-white">
            <FileText className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-bold tracking-tight text-[#111827] dark:text-foreground">
                {detail.artifactCode} {detail.name}
              </h2>
              <StatusBadge label={status.label} tone={status.tone} />
            </div>
            <p className="mt-1 text-sm text-[#475569] dark:text-muted-foreground">
              {detail.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Favorite artifact">
            <Star className="size-4" aria-hidden />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Share artifact">
            <Share2 className="size-4" aria-hidden />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="More actions">
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-[#e5e7eb] pt-4 text-sm dark:border-border sm:grid-cols-3 lg:grid-cols-4">
        <MetaItem label="Project" value={`${detail.projectName} (${detail.projectId.toUpperCase()})`} />
        <MetaItem label="Phase" value={`${detail.phaseNumber}. ${detail.phaseName}`} />
        <MetaItem label="Template" value={detail.templateName} />
        <MetaItem label="Owner" value={detail.ownerName} />
        <MetaItem label="Status" value={status.label} />
        <MetaItem label="Version" value={detail.version} />
        <MetaItem label="Last Updated" value={detail.lastUpdatedLabel} />
        <MetaItem label="Artifact ID" value={detail.id} />
        <MetaItem label="Created On" value={detail.createdOnLabel} />
      </dl>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#64748b] dark:text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-[#111827] dark:text-foreground">{value}</dd>
    </div>
  );
}
