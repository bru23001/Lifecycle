import { NextResponse } from "next/server";

import { loadSettingsPageData, saveSettingsPageData } from "@/lib/server/settings";
import { validateSettingsPageData } from "@/lib/settings-validation";
import type { SettingsActivity, SettingsPageData } from "@/types/settings.types";

type PartialImport = Partial<
  Pick<
    SettingsPageData,
    | "activeSection"
    | "lifecycleConfiguration"
    | "templateRegistry"
    | "gateRules"
    | "rolesPermissions"
    | "exportSettings"
    | "localStorageSettings"
  >
>;

export async function POST(request: Request) {
  const body = (await request.json()) as { payload?: PartialImport };
  if (!body?.payload || typeof body.payload !== "object") {
    return NextResponse.json({ error: "Invalid import payload." }, { status: 400 });
  }

  const current = await loadSettingsPageData();
  const importActivity: SettingsActivity = {
    id: `activity-${Date.now()}`,
    eventType: "lifecycle_updated",
    title: "Lifecycle configuration imported",
    actorName: current.user.name,
    timestampLabel: "Just now",
  };
  const merged: SettingsPageData = {
    ...current,
    activeSection: body.payload.activeSection ?? current.activeSection,
    lifecycleConfiguration: body.payload.lifecycleConfiguration ?? current.lifecycleConfiguration,
    templateRegistry: body.payload.templateRegistry ?? current.templateRegistry,
    gateRules: body.payload.gateRules ?? current.gateRules,
    rolesPermissions: body.payload.rolesPermissions ?? current.rolesPermissions,
    exportSettings: body.payload.exportSettings ?? current.exportSettings,
    localStorageSettings: body.payload.localStorageSettings ?? current.localStorageSettings,
    recentActivity: [importActivity, ...current.recentActivity].slice(0, 20),
  };

  const blockers = validateSettingsPageData(merged);
  if (blockers.length > 0) {
    return NextResponse.json({ error: "Validation failed.", blockers }, { status: 400 });
  }

  await saveSettingsPageData(merged);
  const fresh = await loadSettingsPageData(merged.activeSection);
  return NextResponse.json({ data: fresh });
}
