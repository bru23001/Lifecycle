"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import {
  computeValidationSummary,
} from "@/lib/template-wizard-computed";
import type { TemplateWizardData, ValidationIssue } from "@/types/template-wizard.types";
import { toJsonEvidence } from "@/templates/renderJsonEvidence";
import { toMarkdown } from "@/templates/renderMarkdown";
import { TemplateWizardContent } from "@/components/template-wizard/template-wizard-content";

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
  const storageKey = useMemo(
    () => `template-wizard-draft:${initial.project.id}:${initial.selectedTemplate.id}`,
    [initial.project.id, initial.selectedTemplate.id],
  );

  const initialFormValues = useMemo(() => {
    if (typeof window === "undefined") {
      return initial.formValues;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return initial.formValues;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return { ...initial.formValues, ...parsed };
    } catch {
      return initial.formValues;
    }
  }, [initial.formValues, storageKey]);

  const [activeSectionId, setActiveSectionId] = useState(initial.activeSectionId);
  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialFormValues);
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
    () =>
      toMarkdown({
        wizardHeader,
        sections,
        formValues,
        generatedAtLabel,
      }),
    [wizardHeader, sections, formValues, generatedAtLabel],
  );

  const jsonEvidence = useMemo(
    () =>
      toJsonEvidence({
        wizardHeader,
        selectedTemplate: initial.selectedTemplate,
        projectId: initial.project.id,
        generatedBy: initial.user.name,
        sections,
        formValues,
        validationSummary,
      }),
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

  const persistDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(formValues));
    } catch {
      // non-blocking fallback: keep working even if storage is unavailable
    }
  }, [formValues, storageKey]);

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
    persistDraft();
    bumpAutosave();
  }, [bumpAutosave, persistDraft]);

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

  const saveArtifactDisabledReason = !initial.artifactSaveState.canSave
    ? initial.artifactSaveState.blockers.join("; ") || "Artifact cannot be saved yet."
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
      navActive="artifacts"
    >
      <TopHeader
        title="Template Wizard"
        userInitials={initial.user.initials}
        autosaveLabel={autosaveLabel}
        notificationCount={6}
      />
      <TemplateWizardContent
        project={initial.project}
        wizardHeader={wizardHeader}
        templateSelections={initial.templateSelections}
        selectedTemplateId={initial.selectedTemplate.id}
        sections={sections}
        activeSection={activeSection}
        activeIndex={activeIndex}
        formValues={formValues}
        sectionErrors={sectionErrors}
        validationSummary={validationSummary}
        markdownPreview={markdownPreview}
        jsonEvidence={jsonEvidence}
        autosaveLabel={autosaveLabel}
        onSelectSection={setActiveSectionId}
        onFieldChange={onFieldChange}
        onIssueClick={onIssueClick}
        onPrevSection={goPrev}
        onNextSection={goNext}
        onSaveSection={saveDraft}
        onRegenerateMarkdown={bumpAutosave}
        onSaveDraft={saveDraft}
        onExportMarkdown={exportMd}
        onExportJson={exportJson}
        onCancel={() => router.push(`/projects/${initial.project.id}/workspace`)}
        onSaveArtifact={() => {
          saveDraft();
        }}
        onMarkComplete={() => {
          if (!markCompleteDisabledReason) {
            setAutosaveLabel("Marked complete · saved");
            saveDraft();
          }
        }}
        saveArtifactDisabledReason={saveArtifactDisabledReason}
        markCompleteDisabledReason={markCompleteDisabledReason}
      />
    </AuthenticatedAppShell>
  );
}
