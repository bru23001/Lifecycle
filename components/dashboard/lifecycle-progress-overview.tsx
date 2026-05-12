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
    <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-200">
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
    <div className="flex items-center gap-3">
      <span className={["h-3.5 w-3.5 rounded-full", className].join(" ")} />
      <span className="text-base text-slate-600 dark:text-slate-300">{label}</span>
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
  return (
    <article className="h-full rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-10 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">
          Lifecycle Progress Overview
        </h2>
        <Link
          href="/projects"
          className="text-base font-semibold text-blue-600 hover:text-blue-700"
        >
          View all projects
        </Link>
      </header>

      <div className="space-y-9">
        {lifecycleProgress.map((project) => (
          <Link
            key={project.projectName}
            href={project.projectId ? `/projects/${project.projectId}` : "/projects"}
            className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_56px] lg:items-center"
          >
            <p className="truncate text-base font-medium text-slate-700 dark:text-slate-200">
              {project.projectName}
            </p>

            <SegmentedProgressBar segments={buildSegments(project)} />

            <p className="text-right text-base font-semibold text-slate-900 dark:text-slate-100">
              {project.progressPercent}%
            </p>
          </Link>
        ))}
      </div>

      <footer className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
        <LegendDot className="bg-emerald-500" label="Completed" />
        <LegendDot className="bg-blue-600" label="In Progress" />
        <LegendDot className="bg-amber-400" label="Pending" />
        <LegendDot className="bg-slate-200" label="Not Started" />
      </footer>
    </article>
  );
}
