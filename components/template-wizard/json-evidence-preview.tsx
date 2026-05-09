"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { JsonEvidence } from "@/types/template-wizard.types";

export function JsonEvidencePreview({ data }: { data: JsonEvidence }) {
  const text = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const [validateMsg, setValidateMsg] = useState<string | null>(null);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
  }, [text]);

  const validate = useCallback(() => {
    try {
      JSON.parse(text);
      setValidateMsg("JSON parses successfully.");
    } catch {
      setValidateMsg("JSON failed validation (parse error).");
    }
  }, [text]);

  return (
    <section
      className="flex min-h-0 flex-col rounded-2xl border bg-card shadow-sm"
      aria-label="JSON evidence preview"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">JSON Evidence Preview</h3>
          <p className="text-[11px] text-muted-foreground">Structured evidence package</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={validate}>
            Validate JSON
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={copy}>
            Copy JSON
          </Button>
        </div>
      </div>

      <div className="max-h-[280px] min-h-[140px] overflow-auto p-4">
        <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground">
          {text}
        </pre>
      </div>

      {validateMsg ? (
        <p className="border-t px-4 py-2 text-xs text-muted-foreground" role="status">
          {validateMsg}
        </p>
      ) : null}
    </section>
  );
}
