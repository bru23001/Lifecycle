import Link from "next/link";

import type { DashboardLifecycleProgressItem } from "@/types/dashboard.types";

type SegmentedProjectProgress = {
  completed: number;
  inProgress: number;
  pending: number;
  notStarted: number;
};

const PROJECT_SEGMENT_OVERRIDES: Record<string, SegmentedProjectProgress> = {
  "Secure Identity Platform": {
    completed: 35,
    inProgress: 20,
    pending: 10,
    notStarted: 35,
  },
  "Data Governance Hub": {
    completed: 38,
    inProgress: 0,
    pending: 12,
    notStarted: 50,
  },
  "Threat Intelligence System": {
    completed: 19,
    inProgress: 16,
    pending: 0,
    notStarted: 65,
  },
  "Compliance Automation Tool": {
    completed: 10,
    inProgress: 0,
    pending: 0,
    notStarted: 90,
  },
};

function SegmentedProgressBar({ segments }: { segments: SegmentedProjectProgress }) {
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
      {segments.completed > 0 && (
        <div className="h-full bg-emerald-500" style={{ width: `${segments.completed}%` }} />
      )}
      {segments.inProgress > 0 && (
        <div className="h-full bg-blue-600" style={{ width: `${segments.inProgress}%` }} />
      )}
      {segments.pending > 0 && (
        <div className="h-full bg-amber-400" style={{ width: `${segments.pending}%` }} />
      )}
      {segments.notStarted > 0 && (
        <div className="h-full bg-slate-200" style={{ width: `${segments.notStarted}%` }} />
      )}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={["h-3 w-3 rounded-full", className].join(" ")} />
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
}

function buildSegments(item: DashboardLifecycleProgressItem): SegmentedProjectProgress {
  const override = PROJECT_SEGMENT_OVERRIDES[item.projectName];
  if (override) return override;

  return {
    completed: item.progressPercent,
    inProgress: 0,
    pending: 0,
    notStarted: Math.max(0, 100 - item.progressPercent),
  };
}

export function LifecycleProgressOverview({
  lifecycleProgress,
}: {
  lifecycleProgress: DashboardLifecycleProgressItem[];
}) {
  const lead = lifecycleProgress[0];
  const leadWorkspaceHref =
    lead?.projectId != null && lead.currentPhase != null
      ? `/projects/${lead.projectId}/workspace?phase=${lead.currentPhase}`
      : null;
  const leadTimelineHref =
    lead?.projectId != null ? `/projects?selected=${lead.projectId}&tab=lifecycle-timeline` : null;

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {leadWorkspaceHref ? (
            <Link href={leadWorkspaceHref} className="block hover:opacity-90">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                Lifecycle Progress Overview
              </h2>
            </Link>
          ) : (
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              Lifecycle Progress Overview
            </h2>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          {leadTimelineHref ? (
            <Link href={leadTimelineHref} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View full timeline
            </Link>
          ) : null}
          <Link href="/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            View all projects
          </Link>
        </div>
      </header>

      <div className="lifecycle-scroll-on-demand min-h-0 flex-1 space-y-4 overflow-auto pr-1">
        {lifecycleProgress.map((project) => (
          <Link
            key={project.projectId ?? project.projectName}
            href={
              project.projectId != null && project.currentPhase != null
                ? `/projects/${project.projectId}/workspace?phase=${project.currentPhase}`
                : "/projects"
            }
            className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,210px)_1fr_44px] lg:items-center"
          >
            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
              {project.projectName}
            </p>

            <SegmentedProgressBar segments={buildSegments(project)} />

            <p className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
              {project.progressPercent}%
            </p>
          </Link>
        ))}
      </div>

      <footer className="mt-4 flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2">
        <LegendDot className="bg-emerald-500" label="Completed" />
        <LegendDot className="bg-blue-600" label="In Progress" />
        <LegendDot className="bg-amber-400" label="Pending" />
        <LegendDot className="bg-slate-200" label="Not Started" />
      </footer>
    </article>
  );
}
