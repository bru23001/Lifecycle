import type { ReactNode } from "react";

import { artifactStatusBadgeMap } from "@/lib/artifact-status";
import { cn } from "@/lib/utils";
import type { ArtifactQuickInfoData, ArtifactWorkflowStatus } from "@/types/artifact-library.types";

import { SidebarCard } from "./sidebar-primitives";

const workflowPillClass: Record<ArtifactWorkflowStatus, string> = {
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  not_started: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  in_review: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200",
  changes_requested: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

function StatusValue({ label }: { label: string }) {
  const key = (Object.keys(artifactStatusBadgeMap) as ArtifactWorkflowStatus[]).find(
    (k) => artifactStatusBadgeMap[k].label === label,
  );
  if (!key) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {label}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-semibold", workflowPillClass[key])}>
      {artifactStatusBadgeMap[key].label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6">
      <dt className="min-w-0 text-sm font-medium text-slate-600 dark:text-muted-foreground sm:text-base">{label}</dt>
      <dd className="min-w-0 text-sm font-semibold text-slate-700 dark:text-foreground sm:text-base">{value}</dd>
    </div>
  );
}

export function ArtifactQuickInfo({ info }: { info: ArtifactQuickInfoData }) {
  const pct = Math.max(0, Math.min(100, info.overallProgressPercent));
  const words = info.wordCount.toLocaleString("en-US");

  return (
    <SidebarCard title="Quick Info">
      <dl className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
        <InfoRow label="Artifact Type" value={info.artifactType} />
        <InfoRow label="Template Version" value={info.templateVersion} />
        <InfoRow label="Artifact Version" value={info.artifactVersion} />
        <InfoRow label="Status" value={<StatusValue label={info.status} />} />

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <dt className="min-w-0 text-sm font-medium text-slate-600 dark:text-muted-foreground sm:text-base">
            Overall Progress
          </dt>
          <dd className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-foreground sm:text-base">{pct}%</p>
            <div
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 sm:mt-4"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: `${pct}%` }} />
            </div>
          </dd>
        </div>

        <InfoRow label="Required Sections" value={String(info.requiredSections)} />
        <InfoRow label="Completed Sections" value={String(info.completedSections)} />
        <InfoRow label="Evidence Items" value={String(info.evidenceItems)} />
        <InfoRow label="Words" value={words} />
        <InfoRow label="Last Updated By" value={info.lastUpdatedBy} />
      </dl>
    </SidebarCard>
  );
}
