"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { updateRequirementStatus } from "@/app/actions/updateRegisterRows";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

const STATUSES = ["Draft", "Baselined", "Deferred", "Withdrawn"] as const;

export type RequirementRegisterRow = {
  id: string;
  localId: string;
  kind: string;
  title: string;
  status: string;
  traceParts: string[];
};

export function RequirementsRegisterTable({
  projectId,
  rows,
  highlightLocalId,
}: {
  projectId: string;
  rows: RequirementRegisterRow[];
  /** Deep link: `?localId=` from requirements register URL. */
  highlightLocalId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const key = highlightLocalId?.trim();
    if (!key || !highlightRowRef.current) return;
    highlightRowRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightLocalId, rows]);

  function onStatusChange(requirementId: string, status: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateRequirementStatus({
          projectId,
          requirementId,
          status,
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
            <th className="px-4 py-3">Kind</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Trace</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                No rows match the current filters — adjust filters or save templates
                A-1 / A-2 / A-10 for this project.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const highlighted = Boolean(highlightLocalId?.trim() && highlightLocalId.trim() === r.localId);
              return (
              <tr
                key={r.id}
                ref={highlighted ? highlightRowRef : undefined}
                className={cn(
                  "border-b border-border/60 align-top",
                  highlighted && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                )}
              >
                <td className="px-4 py-3 font-mono text-xs">{r.localId}</td>
                <td className="px-4 py-3">{r.kind}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${projectId}/requirements/${r.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Status for ${r.localId}`}
                    disabled={pending}
                    className="max-w-[11rem] rounded-lg border bg-background px-2 py-1.5 text-xs"
                    value={STATUSES.includes(r.status as (typeof STATUSES)[number]) ? r.status : "Draft"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (STATUSES.includes(v as (typeof STATUSES)[number])) {
                        onStatusChange(r.id, v);
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
                  {r.traceParts.length === 0 ? (
                    <span className="text-xs text-amber-700 dark:text-amber-400">No links</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {r.traceParts.map((t, i) => (
                        <span
                          key={`${r.id}-tr-${i}`}
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
