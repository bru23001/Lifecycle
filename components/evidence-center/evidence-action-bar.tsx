"use client";

import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EvidenceCenterData } from "@/types/evidence-center.types";

export function EvidenceActionBar({
  actionState,
  onPrimaryAction,
  onSecondaryAction,
}: {
  actionState: EvidenceCenterData["actionState"];
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}) {
  return (
    <footer className="evidence-action-bar shrink-0 border-t border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] min-[901px]:px-8">
      <div className="flex min-w-0 items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
        <Info className="mt-0.5 size-5 shrink-0 text-[#2563eb]" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827]">{actionState.title}</p>
          <p className="text-sm text-slate-600">{actionState.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {!actionState.canSubmit && actionState.blockers.length > 0 ? (
          <p className="hidden max-w-md text-right text-xs text-slate-500 min-[901px]:block">{actionState.blockers.join(" · ")}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="lg"
          data-testid="evidence-action-secondary"
          onClick={() => onSecondaryAction?.()}
        >
          {actionState.secondaryLabel}
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-auto flex-col gap-0.5 bg-[#2563eb] px-5 py-2 text-white hover:bg-blue-700"
          onClick={onPrimaryAction}
          disabled={!actionState.canSubmit}
          aria-label={
            actionState.primarySubLabel ? `${actionState.primaryLabel}: ${actionState.primarySubLabel}` : actionState.primaryLabel
          }
        >
          <span className="text-sm font-semibold leading-tight">{actionState.primaryLabel}</span>
          {actionState.primarySubLabel ? (
            <span className="text-[11px] font-normal leading-tight text-blue-100">{actionState.primarySubLabel}</span>
          ) : null}
        </Button>
      </div>
    </footer>
  );
}
