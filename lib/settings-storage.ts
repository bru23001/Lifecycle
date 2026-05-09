import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildSettingsPageData } from "@/data/settings.mock";
import type { SettingsPageData, SettingsSectionId } from "@/types/settings.types";

const SETTINGS_STORE_PATH = path.join(process.cwd(), "data", "settings.store.json");

async function ensureStoreDirectory(): Promise<void> {
  await mkdir(path.dirname(SETTINGS_STORE_PATH), { recursive: true });
}

function withSection(data: SettingsPageData, section: SettingsSectionId): SettingsPageData {
  return {
    ...data,
    activeSection: section,
    navigationItems: data.navigationItems.map((item) => ({
      ...item,
      active: item.section === section,
    })),
  };
}

export async function readSettingsStore(section?: SettingsSectionId): Promise<SettingsPageData> {
  try {
    const content = await readFile(SETTINGS_STORE_PATH, "utf-8");
    const parsed = JSON.parse(content) as SettingsPageData;
    return section ? withSection(parsed, section) : parsed;
  } catch {
    const fallback = buildSettingsPageData(section ?? "lifecycle_configuration");
    await writeSettingsStore(fallback);
    return fallback;
  }
}

export async function writeSettingsStore(data: SettingsPageData): Promise<void> {
  await ensureStoreDirectory();
  await writeFile(SETTINGS_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function resetSettingsStore(section: SettingsSectionId): Promise<SettingsPageData> {
  const defaults = buildSettingsPageData(section);
  await writeSettingsStore(defaults);
  return defaults;
}
