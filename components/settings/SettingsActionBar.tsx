"use client";

import Link from "next/link";
import { BookOpen, Check, CircleAlert, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SettingsActionBar({
  title,
  description,
  blockers,
  canSave,
  canReset,
  isSaving,
  onSave,
  onReset,
}: {
  title: string;
  description: string;
  blockers: string[];
  canSave: boolean;
  canReset: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <footer className="sticky bottom-0 z-20 mt-5 flex flex-col items-stretch justify-between gap-3 border-t border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] min-[901px]:flex-row min-[901px]:items-center min-[901px]:px-8">
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-blue-700" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-600">{description}</p>
          {blockers.length > 0 ? (
            <p id="save-disabled-helper" className="mt-1 text-xs text-amber-700">
              Save is disabled: {blockers.join(" ")}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link href="/docs/settings">
          <Button type="button" variant="outline" size="sm">
            <BookOpen className="size-3.5" aria-hidden />
            Documentation & Help
          </Button>
        </Link>
        <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={!canReset || isSaving}>
          <RefreshCcw className="size-3.5" aria-hidden />
          Reset Changes
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={onSave}
          disabled={!canSave || isSaving}
          aria-describedby={!canSave ? "save-disabled-helper" : undefined}
        >
          <Check className="size-3.5" aria-hidden />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </footer>
  );
}
