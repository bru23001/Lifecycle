import Link from "next/link";
import { ChevronRight, ClipboardList, History } from "lucide-react";

import type { SelectedProject } from "@/types/projects.types";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectAuditTrailTab({ selectedProject }: { selectedProject: SelectedProject }) {
  const entries = selectedProject.auditTrailEntries;
  const workspaceHref = `/projects/${selectedProject.header.id}/workspace`;

  return (
    <section className="cc-card-standard flex min-h-0 flex-1 flex-col p-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground">
            <ClipboardList className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="cc-card-title">Audit Trail</h3>
            <p className="cc-card-meta mt-1 max-w-prose">
              Immutable activity log from <span className="font-mono text-[10px]">AuditEntry</span> for{" "}
              {selectedProject.header.code} · {selectedProject.header.name}
            </p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="cc-card-text mt-6">No audit events recorded for this project yet.</p>
      ) : (
        <ul className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {entries.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-border bg-background/80 px-3 py-2.5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[11px] font-semibold leading-snug text-foreground">{row.title}</p>
                <time className="cc-card-meta shrink-0 tabular-nums" dateTime={row.createdAt}>
                  {formatWhen(row.createdAt)}
                </time>
              </div>
              <p className="cc-card-meta mt-1 leading-relaxed">{row.detail}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 cc-card-meta">
                <span>
                  <span className="text-muted-foreground">Action</span>{" "}
                  <span className="font-mono text-[10px]">{row.action}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Subject</span>{" "}
                  <span className="font-mono text-[10px]">
                    {row.subjectKind}:{row.subjectId.slice(0, 12)}
                    {row.subjectId.length > 12 ? "…" : ""}
                  </span>
                </span>
                {row.actorLabel ? (
                  <span>
                    <span className="text-muted-foreground">Actor</span> {row.actorLabel}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link href={workspaceHref} className="cc-card-link mt-4 inline-flex items-center gap-1 self-start">
        Open lifecycle workspace
        <ChevronRight className="size-3.5" />
      </Link>
    </section>
  );
}

export function ProjectLifecycleTimelineTab({ selectedProject }: { selectedProject: SelectedProject }) {
  const timeline = [...selectedProject.auditTrailEntries]
    .filter((e) => e.lifecycleRelevant)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const workspaceHref = `/projects/${selectedProject.header.id}/workspace`;

  return (
    <section className="cc-card-standard flex min-h-0 flex-1 flex-col p-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
            <History className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="cc-card-title">Lifecycle Timeline</h3>
            <p className="cc-card-meta mt-1 max-w-prose">
              Project creation and gate reviews (phase advances) from the audit log.
            </p>
          </div>
        </div>
      </div>

      {timeline.length === 0 ? (
        <p className="cc-card-text mt-6">
          No lifecycle events yet. Creating the project and recording gate reviews will populate this timeline.
        </p>
      ) : (
        <ol className="relative mt-6 min-h-0 flex-1 space-y-0 overflow-y-auto pl-6 pr-1 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
          {timeline.map((row) => (
            <li key={row.id} className="relative pb-6 last:pb-0">
              <span
                className="absolute -left-6 top-1 flex size-3.5 items-center justify-center rounded-full border-2 border-background bg-blue-600 dark:bg-blue-500"
                aria-hidden
              />
              <p className="text-[11px] font-semibold text-foreground">{row.title}</p>
              <time className="cc-card-meta tabular-nums" dateTime={row.createdAt}>
                {formatWhen(row.createdAt)}
              </time>
              <p className="cc-card-meta mt-1 leading-relaxed">{row.detail}</p>
              {row.actorLabel ? (
                <p className="cc-card-meta mt-0.5">Actor: {row.actorLabel}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <Link href={workspaceHref} className="cc-card-link mt-4 inline-flex items-center gap-1 self-start">
        Open lifecycle workspace
        <ChevronRight className="size-3.5" />
      </Link>
    </section>
  );
}
