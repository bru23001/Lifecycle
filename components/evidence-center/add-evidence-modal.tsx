"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Upload, X } from "lucide-react";

import { createEvidenceItem } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import {
  buildAddEvidenceInput,
  classificationLabel,
  EVIDENCE_CLASSIFICATIONS,
  EVIDENCE_FORM_TYPES,
  emptyAddEvidenceFormState,
  type AddEvidenceFormState,
  type EvidenceClassification,
  type EvidenceFormType,
} from "@/lib/add-evidence-form";
import { cn } from "@/lib/utils";

export type AddEvidenceLinkedArtifactOption = { id: string; label: string };

type Props = {
  open: boolean;
  projectId: string;
  /** Optional artifact dropdown options. When empty, the field is a free-text input. */
  artifactOptions?: AddEvidenceLinkedArtifactOption[];
  onClose: () => void;
  /** Optional success callback (e.g. revalidate / navigate to the new evidence). */
  onSuccess?: (evidenceId: string) => void;
  /** `page` — embedded card for `/evidence/new` (no modal chrome). */
  presentation?: "modal" | "page";
};

type Tab = "link" | "upload";

/**
 * "Add Evidence" modal — UI surface for `createEvidenceItem`.
 *
 *  - **Upload tab**: documented as future work; STD-SEC-002 + STD-DAT-001 require a
 *    classified upload pipeline that this repository doesn't yet have.
 *  - **Link tab**: collects link metadata + classification + phase / gate /
 *    artifact context and submits via the existing server action (which is
 *    the trust boundary; client validation is UX only).
 */
