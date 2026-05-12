"use client";

import type { ReactNode } from "react";
import { Copy, Download, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copyToClipboard, downloadTextFile } from "@/lib/artifact-export";
import { prettyJson, validateJson } from "@/lib/json-evidence-renderer";
import type { ArtifactJsonEvidence } from "@/types/artifact-library.types";

function ToolbarButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:h-12 sm:gap-3 sm:px-5 sm:text-base dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/50"
    >
      {children}
    </button>
  );
}

export function JsonEvidenceView({
  evidence,
  embedded = false,
}: {
  evidence: ArtifactJsonEvidence;
  embedded?: boolean;
}) {
  const pretty = prettyJson(evidence);
  const validation = validateJson(pretty);

  const toolbar = (
    <div className="mb-4 flex flex-wrap justify-end gap-3 sm:mb-6 sm:gap-4">
      <ToolbarButton>
        <ShieldCheck className="h-4 w-4 stroke-[2.2] sm:h-5 sm:w-5" aria-hidden />
        Validate JSON
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          downloadTextFile(
            `${evidence.templateCode.replaceAll(".", "-")}_evidence.json`,
            pretty,
            "application/json;charset=utf-8",
          )
        }
      >
        <Download className="h-4 w-4 stroke-[2.2] sm:h-5 sm:w-5" aria-hidden />
        Download .json
      </ToolbarButton>
      <ToolbarButton onClick={() => copyToClipboard(pretty)}>
        <Copy className="h-4 w-4 stroke-[2.2] sm:h-5 sm:w-5" aria-hidden />
        Copy
      </ToolbarButton>
    </div>
  );

  const body = (
    <>
      {embedded ? toolbar : null}
      {!embedded ? (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-[#111827] dark:text-foreground">JSON Evidence View</h3>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="xs">
              <ShieldCheck className="size-3.5" />
              Validate JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                downloadTextFile(
                  `${evidence.templateCode.replaceAll(".", "-")}_evidence.json`,
                  pretty,
                  "application/json;charset=utf-8",
                )
              }
            >
              <Download className="size-3.5" />
              Download .json
            </Button>
            <Button type="button" variant="outline" size="xs" onClick={() => copyToClipboard(pretty)}>
              <Copy className="size-3.5" />
              Copy
            </Button>
          </div>
        </header>
      ) : null}

      <p
        className="mb-2 text-xs text-slate-600 dark:text-muted-foreground"
        aria-live="polite"
        aria-label="JSON validation status"
      >
        {validation.message}
      </p>
      <div className="rounded-xl border border-slate-200 bg-[#0b1020] p-4 dark:border-border">
        <pre
          aria-label={`JSON evidence for ${evidence.artifactId}`}
          className="max-h-[min(60vh,520px)] overflow-auto text-[12px] leading-5 text-slate-100"
        >
          {pretty}
        </pre>
      </div>
    </>
  );

  if (embedded) {
    return <div className="space-y-2">{body}</div>;
  }

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      {body}
    </section>
  );
}
