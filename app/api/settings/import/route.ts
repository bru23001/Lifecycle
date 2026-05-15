import { NextResponse } from "next/server";

import { ensureLifecycleConfigurationShape } from "@/lib/lifecycle-settings-defaults";
import { ensureGateRulesList } from "@/lib/gate-rules-defaults";
import { ensureRolesList } from "@/lib/role-settings-defaults";
import { ensureTemplateRegistryList } from "@/lib/template-registry-defaults";
import { ensureExportSettingsShape, ensureLocalStorageSettingsShape } from "@/lib/server/settings-seed-builders";
import { loadSettingsPageData, saveSettingsPageData } from "@/lib/server/settings";
import { validateSettingsPageData } from "@/lib/settings-validation";
import type {
  ExportSettings,
  GateRuleSetting,
  LifecycleConfigurationBlock,
  LocalStorageSettings,
  RolePermissionSetting,
  SettingsActivity,
  SettingsPageData,
  TemplateRegistryItem,
} from "@/types/settings.types";

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
    lifecycleConfiguration: ensureLifecycleConfigurationShape(
      (body.payload.lifecycleConfiguration ?? current.lifecycleConfiguration) as LifecycleConfigurationBlock,
    ),
    templateRegistry: ensureTemplateRegistryList(
      (body.payload.templateRegistry ?? current.templateRegistry) as TemplateRegistryItem[],
    ),
    gateRules: ensureGateRulesList((body.payload.gateRules ?? current.gateRules) as GateRuleSetting[]),
    rolesPermissions: ensureRolesList(
      (body.payload.rolesPermissions ?? current.rolesPermissions) as RolePermissionSetting[],
    ),
    exportSettings: ensureExportSettingsShape(
      (body.payload.exportSettings ?? current.exportSettings) as ExportSettings,
    ),
    localStorageSettings: ensureLocalStorageSettingsShape(
      (body.payload.localStorageSettings ?? current.localStorageSettings) as LocalStorageSettings,
    ),
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
