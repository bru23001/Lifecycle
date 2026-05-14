"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { classificationLabel, EVIDENCE_CLASSIFICATIONS } from "@/lib/add-evidence-form";
import { cn } from "@/lib/utils";
import { defaultEvidenceFilters, type EvidenceFilters } from "./evidence-center-shared";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

const labelClass = "block text-xs font-semibold text-slate-600";

type ArtifactOpt = { id: string; label: string };

export function EvidenceFiltersDrawer({
  open,
  appliedFilters,
  artifactOptions,
  onClose,
  onApply,
}: {
  open: boolean;
  appliedFilters: EvidenceFilters;
  artifactOptions: ArtifactOpt[];
  onClose: () => void;
  onApply: (next: EvidenceFilters) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<EvidenceFilters>(appliedFilters);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      setDraft(appliedFilters);
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, appliedFilters]);

  const set = <K extends keyof EvidenceFilters>(key: K, value: EvidenceFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const phaseOptions: { value: string; label: string }[] = [
    { value: "all", label: "All phases" },
    ...Array.from({ length: 14 }, (_, i) => {
      const n = i + 1;
      return { value: String(n), label: `Phase ${n}` };
    }),
  ];

  const gateOptions: { value: string; label: string }[] = [
    { value: "all", label: "All gates" },
    ...["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"].map((g) => ({
      value: g,
      label: g,
    })),
  ];

  const typeOptions: { value: EvidenceFilters["type"]; label: string }[] = [
    { value: "all", label: "All types" },
    { value: "pdf", label: "PDF" },
    { value: "spreadsheet", label: "Spreadsheet" },
    { value: "document", label: "Document" },
    { value: "image", label: "Image" },
    { value: "link", label: "Link" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "report", label: "Report" },
  ];

  const statusOptions: { value: EvidenceFilters["status"]; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "linked", label: "Linked" },
    { value: "partially_linked", label: "Partially linked" },
    { value: "unlinked", label: "Unlinked" },
    { value: "archived", label: "Archived" },
  ];

  const linkingOptions: { value: EvidenceFilters["linking"]; label: string }[] = [
    { value: "all", label: "Any link state" },
    { value: "linked_or_partial", label: "Linked or partially linked" },
    { value: "unlinked_only", label: "Unlinked only" },
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "fixed inset-y-0 right-0 z-50 m-0 ml-auto flex h-full max-h-none w-[min(100vw-1rem,420px)] max-w-none flex-col rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/30",
      )}
      aria-labelledby="evidence-filters-drawer-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Evidence</p>
          <h2 id="evidence-filters-drawer-title" className="text-lg font-semibold text-slate-900">
            Filters
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div>
          <span className={labelClass}>Evidence type</span>
          <select
            aria-label="Evidence type"
            className={inputClass}
            value={draft.type}
            onChange={(e) => set("type", e.target.value as EvidenceFilters["type"])}
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Evidence status</span>
          <select
            aria-label="Evidence status"
            className={inputClass}
            value={draft.status}
            onChange={(e) => set("status", e.target.value as EvidenceFilters["status"])}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Phase</span>
          <select
            aria-label="Phase"
            className={inputClass}
            value={draft.phase}
            onChange={(e) => set("phase", e.target.value)}
          >
            {phaseOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Gate</span>
          <select
            aria-label="Gate"
            className={inputClass}
            value={draft.gate}
            onChange={(e) => set("gate", e.target.value === "all" ? "all" : e.target.value.toUpperCase())}
          >
            {gateOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Artifact</span>
          <select
            aria-label="Artifact"
            className={inputClass}
            value={draft.artifactId}
            onChange={(e) => set("artifactId", e.target.value as EvidenceFilters["artifactId"])}
          >
            <option value="all">All artifacts</option>
            {artifactOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Classification</span>
          <select
            aria-label="Classification"
            className={inputClass}
            value={draft.classification}
            onChange={(e) =>
              set("classification", e.target.value as EvidenceFilters["classification"])
            }
          >
            <option value="all">All classifications</option>
            {EVIDENCE_CLASSIFICATIONS.map((c) => (
              <option key={c} value={c}>
                {classificationLabel(c)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Uploaded by (contains)</span>
          <input
            type="text"
            className={inputClass}
            value={draft.uploadedByContains}
            onChange={(e) => set("uploadedByContains", e.target.value)}
            placeholder="Name substring"
            aria-label="Uploaded by filter"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Uploaded from
            <input
              type="date"
              className={inputClass}
              value={draft.uploadedFrom}
              onChange={(e) => set("uploadedFrom", e.target.value)}
              aria-label="Uploaded date from"
            />
          </label>
          <label className={labelClass}>
            Uploaded to
            <input
              type="date"
              className={inputClass}
              value={draft.uploadedTo}
              onChange={(e) => set("uploadedTo", e.target.value)}
              aria-label="Uploaded date to"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Completeness min (%)
            <input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              className={inputClass}
              value={draft.completenessMin}
              onChange={(e) => set("completenessMin", e.target.value)}
              placeholder="0"
              aria-label="Minimum completeness percent"
            />
          </label>
          <label className={labelClass}>
            Completeness max (%)
            <input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              className={inputClass}
              value={draft.completenessMax}
              onChange={(e) => set("completenessMax", e.target.value)}
              placeholder="100"
              aria-label="Maximum completeness percent"
            />
          </label>
        </div>

        <div>
          <span className={labelClass}>Linked / unlinked</span>
          <select
            aria-label="Linked state"
            className={inputClass}
            value={draft.linking}
            onChange={(e) => set("linking", e.target.value as EvidenceFilters["linking"])}
          >
            {linkingOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const cleared = { ...defaultEvidenceFilters(), search: draft.search };
            setDraft(cleared);
            onApply(cleared);
            onClose();
          }}
        >
          Reset filters
        </Button>
        <Button
          type="button"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          Apply
        </Button>
      </footer>
    </dialog>
  );
}
