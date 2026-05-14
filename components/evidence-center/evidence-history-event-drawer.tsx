"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EvidenceHistoryEvent } from "@/types/evidence-center.types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm text-slate-800">{value || "—"}</dd>
    </div>
  );
}

export function EvidenceHistoryEventDrawer({
  open,
  event,
  onClose,
  onOpenAuditDetail,
}: {
  open: boolean;
  event: EvidenceHistoryEvent | null;
  onClose: () => void;
  /** When set, history rows with `auditReference` can open the audit detail drawer. */
  onOpenAuditDetail?: (auditId: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && event) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, event]);

  if (!event) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="evidence-history-event-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence history</p>
            <h2 id="evidence-history-event-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              {event.summaryLabel}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{event.timestampLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          <dl>
            <Field label="Event type" value={event.eventType} />
            <Field label="Actor" value={event.actor} />
            <Field label="Timestamp" value={event.timestampLabel} />
            <Field label="Previous value" value={event.previousValue} />
            <Field label="New value" value={event.newValue} />
            <Field label="Related object" value={event.relatedObject} />
            <Field label="Audit reference" value={event.auditReference || "—"} />
          </dl>
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          {event.auditReference && onOpenAuditDetail ? (
            <Button
              type="button"
              data-testid="evidence-history-open-audit-detail"
              className="w-full sm:w-auto"
              onClick={() => {
                onOpenAuditDetail(event.auditReference);
                onClose();
              }}
            >
              View audit entry
            </Button>
          ) : null}
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
