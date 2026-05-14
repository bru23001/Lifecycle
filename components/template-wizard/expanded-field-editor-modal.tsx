"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExpandedFieldEditorModal({
  open,
  fieldLabel,
  fieldName,
  helpText,
  initialValue,
  required,
  onSave,
  onClose,
}: {
  open: boolean;
  fieldLabel: string;
  fieldName: string;
  helpText?: string;
  initialValue: string;
  required: boolean;
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { charCount, wordCount } = useMemo(() => {
    const text = draft ?? "";
    return {
      charCount: text.length,
      wordCount: text.trim() === "" ? 0 : text.trim().split(/\s+/).length,
    };
  }, [draft]);

  const validationStatus: { tone: "ok" | "warn" | "error"; message: string } = (() => {
    if (required && draft.trim().length === 0) {
      return { tone: "error", message: "Required field is empty." };
    }
    if (draft.trim().length > 0 && draft.trim().length < 12) {
      return { tone: "warn", message: "Short response — consider adding more detail." };
    }
    return { tone: "ok", message: "Looks good." };
  })();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="flex max-h-[min(900px,100vh-2rem)] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        data-testid="expanded-field-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`expand-${fieldName}-title`}
      >
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id={`expand-${fieldName}-title`} className="text-lg font-semibold text-foreground">
              {fieldLabel}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {helpText ?? "Expanded editor — write freely, then save back into the wizard."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close expanded editor"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <p className="font-semibold uppercase tracking-wide">Formatting help</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Use blank lines between paragraphs.</li>
              <li>Use `- ` for bullet lists; `1.` for numbered lists.</li>
              <li>Wrap inline code with backticks; use fenced ``` blocks for code samples.</li>
            </ul>
          </div>

          <label htmlFor={`expand-${fieldName}-textarea`} className="sr-only">
            {fieldLabel}
          </label>
          <textarea
            id={`expand-${fieldName}-textarea`}
            data-testid={`expand-${fieldName}-textarea`}
            className="mt-3 min-h-[420px] w-full rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-muted-foreground">
              {charCount} characters · {wordCount} words
            </p>
            <p
              className={
                validationStatus.tone === "error"
                  ? "font-semibold text-[#b91c1c]"
                  : validationStatus.tone === "warn"
                    ? "font-semibold text-[#b45309]"
                    : "font-semibold text-[#15803d]"
              }
            >
              {validationStatus.message}
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            data-testid={`expand-${fieldName}-save`}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save field
          </Button>
        </footer>
      </div>
    </div>
  );
}
