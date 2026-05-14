"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { advanceLifecyclePhase } from "@/app/actions/advanceLifecyclePhase";
import type { StartPhaseModalPayload } from "@/components/lifecycle-workspace/phase-navigator-types";
import type { Applicability } from "@/lib/applicability";
import {
  WORKSPACE_PHASE_MAX,
  domainPhaseForWorkspaceIndex,
  workspacePhaseMeta,
} from "@/lib/workspacePhases";
import { getTemplatesForPhase } from "@/templates/registry";
import { toUserMessage } from "@/lib/toUserMessage";

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

export type StartPhaseConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  /** DB-backed phase before advance (1–14). */
  currentPhase: number;
  applicability: Applicability;
  onStarted: () => void;
  /** Rich copy from workspace server; when omitted, generic checklist is shown. */
  preview?: StartPhaseModalPayload | null;
};

export function StartPhaseConfirmModal({
  open,
  onClose,
  projectId,
  currentPhase,
  applicability,
  onStarted,
  preview,
}: StartPhaseConfirmModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cur = Math.min(WORKSPACE_PHASE_MAX, Math.max(1, currentPhase));
  const next = Math.min(WORKSPACE_PHASE_MAX, cur + 1);
  const nextMeta = workspacePhaseMeta(next);
  const templates = filterTemplatesForPhase(cur, applicability);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      setError(null);
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open]);

  function confirm() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await advanceLifecyclePhase(projectId);
        if (!res.ok) {
          setError(res.blockingTemplates?.length ? `${res.error} ${res.blockingTemplates.join("; ")}` : res.error);
          return;
        }
        onStarted();
        onClose();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={ref}
      data-testid="start-phase-modal"
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      onClose={onClose}
      aria-labelledby="start-phase-modal-title"
    >
      <h2 id="start-phase-modal-title" className="text-lg font-semibold text-foreground">
        Start next phase
      </h2>
      <p className="mt-2 text-[12px] text-muted-foreground">
        {preview ? (
          <>
            Confirms advancing from <span className="font-medium">{preview.currentPhaseTitle}</span> to phase{" "}
            <span className="font-medium">
              {preview.nextPhase}: {preview.nextPhaseTitle}
            </span>
            . The server re-validates required artifacts for the current phase before updating.
          </>
        ) : (
          <>
            Advances the project from phase {cur} to phase {next} after required artifacts for the current phase are
            complete.
          </>
        )}
      </p>
      {error ? (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-900" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 space-y-3 text-[12px]">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground">Phase being started</p>
          <p className="mt-1 font-medium text-foreground">
            Phase {preview?.nextPhase ?? next}: {preview?.nextPhaseTitle ?? nextMeta.title}
          </p>
        </div>
        {preview?.checklistPreview && preview.checklistPreview.length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Exit checklist preview</p>
            <ul className="mt-1 max-h-24 list-inside list-disc overflow-y-auto text-foreground/90">
              {preview.checklistPreview.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Prerequisite status</p>
            <p className="mt-1 text-foreground/90">
              All required templates for phase {cur} must have a saved artifact that is not in Draft status.
            </p>
          </div>
        )}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground">
            {preview?.nextTemplateLabels?.length ? "Templates in next phase" : "Templates to satisfy before advance"}
          </p>
          {preview?.nextTemplateLabels && preview.nextTemplateLabels.length > 0 ? (
            <ul className="mt-1 max-h-28 list-inside list-disc overflow-y-auto text-foreground/90">
              {preview.nextTemplateLabels.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : templates.length === 0 ? (
            <p className="mt-1 text-muted-foreground">No catalog templates for this phase.</p>
          ) : (
            <ul className="mt-1 max-h-28 list-inside list-disc overflow-y-auto text-foreground/90">
              {templates.map((t) => (
                <li key={t.templateId}>
                  <span className="font-mono text-[11px]">{t.templateId}</span> — {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground">Evidence expectations</p>
          <p className="mt-1 text-muted-foreground">
            {preview?.evidenceExpectation ??
              "Keep evidence linked to artifacts; gate reviews record an evidence pass snapshot when accepted."}
          </p>
        </div>
        {preview ? (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Gate package</p>
            <p className="mt-1 text-foreground/90">
              {preview.gateCode} — {preview.gateName}
            </p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm dark:border-border"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="start-phase-confirm"
          className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          onClick={confirm}
          disabled={pending}
        >
          {pending ? "Starting…" : "Start phase"}
        </button>
      </div>
    </dialog>
  );
}
