"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import type { TemplateRegistryItem } from "@/types/settings.types";

export function TemplateRegistryPanel({
  items,
  onCreateTemplate,
  onUpdateTemplate,
}: {
  items: TemplateRegistryItem[];
  onCreateTemplate: () => void;
  onUpdateTemplate: (templateId: string, updater: (item: TemplateRegistryItem) => TemplateRegistryItem) => void;
}) {
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [outputFilter, setOutputFilter] = useState("all");
  const [query, setQuery] = useState("");

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

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <SectionHeader
        title="Template Registry"
        description="Manage lifecycle templates for artifact generation, markdown rendering, and JSON evidence generation."
        actionLabel="New Template"
        onActionClick={onCreateTemplate}
      />
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
          <table className="w-full min-w-[780px] text-left text-sm">
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
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="py-2 font-semibold">{item.templateCode}</td>
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">
                    {item.phaseNumber}. {item.phaseName}
                  </td>
                  <td className="py-2 uppercase">{item.outputType}</td>
                  <td className="py-2">
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
                  <td className="py-2">
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
                  <td className="py-2">
                    <select
                      className="h-8 rounded border border-slate-200 bg-white px-2 text-xs"
                      value={item.status}
                      onChange={(event) =>
                        onUpdateTemplate(item.id, (current) => ({
                          ...current,
                          status: event.target.value as TemplateRegistryItem["status"],
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
                  <td className="py-2">
                    <Badge {...settingsStatusBadgeMap[item.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
