"use client";

import { Check, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type {
  TemplateSelectionItem,
  TemplateSection,
  TemplateSectionStatus,
} from "@/types/template-wizard.types";
import { deriveSectionStatus, estimateSectionProgress } from "@/lib/template-wizard-computed";

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

export function TemplateSelectionPanel({
  projectId,
  phaseNumber,
  phaseName,
  templates,
  selectedTemplateId,
  sections,
  activeSectionId,
  formValues,
  onSelectSection,
}: {
  projectId: string;
  phaseNumber: number;
  phaseName: string;
  templates: TemplateSelectionItem[];
  selectedTemplateId: string;
  sections: TemplateSection[];
  activeSectionId: string;
  formValues: Record<string, unknown>;
  onSelectSection: (sectionId: string) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return templates;
    return templates.filter(
      (t) =>
        t.templateCode.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        t.status.replace(/_/g, " ").includes(s),
    );
  }, [templates, q]);

  return (
    <aside className="template-selection-panel flex flex-col gap-4">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Template</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase {phaseNumber} · {phaseName}
            </p>
          </div>
          <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1d4ed8]">
            Phase {phaseNumber}
          </span>
        </div>

        <label htmlFor="template-wizard-search" className="sr-only">
          Search templates
        </label>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="template-wizard-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates…"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <label htmlFor="template-wizard-dropdown" className="mt-4 block text-xs font-semibold text-muted-foreground">
          Active template
        </label>
        <select
          id="template-wizard-dropdown"
          className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          value={selectedTemplateId}
          onChange={(e) => {
            const next = e.target.value;
            router.push(`/projects/${projectId}/templates/${next}`);
          }}
          aria-label="Select lifecycle template"
        >
          {filtered.map((t) => (
            <option key={t.id} value={t.id}>
              {t.templateCode} · {t.name}
            </option>
          ))}
        </select>

        <ul className="mt-4 space-y-1.5">
          {filtered.map((t) => {
            const selected = t.id === selectedTemplateId;
            return (
              <li key={t.id}>
                <Link
                  href={t.href}
                  aria-selected={selected}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition",
                    selected
                      ? "border-[#2563eb] bg-[#eff6ff] text-[#1e40af]"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{t.templateCode}</span>
                    <span className="block truncate text-xs text-muted-foreground">{t.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {t.completionPercent}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

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

        <a
          href="https://example.com/template-guide"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#2563eb] hover:underline"
        >
          Template Guide
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </nav>
    </aside>
  );
}
