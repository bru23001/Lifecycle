"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Calendar, Check, ClipboardCheck, Info } from "lucide-react";

import { PhaseDetailDrawer } from "@/components/lifecycle-workspace/phase-detail-drawer";
import { StartPhaseConfirmModal } from "@/components/lifecycle-workspace/start-phase-confirm-modal";
import type { PhaseNavItem } from "@/components/lifecycle-workspace/phase-navigator-types";
import type { PhaseNavigatorMeta } from "@/components/lifecycle-workspace/phase-navigator-types";
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
    case "locked":
      return "Locked";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
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

  if (status === "locked") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 bg-muted text-xs font-semibold text-muted-foreground">
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
  onOpenDetail,
}: {
  item: PhaseNavItem;
  stemBelowClass: string;
  isLast: boolean;
  onOpenDetail: (phaseNumber: number) => void;
}) {
  const isCurrent = item.status === "current";
  const isBlocked = item.status === "blocked";
  const isReady = item.status === "ready_for_review";
  const isLocked = item.status === "locked";

  const rowClass = cn(
    "relative flex min-w-0 flex-1 gap-3 py-2 pl-4 pr-3 transition-colors",
    isCurrent && "border-l-[3px] border-l-[#2563eb] bg-sky-50/80 dark:bg-sky-950/30",
    isBlocked && "border-l-[3px] border-l-red-600 bg-red-50/80 dark:bg-red-950/25",
    isReady && "border-l-[3px] border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/25",
    isLocked && "border-l-[3px] border-l-transparent bg-muted/20",
    !isCurrent && !isBlocked && !isReady && !isLocked && "border-l-[3px] border-l-transparent",
  );

  const main = (
    <>
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
              item.status === "completed" && "text-foreground",
              item.status === "locked" && "text-muted-foreground",
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
    </>
  );

  return (
    <div className="flex items-stretch gap-1 pr-1">
      {isLocked ? (
        <div className={cn(rowClass, "min-w-0 flex-1")}>{main}</div>
      ) : (
        <Link
          href={item.href}
          aria-current={item.status === "current" ? "step" : undefined}
          className={cn(rowClass, "min-w-0 flex-1 no-underline outline-none")}
        >
          {main}
        </Link>
      )}
      <button
        type="button"
        data-testid={`phase-nav-detail-${item.phaseNumber}`}
        aria-label={`Phase ${item.phaseNumber} details`}
        className="mt-2 shrink-0 self-start rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenDetail(item.phaseNumber);
        }}
      >
        <Info className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

function PhaseList({
  items,
  onOpenDetail,
}: {
  items: PhaseNavItem[];
  onOpenDetail: (phaseNumber: number) => void;
}) {
  return (
    <ol className="phase-list flex flex-1 list-none flex-col gap-0 overflow-y-auto py-2">
      {items.map((item, index) => {
        const stemBelow = item.status === "completed" ? "bg-emerald-500" : "bg-border";
        const isLast = index === items.length - 1;
        return (
          <li key={item.phaseNumber}>
            <PhaseNavItemRow
              item={item}
              stemBelowClass={stemBelow}
              isLast={isLast}
              onOpenDetail={onOpenDetail}
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
  meta: PhaseNavigatorMeta;
};

export function PhaseNavigator({ items, projectId, meta }: PhaseNavigatorProps) {
  const router = useRouter();
  const [drawerPhase, setDrawerPhase] = useState<number | null>(null);
  const [startOpen, setStartOpen] = useState(false);

  const completion =
    drawerPhase != null && drawerPhase < meta.projectCurrentPhase
      ? meta.completionByPhase[drawerPhase] ?? null
      : null;

  const showAdvanceInDrawer =
    drawerPhase === meta.projectCurrentPhase && Boolean(meta.startPhaseModal);

  return (
    <aside
      id="phase-navigator"
      data-pane="phase"
      aria-label="Phase navigator"
      className="phase-navigator-panel phase-navigator flex flex-col rounded-lg border bg-card shadow-sm"
    >
      <PanelHeader title="Phase Navigator" phaseCount={items.length} />
      {meta.startPhaseModal ? (
        <div className="border-b px-3 py-2">
          <button
            type="button"
            data-testid="workspace-start-phase-open"
            className="w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-left text-[11px] font-semibold text-foreground hover:bg-muted dark:border-border"
            onClick={() => setStartOpen(true)}
          >
            Start next phase
          </button>
        </div>
      ) : null}
      <PhaseList items={items} onOpenDetail={setDrawerPhase} />
      <div className="border-t p-3">
        <ViewFullTimelineButton projectId={projectId} />
      </div>

      {drawerPhase != null ? (
        <PhaseDetailDrawer
          open
          onClose={() => setDrawerPhase(null)}
          phaseNumber={drawerPhase}
          projectId={projectId}
          projectCurrentPhase={meta.projectCurrentPhase}
          applicability={meta.applicability}
          gateReviewHref={meta.gatesHref}
          completionDetail={completion}
          lockedContext={drawerPhase > meta.projectCurrentPhase ? meta.lockedContext : null}
          startPhaseModal={showAdvanceInDrawer ? meta.startPhaseModal : null}
          onRequestAdvance={
            showAdvanceInDrawer
              ? () => {
                  setDrawerPhase(null);
                  setStartOpen(true);
                }
              : undefined
          }
        />
      ) : null}

      <StartPhaseConfirmModal
        open={startOpen}
        onClose={() => setStartOpen(false)}
        projectId={projectId}
        currentPhase={meta.projectCurrentPhase}
        applicability={meta.applicability}
        preview={meta.startPhaseModal}
        onStarted={() => router.refresh()}
      />
    </aside>
  );
}
