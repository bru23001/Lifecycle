"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type AuditEntryPayload = {
  id: string;
  action: string;
  subjectKind: string;
  subjectId: string;
  metadata: Record<string, unknown>;
  createdAtIso: string;
  actorLabel: string;
};

export function EvidenceAuditDetailDrawer({
  open,
  projectId,
  auditId,
  onClose,
}: {
  open: boolean;
  projectId: string;
  auditId: string | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [entry, setEntry] = useState<AuditEntryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && auditId) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, auditId]);

  useEffect(() => {
    if (!open || !auditId) {
      setEntry(null);
      setError(null);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    setError(null);
    setEntry(null);

    void (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/audit/entry/${auditId}`, {
          signal: ac.signal,
          credentials: "same-origin",
        });
        const body = (await res.json().catch(() => ({}))) as { entry?: AuditEntryPayload; error?: string };
        if (!res.ok) {
          setError(body.error ?? `Request failed (${res.status})`);
          return;
        }
        if (body.entry) setEntry(body.entry);
        else setError("Malformed response.");
      } catch (e) {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Load failed.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [open, auditId, projectId]);

  return (
    <dialog
      ref={dialogRef}
      data-testid="evidence-audit-detail-drawer"
      onClose={onClose}
      className="z-[55] ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="evidence-audit-detail-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Audit trail</p>
            <h2 id="evidence-audit-detail-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Audit entry
            </h2>
            {auditId ? <p className="mt-0.5 font-mono text-xs text-slate-500">{auditId}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm">
          {loading ? <p className="text-slate-600">Loading audit entry…</p> : null}
          {error ? <p className="text-red-700">{error}</p> : null}
          {entry && !loading ? (
            <dl className="space-y-3">
              <div className="grid gap-1 border-b border-slate-100 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Action</dt>
                <dd className="break-words text-slate-900">{entry.action}</dd>
              </div>
              <div className="grid gap-1 border-b border-slate-100 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actor</dt>
                <dd className="break-words text-slate-900">{entry.actorLabel}</dd>
              </div>
              <div className="grid gap-1 border-b border-slate-100 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timestamp</dt>
                <dd className="text-slate-900">{new Date(entry.createdAtIso).toLocaleString()}</dd>
              </div>
              <div className="grid gap-1 border-b border-slate-100 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</dt>
                <dd className="break-words text-slate-900">
                  {entry.subjectKind} · {entry.subjectId}
                </dd>
              </div>
              <div className="grid gap-1 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metadata</dt>
                <dd>
                  <pre className="max-h-48 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-xs dark:border-border dark:bg-muted/30">
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <footer className="border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
