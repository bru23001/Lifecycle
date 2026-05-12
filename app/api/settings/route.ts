import { NextResponse } from "next/server";

import { recordAudit } from "@/lib/server/audit";
import { loadSettingsPageData, saveSettingsPageData } from "@/lib/server/settings";
import { computeActionState } from "@/lib/settings-validation";
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

function eventTypeForSection(section: SettingsSectionId): SettingsActivity["eventType"] {
  switch (section) {
    case "lifecycle_configuration":
      return "lifecycle_updated";
    case "template_registry":
      return "template_updated";
    case "gate_rules":
      return "gate_rule_modified";
    case "roles_permissions":
      return "role_changed";
    case "export_settings":
      return "export_settings_changed";
    case "local_storage_settings":
      return "storage_settings_changed";
    default:
      return "lifecycle_updated";
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionParam = searchParams.get("section");
  const section = isSection(sectionParam) ? sectionParam : undefined;
  const data = await loadSettingsPageData(section);
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
    eventType: eventTypeForSection(incoming.activeSection),
    title: `Settings saved (${incoming.activeSection.replaceAll("_", " ")})`,
    actorName: incoming.user.name,
    timestampLabel: "Just now",
    href: incoming.navigationItems.find((item) => item.section === incoming.activeSection)?.href,
  };
  const nextData: SettingsPageData = {
    ...incoming,
    recentActivity: [saveActivity, ...incoming.recentActivity].slice(0, 20),
  };

  await saveSettingsPageData(nextData);
  await recordAudit({
    action: "settings.saved",
    subjectKind: "settings",
    subjectId: incoming.activeSection,
    projectId: null,
    metadata: {
      section: incoming.activeSection,
    },
  });
  const fresh = await loadSettingsPageData(incoming.activeSection);
  return NextResponse.json({ data: fresh });
}
