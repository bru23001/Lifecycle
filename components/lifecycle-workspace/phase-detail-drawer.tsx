"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

import type {
  LockedPhaseContextPayload,
  PhaseCompletionDetailPayload,
  StartPhaseModalPayload,
} from "@/components/lifecycle-workspace/phase-navigator-types";
import type { Applicability } from "@/lib/applicability";
import {
  WORKSPACE_PHASE_MAX,
  domainPhaseForWorkspaceIndex,
  gateHeaderDisplayName,
  workspacePhaseMeta,
  workspacePhaseObjectives,
  workspacePhasePurpose,
} from "@/lib/workspacePhases";
import { getTemplatesForPhase } from "@/templates/registry";

function filterTemplatesForPhase(phase: number, app: Applicability) {
  const p = domainPhaseForWorkspaceIndex(phase);
  return getTemplatesForPhase(p).filter((tmpl) => {
    const tid = tmpl.templateId;
    if (tid === "A-11" && !app.data) return false;
    if (tid === "A-12" && !app.apis) return false;
    if (tid === "UXD-001" && !app.ui) return false;
    return true;
  });
}

function phaseLabel(phaseNumber: number, projectCurrentPhase: number): "completed" | "current" | "upcoming" {
  const cur = Math.min(WORKSPACE_PHASE_MAX, Math.max(1, projectCurrentPhase));
  if (phaseNumber < cur) return "completed";
  if (phaseNumber === cur) return "current";
  return "upcoming";
}

export type PhaseDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  phaseNumber: number;
  projectId: string;
  /** DB-backed current lifecycle phase (1–14). */
  projectCurrentPhase: number;
  applicability: Applicability;
  /** Primary gate review link for this project. */
  gateReviewHref: string;
  completionDetail?: PhaseCompletionDetailPayload | null;
  lockedContext?: LockedPhaseContextPayload | null;
  startPhaseModal?: StartPhaseModalPayload | null;
  /** Opens the Start Phase confirmation flow (parent owns modal state). */
  onRequestAdvance?: () => void;
};

export function PhaseDetailDrawer({
  open,
  onClose,
  phaseNumber,
  projectId,
  projectCurrentPhase,
  applicability,
  gateReviewHref,
  completionDetail,
  lockedContext,
  startPhaseModal,
  onRequestAdvance,
}: PhaseDetailDrawerProps) {
  const meta = workspacePhaseMeta(phaseNumber);
  const purpose = workspacePhasePurpose(phaseNumber);
  const objectives = workspacePhaseObjectives(phaseNumber);
  const templates = filterTemplatesForPhase(phaseNumber, applicability);
  const gate = meta.gate;
  const status = phaseLabel(phaseNumber, projectCurrentPhase);
  const workspaceHref =
    status === "upcoming" ? `/projects/${projectId}/workspace?phase=${projectCurrentPhase}` : `/projects/${projectId}/workspace?phase=${phaseNumber}`;

  const completion =
    completionDetail && completionDetail.phaseNumber === phaseNumber ? completionDetail : null;
  const isFuture = phaseNumber > projectCurrentPhase;
  const isCurrent = phaseNumber === projectCurrentPhase;
  const showAdvanceCta = Boolean(isCurrent && startPhaseModal && onRequestAdvance);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close phase details" onClick={onClose} />
      <div
        data-testid="phase-detail-drawer"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-[var(--app-bg)] shadow-2xl dark:border-border"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phase {phaseNumber}</p>
            <h2 id="phase-detail-drawer-title" className="text-sm font-semibold text-foreground">
              {meta.title}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-[12px]">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Status</p>
            <p className="mt-1 font-medium capitalize text-foreground">
              {status === "completed" ? "Completed" : status === "current" ? "Current" : "Upcoming"}
            </p>
          </div>

          {completion ? (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground">Recorded exit</p>
              <p className="mt-1 text-foreground/90">
                {completion.gateCode} — {completion.gateName}
              </p>
              <p className="mt-1 text-muted-foreground">{completion.decisionLabel}</p>
              <p className="mt-1 cc-card-meta">Completed on {completion.completedOnLabel}</p>
              {completion.artifactSummaries.length > 0 ? (
                <ul className="mt-2 max-h-32 list-inside list-disc overflow-y-auto text-[11px] text-foreground/90">
                  {completion.artifactSummaries.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {isFuture && lockedContext ? (
            <div className="rounded-md border border-amber-200 bg-amber-50/80 px-3 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-100">Phase locked</p>
              <p className="mt-1 text-[12px] text-amber-950 dark:text-amber-50">
                The project is still in <span className="font-semibold">{lockedContext.currentPhaseTitle}</span>. Finish
                current-phase requirements before this milestone unlocks.
              </p>
              {lockedContext.missingBullets.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-[11px] text-amber-950 dark:text-amber-100">
                  {lockedContext.missingBullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              <Link href={gateReviewHref} className="mt-2 inline-block text-[11px] font-semibold text-amber-950 underline dark:text-amber-100">
                Open gate review
              </Link>
            </div>
          ) : null}

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Purpose</p>
            <p className="mt-1 leading-relaxed text-foreground/90">{purpose}</p>
          </div>
          {gate ? (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Gate dependency</p>
              <p className="mt-1 font-medium text-foreground">
                {gate} — {gateHeaderDisplayName(gate)}
              </p>
              <p className="mt-1 text-muted-foreground">
                Phase exit is governed by the gate review package and recorded decisions for this project.
              </p>
            </div>
          ) : null}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Required artifacts</p>
            {templates.length === 0 ? (
              <p className="mt-1 text-muted-foreground">No registered templates for this phase in the catalog.</p>
            ) : (
              <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
                {templates.map((t) => (
                  <li key={t.templateId}>
                    <span className="font-mono text-[11px]">{t.templateId}</span> — {t.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Required evidence</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">
              Link evidence items to completed artifacts for this phase in the workspace. Gate submission checks
              traceability and completeness before approval.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Completion checklist</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
              {objectives.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          {startPhaseModal && isCurrent ? (
            <div className="rounded-md border border-border bg-muted/20 px-3 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground">Ready for next phase</p>
              <p className="mt-1 text-[12px] text-foreground/90">
                Next: Phase {startPhaseModal.nextPhase} — {startPhaseModal.nextPhaseTitle}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Gate {startPhaseModal.gateCode} ({startPhaseModal.gateName}) applies to the current exit package.
              </p>
            </div>
          ) : null}
        </div>
        <footer className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          {showAdvanceCta ? (
            <button
              type="button"
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 text-sm font-semibold text-foreground hover:bg-slate-50 dark:border-border dark:hover:bg-muted"
              onClick={() => {
                onRequestAdvance?.();
              }}
            >
              Advance to phase {startPhaseModal!.nextPhase}…
            </button>
          ) : null}
          <Link
            href={workspaceHref}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Open workspace
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        </footer>
      </div>
    </div>
  );
}
