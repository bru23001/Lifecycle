"use client";

import {
  Controller,
  type ArrayPath,
  type Control,
  type FieldValues,
  type Path,
  type UseFormRegister,
  useFieldArray,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { rowFieldDefault } from "@/lib/templateDefaultValues";
import type {
  RepeaterRowField,
  TemplateField,
} from "@/templates/types";

export { buildTemplateDefaultValues } from "@/lib/templateDefaultValues";

function RepeaterBlock<TFormData extends FieldValues>({
  field,
  control,
}: {
  field: Extract<TemplateField, { type: "repeater" }>;
  control: Control<TFormData>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.name as ArrayPath<TFormData>,
  });

  const rowTemplate = (): Record<string, unknown> => {
    const row: Record<string, unknown> = {};
    for (const rf of field.rowFields) {
      row[rf.name] = rowFieldDefault(rf);
    }
    return row;
  };

  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div
          key={item.id}
          className="rounded-xl border bg-muted/20 p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Row {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive"
            >
              Remove row
            </Button>
          </div>
          <div className="grid gap-3">
            {field.rowFields.map((rf) => (
              <RepeaterRowNative
                key={`${item.id}-${rf.name}`}
                control={control}
                baseName={`${String(field.name)}.${index}.${rf.name}`}
                rowField={rf}
              />
            ))}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          append(rowTemplate() as never);
        }}
        className="w-full border-dashed text-muted-foreground hover:text-foreground"
      >
        + Add row
      </Button>
      {field.minRows && fields.length < field.minRows ? (
        <p className="text-xs text-destructive">
          At least {field.minRows} row(s) required.
        </p>
      ) : null}
    </div>
  );
}

function RepeaterRowNative<TFormData extends FieldValues>({
  control,
  baseName,
  rowField,
}: {
  control: Control<TFormData>;
  baseName: string;
  rowField: RepeaterRowField;
}) {
  const commonClassName =
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <Controller
      control={control}
      name={baseName as Path<TFormData>}
      render={({ field: f }) => (
        <label className="grid gap-1 text-sm">
          <span className="font-medium">
            {rowField.label}
            {rowField.required ? (
              <span className="text-destructive"> *</span>
            ) : null}
          </span>
          {rowField.description ? (
            <span className="text-xs text-muted-foreground">
              {rowField.description}
            </span>
          ) : null}
          {rowField.type === "select" ? (
            <select {...f} className={commonClassName}>
              <option value="">Select...</option>
              {rowField.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : rowField.type === "textarea" ? (
            <textarea {...f} rows={3} className={commonClassName} />
          ) : rowField.type === "number" ? (
            <input
              type="number"
              {...f}
              value={f.value ?? ""}
              onChange={(e) =>
                f.onChange(
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
              className={commonClassName}
            />
          ) : rowField.type === "checkbox" ? (
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-input text-primary accent-primary"
              checked={Boolean(f.value)}
              onChange={(e) => f.onChange(e.target.checked)}
            />
          ) : (
            <input type="text" {...f} className={commonClassName} />
          )}
        </label>
      )}
    />
  );
}

function RefPickerControl<TFormData extends FieldValues>({
  field,
  control,
}: {
  field: Extract<TemplateField, { type: "refPicker" }>;
  control: Control<TFormData>;
}) {
  const name = field.name as Path<TFormData>;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: f }) => {
        const commonClassName =
          "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2";
        if (field.multi) {
          const arr = Array.isArray(f.value) ? (f.value as string[]) : [];
          return (
            <textarea
              className={commonClassName}
              rows={2}
              placeholder={
                field.placeholder ??
                "Comma-separated IDs (e.g. CRS-001, CRS-002)"
              }
              value={arr.join(", ")}
              onChange={(e) => {
                const raw = e.target.value;
                const parts = raw
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                f.onChange(parts);
              }}
            />
          );
        }
        return (
          <input
            type="text"
            className={commonClassName}
            placeholder={
              field.placeholder ?? "e.g. CRS-001"
            }
            value={typeof f.value === "string" ? f.value : ""}
            onChange={(e) => f.onChange(e.target.value)}
          />
        );
      }}
    />
  );
}

export function FieldRenderer<TFormData extends FieldValues>({
  field,
  register,
  control,
  invalid,
  errorId,
}: {
  field: TemplateField;
  register: UseFormRegister<TFormData>;
  control?: Control<TFormData>;
  /** When true, sets `aria-invalid` on applicable controls. */
  invalid?: boolean;
  /** Error message element id for `aria-describedby`. */
  errorId?: string;
}) {
  const commonClassName =
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const a11yProps =
    invalid === true
      ? ({ "aria-invalid": true as const, "aria-describedby": errorId } as const)
      : errorId
        ? { "aria-describedby": errorId }
        : {};

  if (field.type === "repeater") {
    if (!control) {
      return (
        <p className="text-sm text-destructive">
          Repeater requires form control (internal error).
        </p>
      );
    }
    return <RepeaterBlock field={field} control={control} />;
  }

  if (field.type === "refPicker") {
    if (!control) {
      return (
        <p className="text-sm text-destructive">
          Reference picker requires form control (internal error).
        </p>
      );
    }
    return <RefPickerControl field={field} control={control} />;
  }

  const fieldName = field.name as Path<TFormData>;

  if (field.type === "textarea") {
    return (
      <textarea
        id={field.name}
        rows={5}
        placeholder={field.placeholder}
        className={commonClassName}
        {...a11yProps}
        {...register(fieldName)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={field.name}
        className={commonClassName}
        {...a11yProps}
        {...register(fieldName)}
      >
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "number") {
    return (
      <input
        id={field.name}
        type="number"
        placeholder={field.placeholder}
        className={commonClassName}
        {...a11yProps}
        {...register(fieldName, { valueAsNumber: true })}
      />
    );
  }

  if (field.type === "date") {
    return (
      <input
        id={field.name}
        type="date"
        className={commonClassName}
        {...a11yProps}
        {...register(fieldName)}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <input
        id={field.name}
        type="checkbox"
        className="h-4 w-4 rounded border border-input text-primary accent-primary"
        {...a11yProps}
        {...register(fieldName)}
      />
    );
  }

  if (field.type === "tags") {
    return (
      <input
        id={field.name}
        type="text"
        placeholder={field.placeholder ?? "Comma-separated tags"}
        className={commonClassName}
        {...a11yProps}
        {...register(fieldName)}
      />
    );
  }

  return (
    <input
      id={field.name}
      type="text"
      placeholder={field.placeholder}
      className={commonClassName}
      {...a11yProps}
      {...register(fieldName)}
    />
  );
}
