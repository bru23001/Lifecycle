"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TemplateDefinitionFields,
  TemplateRegistryPageShell,
  emptyTemplateFormDraft,
  putSettingsPageData,
  type TemplateFormDraft,
} from "@/components/settings/template-registry-shared";
import { templateRegistryItemId } from "@/lib/template-registry-defaults";
import type { SettingsPageData, TemplateRegistryItem, TemplateVersionEntry } from "@/types/settings.types";

function phaseNameForNumber(data: SettingsPageData, phaseNumber: number): string {
  const p = data.lifecycleConfiguration.phases.find((x) => x.phaseNumber === phaseNumber);
  return p?.name ?? `Phase ${phaseNumber}`;
}

function buildItemFromDraft(
  data: SettingsPageData,
  draft: TemplateFormDraft,
  versionHistory: TemplateVersionEntry[],
): TemplateRegistryItem {
  const templateCode = draft.templateCode.trim();
  const id = templateRegistryItemId(templateCode);
  const phaseName = phaseNameForNumber(data, draft.phaseNumber);
  const sv = draft.schemaVersion.trim();
  const schemaVersion = sv.startsWith("v") ? sv : `v${sv}`;
  return {
    id,
    templateCode,
    name: draft.name.trim() || templateCode,
    phaseNumber: draft.phaseNumber,
    phaseName,
    outputType: draft.outputType,
    required: draft.required,
    schemaVersion,
    status: "draft",
    canEdit: true,
    canClone: true,
    canArchive: true,
    detail: {
      sectionDefinitions: draft.sectionDefinitions,
      fieldDefinitions: draft.fieldDefinitions,
      validationRules: draft.validationRules,
      markdownRendererSettings: draft.markdownRendererSettings,
      jsonEvidenceSettings: draft.jsonEvidenceSettings,
      usageSummaryLabel: draft.usageSummaryLabel,
      versionHistory,
    },
  };
}

export function TemplateNewPageClient({ initial }: { initial: SettingsPageData }) {
  const router = useRouter();
  const [draft, setDraft] = useState<TemplateFormDraft>(() => emptyTemplateFormDraft());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const phaseOptions = useMemo(
    () =>
      initial.lifecycleConfiguration.phases.map((p) => ({
        phaseNumber: p.phaseNumber,
        label: `${p.phaseNumber}. ${p.name}`,
      })),
    [initial.lifecycleConfiguration.phases],
  );

  const handleCreate = async () => {
    setError(null);
    const code = draft.templateCode.trim();
    if (!code) {
      setError("Template ID is required.");
      return;
    }
    if (initial.templateRegistry.some((t) => t.templateCode === code || t.id === templateRegistryItemId(code))) {
      setError("A template with this ID already exists.");
      return;
    }
    const versionHistory: TemplateVersionEntry[] = [
      {
        id: `ver-${Date.now()}`,
        author: initial.user.name,
        timestampLabel: "Just now",
        changeSummary: "Template created",
        schemaSnapshot: draft.schemaVersion.trim() || "v1.0.0",
      },
    ];
    const item = buildItemFromDraft(initial, draft, versionHistory);
    const next: SettingsPageData = {
      ...initial,
      activeSection: "template_registry",
      templateRegistry: [...initial.templateRegistry, item],
    };
    setSaving(true);
    try {
      await putSettingsPageData(next);
      router.push(`/settings/templates/${encodeURIComponent(item.id)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create template.");
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
        { label: "New template" },
      ]}
    >
      <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">New template</h1>
        <p className="mt-1 text-sm text-slate-600">
          Define template metadata and authoring fields. Saving persists to the platform registry.
        </p>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6">
          <TemplateDefinitionFields draft={draft} onChange={setDraft} phaseOptions={phaseOptions} />
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void handleCreate()} disabled={saving}>
            {saving ? "Creating…" : "Create template"}
          </Button>
          <Link href="/settings/templates" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
