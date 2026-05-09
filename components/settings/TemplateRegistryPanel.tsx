"use client";

import { Search } from "lucide-react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import type { TemplateRegistryItem } from "@/types/settings.types";

export function TemplateRegistryPanel({
  items,
  onCreateTemplate,
}: {
  items: TemplateRegistryItem[];
  onCreateTemplate: () => void;
}) {
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
          <select className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm">
            <option>All Phases</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-slate-500">Status</span>
          <select className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm">
            <option>All Statuses</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-slate-500">Output Type</span>
          <select className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm">
            <option>Any</option>
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
            />
          </div>
        </label>
      </div>
      <div className="mt-4 overflow-x-auto">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>No templates are registered.</p>
            <Button type="button" size="sm" className="mt-3" onClick={onCreateTemplate}>
              Create First Template
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
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="py-2 font-semibold">{item.templateCode}</td>
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">
                    {item.phaseNumber}. {item.phaseName}
                  </td>
                  <td className="py-2 uppercase">{item.outputType}</td>
                  <td className="py-2">{item.required ? "Required" : "Optional"}</td>
                  <td className="py-2">{item.schemaVersion}</td>
                  <td className="py-2">
                    <Badge {...settingsStatusBadgeMap[item.status]} />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                      aria-label={`Edit template ${item.templateCode}`}
                    >
                      Edit
                    </button>
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
