import { describe, expect, it } from "vitest";

import { buildLocalDraftDownloadPayload, persistLocalDraft } from "@/lib/template-wizard-local-draft";

describe("persistLocalDraft", () => {
  it("should fail when window is undefined (non-browser)", () => {
    const original = globalThis.window;
    // @ts-expect-error — simulate SSR / Node
    delete globalThis.window;
    try {
      const result = persistLocalDraft("key", { a: 1 });
      expect(result).toEqual({
        ok: false,
        error: "Draft save is only available in the browser.",
      });
    } finally {
      globalThis.window = original;
    }
  });
});

describe("buildLocalDraftDownloadPayload", () => {
  it("should produce parseable JSON with expected shape", () => {
    const raw = buildLocalDraftDownloadPayload({
      storageKey: "tw:proj-1:tpl-a",
      formValues: { "sec-f": "hello" },
      templateId: "tpl-a",
      projectId: "proj-1",
    });
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.kind).toBe("template-wizard-local-draft");
    expect(parsed.storageKey).toBe("tw:proj-1:tpl-a");
    expect(parsed.templateId).toBe("tpl-a");
    expect(parsed.projectId).toBe("proj-1");
    expect(parsed.formValues).toEqual({ "sec-f": "hello" });
    expect(typeof parsed.savedAt).toBe("string");
  });
});
