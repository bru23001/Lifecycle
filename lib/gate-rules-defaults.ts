import type { GateRuleExtendedDetail, GateRuleSetting } from "@/types/settings.types";

export const GATE_EXT_SCHEMA_VERSION = 1 as const;

export function emptyGateRuleDetail(): GateRuleExtendedDetail {
  return {
    readinessRuleSummary: "",
    decisionCriteriaNotes: "",
    approverPolicyNotes: "",
    escalationNotes: "",
    dueDatePolicyNotes: "",
    usageSummaryLabel: "",
  };
}

export function settingsGateRuleId(gateCode: string): string {
  return `gate-rule-${gateCode.toLowerCase()}`;
}

export function findGateRuleByRouteParam(rules: GateRuleSetting[], param: string): GateRuleSetting | undefined {
  const decoded = decodeURIComponent(param);
  return rules.find(
    (g) => g.id === param || g.id === decoded || g.gateCode === param || g.gateCode.toLowerCase() === decoded.toLowerCase(),
  );
}

export function mergeGateRuleDetail(gateCode: string, byCode: Record<string, unknown>): GateRuleExtendedDetail {
  const base = emptyGateRuleDetail();
  const raw = byCode[gateCode];
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    readinessRuleSummary:
      typeof r.readinessRuleSummary === "string" ? r.readinessRuleSummary : base.readinessRuleSummary,
    decisionCriteriaNotes:
      typeof r.decisionCriteriaNotes === "string" ? r.decisionCriteriaNotes : base.decisionCriteriaNotes,
    approverPolicyNotes: typeof r.approverPolicyNotes === "string" ? r.approverPolicyNotes : base.approverPolicyNotes,
    escalationNotes: typeof r.escalationNotes === "string" ? r.escalationNotes : base.escalationNotes,
    dueDatePolicyNotes: typeof r.dueDatePolicyNotes === "string" ? r.dueDatePolicyNotes : base.dueDatePolicyNotes,
    usageSummaryLabel: typeof r.usageSummaryLabel === "string" ? r.usageSummaryLabel : base.usageSummaryLabel,
  };
}

export function gateDetailHasPersistableContent(d: GateRuleExtendedDetail): boolean {
  return (
    d.readinessRuleSummary.trim().length > 0 ||
    d.decisionCriteriaNotes.trim().length > 0 ||
    d.approverPolicyNotes.trim().length > 0 ||
    d.escalationNotes.trim().length > 0 ||
    d.dueDatePolicyNotes.trim().length > 0 ||
    d.usageSummaryLabel.trim().length > 0
  );
}

export function ensureGateRuleItem(rule: GateRuleSetting): GateRuleSetting {
  return {
    ...rule,
    detail:
      rule.detail && typeof rule.detail === "object"
        ? { ...emptyGateRuleDetail(), ...rule.detail }
        : emptyGateRuleDetail(),
  };
}

export function ensureGateRulesList(rules: GateRuleSetting[]): GateRuleSetting[] {
  return rules.map(ensureGateRuleItem);
}
