"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateProjectMeta } from "@/app/actions/updateProjectMeta";
import type { Applicability } from "@/lib/applicability";
import { toUserMessage } from "@/lib/toUserMessage";

type Props = {
  projectId: string;
  initial: {
    applicability: Applicability;
    complexityLevel: string;
    namingConformanceNote: string;
    initialTestSetupNote: string;
  };
};

export function ProjectMetaForm({ projectId, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [a, setA] = useState<Applicability>(initial.applicability);
  const [complexity, setComplexity] = useState(initial.complexityLevel);
  const [naming, setNaming] = useState(initial.namingConformanceNote);
  const [testSetup, setTestSetup] = useState(initial.initialTestSetupNote);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateProjectMeta({
          projectId,
          applicability: a,
          complexityLevel: complexity,
          namingConformanceNote: naming,
          initialTestSetupNote: testSetup,
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        setMessage("Saved project metadata.");
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Project metadata (G4 / G5 / G6)</h2>
      <p className="text-sm text-muted-foreground">
        Applicability toggles control which architecture templates are required at G5.
        Complexity is required for G4. Naming + test setup notes are required for G6.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["data", "Data / persistence (A-11 ERD)"] as const,
            ["apis", "APIs / integrations (A-12)"] as const,
            ["ui", "User interface (UXD-001)"] as const,
            ["modules", "Modular design emphasis"] as const,
            ["blueprint", "Blueprint extraction (informational)"] as const,
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={a[key]}
              onChange={(e) => setA({ ...a, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="complexity">
          Complexity level (G4)
        </label>
        <input
          id="complexity"
          className="rounded-xl border bg-background px-3 py-2 text-sm"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
          placeholder="e.g. Medium, High, Enterprise"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="naming">
          Naming / identifier conformance (G6)
        </label>
        <textarea
          id="naming"
          rows={3}
          className="rounded-xl border bg-background px-3 py-2 text-sm"
          value={naming}
          onChange={(e) => setNaming(e.target.value)}
          placeholder="Namespace M, CC-PID, artifact IDs per STD-ENG-001"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="test">
          Initial test setup (G6)
        </label>
        <textarea
          id="test"
          rows={3}
          className="rounded-xl border bg-background px-3 py-2 text-sm"
          value={testSetup}
          onChange={(e) => setTestSetup(e.target.value)}
          placeholder="Test frameworks, CI gates, coverage targets"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save metadata"}
      </button>
    </form>
  );
}
