"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";

import { addGateEvidence } from "@/app/actions/addGateEvidence";
import { Button } from "@/components/ui/button";
import { toUserMessage } from "@/lib/toUserMessage";
import type { GateId } from "@/lib/gateRules";

const EVIDENCE_TYPES = ["document", "pdf", "spreadsheet", "image", "link", "json"] as const;

const CLASSIFICATIONS = ["internal", "confidential", "public", "restricted"] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  gateId: GateId;
  defaultPhaseNumber: number;
  artifactPickerOptions: { id: string; label: string }[];
  onSaved: () => void;
};

export function AddGateEvidenceModal({
  open,
  onClose,
  projectId,
  gateId,
  defaultPhaseNumber,
  artifactPickerOptions,
  onSaved,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [name, setName] = useState("");
  const [evidenceType, setEvidenceType] = useState<(typeof EVIDENCE_TYPES)[number]>("document");
  const [classification, setClassification] = useState<(typeof CLASSIFICATIONS)[number]>("internal");
  const [phaseNumber, setPhaseNumber] = useState(defaultPhaseNumber);
  const [externalUrl, setExternalUrl] = useState("");
  const [artifactId, setArtifactId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
      setName("");
      setEvidenceType("document");
      setClassification("internal");
      setPhaseNumber(defaultPhaseNumber);
      setExternalUrl("");
      setArtifactId("");
      setError(null);
    } else if (node.open) {
      node.close();
    }
  }, [open, defaultPhaseNumber]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addGateEvidence({
        projectId,
        gateId,
        name,
        evidenceType,
        classification,
        phaseNumber,
        externalUrl: evidenceType === "link" ? externalUrl : undefined,
        artifactId: artifactId || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSaved();
      onClose();
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <form onSubmit={onSubmit} className="flex max-h-[85vh] flex-col">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-border">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            Add evidence
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Attach to gate {gateId}. File upload requires storage integration; use an external link or record metadata
            for now.
          </p>
        </div>

        <div className="lifecycle-scroll space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-2">
            <label htmlFor="ev-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="ev-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. Security scan report"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="ev-type" className="text-sm font-medium">
              Evidence type
            </label>
            <select
              id="ev-type"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as (typeof EVIDENCE_TYPES)[number])}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="ev-class" className="text-sm font-medium">
              Classification
            </label>
            <select
              id="ev-class"
              value={classification}
              onChange={(e) => setClassification(e.target.value as (typeof CLASSIFICATIONS)[number])}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CLASSIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="ev-phase" className="text-sm font-medium">
              Linked phase
            </label>
            <input
              id="ev-phase"
              type="number"
              min={1}
              max={14}
              value={phaseNumber}
              onChange={(e) => setPhaseNumber(Number.parseInt(e.target.value, 10) || 1)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium">Linked gate</span>
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-mono">{gateId}</p>
          </div>

          {evidenceType === "link" ? (
            <div className="grid gap-2">
              <label htmlFor="ev-url" className="text-sm font-medium">
                External link
              </label>
              <input
                id="ev-url"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                required
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="https://…"
              />
            </div>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
              Upload file: connect object storage and an upload API route; this dialog records metadata and optional
              links only.
            </p>
          )}

          <div className="grid gap-2">
            <label htmlFor="ev-art" className="text-sm font-medium">
              Linked artifact (optional)
            </label>
            <select
              id="ev-art"
              value={artifactId}
              onChange={(e) => setArtifactId(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— None —</option>
              {artifactPickerOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {toUserMessage(error)}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save evidence"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
