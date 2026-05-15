"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, PlayCircle, ShieldCheck } from "lucide-react";

import { PhaseDetailDrawer } from "@/components/lifecycle-workspace/phase-detail-drawer";
import { StartPhaseConfirmModal } from "@/components/lifecycle-workspace/start-phase-confirm-modal";
import { WORKSPACE_PHASE_MAX, WORKSPACE_PHASES } from "@/lib/workspacePhases";
import type { ProjectsLifecycleStripModel } from "@/types/projects.types";

function phaseStatusFor(phaseNumber: number, currentPhase: number): "completed" | "current" | "pending" {
  const cur = Math.min(WORKSPACE_PHASE_MAX, Math.max(1, currentPhase));
  if (phaseNumber < cur) return "completed";
  if (phaseNumber === cur) return "current";
  return "pending";
}

export function ProjectLifecyclePhaseStrip({
  showToolbar = true,
  ...strip
}: ProjectsLifecycleStripModel & { showToolbar?: boolean }) {
  const { projectId, currentPhase, applicability, gateReviewHref } = strip;
  const router = useRouter();
  const [drawerPhase, setDrawerPhase] = useState<number | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const cur = Math.min(WORKSPACE_PHASE_MAX, Math.max(1, currentPhase));
  const canStartNext = cur < WORKSPACE_PHASE_MAX;

  return (
    <div className="space-y-3">
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="lifecycle-start-phase-open"
            disabled={!canStartNext}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-background dark:hover:bg-muted"
            onClick={() => setStartOpen(true)}
          >
            <PlayCircle className="size-3.5" aria-hidden />
            Start next phase
          </button>
          <Link
            data-testid="lifecycle-submit-gate"
            href={gateReviewHref}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-950 hover:bg-emerald-100"
          >
            <ShieldCheck className="size-3.5" aria-hidden />
            Submit gate review
          </Link>
        </div>
      ) : null}

      <div className="lifecycle-scroll overflow-x-auto pb-2">
        <div className="relative z-0 min-w-[1900px] px-4">
          <div className="absolute left-4 right-4 top-6 h-[3px] bg-slate-200 dark:bg-border" />
          <div
            className="absolute left-4 top-6 h-[3px] bg-emerald-500"
            style={{
              width: `calc(${(Math.max(0, cur - 1) / (WORKSPACE_PHASES.length - 1)) * 100}% )`,
            }}
          />

          <div className="relative grid grid-cols-[repeat(14,minmax(0,1fr))]">
            {WORKSPACE_PHASES.map((phase) => {
              const n = phase.index;
              const isComplete = phaseStatusFor(n, cur) === "completed";
              const isCurrent = phaseStatusFor(n, cur) === "current";
              const wsHref = `/projects/${projectId}/workspace?phase=${n}`;

              return (
                <div key={n} className="flex flex-col items-center text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Link
                      href={wsHref}
                      data-testid={`lifecycle-phase-node-${n}`}
                      aria-label={`Open workspace for phase ${n}`}
                      className={[
                        "z-[1] flex h-12 w-12 items-center justify-center rounded-full text-base font-bold no-underline outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                        isComplete && "bg-emerald-500 text-white hover:bg-emerald-600",
                        isCurrent && "bg-blue-600 text-white hover:bg-blue-700",
                        !isComplete && !isCurrent && "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-border dark:bg-muted dark:text-muted-foreground",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {n === 1 && isComplete ? (
                        <span className="text-xl leading-none">✓</span>
                      ) : (
                        n
                      )}
                    </Link>
                    <button
                      type="button"
                      data-testid={`lifecycle-phase-details-${n}`}
                      aria-label={`Phase ${n} details`}
                      className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-muted"
                      onClick={() => setDrawerPhase(n)}
                    >
                      <Info className="size-3.5" />
                    </button>
                  </div>

                  <p
                    className={[
                      "mt-2 max-w-[130px] text-sm leading-6",
                      isCurrent ? "font-medium text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-foreground/90",
                    ].join(" ")}
                  >
                    {phase.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {drawerPhase != null ? (
        <PhaseDetailDrawer
          open
          onClose={() => setDrawerPhase(null)}
          phaseNumber={drawerPhase}
          projectId={projectId}
          projectCurrentPhase={cur}
          applicability={applicability}
          gateReviewHref={gateReviewHref}
        />
      ) : null}

      <StartPhaseConfirmModal
        open={startOpen}
        onClose={() => setStartOpen(false)}
        projectId={projectId}
        currentPhase={cur}
        applicability={applicability}
        preview={null}
        onStarted={() => router.refresh()}
      />
    </div>
  );
}
