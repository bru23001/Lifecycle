"use client";

import { Check } from "lucide-react";

import { deriveSectionStatus, estimateSectionProgress } from "@/lib/template-wizard-computed";
import { cn } from "@/lib/utils";
import type {
  TemplateSection,
  TemplateSectionStatus,
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

export function SectionNavigator({
  sections,
  activeSectionId,
  formValues,
  onSelectSection,
}: {
  sections: TemplateSection[];
  activeSectionId: string;
  formValues: Record<string, unknown>;
  onSelectSection: (sectionId: string) => void;
}) {
  return (
    <nav className="rounded-2xl border bg-card p-4 shadow-sm" aria-label="Template sections">
      <h3 className="text-sm font-semibold text-foreground">Sections</h3>
      <ol className="mt-3 space-y-2">
        {sections.map((section) => {
          const derived = deriveSectionStatus(section, formValues);
          const pct = estimateSectionProgress(section, formValues);
          const active = section.id === activeSectionId;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelectSection(section.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-[#2563eb] bg-[#eff6ff]" : "border-transparent hover:bg-muted/50",
                )}
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
                  <span className="mt-0.5 block text-xs capitalize text-muted-foreground">
                    {derived.replace(/_/g, " ")}
                  </span>
                  <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-[#2563eb] transition-[width]"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
