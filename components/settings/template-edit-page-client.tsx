"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TemplateDefinitionFields,
  TemplateRegistryPageShell,
  putSettingsPageData,
  templateItemToFormDraft,
  type TemplateFormDraft,
} from "@/components/settings/template-registry-shared";
import { templateRegistryItemId } from "@/lib/template-registry-defaults";
import type { SettingsPageData, TemplateRegistryItem, TemplateVersionEntry } from "@/types/settings.types";

function phaseNameForNumber(data: SettingsPageData, phaseNumber: number): string {
  const p = data.lifecycleConfiguration.phases.find((x) => x.phaseNumber === phaseNumber);
  return p?.name ?? `Phase ${phaseNumber}`;
}

function applyDraftToItem(
  data: SettingsPageData,
  base: TemplateRegistryItem,
  draft: TemplateFormDraft,
  changeSummary: string,
): TemplateRegistryItem {
  const sv = draft.schemaVersion.trim();
  const schemaVersion = sv.startsWith("v") ? sv : `v${sv}`;
  const phaseName = phaseNameForNumber(data, draft.phaseNumber);
  const nextDetail = {
    ...base.detail,
    sectionDefinitions: draft.sectionDefinitions,
    fieldDefinitions: draft.fieldDefinitions,
    validationRules: draft.validationRules,
    markdownRendererSettings: draft.markdownRendererSettings,
    jsonEvidenceSettings: draft.jsonEvidenceSettings,
    usageSummaryLabel: draft.usageSummaryLabel,
  };
  const entry: TemplateVersionEntry = {
    id: `ver-${Date.now()}`,
    author: data.user.name,
    timestampLabel: "Just now",
    changeSummary: changeSummary.trim() || "Template updated",
    schemaSnapshot: schemaVersion,
  };
  return {
    ...base,
    name: draft.name.trim() || base.templateCode,
    phaseNumber: draft.phaseNumber,
    phaseName,
    outputType: draft.outputType,
    required: draft.required,
    schemaVersion,
    detail: {
      ...nextDetail,
      versionHistory: [entry, ...base.detail.versionHistory].slice(0, 50),
    },
  };
}

export function TemplateEditPageClient({
  initial,
  item,
}: {
  initial: SettingsPageData;
  item: TemplateRegistryItem;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<TemplateFormDraft | null>(null);
  const [changeSummary, setChangeSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const effectiveDraft = draft ?? templateItemToFormDraft(item);

  const phaseOptions = initial.lifecycleConfiguration.phases.map((p) => ({
    phaseNumber: p.phaseNumber,
    label: `${p.phaseNumber}. ${p.name}`,
  }));

  const handleSave = async () => {
    setError(null);
    const updated = applyDraftToItem(initial, item, effectiveDraft, changeSummary);
    if (updated.templateCode !== item.templateCode) {
      setError("Renaming template ID is not supported here; clone instead.");
      return;
    }
    const nextRegistry = initial.templateRegistry.map((t) =>
      t.id === item.id || t.templateCode === item.templateCode ? updated : t,
    );
    const next: SettingsPageData = {
      ...initial,
      activeSection: "template_registry",
      templateRegistry: nextRegistry,
    };
    setSaving(true);
    try {
      await putSettingsPageData(next);
      router.push(`/settings/templates/${encodeURIComponent(templateRegistryItemId(updated.templateCode))}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TemplateRegistryPageShell
      navActive="template_registry"
      user={initial.user}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Settings", href: "/settings/lifecycle" },
        { label: "Template Registry", href: "/settings/templates" },
        { label: item.templateCode, href: `/settings/templates/${encodeURIComponent(item.id)}` },
        { label: "Edit" },
      ]}
    >
      <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Edit template</h1>
        <p className="mt-1 font-mono text-sm text-slate-600">{item.templateCode}</p>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6">
          <TemplateDefinitionFields
            draft={effectiveDraft}
            onChange={(next) => setDraft(next)}
            phaseOptions={phaseOptions}
            disableTemplateCode
          />
        </div>
        <label className="mt-6 block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Change summary</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="Brief note for version history"
          />
        </label>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Markdown preview</h3>
            <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-slate-800">
              {effectiveDraft.markdownRendererSettings.trim().length > 0
                ? effectiveDraft.markdownRendererSettings
                : "—"}
            </pre>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">JSON evidence preview</h3>
            <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-slate-800">
              {effectiveDraft.jsonEvidenceSettings.trim().length > 0 ? effectiveDraft.jsonEvidenceSettings : "—"}
            </pre>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save template"}
          </Button>
          <Link
            href={`/settings/templates/${encodeURIComponent(item.id)}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
