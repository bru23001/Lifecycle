"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FieldHelpContent } from "@/types/template-wizard.types";

export function FieldHelpPopover({
  fieldName,
  fieldLabel,
  content,
  helpText,
  buttonClassName,
}: {
  fieldName: string;
  fieldLabel: string;
  content?: FieldHelpContent;
  /** Fallback inline help when no rich content is available. */
  helpText?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const hasContent = Boolean(
    content?.purpose ||
      content?.expectedInput ||
      content?.exampleValue ||
      content?.validationRule ||
      content?.evidenceExpectation ||
      helpText,
  );

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hasContent) return null;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          buttonClassName,
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-label={`Help for ${fieldLabel}`}
        data-testid={`field-help-button-${fieldName}`}
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle className="size-4" aria-hidden />
      </button>

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label={`Help for ${fieldLabel}`}
          data-testid={`field-help-popover-${fieldName}`}
          className="absolute left-0 top-full z-40 mt-2 w-80 rounded-xl border border-border bg-card p-3 text-sm shadow-xl"
        >
          <header className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Field
              </p>
              <p className="text-sm font-semibold text-foreground">{fieldLabel}</p>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              <X className="size-4" />
            </button>
          </header>
          <div className="mt-2 space-y-2 text-[13px]">
            {content?.purpose ? (
              <HelpRow label="Purpose">{content.purpose}</HelpRow>
            ) : helpText ? (
              <HelpRow label="Purpose">{helpText}</HelpRow>
            ) : null}
            {content?.expectedInput ? (
              <HelpRow label="Expected input">{content.expectedInput}</HelpRow>
            ) : null}
            {content?.exampleValue ? (
              <HelpRow label="Example value">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {content.exampleValue}
                </code>
              </HelpRow>
            ) : null}
            {content?.validationRule ? (
              <HelpRow label="Validation rule">{content.validationRule}</HelpRow>
            ) : null}
            {content?.evidenceExpectation ? (
              <HelpRow label="Related evidence">{content.evidenceExpectation}</HelpRow>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HelpRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-foreground/90">{children}</p>
    </div>
  );
}
