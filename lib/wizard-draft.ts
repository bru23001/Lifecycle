const STORAGE_PREFIX = "lifecycle-wizard-draft:";

export function wizardDraftKey(templateId: string): string {
  return `${STORAGE_PREFIX}${templateId}`;
}

export function loadWizardDraft(templateId: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(wizardDraftKey(templateId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function saveWizardDraft(
  templateId: string,
  data: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(wizardDraftKey(templateId), JSON.stringify(data));
  } catch {
    // Quota or privacy mode — ignore silently
  }
}

export function clearWizardDraft(templateId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(wizardDraftKey(templateId));
  } catch {
    // ignore
  }
}
