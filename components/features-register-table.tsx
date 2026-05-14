"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { updateFeatureRow } from "@/app/actions/updateRegisterRows";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

const STATUSES = ["Draft", "Baselined", "Deferred", "Withdrawn"] as const;
const SCOPES = ["InScope", "OutOfScope", "Deferred"] as const;

export type FeatureRegisterRow = {
  id: string;
  localId: string;
  title: string;
  priority: string | null;
  status: string;
  scopeStatus: string;
  traceParts: string[];
};

export function FeaturesRegisterTable({
  projectId,
  rows,
  focusFeatureId,
}: {
  projectId: string;
  rows: FeatureRegisterRow[];
  /** Deep link: `?focus=` feature row id. */
  focusFeatureId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const id = focusFeatureId?.trim();
    if (!id || !highlightRowRef.current) return;
    highlightRowRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusFeatureId, rows]);

  type FeaturePatch = {
    status?: (typeof STATUSES)[number];
    scopeStatus?: (typeof SCOPES)[number];
  };

  function patch(featureId: string, update: FeaturePatch) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateFeatureRow({
          projectId,
          featureId,
          ...update,
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Local ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Scope</th>
            <th className="px-4 py-3">Trace</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                No rows match the current filters — adjust filters or save template A-9
                for this project.
              </td>
            </tr>
          ) : (
            rows.map((f) => {
              const highlighted = Boolean(focusFeatureId?.trim() && focusFeatureId.trim() === f.id);
              return (
              <tr
                key={f.id}
                ref={highlighted ? highlightRowRef : undefined}
                className={cn(
                  "border-b border-border/60 align-top",
                  highlighted && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                )}
              >
                <td className="px-4 py-3 font-mono text-xs">{f.localId}</td>
                <td className="px-4 py-3">{f.title}</td>
                <td className="px-4 py-3">{f.priority ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Status for ${f.localId}`}
                    disabled={pending}
                    className="max-w-[11rem] rounded-lg border bg-background px-2 py-1.5 text-xs"
                    value={STATUSES.includes(f.status as (typeof STATUSES)[number]) ? f.status : "Draft"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (STATUSES.includes(v as (typeof STATUSES)[number])) {
                        patch(f.id, { status: v as (typeof STATUSES)[number] });
                      }
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Scope for ${f.localId}`}
                    disabled={pending}
                    className="max-w-[11rem] rounded-lg border bg-background px-2 py-1.5 text-xs"
                    value={
                      SCOPES.includes(f.scopeStatus as (typeof SCOPES)[number])
                        ? f.scopeStatus
                        : "InScope"
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (SCOPES.includes(v as (typeof SCOPES)[number])) {
                        patch(f.id, { scopeStatus: v as (typeof SCOPES)[number] });
                      }
                    }}
                  >
                    {SCOPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {f.traceParts.length === 0 ? (
                    <span className="text-xs text-amber-700 dark:text-amber-400">No links</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {f.traceParts.map((t, i) => (
                        <span
                          key={`${f.id}-tr-${i}`}
                          className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-tight text-muted-foreground"
                          title={t}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
