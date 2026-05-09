import Link from "next/link";
import { Check, Lock, XCircle } from "lucide-react";

import type { NextPhaseUnlockState } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

export function NextPhaseUnlock({ state }: { state: NextPhaseUnlockState }) {
  const statusLabel =
    state.unlockStatus === "unlocked"
      ? "Unlocked"
      : state.unlockStatus === "ready"
        ? "Ready to unlock after decision"
        : state.unlockStatus === "blocked"
          ? "Blocked"
          : "Locked";

  return (
    <section
      className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm dark:border-border dark:bg-card"
      aria-label="Next phase unlock"
    >
      <header className="border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Next Phase Unlock</h3>
      </header>

      <div className="space-y-4 px-5 py-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl border",
              state.unlockStatus === "blocked" && "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
              state.unlockStatus === "unlocked" &&
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
              (state.unlockStatus === "locked" || state.unlockStatus === "ready") &&
                "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
            )}
            aria-hidden
          >
            {state.unlockStatus === "unlocked" ? (
              <Check className="size-5" />
            ) : state.unlockStatus === "blocked" ? (
              <XCircle className="size-5" />
            ) : (
              <Lock className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111827] dark:text-foreground">{statusLabel}</p>
            <p className="sr-only">
              Unlock status {statusLabel}. Next phase {state.nextPhaseName}. Can unlock:{" "}
              {state.canUnlock ? "yes" : "no"}.
            </p>
            <p className="mt-1 text-sm text-[#475569] dark:text-muted-foreground">
              Phase {state.nextPhaseNumber}: {state.nextPhaseName}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:text-muted-foreground">
            Requirements
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {state.requirements.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="text-[#475569] dark:text-muted-foreground">{r.label}</span>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:text-muted-foreground">
              Carried forward
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#475569] dark:text-muted-foreground">
              {state.carriedForwardArtifacts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link
          href={state.nextPhaseHref}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition",
            state.canUnlock
              ? "border-[#2563eb] bg-[#2563eb] text-white hover:bg-blue-700"
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
    </section>
  );
}
