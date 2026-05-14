"use client";

import { useEffect, useMemo, useRef } from "react";
import { Link2, MessageSquare } from "lucide-react";

import type {
  TemplateSection,
  WizardPopoverAnchorRect,
} from "@/types/template-wizard.types";

import { EvidenceChipList } from "@/components/template-wizard/evidence-chip-list";
import { SectionNavigationControls } from "@/components/template-wizard/section-navigation-controls";
import { useWizardEvidenceForTarget } from "@/components/template-wizard/wizard-evidence-context";
import { WizardDynamicForm } from "@/components/template-wizard/wizard-dynamic-form";
import { deriveSectionStatus } from "@/lib/template-wizard-computed";
import { cn } from "@/lib/utils";

function ActiveSectionHeader({
  section,
  values,
  onOpenSectionComment,
}: {
  section: TemplateSection;
  values: Record<string, unknown>;
  onOpenSectionComment?: (anchor: WizardPopoverAnchorRect) => void;
}) {
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
        {onOpenSectionComment ? (
          <button
            type="button"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              onOpenSectionComment({
                top: r.top,
                left: r.left,
                bottom: r.bottom,
                right: r.right,
                width: r.width,
                height: r.height,
              });
            }}
            data-testid="section-comment-open"
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-dashed border-[#2563eb]/40 px-2 py-1 text-xs font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            <MessageSquare className="size-3" aria-hidden />
            Comment
          </button>
        ) : null}
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
  focusFieldKey,
  onChange,
  onBlur,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onSaveSection,
  onOpenSectionComment,
  onFieldComment,
}: {
  section: TemplateSection;
  sectionIndex: number;
  sectionCount: number;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  idPrefix: string;
  /**
   * Trigger to scroll/focus a field by `field.name`. Use a `${name}-${nonce}` string
   * so repeated requests for the same field still re-trigger the effect.
   */
  focusFieldKey?: string | null;
  onChange: (fieldName: string, value: unknown) => void;
  onBlur?: (fieldName: string) => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSaveSection: () => void;
  onOpenSectionComment?: (anchor: WizardPopoverAnchorRect) => void;
  onFieldComment?: (fieldName: string, anchor: WizardPopoverAnchorRect) => void;
}) {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusFieldKey) return;
    const fieldName = focusFieldKey.split("|", 1)[0];
    if (!fieldName) return;
    const root = formRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>(`[data-field-target="${fieldName}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = target.querySelector<HTMLElement>(
      "input, textarea, select, button, [tabindex]",
    );
    if (input && typeof input.focus === "function") {
      input.focus({ preventScroll: true });
    }
  }, [focusFieldKey, section.id]);

  const sectionTarget = useMemo(
    () => ({ kind: "section" as const, sectionId: section.id }),
    [section.id],
  );
  const { controller, items: sectionEvidence } = useWizardEvidenceForTarget(sectionTarget);

  return (
    <section data-pane="editor" className="section-editor-panel rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground">
          Section {sectionIndex + 1} of {sectionCount}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => controller.openLinkModal(sectionTarget)}
            data-testid="section-link-evidence"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            <Link2 className="size-3" aria-hidden />
            Link Evidence
          </button>
          <button
            type="button"
            onClick={onSaveSection}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            Validate Section
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            View Section Guidance
          </button>
        </div>
      </div>
      <ActiveSectionHeader section={section} values={values} onOpenSectionComment={onOpenSectionComment} />

      {sectionEvidence.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-muted/20 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Section-linked evidence
          </p>
          <div className="mt-1.5">
            <EvidenceChipList
              items={sectionEvidence}
              target={sectionTarget}
              onOpenDetail={controller.openDetail}
              onRequestUnlink={controller.requestUnlink}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6" ref={formRef}>
        <WizardDynamicForm
          section={section}
          values={values}
          errors={errors}
          idPrefix={idPrefix}
          onChange={onChange}
          onBlur={onBlur}
          onFieldComment={onFieldComment}
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
