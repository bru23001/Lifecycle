"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Copy, History, Search, Upload } from "lucide-react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { TemplateSettingsDialog } from "@/components/settings/template-registry-shared";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  emptyTemplateDetail,
  ensureTemplateRegistryItem,
  templateRegistryItemId,
} from "@/lib/template-registry-defaults";
import { formatDateTimeRelative } from "@/lib/datetime-format";
import { cn } from "@/lib/utils";
import type { TemplateRegistryItem, TemplateVersionEntry } from "@/types/settings.types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</span>;
}

function coerceImportedTemplate(raw: unknown): TemplateRegistryItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const templateCode = typeof o.templateCode === "string" ? o.templateCode.trim() : "";
  if (!templateCode) return null;
  const name = typeof o.name === "string" ? o.name.trim() : templateCode;
  const phaseNumber =
    typeof o.phaseNumber === "number" && Number.isFinite(o.phaseNumber) && o.phaseNumber >= 1 ? o.phaseNumber : 1;
  const phaseName = typeof o.phaseName === "string" ? o.phaseName : `Phase ${phaseNumber}`;
  const outputType =
    o.outputType === "markdown" || o.outputType === "json" || o.outputType === "both" ? o.outputType : "markdown";
  const required = o.required === true;
  const schemaVersionRaw = typeof o.schemaVersion === "string" ? o.schemaVersion.trim() : "v1.0.0";
  const schemaVersion = schemaVersionRaw.startsWith("v") ? schemaVersionRaw : `v${schemaVersionRaw}`;
  const status =
    o.status === "active" || o.status === "draft" || o.status === "deprecated" || o.status === "archived"
      ? o.status
      : "draft";
  const detailRaw = o.detail && typeof o.detail === "object" ? (o.detail as Record<string, unknown>) : {};
  const versionHistory: TemplateVersionEntry[] = Array.isArray(detailRaw.versionHistory)
    ? (detailRaw.versionHistory as TemplateVersionEntry[]).filter(
        (v) => v && typeof v.id === "string" && typeof v.author === "string",
      )
    : [];
  const detail = {
    ...emptyTemplateDetail(),
    sectionDefinitions: typeof detailRaw.sectionDefinitions === "string" ? detailRaw.sectionDefinitions : "",
    fieldDefinitions: typeof detailRaw.fieldDefinitions === "string" ? detailRaw.fieldDefinitions : "",
    validationRules: typeof detailRaw.validationRules === "string" ? detailRaw.validationRules : "",
    markdownRendererSettings:
      typeof detailRaw.markdownRendererSettings === "string" ? detailRaw.markdownRendererSettings : "",
    jsonEvidenceSettings: typeof detailRaw.jsonEvidenceSettings === "string" ? detailRaw.jsonEvidenceSettings : "",
    usageSummaryLabel: typeof detailRaw.usageSummaryLabel === "string" ? detailRaw.usageSummaryLabel : "",
    versionHistory,
  };
  return ensureTemplateRegistryItem({
    id: templateRegistryItemId(templateCode),
    templateCode,
    name,
    phaseNumber,
    phaseName,
    outputType,
    required,
    schemaVersion,
    status,
    canEdit: true,
    canClone: true,
    canArchive: status !== "archived",
    detail,
  });
}

