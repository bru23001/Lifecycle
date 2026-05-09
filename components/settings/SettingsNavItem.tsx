"use client";

import { sectionIconMap } from "@/components/settings/shared";
import { cn } from "@/lib/utils";
import type { SettingsNavItem as SettingsNavItemType, SettingsSectionId } from "@/types/settings.types";

export function SettingsNavItem({
  item,
  activeSection,
  onSelect,
}: {
  item: SettingsNavItemType;
  activeSection: SettingsSectionId;
  onSelect: (section: SettingsSectionId, href: string) => void;
}) {
  const Icon = sectionIconMap[item.section];
  const isActive = activeSection === item.section;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.section, item.href)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "w-full rounded-xl border px-3 py-2 text-left transition focus-visible:ring-2 focus-visible:ring-blue-500",
        isActive
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 size-4", isActive ? "text-blue-700" : "text-slate-500")} aria-hidden />
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
        </div>
      </div>
    </button>
  );
}
