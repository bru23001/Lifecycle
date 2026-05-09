"use client";

import { Copy, Download, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copyToClipboard, downloadTextFile } from "@/lib/artifact-export";
import { prettyJson, validateJson } from "@/lib/json-evidence-renderer";
import type { ArtifactJsonEvidence } from "@/types/artifact-library.types";

export function JsonEvidenceView({ evidence }: { evidence: ArtifactJsonEvidence }) {
  const pretty = prettyJson(evidence);
  const validation = validateJson(pretty);

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
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

      <p
        className="mb-2 text-xs text-[#64748b] dark:text-muted-foreground"
        aria-live="polite"
        aria-label="JSON validation status"
      >
        {validation.message}
      </p>
      <div className="rounded-xl border border-[#e5e7eb] bg-[#0b1020] p-4 dark:border-border">
        <pre
          aria-label={`JSON evidence for ${evidence.artifactId}`}
          className="max-h-[420px] overflow-auto text-[12px] leading-5 text-slate-100"
        >
          {pretty}
        </pre>
      </div>
    </section>
  );
}
