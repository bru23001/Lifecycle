"use client";

import Link from "next/link";
import { History } from "lucide-react";

import type { SettingsActivity } from "@/types/settings.types";

export function SettingsRecentActivity({
  items,
}: {
  items: SettingsActivity[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-foreground">Recent Activity</h3>
        {items.length > 0 ? (
          <Link
            href="/settings/activity"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
          >
            View All Activity
          </Link>
        ) : null}
      </div>
      {items.length === 0 ? (
        <div
          className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center dark:border-border dark:bg-muted/30"
          role="status"
          data-testid="settings-recent-activity-empty"
        >
          <div className="mx-auto flex size-9 items-center justify-center rounded-md bg-white text-slate-400 shadow-sm dark:bg-card dark:text-slate-500">
            <History className="size-4" aria-hidden />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-800 dark:text-foreground/90">No settings activity yet</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-muted-foreground">
            Saves, imports, and other changes to your workspace settings will show up here. This is normal on a fresh
            account.
          </p>
          <Link
            href="/settings/activity"
            className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Open full activity log
          </Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2.5 rounded-lg border border-slate-200 px-3 py-2 dark:border-border"
            >
              <span aria-hidden className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-blue-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-muted-foreground">
                  {item.actorName} • {item.timestampLabel}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
