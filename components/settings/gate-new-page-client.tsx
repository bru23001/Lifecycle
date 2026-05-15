"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { putSettingsPageData, TemplateRegistryPageShell } from "@/components/settings/template-registry-shared";
import { emptyGateRuleDetail, settingsGateRuleId } from "@/lib/gate-rules-defaults";
import type { GateRuleSetting, SettingsPageData } from "@/types/settings.types";

function parseList(raw: string): string[] {
  return raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
}

export function GateNewPageClient({ initial }: { initial: SettingsPageData }) {
  const router = useRouter();
  const [gateCode, setGateCode] = useState("");
  const [gateName, setGateName] = useState("");
  const [relatedPhaseNumber, setRelatedPhaseNumber] = useState(1);
  const [requiredInputIdsRaw, setRequiredInputIdsRaw] = useState("");
  const [requiredEvidenceCount, setRequiredEvidenceCount] = useState(1);
  const [requiredApproverRolesRaw, setRequiredApproverRolesRaw] = useState("Governance Admin");
  const [decisionRule, setDecisionRule] = useState<GateRuleSetting["decisionRule"]>("single_approver");
  const [unlocksPhaseRaw, setUnlocksPhaseRaw] = useState("");
  const [readinessRuleSummary, setReadinessRuleSummary] = useState("");
  const [decisionCriteriaNotes, setDecisionCriteriaNotes] = useState("");
  const [approverPolicyNotes, setApproverPolicyNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const phaseOptions = useMemo(
    () =>
      initial.lifecycleConfiguration.phases.map((p) => ({
        value: p.phaseNumber,
        label: `${p.phaseNumber}. ${p.name}`,
      })),
    [initial.lifecycleConfiguration.phases],
  );

  const handleCreate = async () => {
    setError(null);
    const code = gateCode.trim().toUpperCase();
    if (!code) {
      setError("Gate code is required (e.g. G4).");
      return;
    }
    if (initial.gateRules.some((g) => g.gateCode.toUpperCase() === code)) {
      setError("A gate with this code already exists.");
      return;
    }
    const unlocks = unlocksPhaseRaw.trim();
    const unlocksPhaseNumber = unlocks.length > 0 ? Math.max(1, Number.parseInt(unlocks, 10) || 0) : undefined;
    const rule: GateRuleSetting = {
      id: settingsGateRuleId(code),
      gateCode: code,
      gateName: gateName.trim() || `${code} Gate`,
      relatedPhaseNumber,
      requiredInputIds: parseList(requiredInputIdsRaw),
      requiredEvidenceCount: Math.max(1, requiredEvidenceCount),
      requiredApproverRoles: parseList(requiredApproverRolesRaw).length > 0
        ? parseList(requiredApproverRolesRaw)
        : ["Governance Admin"],
      decisionRule,
      unlocksPhaseNumber: unlocksPhaseNumber && unlocksPhaseNumber > 0 ? unlocksPhaseNumber : undefined,
      status: "draft",
      detail: {
        ...emptyGateRuleDetail(),
        readinessRuleSummary,
        decisionCriteriaNotes,
        approverPolicyNotes,
      },
    };
    const next: SettingsPageData = {
      ...initial,
      activeSection: "gate_rules",
      gateRules: [...initial.gateRules, rule],
    };
    setSaving(true);
    try {
      await putSettingsPageData(next);
      router.push(`/settings/gates/${encodeURIComponent(rule.id)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create gate rule.");
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
        { label: "New gate rule" },
      ]}
    >
      <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">New gate rule</h1>
        <p className="mt-1 text-sm text-slate-600">Define gate metadata, readiness inputs, and extended policy notes.</p>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Gate code</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm uppercase"
              value={gateCode}
              onChange={(e) => setGateCode(e.target.value)}
              placeholder="G4"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Gate name</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              placeholder="Display name"
            />
          </label>
          <label className="block text-sm md:col-span-2">
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
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Required input IDs (comma-separated)</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={requiredInputIdsRaw}
              onChange={(e) => setRequiredInputIdsRaw(e.target.value)}
              placeholder="artifact-1, artifact-2"
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
              placeholder="Phase number, or leave blank"
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
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void handleCreate()} disabled={saving}>
            {saving ? "Creating…" : "Create gate rule"}
          </Button>
          <Link href="/settings/gates" className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
