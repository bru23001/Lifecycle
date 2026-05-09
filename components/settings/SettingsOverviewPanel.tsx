"use client";

import { SettingsRecentActivity } from "@/components/settings/SettingsRecentActivity";
import { SettingsQuickActions } from "@/components/settings/SettingsQuickActions";
import { SystemOverviewPanel } from "@/components/settings/SystemOverviewPanel";
import type { SettingsPageData, SettingsQuickAction } from "@/types/settings.types";

export function SettingsOverviewPanel({
  data,
  onQuickAction,
}: {
  data: SettingsPageData;
  onQuickAction: (action: SettingsQuickAction) => void;
}) {
  return (
    <>
      <SystemOverviewPanel data={data.systemOverview} />
      <SettingsRecentActivity items={data.recentActivity} />
      <SettingsQuickActions actions={data.quickActions} onAction={onQuickAction} />
    </>
  );
}
