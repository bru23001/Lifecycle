import { NextResponse } from "next/server";

import { resetSettingsStore } from "@/lib/settings-storage";
import type { SettingsSectionId } from "@/types/settings.types";

function resolveSection(value: unknown): SettingsSectionId {
  if (
    value === "lifecycle_configuration" ||
    value === "template_registry" ||
    value === "gate_rules" ||
    value === "roles_permissions" ||
    value === "export_settings" ||
    value === "local_storage_settings"
  ) {
    return value;
  }
  return "lifecycle_configuration";
}

export async function POST(request: Request) {
  const body = (await request.json()) as { section?: SettingsSectionId };
  const section = resolveSection(body?.section);
  const data = await resetSettingsStore(section);
  return NextResponse.json({ data });
}
