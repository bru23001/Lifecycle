"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge, SectionHeader, settingsStatusBadgeMap } from "@/components/settings/shared";
import { TemplateSettingsDialog } from "@/components/settings/template-registry-shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GateRuleSetting } from "@/types/settings.types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</span>;
}

export function GateRulesPanel({
  data,
  onCreateRule,
  onUpdateRule,
}: {
  data: GateRuleSetting[];
  onCreateRule: () => void;
  onUpdateRule: (ruleId: string, updater: (rule: GateRuleSetting) => GateRuleSetting) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("gate-model");

  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [criteriaRule, setCriteriaRule] = useState<GateRuleSetting | null>(null);
  const [criteriaReadiness, setCriteriaReadiness] = useState("");
  const [criteriaNotes, setCriteriaNotes] = useState("");

  const [approverOpen, setApproverOpen] = useState(false);
  const [approverRule, setApproverRule] = useState<GateRuleSetting | null>(null);
  const [approverRolesRaw, setApproverRolesRaw] = useState("");
  const [approverDecisionRule, setApproverDecisionRule] = useState<GateRuleSetting["decisionRule"]>("single_approver");
  const [approverPolicyNotes, setApproverPolicyNotes] = useState("");
  const [approverEscalation, setApproverEscalation] = useState("");
  const [approverDueDate, setApproverDueDate] = useState("");

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateRule, setDeactivateRule] = useState<GateRuleSetting | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");

  const gateLinks = useMemo(
    () =>
      data.map((r) => (
        <li key={r.id}>
          <Link className="text-blue-700 underline-offset-2 hover:underline" href={`/settings/gates/${encodeURIComponent(r.id)}/edit`}>
            {r.gateCode} — {r.gateName}
          </Link>
        </li>
      )),
    [data],
  );

  const openCriteria = (rule: GateRuleSetting) => {
    setCriteriaRule(rule);
    setCriteriaReadiness(rule.detail.readinessRuleSummary);
    setCriteriaNotes(rule.detail.decisionCriteriaNotes);
    setCriteriaOpen(true);
  };

  const saveCriteria = () => {
    if (!criteriaRule) return;
    onUpdateRule(criteriaRule.id, (r) => ({
      ...r,
      detail: {
        ...r.detail,
        readinessRuleSummary: criteriaReadiness,
        decisionCriteriaNotes: criteriaNotes,
      },
    }));
    setCriteriaOpen(false);
    setCriteriaRule(null);
  };

  const openApprover = (rule: GateRuleSetting) => {
    setApproverRule(rule);
    setApproverRolesRaw(rule.requiredApproverRoles.join(", "));
    setApproverDecisionRule(rule.decisionRule);
    setApproverPolicyNotes(rule.detail.approverPolicyNotes);
    setApproverEscalation(rule.detail.escalationNotes);
    setApproverDueDate(rule.detail.dueDatePolicyNotes);
    setApproverOpen(true);
  };

  const saveApprover = () => {
    if (!approverRule) return;
    const roles = approverRolesRaw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (roles.length === 0) return;
    onUpdateRule(approverRule.id, (r) => ({
      ...r,
      decisionRule: approverDecisionRule,
      requiredApproverRoles: roles,
      detail: {
        ...r.detail,
        approverPolicyNotes: approverPolicyNotes,
        escalationNotes: approverEscalation,
        dueDatePolicyNotes: approverDueDate,
      },
    }));
    setApproverOpen(false);
    setApproverRule(null);
  };

  const applyDeactivate = () => {
    if (!deactivateRule) return;
    const note = deactivateReason.trim();
    onUpdateRule(deactivateRule.id, (r) => ({
      ...r,
      status: "inactive",
      detail: {
        ...r.detail,
        escalationNotes: note
          ? `Deactivated: ${note}\n${r.detail.escalationNotes}`.trim()
          : r.detail.escalationNotes,
      },
    }));
    setDeactivateOpen(false);
    setDeactivateRule(null);
    setDeactivateReason("");
  };

  const secondaryPanel = (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      <p>
        Deep editors for criteria, approvers, and unlock behavior are on each gate&apos;s{" "}
        <strong className="text-slate-800">Edit</strong> screen. Use the actions on a row for quick drawers, or open a
        gate from the list below.
      </p>
      <ul className="mt-3 list-inside list-disc space-y-1">{gateLinks}</ul>
    </div>
  );

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
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2">Gate Code</th>
                  <th className="pb-2">Gate Name</th>
                  <th className="pb-2">Phase</th>
                  <th className="pb-2">Inputs</th>
                  <th className="pb-2">Approvers</th>
                  <th className="pb-2">Decision</th>
                  <th className="pb-2">Evidence</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/80"
                    onClick={() => router.push(`/settings/gates/${encodeURIComponent(row.id)}`)}
                  >
                    <td className="py-2 font-semibold">
                      <Link
                        href={`/settings/gates/${encodeURIComponent(row.id)}`}
                        className="text-blue-700 underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.gateCode}
                      </Link>
                    </td>
                    <td className="py-2">{row.gateName}</td>
                    <td className="py-2">Phase {row.relatedPhaseNumber}</td>
                    <td className="py-2" onClick={(e) => e.stopPropagation()}>
                      {row.requiredInputIds.length}
                    </td>
                    <td className="py-2 text-xs text-slate-600" onClick={(e) => e.stopPropagation()}>
                      {row.requiredApproverRoles.slice(0, 2).join(", ")}
                      {row.requiredApproverRoles.length > 2 ? "…" : ""}
                    </td>
                    <td className="py-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        className="h-8 max-w-[140px] rounded border border-slate-200 bg-white px-2 text-xs"
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
                    <td className="py-2" onClick={(e) => e.stopPropagation()}>
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
                    </td>
                    <td className="py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1">
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
                        <Badge {...settingsStatusBadgeMap[row.status]} />
                      </div>
                    </td>
                    <td className="py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        <Link
                          href={`/settings/gates/${encodeURIComponent(row.id)}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 px-2 text-xs")}
                        >
                          Edit
                        </Link>
                        <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openCriteria(row)}>
                          Criteria
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openApprover(row)}>
                          Approvers
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          disabled={row.status === "inactive"}
                          onClick={() => {
                            setDeactivateRule(row);
                            setDeactivateOpen(true);
                          }}
                        >
                          Deactivate
                        </Button>
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
          className="mt-4"
        >
          {secondaryPanel}
        </div>
      )}

      <TemplateSettingsDialog
        open={criteriaOpen}
        title="Decision criteria"
        wide
        onClose={() => {
          setCriteriaOpen(false);
          setCriteriaRule(null);
        }}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCriteriaOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveCriteria}>
              Save
            </Button>
          </>
        }
      >
        {criteriaRule ? (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">
              Gate <span className="font-mono font-semibold text-slate-900">{criteriaRule.gateCode}</span>
            </p>
            <label className="block">
              <FieldLabel>Readiness rule summary</FieldLabel>
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={criteriaReadiness}
                onChange={(e) => setCriteriaReadiness(e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel>Decision criteria notes</FieldLabel>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={criteriaNotes}
                onChange={(e) => setCriteriaNotes(e.target.value)}
              />
            </label>
          </div>
        ) : null}
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={approverOpen}
        title="Approver rules"
        wide
        onClose={() => {
          setApproverOpen(false);
          setApproverRule(null);
        }}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setApproverOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveApprover}>
              Save
            </Button>
          </>
        }
      >
        {approverRule ? (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">
              Gate <span className="font-mono font-semibold text-slate-900">{approverRule.gateCode}</span>
            </p>
            <label className="block">
              <FieldLabel>Required roles (comma-separated)</FieldLabel>
              <input
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                value={approverRolesRaw}
                onChange={(e) => setApproverRolesRaw(e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel>Decision policy</FieldLabel>
              <select
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
                value={approverDecisionRule}
                onChange={(e) => setApproverDecisionRule(e.target.value as GateRuleSetting["decisionRule"])}
              >
                <option value="single_approver">single_approver</option>
                <option value="majority">majority</option>
                <option value="unanimous">unanimous</option>
                <option value="role_based">role_based</option>
              </select>
            </label>
            <label className="block">
              <FieldLabel>Approver policy notes</FieldLabel>
              <textarea
                className="min-h-[72px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={approverPolicyNotes}
                onChange={(e) => setApproverPolicyNotes(e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel>Escalation rules</FieldLabel>
              <textarea
                className="min-h-[72px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={approverEscalation}
                onChange={(e) => setApproverEscalation(e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel>Due date policy</FieldLabel>
              <textarea
                className="min-h-[72px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={approverDueDate}
                onChange={(e) => setApproverDueDate(e.target.value)}
              />
            </label>
          </div>
        ) : null}
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={deactivateOpen}
        title="Deactivate gate rule"
        onClose={() => {
          setDeactivateOpen(false);
          setDeactivateRule(null);
          setDeactivateReason("");
        }}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyDeactivate}>
              Deactivate
            </Button>
          </>
        }
      >
        {deactivateRule ? (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Gate <span className="font-mono font-semibold">{deactivateRule.gateCode}</span> will be set to inactive.
            </p>
            <p className="text-xs text-slate-500">
              Project impact checks are not wired in this preview; capture a reason for your records (appended to
              escalation notes).
            </p>
            <label className="block">
              <FieldLabel>Deactivation reason</FieldLabel>
              <textarea
                className="min-h-[72px] w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
              />
            </label>
          </div>
        ) : null}
      </TemplateSettingsDialog>
    </section>
  );
}
