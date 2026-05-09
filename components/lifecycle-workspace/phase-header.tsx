import { Calendar, Flag, Shield, User } from "lucide-react";

import type { PhaseHeaderData, PhaseHeaderStatus } from "@/components/lifecycle-workspace/phase-header-types";
import { cn } from "@/lib/utils";

function PhaseIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#dbeafe] dark:bg-[#1e3a8a]/40",
        className,
      )}
    >
      <Shield className="size-6 text-[#2563eb]" aria-hidden />
    </div>
  );
}

function statusBadgeLabel(status: PhaseHeaderStatus): string {
  switch (status) {
    case "not_started":
      return "Not Started";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Blocked";
    case "ready_for_review":
      return "Ready for Review";
    case "approved":
      return "Approved";
  }
}

function PhaseStatusBadge({ status }: { status: PhaseHeaderStatus }) {
  const label = statusBadgeLabel(status);
  let cls =
    "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100";
  if (status === "approved") {
    cls =
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100";
  } else if (status === "ready_for_review") {
    cls =
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100";
  } else if (status === "blocked") {
    cls =
      "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100";
  } else if (status === "not_started") {
    cls = "border-border bg-muted text-muted-foreground";
  }

  return (
    <span
      className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", cls)}
      data-status={status}
    >
      {label}
    </span>
  );
}

function PhaseTitleBlock({ data }: { data: PhaseHeaderData }) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Phase {data.phaseNumber} of {data.totalPhases}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <h2 id="phase-header-title" className="text-2xl font-semibold tracking-tight">
          {data.phaseName}
        </h2>
        <PhaseStatusBadge status={data.status} />
      </div>
      <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{data.purpose}</p>
    </div>
  );
}

function PhaseMetadataRow({ data }: { data: PhaseHeaderData }) {
  const gateDisplay =
    data.gateCode !== "—" && data.gateCode.trim().length > 0
      ? `${data.gateCode}: ${data.gateName}`
      : data.gateName;

  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="flex gap-2">
        <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Phase owner</dt>
          <dd className="text-sm font-medium">{data.ownerName}</dd>
        </div>
      </div>
      <div className="flex gap-2">
        <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Started on</dt>
          <dd className="text-sm font-medium">{data.startedOnLabel}</dd>
        </div>
      </div>
      <div className="flex gap-2">
        <Flag className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Target completion</dt>
          <dd className="text-sm font-medium">{data.targetCompletionLabel}</dd>
        </div>
      </div>
      <div className="flex gap-2">
        <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Gate</dt>
          <dd className="text-sm font-medium">{gateDisplay}</dd>
        </div>
      </div>
    </dl>
  );
}

function CompletionRing({
  percent,
  completeLabel = "Complete",
}: {
  percent: number;
  completeLabel?: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(percent)));
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className="relative flex size-[104px] shrink-0 items-center justify-center self-center lg:self-start"
      aria-label={`${pct}% ${completeLabel}`}
    >
      <svg className="-rotate-90" width="104" height="104" viewBox="0 0 104 104" aria-hidden>
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/40"
        />
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-[#2563eb]"
        />
      </svg>
      <span className="absolute text-center text-sm font-semibold tabular-nums text-foreground">
        {pct}%
        <span className="block text-[10px] font-normal text-muted-foreground">{completeLabel}</span>
      </span>
    </div>
  );
}

export type PhaseHeaderProps = {
  data: PhaseHeaderData;
};

export function PhaseHeader({ data }: PhaseHeaderProps) {
  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm" aria-labelledby="phase-header-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start gap-3">
            <PhaseIcon />
            <PhaseTitleBlock data={data} />
          </div>
          <PhaseMetadataRow data={data} />
        </div>
        <CompletionRing percent={data.completionPercent} />
      </div>
    </section>
  );
}

export type { PhaseHeaderData, PhaseHeaderStatus } from "./phase-header-types";
