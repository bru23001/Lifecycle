"use client";

import { cn } from "@/lib/utils";

export type PaneTab = { id: string; label: string };

export function PaneSwitcher({
  panes,
  active,
  onChange,
  className,
}: {
  panes: PaneTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Workspace panes"
      className={cn(
        "sticky top-0 z-10 flex shrink-0 gap-1 border-b border-[var(--cc-border)] bg-[var(--app-bg)] px-5 py-2 min-[901px]:hidden",
        className,
      )}
    >
      {panes.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={active === p.id}
          onClick={() => onChange(p.id)}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
            active === p.id
              ? "bg-[#2563eb] text-white"
              : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-card dark:text-foreground dark:ring-border",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
