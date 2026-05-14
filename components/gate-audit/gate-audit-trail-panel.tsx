"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import type { GateAuditTrailEvent, GateAuditTrailViewData } from "@/types/gate-audit.types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function categoryLabel(c: GateAuditTrailEvent["eventCategory"]): string {
  switch (c) {
    case "decision":
      return "Decision";
    case "evidence":
      return "Evidence";
    case "approver":
      return "Approver";
    case "criteria":
      return "Criteria";
    case "submission":
      return "Submission";
    default:
      return "Other";
  }
}

export function AuditEventDetailDrawer({
  open,
  event,
  gateCode,
  projectId,
  onClose,
  overlayZClass = "z-[60]",
}: {
  open: boolean;
  event: GateAuditTrailEvent | null;
  gateCode: string;
  projectId: string;
  onClose: () => void;
  /** Raise when nested under another full-screen overlay (e.g. gate review preview). */
  overlayZClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !event) return null;

  const meta = event.metadata;
  const before = meta.before ?? meta.previous ?? meta.oldValue;
  const after = meta.after ?? meta.next ?? meta.newValue;
  const evidenceId =
    typeof meta.evidenceId === "string"
      ? meta.evidenceId
      : event.subjectKind === "evidence_item"
        ? event.subjectId
        : undefined;
  const artifactId = typeof meta.artifactId === "string" ? meta.artifactId : undefined;

  return (
    <div className={cn("fixed inset-0 flex justify-end", overlayZClass)} role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-[var(--app-bg)] shadow-2xl dark:border-border">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Audit event</p>
            <h2 className="mt-1 text-base font-semibold text-foreground">Event detail</h2>
            <p className="mt-1 text-xs text-muted-foreground">{event.auditReference}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <dl className="grid grid-cols-1 gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">Event type</dt>
              <dd className="mt-0.5 text-foreground">{event.action}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">Actor</dt>
              <dd className="mt-0.5 text-foreground">{event.actorLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">Timestamp</dt>
              <dd className="mt-0.5 text-foreground">{event.timestampLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">Object changed</dt>
              <dd className="mt-0.5 text-foreground">
                {event.subjectKind} · {event.subjectId}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">Related gate</dt>
              <dd className="mt-0.5 text-foreground">{gateCode}</dd>
            </div>
          </dl>

          {before !== undefined || after !== undefined ? (
            <section>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Before / after</h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/40 p-2">
                  <p className="text-[11px] font-medium text-muted-foreground">Before</p>
                  <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs">
                    {before !== undefined ? JSON.stringify(before, null, 2) : "—"}
                  </pre>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-2">
                  <p className="text-[11px] font-medium text-muted-foreground">After</p>
                  <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs">
                    {after !== undefined ? JSON.stringify(after, null, 2) : "—"}
                  </pre>
                </div>
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Metadata payload</h3>
            <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-border bg-card p-3 text-xs leading-relaxed">
              {JSON.stringify(meta, null, 2)}
            </pre>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Related evidence / artifact</h3>
            <div className="mt-2 flex flex-col gap-2">
              {evidenceId ? (
                <Link
                  href={`/projects/${projectId}/evidence/${evidenceId}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-center")}
                >
                  Open evidence
                </Link>
              ) : null}
              {artifactId ? (
                <Link
                  href={`/projects/${projectId}/artifacts/${artifactId}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-center")}
                >
                  Open artifact
                </Link>
              ) : null}
              {!evidenceId && !artifactId ? (
                <p className="text-xs text-muted-foreground">No direct links in this event payload.</p>
              ) : null}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Audit reference</h3>
            <p className="mt-1 font-mono text-xs text-foreground">{event.id}</p>
          </section>
        </div>
        <footer className="border-t border-border px-5 py-3">
          <Button type="button" className="w-full" variant="default" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </div>
  );
}

export function GateAuditTrailPanel({
  data,
  reviewHref,
  initialOpenEventId,
  variant = "page",
  onEventDetailOpenChange,
}: {
  data: GateAuditTrailViewData;
  reviewHref: string;
  initialOpenEventId?: string | null;
  /** `page` shows full heading; `drawer` is denser for the gate review preview. */
  variant?: "page" | "drawer";
  onEventDetailOpenChange?: (open: boolean) => void;
}) {
  const [selected, setSelected] = useState<GateAuditTrailEvent | null>(null);

  useEffect(() => {
    onEventDetailOpenChange?.(selected !== null);
  }, [selected, onEventDetailOpenChange]);

  useEffect(() => {
    return () => onEventDetailOpenChange?.(false);
  }, [onEventDetailOpenChange]);

  useEffect(() => {
    if (!initialOpenEventId) return;
    const hit = data.events.find((e) => e.id === initialOpenEventId);
    if (hit) setSelected(hit);
  }, [initialOpenEventId, data.events]);

  const rows = useMemo(() => data.events, [data.events]);

  const heading = (
    <div className={cn(variant === "drawer" ? "mt-0" : "mt-6", "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between")}>
      <div>
        <h1
          className={cn(
            "font-semibold text-foreground",
            variant === "drawer" ? "text-lg" : "text-2xl",
          )}
        >
          {data.gateCode} · {data.gateName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {variant === "drawer"
            ? "Recent events for this gate. Open the full page for a dedicated view."
            : "Immutable audit events scoped to this gate (evidence, approvers, decisions)."}
        </p>
      </div>
      <Link href={reviewHref} className={cn(buttonVariants({ variant: "outline" }), "shrink-0 self-start")}>
        Back to gate review
      </Link>
    </div>
  );

  return (
    <>
      {heading}

      {rows.length === 0 ? (
        <p
          className={cn(
            "rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground",
            variant === "drawer" ? "mt-4" : "mt-10",
          )}
        >
          No audit events recorded for this gate yet. Actions in gate review (evidence, approvers, decision) will
          appear here.
        </p>
      ) : (
        <div className={cn("overflow-x-auto rounded-xl border border-border bg-card shadow-sm", variant === "drawer" ? "mt-4" : "mt-8")}>
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-semibold text-foreground">Category</th>
                <th className="px-4 py-3 font-semibold text-foreground">Event</th>
                <th className="px-4 py-3 font-semibold text-foreground">Summary</th>
                <th className="px-4 py-3 font-semibold text-foreground">Actor</th>
                <th className="px-4 py-3 font-semibold text-foreground">Timestamp</th>
                <th className="px-4 py-3 font-semibold text-foreground">Reference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel(e.eventCategory)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{e.action}</td>
                  <td className="max-w-[280px] px-4 py-3 text-foreground/90">
                    <button
                      type="button"
                      className="text-left text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
                      onClick={() => setSelected(e)}
                    >
                      {e.summary}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground/90">{e.actorLabel}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{e.timestampLabel}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.auditReference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AuditEventDetailDrawer
        open={selected !== null}
        event={selected}
        gateCode={data.gateCode}
        projectId={data.projectId}
        overlayZClass={variant === "drawer" ? "z-[110]" : "z-[60]"}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
