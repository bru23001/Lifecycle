/** Manual checklist completion / rollback; audited via `recordChecklistOverride`. */
export type ChecklistOverrideRecord = {
  targetStatus: "complete" | "incomplete";
  reason: string;
  comment: string;
  at: string;
};

/** Non-blocking validation warning cleared under triage; audited via `dismissValidationWarning`. */
export type DismissedValidationWarningRecord = {
  warningId: string;
  reason: string;
  dismissedAt: string;
};

export type WorkspacePhaseDetailRecord = {
  ownerName?: string;
  targetCompletionIso?: string | null;
  phaseNotes?: string;
  priority?: string;
  riskLevel?: string;
  internalStatus?: string;
  contributorNames?: string[];
  /** Keyed by checklist item id (e.g. `tmpl-*`, `evidence-pkg`). */
  checklistOverrides?: Record<string, ChecklistOverrideRecord>;
  dismissedValidationWarnings?: DismissedValidationWarningRecord[];
};

export type WorkspacePhaseDetailsMap = Record<string, WorkspacePhaseDetailRecord>;

export function parseWorkspacePhaseDetailsJson(raw: unknown): WorkspacePhaseDetailsMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw as WorkspacePhaseDetailsMap;
}

export function getWorkspacePhaseDetail(
  map: WorkspacePhaseDetailsMap,
  phaseNumber: number,
): WorkspacePhaseDetailRecord {
  return map[String(phaseNumber)] ?? {};
}

export function applyDismissedValidationWarnings<T extends { id: string }>(
  warnings: T[],
  dismissed: DismissedValidationWarningRecord[] | undefined,
): T[] {
  if (!dismissed?.length) return warnings;
  const ids = new Set(dismissed.map((d) => d.warningId));
  return warnings.filter((w) => !ids.has(w.id));
}
