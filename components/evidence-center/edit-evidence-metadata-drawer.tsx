"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { updateEvidenceMetadata } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import {
  classificationLabel,
  EVIDENCE_CLASSIFICATIONS,
  EVIDENCE_FORM_TYPES,
  type EvidenceClassification,
  type EvidenceFormType,
} from "@/lib/add-evidence-form";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EditEvidenceMetadataDrawer({
  open,
  projectId,
  selectedEvidence,
  onClose,
}: {
  open: boolean;
  projectId: string;
  selectedEvidence: EvidenceCenterSelectedEvidence | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceFormType>("document");
  const [classification, setClassification] = useState<EvidenceClassification>("internal");
  const [retention, setRetention] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && selectedEvidence) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, selectedEvidence]);

  useEffect(() => {
    if (!open || !selectedEvidence) return;
    const d = selectedEvidence.detail;
    setName(d.name);
    setDescription(d.description);
    setEvidenceType(d.evidenceType as EvidenceFormType);
    setClassification(d.classification);
    setRetention(d.retentionPolicyLabel ?? "");
    setNotes(d.notes ?? "");
    setTagsRaw(d.tags.join(", "));
    setSource(d.source ?? "");
    setError(null);
  }, [open, selectedEvidence]);

  if (!selectedEvidence) return null;

  const save = () => {
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    startTransition(async () => {
      const res = await updateEvidenceMetadata({
        projectId,
        evidenceId: selectedEvidence.detail.id,
        name,
        description,
        evidenceType,
        classification,
        retentionPolicyLabel: retention.trim() || null,
        notes: notes.trim() || null,
        tags,
        source: source.trim() || null,
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,480px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="edit-evidence-metadata-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence</p>
            <h2 id="edit-evidence-metadata-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Edit metadata
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{selectedEvidence.detail.evidenceCode}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Name</span>
            <input className={cn(inputClass, "mt-1")} value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Description</span>
            <textarea
              className={cn(inputClass, "mt-1 min-h-[80px]")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={8000}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Evidence type</span>
            <select
              className={cn(inputClass, "mt-1")}
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as EvidenceFormType)}
            >
              {EVIDENCE_FORM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Classification</span>
            <select
              className={cn(inputClass, "mt-1")}
              value={classification}
              onChange={(e) => setClassification(e.target.value as EvidenceClassification)}
            >
              {EVIDENCE_CLASSIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {classificationLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Source URL</span>
            <input className={cn(inputClass, "mt-1")} value={source} onChange={(e) => setSource(e.target.value)} placeholder="https://…" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Retention policy</span>
            <input className={cn(inputClass, "mt-1")} value={retention} onChange={(e) => setRetention(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Tags (comma-separated)</span>
            <input className={cn(inputClass, "mt-1")} value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Notes</span>
            <textarea className={cn(inputClass, "mt-1 min-h-[72px]")} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={8000} />
          </label>
          <p className="text-xs text-slate-500">Confidentiality follows classification (STD-DAT-001).</p>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={pending || name.trim().length < 2} onClick={save}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