export function AddEvidenceModal({
  open,
  projectId,
  artifactOptions,
  onClose,
  onSuccess,
  presentation = "modal",
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AddEvidenceFormState>(() =>
    emptyAddEvidenceFormState(),
  );
  const [tab, setTab] = useState<Tab>("link");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presentation === "page") return;
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, presentation]);

  useEffect(() => {
    if (!open) return;
    setState(emptyAddEvidenceFormState());
    setTab("link");
    setError(null);
  }, [open]);

  function updateField<K extends keyof AddEvidenceFormState>(
    field: K,
    value: AddEvidenceFormState[K],
  ) {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "upload") {
      setError(
        "File upload is not available yet. Use the Link tab to attach evidence via URL.",
      );
      return;
    }
    const result = buildAddEvidenceInput(state, projectId);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setError(null);
    startTransition(async () => {
      const response = await createEvidenceItem({
        ...result.value,
        gateCode: result.value.gateCode ?? null,
      });
      if (response.ok) {
        onSuccess?.(response.evidenceId);
        router.refresh();
        onClose();
      } else {
        setError(response.error);
      }
    });
  }

  const formClass =
    presentation === "page"
      ? "flex min-h-0 max-h-[min(100vh,920px)] flex-col"
      : "flex max-h-[85vh] flex-col";

  const form = (
    <form className={formClass} onSubmit={handleSubmit}>
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Evidence
          </p>
          <h2
            id="add-evidence-modal-title"
            className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
          >
            Add Evidence
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Upload coming soon — link external evidence and attach metadata for
            now.
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

      <div
        role="tablist"
        className="flex gap-1 border-b border-slate-200 px-6 dark:border-border"
      >
        <TabButton
          active={tab === "upload"}
          onClick={() => setTab("upload")}
          icon={<Upload className="size-3.5" aria-hidden />}
          label="Upload file"
          sublabel="Coming soon"
        />
        <TabButton
          active={tab === "link"}
          onClick={() => setTab("link")}
          icon={<Link2 className="size-3.5" aria-hidden />}
          label="Add external link"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5 text-sm">
        {tab === "upload" ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            <Upload
              className="mx-auto mb-2 size-6 text-slate-400"
              aria-hidden
            />
            <p className="font-medium text-slate-800">
              File upload is not available yet.
            </p>
            <p className="mt-1 text-xs">
              Switch to <strong>Add external link</strong> to attach evidence
              via URL with full metadata. A classified upload pipeline
              (STD-SEC-002 + STD-DAT-001) will follow in a future release.
            </p>
          </div>
        ) : (
          <>
            <Field id="name" label="Name" required>
              <input
                id="name"
                type="text"
                value={state.name}
                maxLength={200}
                required
                onChange={(e) => updateField("name", e.target.value)}
                className={inputClass}
                placeholder="Quarterly Audit Report — Q1 2026"
              />
            </Field>

            <Field id="description" label="Description">
              <textarea
                id="description"
                value={state.description}
                maxLength={8000}
                onChange={(e) => updateField("description", e.target.value)}
                className={cn(inputClass, "min-h-[60px]")}
                placeholder="Short summary of what this evidence demonstrates."
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="evidenceType" label="Evidence type" required>
                <select
                  id="evidenceType"
                  value={state.evidenceType}
                  onChange={(e) =>
                    updateField(
                      "evidenceType",
                      e.target.value as EvidenceFormType,
                    )
                  }
                  className={inputClass}
                >
                  {EVIDENCE_FORM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="classification" label="Classification" required>
                <select
                  id="classification"
                  value={state.classification}
                  onChange={(e) =>
                    updateField(
                      "classification",
                      e.target.value as EvidenceClassification,
                    )
                  }
                  className={inputClass}
                >
                  {EVIDENCE_CLASSIFICATIONS.map((c) => (
                    <option key={c} value={c}>
                      {classificationLabel(c)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              id="sourceUrl"
              label={
                state.evidenceType === "link"
                  ? "Source URL"
                  : "Source URL (optional)"
              }
              required={state.evidenceType === "link"}
            >
              <input
                id="sourceUrl"
                type="url"
                value={state.sourceUrl}
                maxLength={2000}
                required={state.evidenceType === "link"}
                onChange={(e) => updateField("sourceUrl", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </Field>

            <Field id="declaredFileName" label="Declared file name (optional)">
              <input
                id="declaredFileName"
                type="text"
                value={state.declaredFileName}
                maxLength={500}
                onChange={(e) =>
                  updateField("declaredFileName", e.target.value)
                }
                className={inputClass}
                placeholder="audit-q1-2026.pdf"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="phaseNumber" label="Linked phase (1–14)">
                <input
                  id="phaseNumber"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={14}
                  value={state.phaseNumber}
                  onChange={(e) => updateField("phaseNumber", e.target.value)}
                  className={inputClass}
                  placeholder="3"
                />
              </Field>
              <Field id="gateCode" label="Linked gate (G1–G9)">
                <input
                  id="gateCode"
                  type="text"
                  value={state.gateCode}
                  maxLength={4}
                  onChange={(e) => updateField("gateCode", e.target.value)}
                  className={inputClass}
                  placeholder="G3"
                />
              </Field>
            </div>

            <Field id="linkedArtifactId" label="Linked artifact (optional)">
              {artifactOptions && artifactOptions.length > 0 ? (
                <select
                  id="linkedArtifactId"
                  value={state.linkedArtifactId}
                  onChange={(e) =>
                    updateField("linkedArtifactId", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">— None —</option>
                  {artifactOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="linkedArtifactId"
                  type="text"
                  value={state.linkedArtifactId}
                  onChange={(e) =>
                    updateField("linkedArtifactId", e.target.value)
                  }
                  className={inputClass}
                  placeholder="art_…"
                />
              )}
            </Field>

            <Field id="notes" label="Notes (optional)">
              <textarea
                id="notes"
                value={state.notes}
                maxLength={8000}
                onChange={(e) => updateField("notes", e.target.value)}
                className={cn(inputClass, "min-h-[60px]")}
              />
            </Field>
          </>
        )}

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"
          >
            {error}
          </p>
        ) : null}
      </div>

      <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending || tab === "upload"}>
          {pending ? "Saving…" : "Save evidence"}
        </Button>
      </footer>
    </form>
  );

  if (presentation === "page") {
    if (!open) return null;
    return (
      <div
        className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card"
        aria-labelledby="add-evidence-modal-title"
      >
        {form}
      </div>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="add-evidence-modal-title"
    >
      {form}
    </dialog>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block text-xs font-medium text-slate-700">
      <span className="flex items-center gap-1">
        {label}
        {required ? <span className="text-rose-600">*</span> : null}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm",
        active
          ? "border-blue-600 text-blue-700"
          : "border-transparent text-slate-600 hover:text-slate-900",
      )}
    >
      {icon}
      <span>{label}</span>
      {sublabel ? (
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          · {sublabel}
        </span>
      ) : null}
    </button>
  );
}
