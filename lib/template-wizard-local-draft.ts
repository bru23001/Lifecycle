export type PersistLocalDraftResult =
  | { ok: true; savedAt: Date }
  | { ok: false; error: string };

export function persistLocalDraft(
  storageKey: string,
  formValues: Record<string, unknown>,
): PersistLocalDraftResult {
  if (typeof window === "undefined") {
    return { ok: false, error: "Draft save is only available in the browser." };
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(formValues));
    return { ok: true, savedAt: new Date() };
  } catch (e) {
    const msg =
      e instanceof DOMException && e.name === "QuotaExceededError"
        ? "Browser storage is full (quota exceeded)."
        : e instanceof Error
          ? e.message
          : "Unable to save draft locally.";
    return { ok: false, error: msg };
  }
}

export function buildLocalDraftDownloadPayload(args: {
  storageKey: string;
  formValues: Record<string, unknown>;
  templateId: string;
  projectId: string;
}): string {
  return JSON.stringify(
    {
      kind: "template-wizard-local-draft",
      savedAt: new Date().toISOString(),
      storageKey: args.storageKey,
      projectId: args.projectId,
      templateId: args.templateId,
      formValues: args.formValues,
    },
    null,
    2,
  );
}
