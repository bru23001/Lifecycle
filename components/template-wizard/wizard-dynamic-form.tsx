"use client";

import { useState } from "react";
import { Link2, Maximize2, MessageSquare, Upload } from "lucide-react";

import type {
  DynamicField,
  TemplateSection,
  WizardPopoverAnchorRect,
  WizardScoreMatrix,
} from "@/types/template-wizard.types";

import { EvidenceChipList } from "@/components/template-wizard/evidence-chip-list";
import { ExpandedFieldEditorModal } from "@/components/template-wizard/expanded-field-editor-modal";
import { FieldHelpPopover } from "@/components/template-wizard/field-help-popover";
import { ScoreMatrixField } from "@/components/template-wizard/score-matrix-field";
import { useWizardEvidenceForTarget } from "@/components/template-wizard/wizard-evidence-context";

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
  onFieldComment,
}: {
  section: TemplateSection;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  idPrefix: string;
  onChange: (fieldName: string, value: unknown) => void;
  onBlur?: (fieldName: string) => void;
  onFieldComment?: (fieldName: string, anchor: WizardPopoverAnchorRect) => void;
}) {
  return (
    <div className="space-y-6">
      {section.fields.map((field) => (
        <div key={field.id} data-field-target={field.name}>
          <FieldControl
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            idPrefix={`${idPrefix}-${field.name}`}
            onChange={(v) => onChange(field.name, v)}
            onBlur={() => onBlur?.(field.name)}
            onFieldComment={
              onFieldComment
                ? (anchor) => onFieldComment(field.name, anchor)
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}

function rectFromButton(event: React.MouseEvent<HTMLButtonElement>): WizardPopoverAnchorRect {
  const r = event.currentTarget.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    bottom: r.bottom,
    right: r.right,
    width: r.width,
    height: r.height,
  };
}

function FieldControl({
  field,
  value,
  error,
  idPrefix,
  onChange,
  onBlur,
  onFieldComment,
}: {
  field: DynamicField;
  value: unknown;
  error?: string;
  idPrefix: string;
  onChange: (v: unknown) => void;
  onBlur: () => void;
  onFieldComment?: (anchor: WizardPopoverAnchorRect) => void;
}) {
  const [expandedOpen, setExpandedOpen] = useState(false);
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
        {onFieldComment ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => onFieldComment(rectFromButton(e))}
              data-testid={`field-comment-open-${field.name}`}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2563eb]/40 px-2 py-0.5 text-[11px] font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
            >
              <MessageSquare className="size-3" aria-hidden />
              Comment
            </button>
          </div>
        ) : null}
        <ScoreMatrixField idPrefix={idPrefix} value={matrix} onChange={onChange} />
        {error ? (
          <p id={errId} className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (field.type === "evidence_link") {
    return (
      <EvidenceLinkFieldControl
        field={field}
        error={error}
        errId={errId}
        onFieldComment={onFieldComment}
      />
    );
  }

  const describedBy = error ? errId : undefined;
  const showExpand = field.expandable && field.type === "textarea";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
          {field.label}
          {field.required ? (
            <span className="text-destructive" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </label>
        <FieldHelpPopover
          fieldName={field.name}
          fieldLabel={field.label}
          content={field.helpPopover}
          helpText={field.helpText}
        />
        {onFieldComment ? (
          <button
            type="button"
            onClick={(e) => onFieldComment(rectFromButton(e))}
            data-testid={`field-comment-open-${field.name}`}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2563eb]/40 px-2 py-0.5 text-[11px] font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            <MessageSquare className="size-3" aria-hidden />
            Comment
          </button>
        ) : null}
        {showExpand ? (
          <button
            type="button"
            onClick={() => setExpandedOpen(true)}
            data-testid={`expand-field-${field.name}`}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2563eb]/40 px-2 py-0.5 text-[11px] font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            <Maximize2 className="size-3" aria-hidden />
            Expand
          </button>
        ) : null}
      </div>
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

      {showExpand ? (
        <ExpandedFieldEditorModal
          open={expandedOpen}
          fieldLabel={field.label}
          fieldName={field.name}
          helpText={field.helpText}
          initialValue={typeof value === "string" ? value : ""}
          required={field.required}
          onSave={(v) => onChange(v)}
          onClose={() => setExpandedOpen(false)}
        />
      ) : null}
    </div>
  );
}

function EvidenceLinkFieldControl({
  field,
  error,
  errId,
  onFieldComment,
}: {
  field: DynamicField;
  error?: string;
  errId: string;
  onFieldComment?: (anchor: WizardPopoverAnchorRect) => void;
}) {
  const target = { kind: "field" as const, fieldName: field.name };
  const { controller, items } = useWizardEvidenceForTarget(target);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="block text-sm font-semibold text-foreground">
          {field.label}
          {field.required ? (
            <span className="text-destructive" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </span>
        <FieldHelpPopover
          fieldName={field.name}
          fieldLabel={field.label}
          content={field.helpPopover}
          helpText={field.helpText}
        />
        {onFieldComment ? (
          <button
            type="button"
            onClick={(e) => onFieldComment(rectFromButton(e))}
            data-testid={`field-comment-open-${field.name}`}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2563eb]/40 px-2 py-0.5 text-[11px] font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            <MessageSquare className="size-3" aria-hidden />
            Comment
          </button>
        ) : null}
      </div>
      {field.helpText ? (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      ) : null}

      <EvidenceChipList
        items={items}
        target={target}
        emptyMessage="No evidence linked yet."
        onOpenDetail={controller.openDetail}
        onRequestUnlink={controller.requestUnlink}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => controller.openLinkModal(target)}
          data-testid={`evidence-link-button-${field.name}`}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Link2 className="size-3" aria-hidden />
          Link evidence
        </button>
        <button
          type="button"
          onClick={() => controller.openUploadModal(target)}
          data-testid={`evidence-upload-button-${field.name}`}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2563eb]/40 px-2.5 py-1 text-xs font-semibold text-[#2563eb] hover:bg-[#eff6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Upload className="size-3" aria-hidden />
          Upload evidence
        </button>
      </div>

      {error ? (
        <p id={errId} className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
