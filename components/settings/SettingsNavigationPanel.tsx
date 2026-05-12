"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SettingsNavItem } from "@/components/settings/SettingsNavItem";
import type { SettingsPageData, SettingsSectionId } from "@/types/settings.types";

export function SettingsNavigationPanel({
  data,
  activeSection,
  onSectionChange,
}: {
  data: SettingsPageData;
  activeSection: SettingsSectionId;
  onSectionChange: (section: SettingsSectionId, href: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Settings</h2>
      <p className="mt-0.5 text-xs text-slate-500">Configure platform behavior</p>
      <ul className="mt-4 space-y-2">
        {data.navigationItems.map((item) => (
          <li key={item.id}>
            <SettingsNavItem item={item} activeSection={activeSection} onSelect={onSectionChange} />
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-slate-200 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">System Settings</p>
        <ul className="mt-2 space-y-1">
          {data.systemNavigationItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <span>{item.label}</span>
                <ChevronRight className="size-3.5 text-slate-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
