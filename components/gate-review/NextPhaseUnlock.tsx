"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, LockKeyhole, Package, XCircle } from "lucide-react";

import type { NextPhaseUnlockState } from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

import { NextPhaseUnlockRequirementsDrawer } from "./next-phase-unlock-drawer";

export function NextPhaseUnlock({
  state,
  gateCode,
  gateName,
  embedded = false,
}: {
  state: NextPhaseUnlockState;
  gateCode: string;
  gateName: string;
  embedded?: boolean;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const row = (
    <>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Next Phase Unlock</h2>

        <p className="sr-only">
          Unlock status {statusLabel}. Next phase {state.nextPhaseName}. Can unlock: {state.canUnlock ? "yes" : "no"}.
        </p>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-muted-foreground">{summaryLine}</p>

        <button
          type="button"
          className="group mt-2 inline-flex items-center gap-2 rounded-md text-left text-sm font-semibold text-slate-700 outline-none ring-offset-background hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-ring dark:text-foreground/90 dark:hover:text-blue-400"
          onClick={() => setDrawerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
        >
          <span className="border-b border-dashed border-slate-400 group-hover:border-blue-600 dark:border-muted-foreground">
            {statusLabel}
          </span>
          <span className="text-xs font-normal text-muted-foreground">(view requirements)</span>
        </button>

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

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
            Carried forward
          </p>
          {state.carriedForwardArtifactLinks?.length || state.carriedForwardArtifacts.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {state.carriedForwardArtifactLinks?.length
                ? state.carriedForwardArtifactLinks.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={a.href}
                        className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                      >
                        {a.label}
                      </Link>
                    </li>
                  ))
                : state.carriedForwardArtifacts.map((t) => (
                    <li key={t} className="text-slate-600 dark:text-muted-foreground">
                      {t}
                    </li>
                  ))}
            </ul>
          ) : (
            <div className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center dark:border-border dark:bg-muted/30">
              <div className="mx-auto flex size-9 items-center justify-center rounded-md bg-white text-slate-400 shadow-sm dark:bg-card dark:text-slate-500">
                <Package className="size-4" aria-hidden />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-800 dark:text-foreground/90">No artifacts listed for carryover</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-muted-foreground">
                The gate package has no prior-phase artifacts to surface. This is normal for early phases.
              </p>
            </div>
          )}
        </div>

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

      <button
        type="button"
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border sm:mt-1",
          "cursor-pointer outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
          state.unlockStatus === "blocked" && "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
          state.unlockStatus === "unlocked" &&
            "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
          (state.unlockStatus === "locked" || state.unlockStatus === "ready") &&
            "border-transparent text-slate-500 dark:text-muted-foreground",
        )}
        aria-label={`Unlock status: ${statusLabel}. Open requirements.`}
        onClick={() => setDrawerOpen(true)}
      >
        {state.unlockStatus === "unlocked" ? (
          <Check className="h-8 w-8" />
        ) : state.unlockStatus === "blocked" ? (
          <XCircle className="h-8 w-8" />
        ) : (
          <LockKeyhole className="h-10 w-10 stroke-[1.8]" />
        )}
      </button>
    </>
  );

  const drawer = (
    <NextPhaseUnlockRequirementsDrawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      state={state}
      gateCode={gateCode}
      gateName={gateName}
    />
  );

  if (embedded) {
    return (
      <>
        <div
          className="mt-8 flex flex-col gap-6 border-t border-slate-100 pt-8 sm:flex-row sm:items-start sm:justify-between dark:border-border"
          role="region"
          aria-label="Next phase unlock"
        >
          {row}
        </div>
        {drawer}
      </>
    );
  }

  return (
    <>
      <section
        className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between dark:border-border dark:bg-card"
        aria-label="Next phase unlock"
      >
        {row}
      </section>
      {drawer}
    </>
  );
}
