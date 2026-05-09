"use client";

import { ChevronRight } from "lucide-react";

import type { SettingsQuickAction } from "@/types/settings.types";

export function SettingsQuickActions({
  actions,
  onAction,
}: {
  actions: SettingsQuickAction[];
  onAction: (action: SettingsQuickAction) => void;
}) {
  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
      <div className="mt-3 space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>{action.label}</span>
            <ChevronRight className="size-4 text-slate-400" aria-hidden />
          </button>
        ))}
      </div>
    </article>
  );
}
