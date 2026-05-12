import { AlertTriangle, Calendar, Check, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import type { PhaseNavItem } from "@/components/lifecycle-workspace/phase-navigator-types";
import { cn } from "@/lib/utils";

function PanelHeader({ title, phaseCount }: { title: string; phaseCount: number }) {
  return (
    <div className="panel-header flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {phaseCount} phases
      </span>
    </div>
  );
}

function phaseNavStatusLabel(status: PhaseNavItem["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "current":
      return "In Progress";
    case "not_started":
      return "Not Started";
    case "blocked":
      return "Blocked";
    case "ready_for_review":
      return "Ready for Review";
  }
}

function PhaseGlyph({ item }: { item: PhaseNavItem }) {
  const { status, phaseNumber } = item;

  if (status === "completed") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20">
        <Check className="size-4" strokeWidth={3} aria-hidden />
      </span>
    );
  }

  if (status === "blocked") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm ring-2 ring-red-600/20">
        <AlertTriangle className="size-4" aria-hidden />
      </span>
    );
  }

  if (status === "ready_for_review") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30">
        <ClipboardCheck className="size-4" aria-hidden />
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-xs font-semibold text-white shadow-sm ring-4 ring-sky-100 dark:ring-sky-900">
        {phaseNumber}
      </span>
    );
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
      {phaseNumber}
    </span>
  );
}

function PhaseNavItemRow({
  item,
  stemBelowClass,
  isLast,
}: {
  item: PhaseNavItem;
  stemBelowClass: string;
  isLast: boolean;
}) {
  const isCurrent = item.status === "current";
  const isBlocked = item.status === "blocked";
  const isReady = item.status === "ready_for_review";

  return (
    <Link
      href={item.href}
      aria-current={item.status === "current" ? "step" : undefined}
      className={cn(
        "relative flex gap-3 py-2 pl-4 pr-3 transition-colors",
        isCurrent &&
          "border-l-[3px] border-l-[#2563eb] bg-sky-50/80 dark:bg-sky-950/30",
        isBlocked &&
          "border-l-[3px] border-l-red-600 bg-red-50/80 dark:bg-red-950/25",
        isReady &&
          "border-l-[3px] border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/25",
        !isCurrent && !isBlocked && !isReady && "border-l-[3px] border-l-transparent",
      )}
    >
      <div className="flex w-8 shrink-0 flex-col items-center">
        <PhaseGlyph item={item} />
        {!isLast && (
          <div className={cn("mt-1 min-h-[10px] w-px shrink-0", stemBelowClass)} aria-hidden />
        )}
      </div>
      <div className="min-w-0 pb-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "truncate text-sm font-medium leading-tight",
              item.status === "current" && "text-[#1e40af] dark:text-sky-300",
              item.status === "not_started" && "text-muted-foreground",
              item.status === "blocked" && "text-red-900 dark:text-red-100",
              item.status === "ready_for_review" && "text-amber-950 dark:text-amber-100",
            )}
          >
            {item.phaseNumber}. {item.name}
          </p>
          {item.gateCode ? (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {item.gateCode}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{phaseNavStatusLabel(item.status)}</p>
      </div>
    </Link>
  );
}

function PhaseList({ items }: { items: PhaseNavItem[] }) {
  return (
    <ol className="phase-list flex flex-1 list-none flex-col gap-0 overflow-y-auto py-2">
      {items.map((item, index) => {
        const stemBelow =
          item.status === "completed" ? "bg-emerald-500" : "bg-border";
        const isLast = index === items.length - 1;
        return (
          <li key={item.phaseNumber}>
            <PhaseNavItemRow
              item={item}
              stemBelowClass={stemBelow}
              isLast={isLast}
            />
          </li>
        );
      })}
    </ol>
  );
}

function ViewFullTimelineButton({ projectId }: { projectId: string }) {
  return (
    <Link
      href={`/projects/${projectId}`}
      className="view-full-timeline-button flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted"
    >
      <Calendar className="size-3.5" aria-hidden />
      View full timeline
    </Link>
  );
}

export type PhaseNavigatorProps = {
  items: PhaseNavItem[];
  projectId: string;
};

export function PhaseNavigator({ items, projectId }: PhaseNavigatorProps) {
  return (
    <aside
      id="phase-navigator"
      data-pane="phase"
      aria-label="Phase navigator"
      className="phase-navigator-panel phase-navigator flex flex-col rounded-lg border bg-card shadow-sm"
    >
      <PanelHeader title="Phase Navigator" phaseCount={items.length} />
      <PhaseList items={items} />
      <div className="border-t p-3">
        <ViewFullTimelineButton projectId={projectId} />
      </div>
    </aside>
  );
}
