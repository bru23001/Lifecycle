"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DefaultValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z } from "zod";

import { saveArtifact } from "@/app/actions/saveArtifact";
import {
  WizardMarkdownPreview,
  type SavedArtifactMeta,
} from "@/components/wizard-markdown-preview";
import { Button } from "@/components/ui/button";
import {
  buildTemplateDefaultValues,
  FieldRenderer,
} from "@/components/ui/template-form-fields";
import {
  clearWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
} from "@/lib/wizard-draft";
import { toUserMessage } from "@/lib/toUserMessage";
import { getTemplate } from "@/templates/registry";
import type { TemplateField } from "@/templates/types";

type PhaseWizardFormProps = {
  templateId: string;
  /** When saving artifacts against a specific project (enables relational sync + vault folder). */
  projectId?: string;
  /** Server-hydrated defaults (merged over template defaults). */
  serverDefaults?: Record<string, unknown>;
};

type AutosaveStatus = "idle" | "saving" | "saved";

function fieldLabelMap(sectionFields: TemplateField[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const f of sectionFields) {
    m.set(f.name, f.label);
  }
  return m;
}

export function PhaseWizardForm({
  templateId,
  projectId,
  serverDefaults,
}: PhaseWizardFormProps) {
  const template = useMemo(() => getTemplate(templateId), [templateId]);

  type FormData = z.infer<typeof template.schema>;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const parsedStep = stepParam !== null ? Number.parseInt(stepParam, 10) : 0;
  const sectionCount = template.sections.length;
  const stepIndex = useMemo(() => {
    if (!Number.isFinite(parsedStep) || parsedStep < 0) return 0;
    return Math.min(parsedStep, sectionCount - 1);
  }, [parsedStep, sectionCount]);

  const setStepIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, sectionCount - 1));
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(clamped));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, sectionCount],
  );

  const baseDefaults = useMemo(() => {
    const base = buildTemplateDefaultValues(template) as DefaultValues<FormData>;
    return {
      ...base,
      ...(serverDefaults as Partial<FormData>),
    } as DefaultValues<FormData>;
  }, [template, serverDefaults]);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(template.schema) as never,
    defaultValues: baseDefaults,
    mode: "onBlur",
  });

  const draftHydrated = useRef(false);
  useEffect(() => {
    if (draftHydrated.current) return;
    draftHydrated.current = true;
    const draft = loadWizardDraft(templateId);
    if (draft && !projectId) {
      reset({
        ...baseDefaults,
        ...draft,
      } as DefaultValues<FormData>);
    }
  }, [templateId, baseDefaults, reset, projectId]);

  /** Project-scoped forms: server defaults win; skip merging local draft (handled above). */
  useEffect(() => {
    if (!projectId) return;
    reset(baseDefaults);
  }, [projectId, baseDefaults, reset]);

  const watched = watch();
  const skipAutosave = useRef(true);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");

  useEffect(() => {
    if (projectId) return;
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    setAutosaveStatus("saving");
    const handle = window.setTimeout(() => {
      saveWizardDraft(templateId, watched as Record<string, unknown>);
      setAutosaveStatus("saved");
    }, 450);
    return () => window.clearTimeout(handle);
  }, [watched, templateId, projectId]);

  const mergedPreviewData = useMemo(() => {
    return {
      ...buildTemplateDefaultValues(template),
      ...(watched as Record<string, unknown>),
    };
  }, [template, watched]);

  const previewMarkdown = useMemo(() => {
    return template.toMarkdown(mergedPreviewData);
  }, [template, mergedPreviewData]);

  const [savedArtifactMeta, setSavedArtifactMeta] = useState<SavedArtifactMeta | null>(null);

  const currentSection = template.sections[stepIndex]!;
  const currentFieldNames = currentSection.fields.map((f) => f.name);
  const labels = fieldLabelMap(currentSection.fields);
  const filteredStepErrors = useMemo(() => {
    return currentFieldNames
      .map((name) => {
        const err = errors[name as keyof FormData];
        const msg = err?.message;
        if (typeof msg !== "string") return null;
        const label = labels.get(name) ?? name;
        return { name, label, message: msg };
      })
      .filter((x): x is { name: string; label: string; message: string } =>
        Boolean(x),
      );
  }, [errors, currentFieldNames, labels]);

  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onFinalSubmit: SubmitHandler<FormData> = async (data) => {
    setSubmitError(null);
    setMessage(null);
    try {
      const res = await saveArtifact({
        templateId,
        data: data as Record<string, unknown>,
        projectId,
      });
      if (!res.ok) {
        const detail =
          res.fieldErrors &&
          Object.entries(res.fieldErrors)
            .filter(([, messages]) => messages?.length)
            .map(([key, msgs]) => `${key}: ${msgs?.join(", ")}`)
            .join(" · ");
        setSubmitError(
          [toUserMessage(res.error), detail].filter(Boolean).join(" "),
        );
        return;
      }
      setMessage(
        `Saved artifact ${res.localId} (v${res.version}). File: vault/${res.markdownPath}`,
      );
      setSavedArtifactMeta({
        dbId: res.artifactId,
        localId: res.localId,
        version: res.version,
      });
      clearWizardDraft(templateId);
    } catch (e) {
      setSubmitError(toUserMessage(e));
    }
  };

  const handleNext = async () => {
    const paths = currentFieldNames as Path<FormData>[];
    const ok = await trigger(paths, { shouldFocus: true });
    if (!ok) return;
    setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    setStepIndex(stepIndex - 1);
  };

  const progressPct =
    sectionCount > 0
      ? Math.round(((stepIndex + 1) / sectionCount) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {template.templateId} · Phase {template.phase}
          </span>
          {template.gate ? (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
              {template.gate}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {projectId ? (
            <span className="text-muted-foreground">Server-backed form</span>
          ) : autosaveStatus === "saving" ? (
            <span className="text-muted-foreground">Saving draft…</span>
          ) : autosaveStatus === "saved" ? (
            <span className="text-muted-foreground">Draft saved locally</span>
          ) : (
            <span className="text-muted-foreground">&nbsp;</span>
          )}
          {projectId ? (
            <Link
              href={`/projects/${projectId}`}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              Project
            </Link>
          ) : null}
          <Link
            href="/"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {template.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {stepIndex + 1} of {sectionCount}: {currentSection.title}
        </p>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={sectionCount}
          aria-label="Form progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <nav aria-label="Form steps" className="mt-4">
          <ol className="flex flex-wrap gap-2">
            {template.sections.map((s, i) => {
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStepIndex(i)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`Step ${i + 1} of ${sectionCount}: ${s.title}${done ? " (completed)" : ""}${active ? " (current)" : ""}`}
                    className={`rounded-full border px-3 py-1 text-left text-xs font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : done
                          ? "border-muted-foreground/30 bg-muted text-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.id}. {s.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)]">
        <div className="min-w-0 space-y-6">
          {submitError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 px-4 py-3 text-sm text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          {message ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-border bg-muted px-4 py-3 text-sm"
            >
              {message}
            </p>
          ) : null}

          {filteredStepErrors.length > 0 ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
            >
              <p className="font-medium text-destructive">
                Fix {filteredStepErrors.length} issue
                {filteredStepErrors.length === 1 ? "" : "s"} on this step
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-destructive">
                {filteredStepErrors.map(({ name, label, message }) => (
                  <li key={name}>
                    <a
                      href={`#field-${name}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {label}
                    </a>
                    : {message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-5 space-y-1">
              <h2 className="text-lg font-semibold">
                {currentSection.id}. {currentSection.title}
              </h2>
              {currentSection.description ? (
                <p className="text-sm text-muted-foreground">
                  {currentSection.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5">
              {currentSection.fields.map((field) => {
                const errorMessage = errors[field.name]?.message;

                return (
                  <div key={field.name} id={`field-${field.name}`} className="grid gap-2 scroll-mt-24">
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
                      invalid={typeof errorMessage === "string"}
                      errorId={
                        typeof errorMessage === "string"
                          ? `${field.name}-error`
                          : undefined
                      }
                    />

                    {typeof errorMessage === "string" ? (
                      <p
                        id={`${field.name}-error`}
                        className="text-sm font-medium text-destructive"
                        role="alert"
                      >
                        {errorMessage}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={stepIndex === 0}
            >
              Back
            </Button>

            <div className="flex items-center gap-3">
              {stepIndex < sectionCount - 1 ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => void handleNext()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmit(onFinalSubmit)()}
                >
                  {isSubmitting ? "Saving…" : "Save artifact"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-10 lg:self-start">
          <WizardMarkdownPreview
            template={template}
            mergedData={mergedPreviewData}
            bodyMarkdown={previewMarkdown}
            projectId={projectId}
            savedArtifactMeta={savedArtifactMeta}
          />
        </aside>
      </div>
    </div>
  );
}
