"use client";

import type { DynamicField, TemplateSection } from "@/types/template-wizard.types";
import type { WizardScoreMatrix } from "@/types/template-wizard.types";

import { ScoreMatrixField } from "@/components/template-wizard/score-matrix-field";

function isScoreMatrix(v: unknown): v is WizardScoreMatrix {
  return Boolean(v && typeof v === "object" && Array.isArray((v as WizardScoreMatrix).criteria));
}

export function WizardDynamicForm({
  section,
  values,
  errors,
  idPrefix,
  onChange,
  onBlur,
}: {
  section: TemplateSection;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  idPrefix: string;
  onChange: (fieldName: string, value: unknown) => void;
  onBlur?: (fieldName: string) => void;
}) {
  return (
    <div className="space-y-6">
      {section.fields.map((field) => (
        <FieldControl
          key={field.id}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          idPrefix={`${idPrefix}-${field.name}`}
          onChange={(v) => onChange(field.name, v)}
          onBlur={() => onBlur?.(field.name)}
        />
      ))}
    </div>
  );
}

function FieldControl({
  field,
  value,
  error,
  idPrefix,
  onChange,
  onBlur,
}: {
  field: DynamicField;
  value: unknown;
  error?: string;
  idPrefix: string;
  onChange: (v: unknown) => void;
  onBlur: () => void;
}) {
  const inputId = `${idPrefix}-input`;
  const errId = `${idPrefix}-error`;

  if (field.type === "score_matrix") {
    const matrix = isScoreMatrix(value) ? value : undefined;
    if (!matrix) {
      return (
        <p className="text-sm text-destructive" role="alert">
          Scoring matrix state is invalid.
        </p>
      );
    }
    return (
      <div className="space-y-2">
        <ScoreMatrixField idPrefix={idPrefix} value={matrix} onChange={onChange} />
        {error ? (
          <p id={errId} className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const describedBy = error ? errId : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
        {field.label}
        {field.required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {field.helpText ? (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          id={inputId}
          rows={5}
          className="min-h-[120px] w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      ) : null}

      {field.type === "text" ? (
        <input
          id={inputId}
          type="text"
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      ) : null}

      {field.type === "number" ? (
        <input
          id={inputId}
          type="number"
          className="h-10 w-full max-w-xs rounded-lg border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(Number.parseFloat(e.target.value))}
          onBlur={onBlur}
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      ) : null}

      {field.type === "select" && field.options ? (
        <select
          id={inputId}
          className="h-10 w-full max-w-md rounded-lg border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        >
          <option value="">Select…</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "date" ? (
        <input
          id={inputId}
          type="date"
          className="h-10 w-full max-w-xs rounded-lg border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      ) : null}

      {field.type === "checkbox" ? (
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="checkbox"
            className="h-4 w-4 rounded border border-input accent-primary"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            aria-required={field.required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          />
        </div>
      ) : null}

      {error ? (
        <p id={errId} className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
