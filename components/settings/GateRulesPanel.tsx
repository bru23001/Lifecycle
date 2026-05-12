"use client";

import { useState } from "react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { Button } from "@/components/ui/button";
import type { GateRuleSetting } from "@/types/settings.types";

export function GateRulesPanel({
  data,
  onCreateRule,
  onUpdateRule,
}: {
  data: GateRuleSetting[];
  onCreateRule: () => void;
  onUpdateRule: (ruleId: string, updater: (rule: GateRuleSetting) => GateRuleSetting) => void;
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
            id={`gate-rules-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`gate-rules-tabpanel-${id}`}
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
        <div
          role="tabpanel"
          id="gate-rules-tabpanel-gate-model"
          aria-labelledby="gate-rules-tab-gate-model"
          className="mt-4 overflow-x-auto"
        >
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
                  <th className="pb-2">Actions</th>
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
                    <td className="py-2">
                      <select
                        className="h-8 rounded border border-slate-200 bg-white px-2 text-xs"
                        value={row.decisionRule}
                        onChange={(event) =>
                          onUpdateRule(row.id, (current) => ({
                            ...current,
                            decisionRule: event.target.value as GateRuleSetting["decisionRule"],
                          }))
                        }
                        aria-label={`Decision rule for ${row.gateCode}`}
                      >
                        <option value="single_approver">single_approver</option>
                        <option value="majority">majority</option>
                        <option value="unanimous">unanimous</option>
                        <option value="role_based">role_based</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        className="h-8 rounded border border-slate-200 bg-white px-2 text-xs"
                        value={row.status}
                        onChange={(event) =>
                          onUpdateRule(row.id, (current) => ({
                            ...current,
                            status: event.target.value as GateRuleSetting["status"],
                          }))
                        }
                        aria-label={`Status for ${row.gateCode}`}
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          className="h-8 w-16 rounded border border-slate-200 px-2 text-xs"
                          value={row.requiredEvidenceCount}
                          onChange={(event) =>
                            onUpdateRule(row.id, (current) => ({
                              ...current,
                              requiredEvidenceCount: Math.max(1, Number(event.target.value) || 1),
                            }))
                          }
                          aria-label={`Required evidence count for ${row.gateCode}`}
                        />
                        <Badge {...settingsStatusBadgeMap[row.status]} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div
          role="tabpanel"
          id={`gate-rules-tabpanel-${activeTab}`}
          aria-labelledby={`gate-rules-tab-${activeTab}`}
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
        >
          This tab is available for configuration in the next iteration.
        </div>
      )}
    </section>
  );
}
