"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import {
  DefaultValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z } from "zod";

import {
  buildTemplateDefaultValues,
  FieldRenderer,
} from "@/components/ui/template-form-fields";
import type { AnyLifecycleTemplate } from "@/templates/types";

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
    return {
      ...buildTemplateDefaultValues(template),
      ...defaultValues,
    } as DefaultValues<FormData>;
  }, [template, defaultValues]);

  const {
    register,
    control,
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
                    control={control}
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
