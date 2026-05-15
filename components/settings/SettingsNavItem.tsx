"use client";

import Link from "next/link";

import { sectionIconMap } from "@/components/settings/shared";
import { cn } from "@/lib/utils";
import type { SettingsNavItem as SettingsNavItemType, SettingsSectionId } from "@/types/settings.types";

export function SettingsNavItem({
  item,
  activeSection,
}: {
  item: SettingsNavItemType;
  activeSection: SettingsSectionId;
}) {
  const Icon = sectionIconMap[item.section];
  const isActive = activeSection === item.section;

  return (
    <Link
      href={item.href}
      scroll={false}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        isActive
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
          isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600",
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">{item.label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-500">{item.description}</span>
      </span>
    </Link>
  );
}
