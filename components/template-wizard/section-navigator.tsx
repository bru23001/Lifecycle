"use client";

import { AlertCircle, AlertTriangle, Check, Plus, Trash2 } from "lucide-react";

import { deriveSectionStatus, estimateSectionProgress } from "@/lib/template-wizard-computed";
import { cn } from "@/lib/utils";
import type {
  TemplateSection,
  TemplateSectionStatus,
  ValidationIssue,
} from "@/types/template-wizard.types";

function SectionGlyph({
  status,
  pct,
  active,
}: {
  status: TemplateSectionStatus;
  pct: number;
  active: boolean;
}) {
  if (status === "complete") {
    return (
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#dcfce7] text-[#15803d]">
        <Check className="size-4" aria-hidden />
      </span>
    );
  }

  const tone =
    status === "not_started"
      ? "border-slate-200 bg-slate-50 text-slate-500"
      : pct >= 40
        ? "border-[#f59e0b]/40 bg-[#fffbeb] text-[#d97706]"
        : "border-[#2563eb]/40 bg-[#eff6ff] text-[#2563eb]";

  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
        tone,
        active && "ring-2 ring-[#2563eb] ring-offset-2",
      )}
      aria-hidden
    >
      {status === "not_started" ? "—" : `${pct}%`}
    </span>
  );
}

function indicatorTone(severity: "error" | "warning" | "info"): {
  className: string;
  Icon: typeof AlertCircle;
  label: string;
} {
  if (severity === "error") {
    return {
      className: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] hover:bg-[#fee2e2]",
      Icon: AlertCircle,
      label: "View errors",
    };
  }
  if (severity === "warning") {
    return {
      className: "border-[#fde68a] bg-[#fffbeb] text-[#92400e] hover:bg-[#fef3c7]",
      Icon: AlertTriangle,
      label: "View warnings",
    };
  }
  return {
    className: "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60",
    Icon: AlertCircle,
    label: "View section details",
  };
}

export function SectionNavigator({
  sections,
  activeSectionId,
  formValues,
  issuesBySection,
  hasOptionalSections,
  onSelectSection,
  onOpenValidation,
  onAddOptionalSection,
  onRemoveOptionalSection,
}: {
  sections: TemplateSection[];
  activeSectionId: string;
  formValues: Record<string, unknown>;
  /** Issues grouped by section id; drives the indicator severity. */
  issuesBySection?: Record<string, ValidationIssue[]>;
  /** When true, render the "Add section" affordance. */
  hasOptionalSections?: boolean;
  onSelectSection: (sectionId: string) => void;
  onOpenValidation?: (sectionId: string) => void;
  onAddOptionalSection?: () => void;
  onRemoveOptionalSection?: (sectionId: string) => void;
}) {
  return (
    <nav className="rounded-2xl border bg-card p-4 shadow-sm" aria-label="Template sections">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Sections</h3>
        {hasOptionalSections && onAddOptionalSection ? (
          <button
            type="button"
            data-testid="add-optional-section-open"
            onClick={onAddOptionalSection}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2563eb]/40 px-2 py-1 text-[11px] font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            <Plus className="size-3" aria-hidden />
            Add section
          </button>
        ) : null}
      </div>
      <ol className="mt-3 space-y-2">
        {sections.map((section) => {
          const derived = deriveSectionStatus(section, formValues);
          const pct = estimateSectionProgress(section, formValues);
          const active = section.id === activeSectionId;
          const sectionIssues = issuesBySection?.[section.id] ?? [];
          const hasError = sectionIssues.some((i) => i.severity === "error");
          const hasWarning = sectionIssues.some((i) => i.severity === "warning");
          const indicatorSeverity: "error" | "warning" | "info" | null = hasError
            ? "error"
            : hasWarning
              ? "warning"
              : derived === "not_started" || derived === "in_progress"
                ? "info"
                : null;
          const indicator = indicatorSeverity ? indicatorTone(indicatorSeverity) : null;

          return (
            <li key={section.id}>
              <div
                className={cn(
                  "flex items-stretch gap-2 rounded-xl border transition",
                  active
                    ? "border-[#2563eb] bg-[#eff6ff]"
                    : "border-transparent hover:bg-muted/50",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                  aria-current={active ? "step" : undefined}
                  data-testid="section-nav-item"
                  className="flex min-w-0 flex-1 items-start gap-3 rounded-xl px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <SectionGlyph status={derived} pct={pct} active={active} />
                  <span className="min-w-0">
                    <span className="flex items-start justify-between gap-2">
                      <span className="block truncate font-semibold text-foreground">
                        {section.order}. {section.title}
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                        {pct}%
                      </span>
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="capitalize">{derived.replace(/_/g, " ")}</span>
                      {section.optional ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Optional
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-[#2563eb] transition-[width]"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                  </span>
                </button>

                <div className="flex flex-col items-center justify-center gap-1 pr-2">
                  {indicator && onOpenValidation ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenValidation(section.id);
                      }}
                      data-testid="section-validation-indicator"
                      aria-label={`${indicator.label} for section ${section.title}`}
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        indicator.className,
                      )}
                    >
                      <indicator.Icon className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                  {section.optional && onRemoveOptionalSection ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOptionalSection(section.id);
                      }}
                      data-testid="remove-optional-section"
                      aria-label={`Remove optional section ${section.title}`}
                      className="grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
