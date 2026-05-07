"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z } from "zod";

import type { AnyLifecycleTemplate, TemplateField } from "@/templates/types";

type DynamicFormProps = {
  template: AnyLifecycleTemplate;
  defaultValues?: Partial<Record<string, unknown>>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  submitLabel?: string;
};

export function DynamicForm({
  template,
  defaultValues,
  onSubmit,
  submitLabel = "Save Artifact",
}: DynamicFormProps) {
  type FormData = z.infer<typeof template.schema>;

  const normalizedDefaults = useMemo(() => {
    const values: Record<string, unknown> = {};

    for (const section of template.sections) {
      for (const field of section.fields) {
        values[field.name] = getDefaultValue(field);
      }
    }

    return {
      ...values,
      ...defaultValues,
    } as DefaultValues<FormData>;
  }, [template.sections, defaultValues]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // Zod v4 input/output variance vs @hookform/resolvers — runtime types align.
    resolver: zodResolver(template.schema) as never,
    defaultValues: normalizedDefaults,
    mode: "onBlur",
  });

  const submitHandler: SubmitHandler<FormData> = async (data) => {
    await onSubmit(data as Record<string, unknown>);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {template.templateId} · Phase {template.phase}
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          {template.title}
        </h1>

        {template.gate ? (
          <p className="text-sm text-muted-foreground">
            Gate evidence for {template.gate}
          </p>
        ) : null}
      </header>

      {template.sections.map((section) => (
        <section
          key={section.id}
          className="rounded-2xl border bg-card p-5 shadow-sm"
        >
          <div className="mb-5 space-y-1">
            <h2 className="text-lg font-semibold">
              {section.id}. {section.title}
            </h2>

            {section.description ? (
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5">
            {section.fields.map((field) => {
              const errorMessage = errors[field.name]?.message;

              return (
                <div key={field.name} className="grid gap-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none"
                  >
                    {field.label}
                    {field.required ? (
                      <span className="text-destructive"> *</span>
                    ) : null}
                  </label>

                  {field.description ? (
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  ) : null}

                  <FieldRenderer
                    field={field}
                    register={register}
                  />

                  {typeof errorMessage === "string" ? (
                    <p className="text-sm font-medium text-destructive">
                      {errorMessage}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function FieldRenderer<TFormData extends FieldValues>({
  field,
  register,
}: {
  field: TemplateField;
  register: ReturnType<typeof useForm<TFormData>>["register"];
}) {
  const commonClassName =
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const fieldName = field.name as Path<TFormData>;

  if (field.type === "textarea") {
    return (
      <textarea
        id={field.name}
        rows={5}
        placeholder={field.placeholder}
        className={commonClassName}
        {...register(fieldName)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={field.name}
        className={commonClassName}
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
        {...register(fieldName)}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <input
        id={field.name}
        type="checkbox"
        className="h-4 w-4 rounded border"
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
      {...register(fieldName)}
    />
  );
}

function getDefaultValue(field: TemplateField): unknown {
  if (field.type === "checkbox") return false;
  if (field.type === "tags") return [];
  if (field.type === "number") return undefined;

  return "";
}