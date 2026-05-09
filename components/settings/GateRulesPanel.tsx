"use client";

import { useState } from "react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import type { GateRuleSetting } from "@/types/settings.types";

export function GateRulesPanel({
  data,
  onCreateRule,
}: {
  data: GateRuleSetting[];
  onCreateRule: () => void;
}) {
  const [activeTab, setActiveTab] = useState("gate-model");

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <SectionHeader
        title="Gate Rules"
        description="Configure gate readiness rules, required inputs, evidence requirements, and unlock behavior."
        actionLabel="New Gate Rule"
        onActionClick={onCreateRule}
      />
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Gate rules tabs">
        {[
          ["gate-model", "Gate Model"],
          ["required-inputs", "Required Inputs"],
          ["evidence-rules", "Evidence Rules"],
          ["decision-criteria", "Decision Criteria"],
          ["approver-rules", "Approver Rules"],
          ["unlock-rules", "Unlock Rules"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
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
      {activeTab === "gate-model" ? (
        <div className="mt-4 overflow-x-auto">
          {data.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>No gate rules are configured.</p>
              <Button type="button" size="sm" className="mt-3" onClick={onCreateRule}>
                Create First Gate Rule
              </Button>
            </div>
          ) : (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2">Gate Code</th>
                  <th className="pb-2">Gate Name</th>
                  <th className="pb-2">Related Phase</th>
                  <th className="pb-2">Required Inputs</th>
                  <th className="pb-2">Required Approvers</th>
                  <th className="pb-2">Decision Rule</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-2 font-semibold">{row.gateCode}</td>
                    <td className="py-2">{row.gateName}</td>
                    <td className="py-2">Phase {row.relatedPhaseNumber}</td>
                    <td className="py-2">{row.requiredInputIds.length}</td>
                    <td className="py-2">{row.requiredApproverRoles.join(", ")}</td>
                    <td className="py-2">{row.decisionRule}</td>
                    <td className="py-2">
                      <Badge {...settingsStatusBadgeMap[row.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          This tab is available for configuration in the next iteration.
        </div>
      )}
    </section>
  );
}
