import { NextResponse } from "next/server";

import { computeActionState } from "@/lib/settings-validation";
import { readSettingsStore, writeSettingsStore } from "@/lib/settings-storage";
import type { SettingsActivity, SettingsPageData, SettingsSectionId } from "@/types/settings.types";

function isSection(value: string | null): value is SettingsSectionId {
  return (
    value === "lifecycle_configuration" ||
    value === "template_registry" ||
    value === "gate_rules" ||
    value === "roles_permissions" ||
    value === "export_settings" ||
    value === "local_storage_settings"
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionParam = searchParams.get("section");
  const section = isSection(sectionParam) ? sectionParam : undefined;
  const data = await readSettingsStore(section);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const incoming = (await request.json()) as SettingsPageData;
  const actionState = computeActionState({ data: incoming, hasUnsavedChanges: true });
  if (actionState.blockers.length > 0) {
    return NextResponse.json(
      { error: "Validation failed.", blockers: actionState.blockers },
      { status: 400 },
    );
  }

  const saveActivity: SettingsActivity = {
    id: `activity-${Date.now()}`,
    eventType: "export_settings_changed",
    title: "Settings saved",
    actorName: incoming.user.name,
    timestampLabel: "Just now",
  };
  const nextData: SettingsPageData = {
    ...incoming,
    recentActivity: [saveActivity, ...incoming.recentActivity].slice(0, 20),
  };

  await writeSettingsStore(nextData);
  return NextResponse.json({ data: nextData });
}
