"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deriveBeforeAfter,
  formatAuditReference,
  humanizeAction,
  humanizeMetadataKey,
} from "@/lib/audit-event-details";
import { cn } from "@/lib/utils";
import type { ProjectScreenAuditEntry } from "@/types/projects.types";

/**
 * Right-side drawer showing the full detail of a single `AuditEntry`.
 *
 * Read-only by design — audit entries are immutable per CYBERCUBE 4.5 §1
 * and 6.1 §"Records Retention". This component never offers a mutation
 * surface; clipboard copy is the only "interactive" action.
 */
export function AuditEventDetailDrawer({
  open,
  entry,
  onClose,
}: {
  open: boolean;
  entry: ProjectScreenAuditEntry | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && entry) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, entry]);

  if (!entry) return null;

  const { pairs, remainder } = deriveBeforeAfter(entry.metadata);
  const reference = formatAuditReference(entry.id);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,460px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="audit-event-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Audit event</p>
            <h2
              id="audit-event-drawer-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              {entry.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-slate-500">{humanizeAction(entry.action)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close audit event"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 text-sm">
          <Section title="Event type">
            <p className="font-medium text-slate-900 dark:text-foreground">{humanizeAction(entry.action)}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{entry.action}</p>
          </Section>

          <Section title="Actor">
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-slate-500" aria-hidden />
              <span className="font-medium text-slate-900 dark:text-foreground">
                {entry.actorLabel ?? "System"}
              </span>
            </div>
            {entry.actorEmail ? (
              <p className="text-xs text-slate-500">{entry.actorEmail}</p>
            ) : null}
          </Section>

          <Section title="Timestamp">
            <time dateTime={entry.createdAt} className="text-slate-700 dark:text-muted-foreground">
              {formatTimestamp(entry.createdAt)}
            </time>
          </Section>

          <Section title="Object changed">
            <p className="text-slate-700 dark:text-muted-foreground">
              <span className="font-mono text-xs text-slate-500">{entry.subjectKind}</span>
              <span className="mx-1 text-slate-400">·</span>
              <span className="font-mono text-xs">{entry.subjectId}</span>
            </p>
          </Section>

          {pairs.length > 0 ? (
            <Section title="Before / after">
              <div className="overflow-hidden rounded-md border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-2 py-1.5">Field</th>
                      <th className="px-2 py-1.5">Before</th>
                      <th className="px-2 py-1.5">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairs.map((p, i) => (
                      <tr key={`${p.key}-${i}`} className="border-t border-slate-200">
                        <td className="px-2 py-1.5 font-medium text-slate-700">
                          {humanizeMetadataKey(p.key)}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-slate-500">{renderValue(p.before)}</td>
                        <td className="px-2 py-1.5 font-mono text-slate-900">{renderValue(p.after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          ) : null}

          {remainder.length > 0 ? (
            <Section title="Other metadata">
              <dl className="space-y-1.5">
                {remainder.map((row, i) => (
                  <div key={`${row.key}-${i}`} className="flex flex-wrap items-baseline gap-2">
                    <dt className="font-medium text-slate-700">{humanizeMetadataKey(row.key)}</dt>
                    <dd className="font-mono text-xs text-slate-900">{renderValue(row.value)}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          ) : null}

          {entry.relatedHrefs.length > 0 ? (
            <Section title="Related artifact / gate / evidence">
              <ul className="space-y-1.5">
                {entry.relatedHrefs.map((rel, i) => (
                  <li key={`${rel.kind}-${i}`}>
                    <Link
                      href={rel.href}
                      className="inline-flex items-center gap-1.5 rounded text-[#1d4ed8] hover:underline"
                    >
                      <span className="text-[11px] uppercase tracking-wide text-slate-500">
                        {rel.kind}
                      </span>
                      <span>{rel.label}</span>
                      <ExternalLink className="size-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title="Audit reference">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-slate-500" aria-hidden />
              <span className="font-mono text-xs text-slate-900">{reference.short}</span>
              <CopyButton value={reference.full} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Append <span className="font-mono">/audit/{reference.full}</span> to a project URL to share this event.
            </p>
          </Section>
        </div>

        <footer className={cn("flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 px-5 py-3 dark:border-border")}>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {entry.href ? (
            <Link href={entry.href}>
              <Button type="button" className="gap-2">
                Open subject
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Link>
          ) : null}
        </footer>
      </div>
    </dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          void navigator.clipboard.writeText(value);
        }
      }}
      className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50"
      aria-label="Copy audit reference"
    >
      Copy
    </button>
  );
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
