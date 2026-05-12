import Link from "next/link";
import { Check, LockKeyhole, XCircle } from "lucide-react";

import type { NextPhaseUnlockState } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

export function NextPhaseUnlock({ state, embedded = false }: { state: NextPhaseUnlockState; embedded?: boolean }) {
  const statusLabel =
    state.unlockStatus === "unlocked"
      ? "Unlocked"
      : state.unlockStatus === "ready"
        ? "Ready to unlock after decision"
        : state.unlockStatus === "blocked"
          ? "Blocked"
          : "Locked";

  const summaryLine =
    state.unlockStatus === "unlocked"
      ? `Phase ${state.nextPhaseNumber}: ${state.nextPhaseName} is available.`
      : `If approved, Phase ${state.nextPhaseNumber}: ${state.nextPhaseName} will be unlocked. Artifacts will be carried forward to the next phase.`;

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Next Phase Unlock</h2>

        <p className="sr-only">
          Unlock status {statusLabel}. Next phase {state.nextPhaseName}. Can unlock: {state.canUnlock ? "yes" : "no"}.
        </p>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-muted-foreground">{summaryLine}</p>

        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-foreground/90">{statusLabel}</p>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
            Requirements
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {state.requirements.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-muted-foreground">{r.label}</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    r.status === "complete" && "text-emerald-700 dark:text-emerald-400",
                    r.status === "incomplete" && "text-amber-700 dark:text-amber-400",
                    r.status === "blocked" && "text-red-700 dark:text-red-400",
                  )}
                >
                  {r.status === "complete" ? "Complete" : r.status === "blocked" ? "Blocked" : "Incomplete"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {state.carriedForwardArtifacts.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
              Carried forward
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-muted-foreground">
              {state.carriedForwardArtifacts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link
          href={state.nextPhaseHref}
          className={cn(
            "mt-6 inline-flex w-full max-w-md items-center justify-center rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition sm:w-auto",
            state.canUnlock
              ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 dark:border-border dark:bg-muted dark:text-muted-foreground",
          )}
          aria-disabled={!state.canUnlock}
          onClick={(e) => {
            if (!state.canUnlock) e.preventDefault();
          }}
        >
          Open next phase workspace
        </Link>
      </div>

      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border sm:mt-1",
          state.unlockStatus === "blocked" && "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
          state.unlockStatus === "unlocked" &&
            "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
          (state.unlockStatus === "locked" || state.unlockStatus === "ready") &&
            "border-transparent text-slate-500 dark:text-muted-foreground",
        )}
        aria-hidden
      >
        {state.unlockStatus === "unlocked" ? (
          <Check className="h-8 w-8" />
        ) : state.unlockStatus === "blocked" ? (
          <XCircle className="h-8 w-8" />
        ) : (
          <LockKeyhole className="h-10 w-10 stroke-[1.8]" />
        )}
      </div>
    </>
  );

  if (embedded) {
    return (
      <div
        className="mt-8 flex flex-col gap-6 border-t border-slate-100 pt-8 sm:flex-row sm:items-start sm:justify-between dark:border-border"
        role="region"
        aria-label="Next phase unlock"
      >
        {body}
      </div>
    );
  }

  return (
    <section
      className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between dark:border-border dark:bg-card"
      aria-label="Next phase unlock"
    >
      {body}
    </section>
  );
}
