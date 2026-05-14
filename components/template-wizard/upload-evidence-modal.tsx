"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

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
  { value: "link", label: "Link / URL" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "report", label: "Report" },
];

const classificationOptions: { value: WizardEvidenceItem["classification"]; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
  { value: "confidential", label: "Confidential" },
  { value: "restricted", label: "Restricted" },
];

export type UploadEvidenceDraft = {
  name: string;
  evidenceType: WizardEvidenceItem["evidenceType"];
  classification: WizardEvidenceItem["classification"];
  source?: string;
  retentionPolicyLabel?: string;
  tags: string[];
  phaseNumber?: number;
  phaseName?: string;
  gateCode?: string;
  description?: string;
  declaredFileName?: string;
};

export type UploadEvidenceModalProps = {
  open: boolean;
  initialTarget: WizardEvidenceTarget | null;
  sections: { id: string; title: string }[];
  fields: { name: string; label: string; sectionId: string }[];
  artifactTitle: string;
  defaultPhaseNumber: number;
  defaultPhaseName: string;
  defaultGateCode?: string;
  phaseOptions: { number: number; name: string }[];
  gateOptions: { code: string; label: string }[];
  retentionPolicyOptions: string[];
  onClose: () => void;
  onUpload: (draft: UploadEvidenceDraft, target: WizardEvidenceTarget) => void;
};

