"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadJson } from "@/lib/download-json";
import { approvalAuditFromHistoryEvent } from "@/lib/approval-audit";
import type { ApprovalAuditRecord, ApprovalHistoryEvent } from "@/types/approval-center.types";

function humanizeEventType(t: ApprovalHistoryEvent["eventType"]) {
  return t.replaceAll("_", " ");
}

export function ApprovalHistoryEventDetailDialog({
  open,
  event,
  onClose,
  onOpenAudit,
}: {
  open: boolean;
  event: ApprovalHistoryEvent | null;
  onClose: () => void;
  onOpenAudit: (event: ApprovalHistoryEvent) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && event) {
      if (!node.open) node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open, event]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,480px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
      aria-labelledby="approval-history-detail-title"
    >
      <div className="flex h-full flex-col">
        {event ? (
          <>
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
              <div className="min-w-0">
                <p id="approval-history-detail-title" className="text-lg font-semibold text-slate-900">
                  {event.title}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{humanizeEventType(event.eventType)}</p>
              </div>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
              <dl className="grid gap-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Actor</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{event.actorName}</dd>
                </div>
                {event.actorRole ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Actor role</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">{event.actorRole}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Timestamp</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{event.timestampLabel}</dd>
                </div>
                {event.description ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Description</dt>
                    <dd className="mt-0.5 text-slate-700">{event.description}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Related object</dt>
                  <dd className="mt-0.5">
                    {event.relatedObjectHref && event.relatedObjectLabel ? (
                      <Link href={event.relatedObjectHref} className="font-semibold text-[#2563eb] hover:underline">
                        {event.relatedObjectLabel}
                      </Link>
                    ) : (
                      <span className="text-slate-700">{event.relatedObjectLabel ?? "—"}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Before / after</dt>
                  <dd className="mt-0.5 space-y-1 text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-600">Before: </span>
                      {event.beforeValue ?? "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">After: </span>
                      {event.afterValue ?? "—"}
                    </p>
                  </dd>
                </div>
              </dl>
              {event.auditRecordId ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Audit reference</p>
                  <p className="mt-1 font-mono text-xs text-slate-800">{event.auditRecordId}</p>
                  <Button type="button" size="sm" className="mt-3" variant="outline" onClick={() => onOpenAudit(event)}>
                    Open audit detail
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-slate-600">No event selected.</div>
        )}
      </div>
    </dialog>
  );
}

export function AuditEventDetailDialog({
  open,
  record,
  onClose,
}: {
  open: boolean;
  record: ApprovalAuditRecord | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && record) {
      if (!node.open) node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open, record]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,480px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
      aria-labelledby="audit-event-detail-title"
    >
      <div className="flex h-full flex-col">
        {record ? (
          <>
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
              <div className="min-w-0">
                <p id="audit-event-detail-title" className="text-lg font-semibold text-slate-900">
                  Audit event
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">{record.id}</p>
              </div>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
              <dl className="grid gap-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Event type</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{record.eventType}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Actor</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{record.actorName}</dd>
                </div>
                {record.actorRole ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Actor role</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">{record.actorRole}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Timestamp</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{record.timestampLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Object changed</dt>
                  <dd className="mt-0.5">
                    {record.objectChangedHref ? (
                      <Link href={record.objectChangedHref} className="font-semibold text-[#2563eb] hover:underline">
                        {record.objectChangedLabel}
                      </Link>
                    ) : (
                      <span className="text-slate-700">{record.objectChangedLabel}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Before / after</dt>
                  <dd className="mt-0.5 space-y-1 text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-600">Before: </span>
                      {record.beforeValue ?? "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600">After: </span>
                      {record.afterValue ?? "—"}
                    </p>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Integrity hash</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-slate-800">{record.integrityHash}</dd>
                </div>
              </dl>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  downloadJson(`audit-${record.id.replace(/[^\w-]+/g, "_")}.json`, {
                    exportedAt: new Date().toISOString(),
                    record,
                  })
                }
              >
                Export audit record
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-slate-600">No audit record selected.</div>
        )}
      </div>
    </dialog>
  );
}

export function openAuditFromHistoryEvent(event: ApprovalHistoryEvent): ApprovalAuditRecord {
  return approvalAuditFromHistoryEvent(event);
}
