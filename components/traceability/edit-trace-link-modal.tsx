"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { updateTraceLink } from "@/app/actions/updateTraceLink";
import { Button } from "@/components/ui/button";
import {
  RELATION_HELP,
  TRACE_LINK_CONFIDENCE,
  TRACE_LINK_RELATIONS,
  type TraceLinkConfidence,
  type TraceLinkRelation,
} from "@/lib/trace-link-relations";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";
import type { TraceabilityLinkDetail } from "@/types/traceability.types";

type Props = {
  open: boolean;
  projectId: string;
  detail: TraceabilityLinkDetail;
  onClose: () => void;
  onSaved: () => void;
};

function isTraceLinkRelation(v: string): v is TraceLinkRelation {
  return (TRACE_LINK_RELATIONS as readonly string[]).includes(v);
}

function isTraceLinkConfidence(v: string): v is TraceLinkConfidence {
  return (TRACE_LINK_CONFIDENCE as readonly string[]).includes(v);
}

export function EditTraceLinkModal({ open, projectId, detail, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [relation, setRelation] = useState<TraceLinkRelation>("derives");
  const [rationale, setRationale] = useState("");
  const [confidence, setConfidence] = useState<TraceLinkConfidence>("medium");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [verificationNote, setVerificationNote] = useState("");
  const [recordVerification, setRecordVerification] = useState(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setRecordVerification(false);
    const rel = detail.relation && isTraceLinkRelation(detail.relation) ? detail.relation : "derives";
    setRelation(rel);
    setRationale(detail.rationale?.trim() || "");
    setConfidence(isTraceLinkConfidence(detail.confidence) ? detail.confidence : "medium");
    setEvidenceReference(detail.evidenceReference?.trim() || "");
    setVerificationNote(detail.verificationNote?.trim() || "");
  }, [open, detail]);

  const formValid = rationale.trim().length >= 3;

  function handleSubmit() {
    if (!formValid || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateTraceLink({
          projectId,
          linkId: detail.id,
          relation,
          rationale: rationale.trim(),
          confidence,
          evidenceReference: evidenceReference.trim(),
          verificationNote: verificationNote.trim(),
          recordVerification,
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        onSaved();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="edit-trace-link-modal-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Traceability</p>
            <h2
              id="edit-trace-link-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              Edit trace link
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Update relation, rationale, confidence, or verification notes. Changes are audited.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Endpoints</p>
            <p className="mt-1 text-slate-700 dark:text-foreground">
              <span className="font-medium">{detail.sourceLabel}</span>
              <span className="mx-1 text-slate-400">→</span>
              <span className="font-medium">{detail.targetLabel}</span>
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Link type</p>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as TraceLinkRelation)}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30"
              aria-label="Link type"
            >
              {TRACE_LINK_RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{RELATION_HELP[relation]}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Confidence</p>
            <select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as TraceLinkConfidence)}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30"
              aria-label="Confidence"
            >
              {TRACE_LINK_CONFIDENCE.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence reference</p>
            <input
              type="text"
              value={evidenceReference}
              onChange={(e) => setEvidenceReference(e.target.value)}
              maxLength={500}
              aria-label="Evidence reference"
              placeholder="Ticket, doc id, or artifact pointer (optional)"
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30"
            />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Rationale</p>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              maxLength={500}
              rows={3}
              required
              aria-label="Rationale"
              placeholder="Why does this link exist? (3–500 characters)"
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30"
            />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Verification note</p>
            <textarea
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              maxLength={2000}
              rows={2}
              aria-label="Verification note"
              placeholder="Optional reviewer or verification context"
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-foreground">
            <input
              type="checkbox"
              checked={recordVerification}
              onChange={(e) => setRecordVerification(e.target.checked)}
              className="mt-0.5"
            />
            <span>Record verification time on save</span>
          </label>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <footer
          className={cn(
            "flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border",
          )}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!formValid || pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