export function UploadEvidenceModal({
  open,
  initialTarget,
  sections,
  fields,
  artifactTitle,
  defaultPhaseNumber,
  defaultPhaseName,
  defaultGateCode,
  phaseOptions,
  gateOptions,
  retentionPolicyOptions,
  onClose,
  onUpload,
}: UploadEvidenceModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [evidenceType, setEvidenceType] = useState<WizardEvidenceItem["evidenceType"]>("document");
  const [classification, setClassification] =
    useState<WizardEvidenceItem["classification"]>("internal");
  const [source, setSource] = useState("");
  const [retention, setRetention] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [phaseNumber, setPhaseNumber] = useState<string>(String(defaultPhaseNumber));
  const [gateCode, setGateCode] = useState<string>(defaultGateCode ?? "");
  const [description, setDescription] = useState("");
  const [targetKind, setTargetKind] = useState<WizardEvidenceTarget["kind"]>("artifact");
  const [targetFieldName, setTargetFieldName] = useState("");
  const [targetSectionId, setTargetSectionId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setName("");
    setEvidenceType("document");
    setClassification("internal");
    setSource("");
    setRetention("");
    setTagsInput("");
    setPhaseNumber(String(defaultPhaseNumber));
    setGateCode(defaultGateCode ?? "");
    setDescription("");
    setError(null);
    if (initialTarget) {
      setTargetKind(initialTarget.kind);
      if (initialTarget.kind === "field") setTargetFieldName(initialTarget.fieldName);
      if (initialTarget.kind === "section") setTargetSectionId(initialTarget.sectionId);
    } else {
      setTargetKind("artifact");
    }
  }, [open, initialTarget, defaultPhaseNumber, defaultGateCode]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsInput],
  );

  const resolvedTarget: WizardEvidenceTarget | null = useMemo(() => {
    if (targetKind === "artifact") return { kind: "artifact" };
    if (targetKind === "section" && targetSectionId)
      return { kind: "section", sectionId: targetSectionId };
    if (targetKind === "field" && targetFieldName)
      return { kind: "field", fieldName: targetFieldName };
    return null;
  }, [targetKind, targetFieldName, targetSectionId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Evidence name is required.");
      return;
    }
    if (evidenceType !== "link" && !file) {
      setError("Choose a file to upload, or switch evidence type to Link.");
      return;
    }
    if (!resolvedTarget) {
      setError("Select a link target.");
      return;
    }
    const phaseN = Number.parseInt(phaseNumber, 10);
    const phase = phaseOptions.find((p) => p.number === phaseN);
    const draft: UploadEvidenceDraft = {
      name: name.trim(),
      evidenceType,
      classification,
      source: source.trim() || undefined,
      retentionPolicyLabel: retention.trim() || undefined,
      tags,
      phaseNumber: Number.isFinite(phaseN) ? phaseN : defaultPhaseNumber,
      phaseName: phase?.name ?? defaultPhaseName,
      gateCode: gateCode.trim() || undefined,
      description: description.trim() || undefined,
      declaredFileName: file?.name,
    };
    onUpload(draft, resolvedTarget);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-evidence-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        data-testid="upload-evidence-modal"
        className="relative flex max-h-[88vh] w-[min(100vw-2rem,720px)] flex-col overflow-hidden rounded-2xl border bg-card shadow-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Evidence
            </p>
            <h2
              id="upload-evidence-modal-title"
              className="mt-1 text-lg font-semibold text-foreground"
            >
              Upload Evidence
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Stage a new evidence item locally; it persists with the artifact when you save.
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-foreground">File</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
                aria-label="Choose file"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-input bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                <Upload className="size-3" aria-hidden />
                {file ? "Replace file" : "Choose file"}
              </button>
              {file ? (
                <span className="truncate text-xs text-muted-foreground">{file.name}</span>
              ) : evidenceType === "link" ? (
                <span className="text-xs text-muted-foreground">
                  Link-type evidence does not require a file.
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">No file selected.</span>
              )}
            </div>
          </div>

          <Field label="Evidence name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              data-testid="upload-evidence-name"
              className={inputClass}
              placeholder="Quarterly Risk Review — Q1 2026"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Evidence type" required>
              <select
                value={evidenceType}
                onChange={(e) =>
                  setEvidenceType(e.target.value as WizardEvidenceItem["evidenceType"])
                }
                className={inputClass}
              >
                {evidenceTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Classification" required>
              <select
                value={classification}
                onChange={(e) =>
                  setClassification(e.target.value as WizardEvidenceItem["classification"])
                }
                className={inputClass}
              >
                {classificationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Source">
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className={inputClass}
                placeholder="https://… or system name"
              />
            </Field>
            <Field label="Retention policy">
              {retentionPolicyOptions.length > 0 ? (
                <select
                  value={retention}
                  onChange={(e) => setRetention(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Inherit project default —</option>
                  {retentionPolicyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={retention}
                  onChange={(e) => setRetention(e.target.value)}
                  className={inputClass}
                  placeholder="Retain 7 years (audit)"
                />
              )}
            </Field>
          </div>

          <Field label="Tags">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className={inputClass}
              placeholder="risk, q1-2026, audit"
            />
            {tags.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Linked phase">
              <select
                value={phaseNumber}
                onChange={(e) => setPhaseNumber(e.target.value)}
                className={inputClass}
              >
                {phaseOptions.map((p) => (
                  <option key={p.number} value={String(p.number)}>
                    Phase {p.number} · {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Linked gate (optional)">
              {gateOptions.length > 0 ? (
                <select
                  value={gateCode}
                  onChange={(e) => setGateCode(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— None —</option>
                  {gateOptions.map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={gateCode}
                  onChange={(e) => setGateCode(e.target.value)}
                  className={inputClass}
                  placeholder="G3"
                />
              )}
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
              className={cn(inputClass, "min-h-[60px]")}
              placeholder="Short summary of what this evidence demonstrates."
            />
          </Field>

          <fieldset className="rounded-lg border border-border p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Link target
            </legend>
            <div className="mt-1 space-y-1.5 text-xs">
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
                  className={cn(inputClass, "ml-5 w-[calc(100%-1.25rem)]")}
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
                label="Artifact field"
                onSelect={() => setTargetKind("field")}
              />
              {targetKind === "field" ? (
                <select
                  value={targetFieldName}
                  onChange={(e) => setTargetFieldName(e.target.value)}
                  className={cn(inputClass, "ml-5 w-[calc(100%-1.25rem)]")}
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
          </fieldset>

          {error ? (
            <p
              role="alert"
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"
            >
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-6 py-3">
          <p className="text-[11px] text-muted-foreground">
            Uploads are staged locally and persist when you save the artifact.
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" data-testid="upload-evidence-submit">
              Upload evidence
            </Button>
          </div>
        </footer>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
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
