"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { JsonEvidencePreview } from "@/components/template-wizard/json-evidence-preview";
import { MarkdownPreview } from "@/components/template-wizard/markdown-preview";
import { SectionEditorPanel } from "@/components/template-wizard/section-editor-panel";
import { TemplateSelectionPanel } from "@/components/template-wizard/template-selection-panel";
import { ValidationPanel } from "@/components/template-wizard/validation-panel";
import { WizardActionBar } from "@/components/template-wizard/wizard-action-bar";
import { WizardHeader } from "@/components/template-wizard/wizard-header";
import {
  buildJsonEvidence,
  buildMarkdownPreview,
  computeValidationSummary,
} from "@/lib/template-wizard-computed";
import type { TemplateWizardData, ValidationIssue } from "@/types/template-wizard.types";

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function TemplateWizardScreen({ initial }: { initial: TemplateWizardData }) {
  const router = useRouter();
  const sections = initial.selectedTemplate.sections;

  const [activeSectionId, setActiveSectionId] = useState(initial.activeSectionId);
  const [formValues, setFormValues] = useState<Record<string, unknown>>(initial.formValues);
  const [autosaveLabel, setAutosaveLabel] = useState<string | null>(
    initial.wizardHeader.lastSavedLabel ?? null,
  );

  const validationSummary = useMemo(
    () =>
      computeValidationSummary(
        {
          ...initial.wizardHeader,
          completionPercent: initial.wizardHeader.completionPercent,
        },
        sections,
        formValues,
      ),
    [initial.wizardHeader, sections, formValues],
  );

  const wizardHeader = useMemo(
    () => ({
      ...initial.wizardHeader,
      completionPercent: validationSummary.completionPercent,
      lastSavedLabel: autosaveLabel ?? undefined,
    }),
    [initial.wizardHeader, validationSummary.completionPercent, autosaveLabel],
  );

  const generatedAtLabel = useMemo(() => {
    return new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, []);

  const markdownPreview = useMemo(
    () => buildMarkdownPreview(wizardHeader, sections, formValues, generatedAtLabel),
    [wizardHeader, sections, formValues, generatedAtLabel],
  );

  const jsonEvidence = useMemo(
    () =>
      buildJsonEvidence(
        wizardHeader,
        initial.selectedTemplate,
        initial.project.id,
        initial.user.name,
        sections,
        formValues,
        validationSummary,
      ),
    [
      wizardHeader,
      initial.selectedTemplate,
      initial.project.id,
      initial.user.name,
      sections,
      formValues,
      validationSummary,
    ],
  );

  const activeSection = useMemo(() => {
    return sections.find((s) => s.id === activeSectionId) ?? sections[0];
  }, [sections, activeSectionId]);

  const activeIndex = sections.findIndex((s) => s.id === activeSection.id);

  const sectionErrors = useMemo(() => {
    const o: Record<string, string> = {};
    for (const i of validationSummary.issues) {
      if (i.fieldName && i.sectionId === activeSection.id) {
        o[i.fieldName] = i.message;
      }
    }
    return o;
  }, [validationSummary.issues, activeSection.id]);

  const bumpAutosave = useCallback(() => {
    setAutosaveLabel("Saving…");
  }, []);

  useEffect(() => {
    if (autosaveLabel !== "Saving…") return;
    const t = window.setTimeout(() => {
      setAutosaveLabel("Autosaved just now");
    }, 650);
    return () => window.clearTimeout(t);
  }, [autosaveLabel]);

  const onFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      setFormValues((prev) => ({ ...prev, [fieldName]: value }));
      bumpAutosave();
    },
    [bumpAutosave],
  );

  const onIssueClick = useCallback((issue: ValidationIssue) => {
    if (issue.sectionId) {
      setActiveSectionId(issue.sectionId);
    }
  }, []);

  const goPrev = useCallback(() => {
    if (activeIndex <= 0) return;
    setActiveSectionId(sections[activeIndex - 1].id);
  }, [activeIndex, sections]);

  const goNext = useCallback(() => {
    const blocking = validationSummary.issues.filter(
      (i) => i.sectionId === activeSection.id && i.severity === "error",
    );
    if (blocking.length > 0) {
      return;
    }
    if (activeIndex < 0 || activeIndex >= sections.length - 1) return;
    setActiveSectionId(sections[activeIndex + 1].id);
  }, [activeIndex, activeSection.id, sections, validationSummary.issues]);

  const saveDraft = useCallback(() => {
    bumpAutosave();
  }, [bumpAutosave]);

  const exportMd = useCallback(() => {
    downloadFile(
      `${wizardHeader.templateCode.replace(/[^a-z0-9]+/gi, "-")}-artifact.md`,
      markdownPreview.markdown,
      "text/markdown;charset=utf-8",
    );
  }, [markdownPreview.markdown, wizardHeader.templateCode]);

  const exportJson = useCallback(() => {
    downloadFile(
      `${wizardHeader.templateCode.replace(/[^a-z0-9]+/gi, "-")}-evidence.json`,
      JSON.stringify(jsonEvidence, null, 2),
      "application/json;charset=utf-8",
    );
  }, [jsonEvidence, wizardHeader.templateCode]);

  const markCompleteDisabledReason =
    validationSummary.errorCount > 0 || validationSummary.warningCount > 0
      ? "Resolve validation warnings and errors in the Validation Panel."
      : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft();
      }
      if (mod && e.key === "Enter") {
        e.preventDefault();
        saveDraft();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveDraft]);

  const phaseSummary = `Phase ${wizardHeader.phaseNumber} · ${wizardHeader.phaseName}`;

  return (
    <AuthenticatedAppShell
      projectId={initial.project.id}
      projectName={initial.project.name}
      phaseSummary={phaseSummary}
      phaseProgressPct={wizardHeader.completionPercent}
      navActive="templates"
    >
      <TopHeader
        title="Template Wizard"
        userInitials={initial.user.initials}
        autosaveLabel={autosaveLabel}
        notificationCount={6}
      />

      <div className="flex min-h-0 flex-1 flex-col bg-[#f8fafc] dark:bg-background">
        <div className="mx-auto w-full max-w-[1920px] px-5 pt-4">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              {
                label: `${initial.project.name} (${initial.project.code})`,
                href: `/projects/${initial.project.id}`,
              },
              { label: "Lifecycle Workspace", href: `/projects/${initial.project.id}/workspace` },
              { label: "Template Wizard" },
              {
                label: `${wizardHeader.templateCode} ${wizardHeader.templateName}`,
              },
            ]}
          />
        </div>

        <div className="mx-auto w-full max-w-[1920px] px-5 pb-3 pt-2">
          <WizardHeader data={wizardHeader} />
        </div>

        <div className="template-wizard-grid">
          <TemplateSelectionPanel
            projectId={initial.project.id}
            phaseNumber={wizardHeader.phaseNumber}
            phaseName={wizardHeader.phaseName}
            templates={initial.templateSelections}
            selectedTemplateId={initial.selectedTemplate.id}
            sections={sections}
            activeSectionId={activeSection.id}
            formValues={formValues}
            onSelectSection={setActiveSectionId}
          />

          <SectionEditorPanel
            section={activeSection}
            sectionIndex={activeIndex}
            sectionCount={sections.length}
            values={formValues}
            errors={sectionErrors}
            idPrefix={`sec-${activeSection.id}`}
            onChange={onFieldChange}
            canGoPrev={activeIndex > 0}
            canGoNext={activeIndex < sections.length - 1}
            onPrev={goPrev}
            onNext={goNext}
            onSaveSection={saveDraft}
          />

          <div className="validation-preview-panel">
            <ValidationPanel summary={validationSummary} onIssueClick={onIssueClick} />
            <MarkdownPreview
              data={markdownPreview}
              onRegenerate={() => {
                bumpAutosave();
              }}
            />
            <JsonEvidencePreview data={jsonEvidence} />
          </div>
        </div>

        <WizardActionBar
          autosaveLabel={autosaveLabel}
          onSaveDraft={saveDraft}
          onExportMarkdown={exportMd}
          onExportJson={exportJson}
          onCancel={() => router.push(`/projects/${initial.project.id}/workspace`)}
          onSaveArtifact={saveDraft}
          onMarkComplete={() => {
            if (!markCompleteDisabledReason) {
              setAutosaveLabel("Marked complete · saved");
            }
          }}
          saveArtifactDisabledReason={null}
          markCompleteDisabledReason={markCompleteDisabledReason}
        />
      </div>
    </AuthenticatedAppShell>
  );
}
