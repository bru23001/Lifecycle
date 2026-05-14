"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, FileText, Link2, Search, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  WizardEvidenceItem,
  WizardEvidenceTarget,
} from "@/types/template-wizard.types";

const evidenceTypeOptions: { value: WizardEvidenceItem["evidenceType"]; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "link", label: "Link" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "report", label: "Report" },
];

export type LinkEvidenceModalProps = {
  open: boolean;
  initialTarget: WizardEvidenceTarget | null;
  catalog: WizardEvidenceItem[];
  alreadyLinkedIds: string[];
  sections: { id: string; title: string }[];
  fields: { name: string; label: string; sectionId: string }[];
  artifactTitle: string;
  phaseOptions: { number: number; label: string }[];
  gateOptions: { code: string; label: string }[];
  onClose: () => void;
  onConfirm: (evidenceIds: string[], target: WizardEvidenceTarget) => void;
  onSwitchToUpload: (target: WizardEvidenceTarget) => void;
};

export function LinkEvidenceModal({
  open,
  initialTarget,
  catalog,
  alreadyLinkedIds,
  sections,
  fields,
  artifactTitle,
  phaseOptions,
  gateOptions,
  onClose,
  onConfirm,
  onSwitchToUpload,
}: LinkEvidenceModalProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<WizardEvidenceItem["evidenceType"] | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [gateFilter, setGateFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetKind, setTargetKind] = useState<WizardEvidenceTarget["kind"]>("artifact");
  const [targetFieldName, setTargetFieldName] = useState<string>("");
  const [targetSectionId, setTargetSectionId] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setTypeFilter("all");
    setPhaseFilter("all");
    setGateFilter("all");
    setSelected(new Set());
    if (initialTarget) {
      setTargetKind(initialTarget.kind);
      if (initialTarget.kind === "field") setTargetFieldName(initialTarget.fieldName);
      if (initialTarget.kind === "section") setTargetSectionId(initialTarget.sectionId);
    } else {
      setTargetKind("artifact");
    }
    const id = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open, initialTarget]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (typeFilter !== "all" && item.evidenceType !== typeFilter) return false;
      if (phaseFilter !== "all" && String(item.phaseNumber ?? "") !== phaseFilter) return false;
      if (gateFilter !== "all" && (item.gateCode ?? "") !== gateFilter) return false;
      if (q) {
        const hay = `${item.name} ${item.evidenceCode} ${item.description ?? ""} ${item.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [catalog, gateFilter, phaseFilter, search, typeFilter]);

  const selectedItems = useMemo(
    () => catalog.filter((item) => selected.has(item.id)),
    [catalog, selected],
  );

  const resolvedTarget: WizardEvidenceTarget | null = useMemo(() => {
    if (targetKind === "artifact") return { kind: "artifact" };
    if (targetKind === "section" && targetSectionId)
      return { kind: "section", sectionId: targetSectionId };
    if (targetKind === "field" && targetFieldName)
      return { kind: "field", fieldName: targetFieldName };
    return null;
  }, [targetKind, targetFieldName, targetSectionId]);

  const canConfirm = selected.size > 0 && resolvedTarget != null;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-evidence-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        data-testid="link-evidence-modal"
        className="relative flex max-h-[88vh] w-[min(100vw-2rem,1024px)] flex-col overflow-hidden rounded-2xl border bg-card shadow-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Evidence
            </p>
            <h2 id="link-evidence-modal-title" className="mt-1 text-lg font-semibold text-foreground">
              Link Evidence
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Search the evidence catalog and select one or more items, or upload a new evidence item.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[1fr_320px]">
          <div className="flex min-h-0 flex-col overflow-hidden">
            <div className="grid gap-2 border-b border-border px-6 py-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, code, tag…"
                  className="w-full rounded-md border border-input bg-background py-1.5 pl-7 pr-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  data-testid="link-evidence-search"
                />
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as WizardEvidenceItem["evidenceType"] | "all")
                }
                className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                aria-label="Filter by evidence type"
              >
                <option value="all">All types</option>
                {evidenceTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                aria-label="Filter by phase"
              >
                <option value="all">All phases</option>
                {phaseOptions.map((p) => (
                  <option key={p.number} value={String(p.number)}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select
                value={gateFilter}
                onChange={(e) => setGateFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                aria-label="Filter by gate"
              >
                <option value="all">All gates</option>
                {gateOptions.map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
              {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center text-xs text-muted-foreground">
                  <FileText className="mx-auto mb-2 size-5 text-muted-foreground/60" aria-hidden />
                  <p>No evidence matches your filters.</p>
                  <button
                    type="button"
                    onClick={() => resolvedTarget && onSwitchToUpload(resolvedTarget)}
                    disabled={!resolvedTarget}
                    className="mt-3 inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="size-3" aria-hidden />
                    Upload new evidence
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((item) => {
                    const isSelected = selected.has(item.id);
                    const isAlreadyLinked = alreadyLinkedIds.includes(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          aria-pressed={isSelected}
                          data-testid={`link-evidence-row-${item.id}`}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left transition",
                            isSelected
                              ? "border-ring bg-accent"
                              : "border-border bg-card hover:bg-muted/50",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                              isSelected ? "border-ring bg-primary text-primary-foreground" : "border-input",
                            )}
                            aria-hidden
                          >
                            {isSelected ? <Check className="size-3" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">
                                {item.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {item.evidenceCode}
                              </span>
                              {isAlreadyLinked ? (
                                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Already linked
                                </span>
                              ) : null}
                            </span>
                            {item.description ? (
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            ) : null}
                            <span className="mt-1 flex flex-wrap gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                              <span>{item.evidenceType}</span>
                              <span>·</span>
                              <span>{item.classification}</span>
                              {item.phaseNumber ? (
                                <>
                                  <span>·</span>
                                  <span>Phase {item.phaseNumber}</span>
                                </>
                              ) : null}
                              {item.gateCode ? (
                                <>
                                  <span>·</span>
                                  <span>{item.gateCode}</span>
                                </>
                              ) : null}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <aside className="flex min-h-0 flex-col border-t border-border lg:border-l lg:border-t-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Link target
              </h3>
              <div className="mt-2 space-y-1.5 text-xs">
                <TargetRadio
                  checked={targetKind === "artifact"}
                  label={`Artifact · ${artifactTitle}`}
                  onSelect={() => setTargetKind("artifact")}
                />
                <TargetRadio
                  checked={targetKind === "section"}
                  label="Section"
                  onSelect={() => setTargetKind("section")}
                />
                {targetKind === "section" ? (
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="ml-5 mt-1 w-[calc(100%-1.25rem)] rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    <option value="">Select section…</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                ) : null}
                <TargetRadio
                  checked={targetKind === "field"}
                  label="Field"
                  onSelect={() => setTargetKind("field")}
                />
                {targetKind === "field" ? (
                  <select
                    value={targetFieldName}
                    onChange={(e) => setTargetFieldName(e.target.value)}
                    className="ml-5 mt-1 w-[calc(100%-1.25rem)] rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    <option value="">Select field…</option>
                    {fields.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Selected ({selected.size})
              </h3>
              {selectedItems.length === 0 ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Select one or more evidence items to link.
                </p>
              ) : (
                <ul className="mt-1.5 space-y-1.5">
                  {selectedItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      <Link2 className="size-3 text-muted-foreground" aria-hidden />
                      <span className="flex-1 truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                        aria-label={`Deselect ${item.name}`}
                      >
                        <X className="size-3" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => resolvedTarget && onSwitchToUpload(resolvedTarget)}
                disabled={!resolvedTarget}
                className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="link-evidence-switch-to-upload"
              >
                <Upload className="size-3" aria-hidden />
                Upload new evidence instead
              </button>
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm || !resolvedTarget) return;
              onConfirm(Array.from(selected), resolvedTarget);
            }}
            data-testid="link-evidence-confirm"
          >
            Link evidence ({selected.size})
          </Button>
        </footer>
      </div>
    </div>
  );
}

function TargetRadio({
  checked,
  label,
  onSelect,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        checked={checked}
        onChange={onSelect}
        className="size-3 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}