export function TemplateRegistryPanel({
  items,
  onCreateTemplate,
  onUpdateTemplate,
  onPatchTemplateRegistry,
}: {
  items: TemplateRegistryItem[];
  onCreateTemplate: () => void;
  onUpdateTemplate: (templateId: string, updater: (item: TemplateRegistryItem) => TemplateRegistryItem) => void;
  onPatchTemplateRegistry: (recipe: (items: TemplateRegistryItem[]) => TemplateRegistryItem[]) => void;
}) {
  const router = useRouter();
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [outputFilter, setOutputFilter] = useState("all");
  const [query, setQuery] = useState("");

  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneSource, setCloneSource] = useState<TemplateRegistryItem | null>(null);
  const [cloneDraft, setCloneDraft] = useState({
    templateCode: "",
    name: "",
    phaseNumber: 1,
    copySections: true,
    copyValidation: true,
  });

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<TemplateRegistryItem | null>(null);
  const [archiveReason, setArchiveReason] = useState("");

  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importMode, setImportMode] = useState<"add" | "overwrite" | "version">("add");
  const [importError, setImportError] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<TemplateRegistryItem | null>(null);

  const phaseOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => `${item.phaseNumber}: ${item.phaseName}`))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const phaseLabel = `${item.phaseNumber}: ${item.phaseName}`;
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          normalizedQuery.length === 0 ||
          item.templateCode.toLowerCase().includes(normalizedQuery) ||
          item.name.toLowerCase().includes(normalizedQuery);

        return (
          (phaseFilter === "all" || phaseFilter === phaseLabel) &&
          (statusFilter === "all" || statusFilter === item.status) &&
          (outputFilter === "all" || outputFilter === item.outputType) &&
          matchesQuery
        );
      }),
    [items, phaseFilter, statusFilter, outputFilter, query],
  );

  const openClone = (item: TemplateRegistryItem) => {
    setCloneSource(item);
    setCloneDraft({
      templateCode: `${item.templateCode}-copy`,
      name: `${item.name} (copy)`,
      phaseNumber: item.phaseNumber,
      copySections: true,
      copyValidation: true,
    });
    setCloneOpen(true);
  };

  const applyClone = () => {
    if (!cloneSource) return;
    const code = cloneDraft.templateCode.trim();
    if (!code || items.some((t) => t.templateCode === code || t.id === templateRegistryItemId(code))) {
      window.alert("Choose a unique template ID.");
      return;
    }
    const baseDetail = cloneSource.detail;
    const detail = {
      ...emptyTemplateDetail(),
      sectionDefinitions: cloneDraft.copySections ? baseDetail.sectionDefinitions : "",
      fieldDefinitions: cloneDraft.copySections ? baseDetail.fieldDefinitions : "",
      validationRules: cloneDraft.copyValidation ? baseDetail.validationRules : "",
      markdownRendererSettings: cloneDraft.copySections ? baseDetail.markdownRendererSettings : "",
      jsonEvidenceSettings: cloneDraft.copySections ? baseDetail.jsonEvidenceSettings : "",
      usageSummaryLabel: baseDetail.usageSummaryLabel,
      versionHistory: [
        {
          id: `ver-${Date.now()}`,
          author: "You",
          timestampLabel: formatDateTimeRelative(new Date()),
          changeSummary: `Cloned from ${cloneSource.templateCode}`,
          schemaSnapshot: cloneSource.schemaVersion,
        },
      ],
    };
    const phaseName =
      items.find((t) => t.phaseNumber === cloneDraft.phaseNumber)?.phaseName ??
      cloneSource.phaseName ??
      `Phase ${cloneDraft.phaseNumber}`;
    const next: TemplateRegistryItem = ensureTemplateRegistryItem({
      id: templateRegistryItemId(code),
      templateCode: code,
      name: cloneDraft.name.trim() || code,
      phaseNumber: cloneDraft.phaseNumber,
      phaseName,
      outputType: cloneSource.outputType,
      required: cloneSource.required,
      schemaVersion: cloneSource.schemaVersion,
      status: "draft",
      canEdit: true,
      canClone: true,
      canArchive: true,
      detail,
    });
    onPatchTemplateRegistry((list) => [...list, next]);
    setCloneOpen(false);
    setCloneSource(null);
  };

  const applyArchive = () => {
    if (!archiveTarget) return;
    onUpdateTemplate(archiveTarget.id, (current) => ({
      ...current,
      status: "archived",
      canArchive: false,
      detail: {
        ...current.detail,
        versionHistory: [
          {
            id: `ver-${Date.now()}`,
            author: "You",
            timestampLabel: formatDateTimeRelative(new Date()),
            changeSummary: `Archived${archiveReason.trim() ? `: ${archiveReason.trim()}` : ""}`,
            schemaSnapshot: current.schemaVersion,
          },
          ...current.detail.versionHistory,
        ].slice(0, 50),
      },
    }));
    setArchiveOpen(false);
    setArchiveTarget(null);
    setArchiveReason("");
  };

  const applyImport = () => {
    setImportError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson) as unknown;
    } catch {
      setImportError("Invalid JSON.");
      return;
    }
    let candidate: unknown = parsed;
    if (Array.isArray(parsed) && parsed.length > 0) candidate = parsed[0];
    if (parsed && typeof parsed === "object" && "template" in (parsed as object)) {
      candidate = (parsed as { template: unknown }).template;
    }
    const incoming = coerceImportedTemplate(candidate);
    if (!incoming) {
      setImportError("Could not read a template object (templateCode required).");
      return;
    }

    const idx = items.findIndex((t) => t.templateCode === incoming.templateCode);

    if (importMode === "add") {
      if (idx >= 0) {
        setImportError("Template ID already exists. Switch to overwrite or version.");
        return;
      }
      onPatchTemplateRegistry((list) => [...list, incoming]);
      setImportOpen(false);
      setImportJson("");
      return;
    }

    if (importMode === "overwrite") {
      if (idx < 0) {
        onPatchTemplateRegistry((list) => [...list, incoming]);
      } else {
        onPatchTemplateRegistry((list) => {
          const next = [...list];
          next[idx] = ensureTemplateRegistryItem({ ...incoming, id: list[idx].id });
          return next;
        });
      }
      setImportOpen(false);
      setImportJson("");
      return;
    }

    if (idx < 0) {
      onPatchTemplateRegistry((list) => [...list, incoming]);
      setImportOpen(false);
      setImportJson("");
      return;
    }

    onPatchTemplateRegistry((list) => {
      const existing = list[idx];
      const mergedDetail = {
        ...existing.detail,
        ...incoming.detail,
        versionHistory: [
          {
            id: `ver-${Date.now()}`,
            author: "You",
            timestampLabel: formatDateTimeRelative(new Date()),
            changeSummary: "Imported version merge",
            schemaSnapshot: incoming.schemaVersion,
          },
          ...existing.detail.versionHistory,
        ].slice(0, 50),
      };
      const merged = ensureTemplateRegistryItem({
        ...existing,
        ...incoming,
        id: existing.id,
        detail: mergedDetail,
      });
      const next = [...list];
      next[idx] = merged;
      return next;
    });
    setImportOpen(false);
    setImportJson("");
  };

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <SectionHeader
        title="Template Registry"
        description="Manage lifecycle templates for artifact generation, markdown rendering, and JSON evidence generation."
        actionLabel="New Template"
        onActionClick={onCreateTemplate}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="mr-1.5 size-3.5" aria-hidden />
          Import template JSON
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-slate-500">Phase</span>
          <select
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            value={phaseFilter}
            onChange={(event) => setPhaseFilter(event.target.value)}
          >
            <option value="all">All Phases</option>
            {phaseOptions.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-slate-500">Status</span>
          <select
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="deprecated">Deprecated</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-slate-500">Output Type</span>
          <select
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            value={outputFilter}
            onChange={(event) => setOutputFilter(event.target.value)}
          >
            <option value="all">Any</option>
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-slate-500">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-sm"
              placeholder="Search templates..."
              aria-label="Search templates"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </label>
      </div>
      <div className="mt-4 overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>No templates match the current filters.</p>
            <Button type="button" size="sm" className="mt-3" onClick={onCreateTemplate}>
              Create Template
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Template ID</th>
                <th className="pb-2">Template Name</th>
                <th className="pb-2">Phase</th>
                <th className="pb-2">Output Type</th>
                <th className="pb-2">Required</th>
                <th className="pb-2">Version</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/80"
                  onClick={() => router.push(`/settings/templates/${encodeURIComponent(item.id)}`)}
                >
                  <td className="py-2 font-semibold">
                    <Link
                      href={`/settings/templates/${encodeURIComponent(item.id)}`}
                      className="text-blue-700 underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.templateCode}
                    </Link>
                  </td>
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">
                    {item.phaseNumber}. {item.phaseName}
                  </td>
                  <td className="py-2 uppercase" onClick={(e) => e.stopPropagation()}>
                    {item.outputType}
                  </td>
                  <td className="py-2" onClick={(e) => e.stopPropagation()}>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.required}
                        onChange={(event) =>
                          onUpdateTemplate(item.id, (current) => ({
                            ...current,
                            required: event.target.checked,
                          }))
                        }
                        aria-label={`Set ${item.templateCode} required`}
                      />
                      {item.required ? "Required" : "Optional"}
                    </label>
                  </td>
                  <td className="py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      className="h-8 w-24 rounded border border-slate-200 px-2 text-xs"
                      value={item.schemaVersion}
                      onChange={(event) =>
                        onUpdateTemplate(item.id, (current) => ({
                          ...current,
                          schemaVersion: event.target.value,
                        }))
                      }
                      aria-label={`Schema version for ${item.templateCode}`}
                    />
                  </td>
                  <td className="py-2" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="h-8 rounded border border-slate-200 bg-white px-2 text-xs"
                      value={item.status}
                      onChange={(event) =>
                        onUpdateTemplate(item.id, (current) => ({
                          ...current,
                          status: event.target.value as TemplateRegistryItem["status"],
                          canArchive: event.target.value !== "archived",
                        }))
                      }
                      aria-label={`Status for ${item.templateCode}`}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="deprecated">Deprecated</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge {...settingsStatusBadgeMap[item.status]} />
                      <Link
                        href={`/settings/templates/${encodeURIComponent(item.id)}/edit`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-7 px-2 text-xs no-underline",
                        )}
                      >
                        Edit
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => openClone(item)}
                      >
                        <Copy className="mr-1 size-3" aria-hidden />
                        Clone
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setHistoryItem(item);
                          setHistoryOpen(true);
                        }}
                      >
                        <History className="mr-1 size-3" aria-hidden />
                        History
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        disabled={item.status === "archived"}
                        onClick={() => {
                          setArchiveTarget(item);
                          setArchiveOpen(true);
                        }}
                      >
                        Archive
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TemplateSettingsDialog
        open={cloneOpen}
        title="Clone template"
        wide
        onClose={() => {
          setCloneOpen(false);
          setCloneSource(null);
        }}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCloneOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyClone}>
              Clone
            </Button>
          </>
        }
      >
        {cloneSource ? (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">
              Source: <span className="font-mono font-semibold text-slate-900">{cloneSource.templateCode}</span>
            </p>
            <label className="block">
              <FieldLabel>New template ID</FieldLabel>
              <input
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                value={cloneDraft.templateCode}
                onChange={(e) => setCloneDraft((d) => ({ ...d, templateCode: e.target.value }))}
              />
            </label>
            <label className="block">
              <FieldLabel>New template name</FieldLabel>
              <input
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                value={cloneDraft.name}
                onChange={(e) => setCloneDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </label>
            <label className="block">
              <FieldLabel>Related phase</FieldLabel>
              <select
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
                value={cloneDraft.phaseNumber}
                onChange={(e) => setCloneDraft((d) => ({ ...d, phaseNumber: Number(e.target.value) }))}
              >
                {Array.from(new Set(items.map((i) => i.phaseNumber)))
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <option key={n} value={n}>
                      {n}. {items.find((i) => i.phaseNumber === n)?.phaseName ?? `Phase ${n}`}
                    </option>
                  ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={cloneDraft.copySections}
                onChange={(e) => setCloneDraft((d) => ({ ...d, copySections: e.target.checked }))}
              />
              Copy sections & renderer / JSON settings
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={cloneDraft.copyValidation}
                onChange={(e) => setCloneDraft((d) => ({ ...d, copyValidation: e.target.checked }))}
              />
              Copy validation rules
            </label>
          </div>
        ) : null}
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={archiveOpen}
        title="Archive template"
        onClose={() => {
          setArchiveOpen(false);
          setArchiveTarget(null);
          setArchiveReason("");
        }}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setArchiveOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyArchive}>
              Archive
            </Button>
          </>
        }
      >
        {archiveTarget ? (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Template <span className="font-mono font-semibold">{archiveTarget.templateCode}</span> will be marked
              archived.
            </p>
            <p className="text-xs text-slate-500">
              Active projects, artifact counts, and dependency checks are not wired in this preview build; capture an
              archive reason for your records.
            </p>
            <label className="block">
              <FieldLabel>Archive reason</FieldLabel>
              <textarea
                className="min-h-[72px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
              />
            </label>
          </div>
        ) : null}
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={importOpen}
        title="Import template JSON"
        wide
        onClose={() => {
          setImportOpen(false);
          setImportError(null);
        }}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyImport}>
              Import
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <label className="block">
            <FieldLabel>Import mode</FieldLabel>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2"
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as typeof importMode)}
            >
              <option value="add">Add (reject duplicate ID)</option>
              <option value="overwrite">Overwrite existing</option>
              <option value="version">Merge as new version row</option>
            </select>
          </label>
          <label className="block">
            <FieldLabel>Template JSON</FieldLabel>
            <textarea
              className={cn("min-h-[160px] w-full rounded-lg border px-2 py-2 font-mono text-xs", importError ? "border-red-300" : "border-slate-200")}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='{ "templateCode": "X-1", "name": "...", ... }'
            />
          </label>
          {importError ? <p className="text-sm text-red-700">{importError}</p> : null}
          <p className="text-xs text-slate-500">
            Paste a single template object (optionally wrapped as {"{ \"template\": { ... } }"}). Save the settings
            page when you are done importing.
          </p>
        </div>
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={historyOpen}
        title="Version history"
        wide
        onClose={() => {
          setHistoryOpen(false);
          setHistoryItem(null);
        }}
        footer={
          <Button type="button" variant="outline" onClick={() => setHistoryOpen(false)}>
            Close
          </Button>
        }
      >
        {historyItem ? (
          historyItem.detail.versionHistory.length === 0 ? (
            <p className="text-sm text-slate-600">No recorded versions.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {historyItem.detail.versionHistory.map((v) => (
                <li key={v.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                  <div className="font-medium text-slate-900">{v.changeSummary}</div>
                  <div className="text-xs text-slate-600">
                    {v.author} · {v.timestampLabel} · {v.schemaSnapshot}
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </TemplateSettingsDialog>
    </section>
  );
}
