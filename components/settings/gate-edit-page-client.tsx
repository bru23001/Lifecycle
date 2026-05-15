"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { putSettingsPageData, TemplateRegistryPageShell } from "@/components/settings/template-registry-shared";
import { emptyGateRuleDetail } from "@/lib/gate-rules-defaults";
import type { GateRuleSetting, SettingsPageData } from "@/types/settings.types";

function parseList(raw: string): string[] {
  return raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
}

export function GateEditPageClient({ initial, rule }: { initial: SettingsPageData; rule: GateRuleSetting }) {
  const router = useRouter();
  const [gateName, setGateName] = useState(rule.gateName);
  const [relatedPhaseNumber, setRelatedPhaseNumber] = useState(rule.relatedPhaseNumber);
  const [requiredInputIdsRaw, setRequiredInputIdsRaw] = useState(rule.requiredInputIds.join(", "));
  const [requiredEvidenceCount, setRequiredEvidenceCount] = useState(rule.requiredEvidenceCount);
  const [requiredApproverRolesRaw, setRequiredApproverRolesRaw] = useState(rule.requiredApproverRoles.join(", "));
  const [decisionRule, setDecisionRule] = useState(rule.decisionRule);
  const [unlocksPhaseRaw, setUnlocksPhaseRaw] = useState(
    rule.unlocksPhaseNumber != null ? String(rule.unlocksPhaseNumber) : "",
  );
  const [status, setStatus] = useState(rule.status);
  const [readinessRuleSummary, setReadinessRuleSummary] = useState(rule.detail.readinessRuleSummary);
  const [decisionCriteriaNotes, setDecisionCriteriaNotes] = useState(rule.detail.decisionCriteriaNotes);
  const [approverPolicyNotes, setApproverPolicyNotes] = useState(rule.detail.approverPolicyNotes);
  const [escalationNotes, setEscalationNotes] = useState(rule.detail.escalationNotes);
  const [dueDatePolicyNotes, setDueDatePolicyNotes] = useState(rule.detail.dueDatePolicyNotes);
  const [usageSummaryLabel, setUsageSummaryLabel] = useState(rule.detail.usageSummaryLabel);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const phaseOptions = initial.lifecycleConfiguration.phases.map((p) => ({
    value: p.phaseNumber,
    label: `${p.phaseNumber}. ${p.name}`,
  }));

  const handleSave = async () => {
    setError(null);
    const unlocks = unlocksPhaseRaw.trim();
    const unlocksPhaseNumber = unlocks.length > 0 ? Math.max(1, Number.parseInt(unlocks, 10) || 0) : undefined;
    const roles = parseList(requiredApproverRolesRaw);
    if (roles.length === 0) {
      setError("At least one approver role is required.");
      return;
    }
    const updated: GateRuleSetting = {
      ...rule,
      gateName: gateName.trim() || rule.gateCode,
      relatedPhaseNumber,
      requiredInputIds: parseList(requiredInputIdsRaw),
      requiredEvidenceCount: Math.max(1, requiredEvidenceCount),
      requiredApproverRoles: roles,
      decisionRule,
      unlocksPhaseNumber: unlocksPhaseNumber && unlocksPhaseNumber > 0 ? unlocksPhaseNumber : undefined,
      status,
      detail: {
        ...emptyGateRuleDetail(),
        ...rule.detail,
        readinessRuleSummary,
        decisionCriteriaNotes,
        approverPolicyNotes,
        escalationNotes,
        dueDatePolicyNotes,
        usageSummaryLabel,
      },
    };
    const next: SettingsPageData = {
      ...initial,
      activeSection: "gate_rules",
      gateRules: initial.gateRules.map((g) => (g.id === rule.id ? updated : g)),
    };
    setSaving(true);
    try {
      await putSettingsPageData(next);
      router.push(`/settings/gates/${encodeURIComponent(rule.id)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TemplateRegistryPageShell
      user={initial.user}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Settings", href: "/settings/lifecycle" },
        { label: "Gate Rules", href: "/settings/gates" },
        { label: rule.gateCode, href: `/settings/gates/${encodeURIComponent(rule.id)}` },
        { label: "Edit" },
      ]}
    >
      <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Edit gate rule</h1>
        <p className="mt-1 font-mono text-sm text-slate-600">{rule.gateCode}</p>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Gate name</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Related phase</span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={relatedPhaseNumber}
              onChange={(e) => setRelatedPhaseNumber(Number(e.target.value))}
            >
              {phaseOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as GateRuleSetting["status"])}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Required input IDs (comma-separated)</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={requiredInputIdsRaw}
              onChange={(e) => setRequiredInputIdsRaw(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Required evidence count</span>
            <input
              type="number"
              min={1}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={requiredEvidenceCount}
              onChange={(e) => setRequiredEvidenceCount(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Unlock phase (optional)</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={unlocksPhaseRaw}
              onChange={(e) => setUnlocksPhaseRaw(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Approver roles (comma-separated)</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={requiredApproverRolesRaw}
              onChange={(e) => setRequiredApproverRolesRaw(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Decision rule</span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={decisionRule}
              onChange={(e) => setDecisionRule(e.target.value as GateRuleSetting["decisionRule"])}
            >
              <option value="single_approver">single_approver</option>
              <option value="majority">majority</option>
              <option value="unanimous">unanimous</option>
              <option value="role_based">role_based</option>
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Readiness rule summary</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={readinessRuleSummary}
              onChange={(e) => setReadinessRuleSummary(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Decision criteria notes</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={decisionCriteriaNotes}
              onChange={(e) => setDecisionCriteriaNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Approver policy notes</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={approverPolicyNotes}
              onChange={(e) => setApproverPolicyNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Escalation notes</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Due date policy</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={dueDatePolicyNotes}
              onChange={(e) => setDueDatePolicyNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Usage summary label</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={usageSummaryLabel}
              onChange={(e) => setUsageSummaryLabel(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save gate rule"}
          </Button>
          <Link
            href={`/settings/gates/${encodeURIComponent(rule.id)}`}
            className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
