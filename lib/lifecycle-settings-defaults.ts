import type {
  LifecycleConfigurationBlock,
  LifecycleMilestone,
  LifecyclePhaseExtended,
  LifecycleTransitionRule,
} from "@/types/settings.types";

export const LIFECYCLE_AUX_SCHEMA_VERSION = 1 as const;

export function emptyPhaseExtended(): LifecyclePhaseExtended {
  return {
    entryCriteria: "",
    exitCriteria: "",
    requiredEvidenceCount: 0,
    relatedGateCode: "",
    requiredTemplateIds: [],
    transitionRulesSummary: "",
  };
}

export function phaseExtendedHasContent(e: LifecyclePhaseExtended): boolean {
  return (
    e.entryCriteria.trim().length > 0 ||
    e.exitCriteria.trim().length > 0 ||
    e.requiredEvidenceCount > 0 ||
    e.relatedGateCode.trim().length > 0 ||
    e.requiredTemplateIds.some((t) => t.trim().length > 0) ||
    e.transitionRulesSummary.trim().length > 0
  );
}

export function defaultLifecycleAuxPayload(): {
  v: typeof LIFECYCLE_AUX_SCHEMA_VERSION;
  configurationEditUnlocked: boolean;
  milestones: LifecycleMilestone[];
  transitionRules: LifecycleTransitionRule[];
  phaseExtras: Record<string, LifecyclePhaseExtended>;
} {
  return {
    v: LIFECYCLE_AUX_SCHEMA_VERSION,
    configurationEditUnlocked: false,
    milestones: [],
    transitionRules: [],
    phaseExtras: {},
  };
}

export function mergePhaseExtra(
  phaseNumber: number,
  phaseExtras: Record<string, LifecyclePhaseExtended>,
): LifecyclePhaseExtended {
  const raw = phaseExtras[String(phaseNumber)];
  const base = emptyPhaseExtended();
  if (!raw || typeof raw !== "object") return base;
  return {
    entryCriteria: typeof raw.entryCriteria === "string" ? raw.entryCriteria : base.entryCriteria,
    exitCriteria: typeof raw.exitCriteria === "string" ? raw.exitCriteria : base.exitCriteria,
    requiredEvidenceCount:
      typeof raw.requiredEvidenceCount === "number" && Number.isFinite(raw.requiredEvidenceCount)
        ? raw.requiredEvidenceCount
        : base.requiredEvidenceCount,
    relatedGateCode: typeof raw.relatedGateCode === "string" ? raw.relatedGateCode : base.relatedGateCode,
    requiredTemplateIds: Array.isArray(raw.requiredTemplateIds)
      ? raw.requiredTemplateIds.filter((x): x is string => typeof x === "string")
      : base.requiredTemplateIds,
    transitionRulesSummary:
      typeof raw.transitionRulesSummary === "string" ? raw.transitionRulesSummary : base.transitionRulesSummary,
  };
}

export function ensureLifecycleConfigurationShape(lc: LifecycleConfigurationBlock): LifecycleConfigurationBlock {
  return {
    ...lc,
    phases: lc.phases.map((p) => ({
      ...p,
      extended:
        p.extended && typeof p.extended === "object"
          ? mergePhaseExtra(p.phaseNumber, { [String(p.phaseNumber)]: p.extended })
          : emptyPhaseExtended(),
    })),
    milestones: Array.isArray(lc.milestones) ? lc.milestones : [],
    transitionRules: Array.isArray(lc.transitionRules) ? lc.transitionRules : [],
    configurationEditUnlocked: Boolean(lc.configurationEditUnlocked),
  };
}
