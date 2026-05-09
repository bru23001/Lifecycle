"use client";

import type { TemplateSection } from "@/types/template-wizard.types";

import { SectionNavigationControls } from "@/components/template-wizard/section-navigation-controls";
import { WizardDynamicForm } from "@/components/template-wizard/wizard-dynamic-form";
import { deriveSectionStatus } from "@/lib/template-wizard-computed";
import { cn } from "@/lib/utils";

function ActiveSectionHeader({ section, values }: { section: TemplateSection; values: Record<string, unknown> }) {
  const st = deriveSectionStatus(section, values);
  const badge =
    st === "complete"
      ? "bg-[#dcfce7] text-[#15803d]"
      : st === "in_progress"
        ? "bg-[#dbeafe] text-[#1d4ed8]"
        : "bg-slate-100 text-slate-600";

  return (
    <header className="space-y-1 border-b pb-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          Section {section.order}: {section.title}
        </h3>
        {section.required ? (
          <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b45309]">
            Required
          </span>
        ) : null}
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", badge)}>
          {st.replace(/_/g, " ")}
        </span>
      </div>
      {section.description ? (
        <p className="text-sm text-muted-foreground">{section.description}</p>
      ) : null}
    </header>
  );
}

export function SectionEditorPanel({
  section,
  sectionIndex,
  sectionCount,
  values,
  errors,
  idPrefix,
  onChange,
  onBlur,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onSaveSection,
}: {
  section: TemplateSection;
  sectionIndex: number;
  sectionCount: number;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  idPrefix: string;
  onChange: (fieldName: string, value: unknown) => void;
  onBlur?: (fieldName: string) => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSaveSection: () => void;
}) {
  return (
    <section className="section-editor-panel rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground">
          Section {sectionIndex + 1} of {sectionCount}
        </p>
        <button
          type="button"
          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
        >
          View Section Guidance
        </button>
      </div>
      <ActiveSectionHeader section={section} values={values} />

      <div className="mt-6">
        <WizardDynamicForm
          section={section}
          values={values}
          errors={errors}
          idPrefix={idPrefix}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>

      <SectionNavigationControls
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={onPrev}
        onNext={onNext}
        onSaveSection={onSaveSection}
      />
    </section>
  );
}
