"use client";

import Link from "next/link";

import type { SettingsActivity } from "@/types/settings.types";

export function SettingsRecentActivity({
  items,
}: {
  items: SettingsActivity[];
}) {
  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
        <Link href="/settings/activity" className="text-sm font-semibold text-blue-700 hover:underline">
          View All Activity
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No settings activity has been recorded yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {item.actorName} • {item.timestampLabel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
