"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import type { LifecyclePhaseSetting } from "@/types/settings.types";

export function LifecycleConfigurationPanel({
  phases,
  totalPhases,
  totalGates,
  totalArtifacts,
  activeTemplates,
  lastUpdatedLabel,
  onAddPhase,
  onEditPhase,
}: {
  phases: LifecyclePhaseSetting[];
  totalPhases: number;
  totalGates: number;
  totalArtifacts: number;
  activeTemplates: number;
  lastUpdatedLabel: string;
  onAddPhase: () => void;
  onEditPhase: (phaseId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("lifecycle-phases");

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <SectionHeader
        title="Lifecycle Configuration"
        description="Configure phases, milestones, artifacts, and lifecycle behavior."
        actionLabel="Edit Configuration"
        onActionClick={() => onEditPhase("lifecycle")}
      />

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Lifecycle configuration tabs">
        {[
          ["lifecycle-phases", "Lifecycle Phases"],
          ["milestones", "Milestones"],
          ["artifacts", "Artifacts"],
          ["transitions", "Transitions"],
          ["general-rules", "General Rules"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`lifecycle-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`lifecycle-tabpanel-${id}`}
            onClick={() => setActiveTab(id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              activeTab === id
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "lifecycle-phases" ? (
        <>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Define and manage lifecycle phases and their order.
          </div>
          <div className="mt-4 overflow-x-auto">
            {phases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>No lifecycle phases are configured.</p>
                <Button type="button" size="sm" className="mt-3" onClick={onAddPhase}>
                  Add First Phase
                </Button>
              </div>
            ) : (
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2">#</th>
                    <th className="pb-2">Phase Name</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Key Deliverables</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase) => (
                    <tr key={phase.id} className="border-t border-slate-100">
                      <td className="py-2 font-semibold text-slate-700">{phase.phaseNumber}</td>
                      <td className="py-2 font-semibold text-slate-900">{phase.name}</td>
                      <td className="py-2 text-slate-600">{phase.description}</td>
                      <td className="py-2 text-slate-600">{phase.keyDeliverables.join(", ")}</td>
                      <td className="py-2">
                        <Badge {...settingsStatusBadgeMap[phase.status]} />
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditPhase(phase.id)}
                            className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                            aria-label={`Edit ${phase.name}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={!phase.canReorder}
                            className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Reorder ${phase.name}`}
                          >
                            Move
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={onAddPhase}>
              <Plus className="size-3.5" aria-hidden />
              Add Phase
            </Button>
            <p className="text-xs text-slate-500">Last updated: {lastUpdatedLabel}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Total Phases", totalPhases],
              ["Total Gates", totalGates],
              ["Total Artifacts", totalArtifacts],
              ["Active Templates", activeTemplates],
            ].map(([label, value]) => (
              <article key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div
          role="tabpanel"
          id={`lifecycle-tabpanel-${activeTab}`}
          aria-labelledby={`lifecycle-tab-${activeTab}`}
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
        >
          This tab is available for configuration in the next iteration.
        </div>
      )}
    </section>
  );
}
