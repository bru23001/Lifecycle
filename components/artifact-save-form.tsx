"use client";

import { useState } from "react";

import { DynamicForm } from "@/components/ui/DynamicForm";
import { saveArtifact } from "@/app/actions/saveArtifact";
import { getTemplate } from "@/templates/registry";

export function ArtifactSaveForm({ templateId }: { templateId: string }) {
  const template = getTemplate(templateId);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {message ? (
        <p className="mb-4 rounded-lg bg-muted px-4 py-3 text-sm">{message}</p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/40 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DynamicForm
        template={template}
        submitLabel="Save artifact"
        onSubmit={async (data) => {
          setError(null);
          setMessage(null);
          const res = await saveArtifact({ templateId, data });
          if (!res.ok) {
            const detail =
              res.fieldErrors &&
              Object.entries(res.fieldErrors)
                .filter(([, messages]) => messages?.length)
                .map(([key, messages]) => `${key}: ${messages?.join(", ")}`)
                .join(" · ");
            setError([res.error, detail].filter(Boolean).join(" "));
            return;
          }
          setMessage(
            `Saved artifact ${res.localId} (v${res.version}). File: vault/${res.markdownPath}`,
          );
        }}
      />
    </div>
  );
}
