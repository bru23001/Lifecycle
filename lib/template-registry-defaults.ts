import type { TemplateRegistryDetail, TemplateRegistryItem, TemplateVersionEntry } from "@/types/settings.types";

export const TEMPLATE_EXT_SCHEMA_VERSION = 1 as const;

/** Stable URL slug / row id derived from template code (matches server `buildSettingsPageDataFromSources`). */
export function templateRegistryItemId(templateCode: string): string {
  return templateCode.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function findTemplateByRouteParam(
  items: TemplateRegistryItem[],
  param: string,
): TemplateRegistryItem | undefined {
  const decoded = decodeURIComponent(param);
  return items.find(
    (t) => t.id === param || t.id === decoded || t.templateCode === param || t.templateCode === decoded,
  );
}

export function emptyTemplateDetail(): TemplateRegistryDetail {
  return {
    sectionDefinitions: "",
    fieldDefinitions: "",
    validationRules: "",
    markdownRendererSettings: "",
    jsonEvidenceSettings: "",
    usageSummaryLabel: "",
    versionHistory: [],
  };
}

export function mergeTemplateDetail(templateCode: string, byCode: Record<string, unknown>): TemplateRegistryDetail {
  const base = emptyTemplateDetail();
  const raw = byCode[templateCode];
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;

  const versionHistory: TemplateVersionEntry[] = Array.isArray(r.versionHistory)
    ? r.versionHistory.filter(
        (v): v is TemplateVersionEntry =>
          Boolean(v) &&
          typeof v === "object" &&
          typeof (v as TemplateVersionEntry).id === "string" &&
          typeof (v as TemplateVersionEntry).author === "string",
      )
    : [];

  return {
    sectionDefinitions:
      typeof r.sectionDefinitions === "string" ? r.sectionDefinitions : base.sectionDefinitions,
    fieldDefinitions: typeof r.fieldDefinitions === "string" ? r.fieldDefinitions : base.fieldDefinitions,
    validationRules: typeof r.validationRules === "string" ? r.validationRules : base.validationRules,
    markdownRendererSettings:
      typeof r.markdownRendererSettings === "string"
        ? r.markdownRendererSettings
        : base.markdownRendererSettings,
    jsonEvidenceSettings:
      typeof r.jsonEvidenceSettings === "string" ? r.jsonEvidenceSettings : base.jsonEvidenceSettings,
    usageSummaryLabel:
      typeof r.usageSummaryLabel === "string" ? r.usageSummaryLabel : base.usageSummaryLabel,
    versionHistory,
  };
}

export function templateDetailHasPersistableContent(d: TemplateRegistryDetail): boolean {
  return (
    d.sectionDefinitions.trim().length > 0 ||
    d.fieldDefinitions.trim().length > 0 ||
    d.validationRules.trim().length > 0 ||
    d.markdownRendererSettings.trim().length > 0 ||
    d.jsonEvidenceSettings.trim().length > 0 ||
    d.usageSummaryLabel.trim().length > 0 ||
    d.versionHistory.length > 0
  );
}

export function ensureTemplateRegistryItem(item: TemplateRegistryItem): TemplateRegistryItem {
  return {
    ...item,
    detail:
      item.detail && typeof item.detail === "object"
        ? {
            ...emptyTemplateDetail(),
            ...item.detail,
            versionHistory: Array.isArray(item.detail.versionHistory) ? item.detail.versionHistory : [],
          }
        : emptyTemplateDetail(),
  };
}

export function ensureTemplateRegistryList(items: TemplateRegistryItem[]): TemplateRegistryItem[] {
  return items.map(ensureTemplateRegistryItem);
}
