"use client";

import { AlertTriangle, BookOpen, Search, Shuffle, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  TemplateSelectionItem,
  TemplateSection,
  ValidationIssue,
} from "@/types/template-wizard.types";
import { SectionNavigator } from "@/components/template-wizard/section-navigator";

export function TemplateSelectionPanel({
  phaseNumber,
  phaseName,
  templates,
  selectedTemplateId,
  sections,
  activeSectionId,
  formValues,
  hasUnsavedChanges,
  issuesBySection,
  hasOptionalSections,
  onSelectSection,
  onSwitchTemplate,
  onOpenGuide,
  onOpenSectionValidation,
  onAddOptionalSection,
  onRemoveOptionalSection,
}: {
  phaseNumber: number;
  phaseName: string;
  templates: TemplateSelectionItem[];
  selectedTemplateId: string;
  sections: TemplateSection[];
  activeSectionId: string;
  formValues: Record<string, unknown>;
  hasUnsavedChanges: boolean;
  issuesBySection?: Record<string, ValidationIssue[]>;
  hasOptionalSections?: boolean;
  onSelectSection: (sectionId: string) => void;
  onSwitchTemplate: (template: TemplateSelectionItem) => void;
  onOpenGuide: () => void;
  onOpenSectionValidation?: (sectionId: string) => void;
  onAddOptionalSection?: () => void;
  onRemoveOptionalSection?: (sectionId: string) => void;
}) {
  const [q, setQ] = useState("");
  const [switchOpen, setSwitchOpen] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState(String(phaseNumber));
  const [switchTemplateId, setSwitchTemplateId] = useState(selectedTemplateId);

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) ?? templates[0] ?? null;

  const phaseOptions = useMemo(() => {
    const byPhase = new Map<number, string>();
    for (const t of templates) {
      byPhase.set(t.phaseNumber, t.phaseName);
    }
    return Array.from(byPhase, ([number, name]) => ({ number, name })).sort(
      (a, b) => a.number - b.number,
    );
  }, [templates]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = templates.filter(
      (t) => phaseFilter === "all" || String(t.phaseNumber) === phaseFilter,
    );
    if (!s) return base;
    return base.filter(
      (t) =>
        t.templateCode.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        t.phaseName.toLowerCase().includes(s) ||
        t.status.replace(/_/g, " ").includes(s),
    );
  }, [templates, phaseFilter, q]);

  const switchTarget =
    templates.find((t) => t.id === switchTemplateId) ?? selectedTemplate;

  function openSwitchModal() {
    setPhaseFilter(String(selectedTemplate?.phaseNumber ?? phaseNumber));
    setSwitchTemplateId(selectedTemplateId);
    setSwitchOpen(true);
  }

  function requestTemplate(template: TemplateSelectionItem) {
    if (template.id === selectedTemplateId) return;
    if (!hasUnsavedChanges) {
      onSwitchTemplate(template);
      return;
    }
    setPhaseFilter(String(template.phaseNumber));
    setSwitchTemplateId(template.id);
    setSwitchOpen(true);
  }

  function confirmSwitch() {
    if (!switchTarget || switchTarget.id === selectedTemplateId) {
      setSwitchOpen(false);
      return;
    }
    setSwitchOpen(false);
    onSwitchTemplate(switchTarget);
  }

  return (
    <aside data-pane="selection" className="template-selection-panel flex flex-col gap-4">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full justify-center gap-1.5"
          data-testid="switch-template-open"
          onClick={openSwitchModal}
        >
          <Shuffle className="size-3.5" aria-hidden />
          Switch Template
        </Button>

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
            const template = templates.find((t) => t.id === next);
            if (template) requestTemplate(template);
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
                  onClick={(e) => {
                    e.preventDefault();
                    requestTemplate(t);
                  }}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition",
                    selected
                      ? "border-[#2563eb] bg-[#eff6ff] text-[#1e40af]"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="block truncate font-semibold">{t.templateCode}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        P{t.phaseNumber}
                      </span>
                      {t.maturity === "scaffold" ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                          Scaffold
                        </span>
                      ) : null}
                    </span>
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

      <div className="space-y-4">
        <SectionNavigator
          sections={sections}
          activeSectionId={activeSectionId}
          formValues={formValues}
          issuesBySection={issuesBySection}
          hasOptionalSections={hasOptionalSections}
          onSelectSection={onSelectSection}
          onOpenValidation={onOpenSectionValidation}
          onAddOptionalSection={onAddOptionalSection}
          onRemoveOptionalSection={onRemoveOptionalSection}
        />
        <button
          type="button"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563eb] hover:underline"
          data-testid="template-guide-open"
          onClick={onOpenGuide}
        >
          <BookOpen className="size-3.5" aria-hidden />
          Template Guide
        </button>
      </div>

      {switchOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="flex max-h-[min(760px,100vh-2rem)] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl"
            data-testid="switch-template-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="switch-template-title"
          >
            <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
              <div>
                <h2 id="switch-template-title" className="text-lg font-semibold text-foreground">
                  Switch Template
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose another lifecycle template for the wizard.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setSwitchOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {selectedTemplate ? (
                <div className="rounded-xl border bg-muted/20 px-3 py-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current template
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {selectedTemplate.templateCode} · {selectedTemplate.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Phase {selectedTemplate.phaseNumber} · {selectedTemplate.phaseName} · {selectedTemplate.version}
                  </p>
                </div>
              ) : null}

              {hasUnsavedChanges ? (
                <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>
                    This wizard has unsaved changes. Switching templates will discard edits that were not saved as a draft.
                  </p>
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Phase filter</span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={phaseFilter}
                    onChange={(e) => setPhaseFilter(e.target.value)}
                  >
                    <option value="all">All phases</option>
                    {phaseOptions.map((phase) => (
                      <option key={phase.number} value={String(phase.number)}>
                        Phase {phase.number}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Available templates</span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={switchTemplateId}
                    onChange={(e) => setSwitchTemplateId(e.target.value)}
                  >
                    {filtered.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.templateCode} · {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <ul className="mt-4 space-y-2">
                {filtered.map((t) => {
                  const selected = t.id === switchTemplateId;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-left text-sm transition hover:bg-muted/50",
                          selected ? "border-[#2563eb] bg-[#eff6ff]" : "border-border",
                        )}
                        onClick={() => setSwitchTemplateId(t.id)}
                      >
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            {t.templateCode} · {t.name}
                          </span>
                          <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                            {t.required ? "Required" : "Optional"} · {t.version}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Phase {t.phaseNumber} · {t.phaseName}
                          {t.gateCode ? ` · ${t.gateCode}` : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
              <Button type="button" variant="outline" onClick={() => setSwitchOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmSwitch}
                disabled={!switchTarget || switchTarget.id === selectedTemplateId}
              >
                Switch
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
