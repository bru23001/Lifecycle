"use client";

import { useState } from "react";

import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import { JsonEvidencePreview } from "@/components/template-wizard/json-evidence-preview";
import { MarkdownPreview } from "@/components/template-wizard/markdown-preview";
import { SectionEditorPanel } from "@/components/template-wizard/section-editor-panel";
import { TemplateSelectionPanel } from "@/components/template-wizard/template-selection-panel";
import { ValidationPanel } from "@/components/template-wizard/validation-panel";
import { WizardActionBar } from "@/components/template-wizard/wizard-action-bar";
import { WizardGrid } from "@/components/template-wizard/wizard-grid";
import { WizardHeader } from "@/components/template-wizard/wizard-header";
import type {
  JsonEvidence,
  MarkdownPreviewData,
  TemplateSection,
  TemplateSelectionItem,
  ValidationIssue,
  ValidationSummary,
  WizardHeaderData,
} from "@/types/template-wizard.types";

export function TemplateWizardContent({
  project,
  wizardHeader,
  templateSelections,
  selectedTemplateId,
  sections,
  activeSection,
  activeIndex,
  formValues,
  sectionErrors,
  validationSummary,
  markdownPreview,
  jsonEvidence,
  autosaveLabel,
  onSelectSection,
  onFieldChange,
  onIssueClick,
  onPrevSection,
  onNextSection,
  onSaveSection,
  onRegenerateMarkdown,
  onSaveDraft,
  onExportMarkdown,
  onExportJson,
  onCancel,
  onSaveArtifact,
  onMarkComplete,
  saveArtifactDisabledReason,
  markCompleteDisabledReason,
}: {
  project: { id: string; code: string; name: string };
  wizardHeader: WizardHeaderData;
  templateSelections: TemplateSelectionItem[];
  selectedTemplateId: string;
  sections: TemplateSection[];
  activeSection: TemplateSection;
  activeIndex: number;
  formValues: Record<string, unknown>;
  sectionErrors: Record<string, string>;
  validationSummary: ValidationSummary;
  markdownPreview: MarkdownPreviewData;
  jsonEvidence: JsonEvidence;
  autosaveLabel?: string | null;
  onSelectSection: (sectionId: string) => void;
  onFieldChange: (fieldName: string, value: unknown) => void;
  onIssueClick: (issue: ValidationIssue) => void;
  onPrevSection: () => void;
  onNextSection: () => void;
  onSaveSection: () => void;
  onRegenerateMarkdown: () => void;
  onSaveDraft: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onCancel: () => void;
  onSaveArtifact: () => void;
  onMarkComplete: () => void;
  saveArtifactDisabledReason?: string | null;
  markCompleteDisabledReason?: string | null;
}) {
  const [mobilePane, setMobilePane] = useState<"selection" | "editor" | "validation">("editor");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
      <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            {
              label: `${project.name} (${project.code})`,
              href: `/projects/${project.id}/workspace`,
            },
            { label: "Lifecycle Workspace", href: `/projects/${project.id}/workspace` },
            { label: "Template Wizard" },
            { label: `${wizardHeader.templateCode} ${wizardHeader.templateName}` },
          ]}
        />
      </div>

      <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-3 pt-2">
        <WizardHeader data={wizardHeader} />
      </div>

      <PaneSwitcher
        panes={[
          { id: "selection", label: "Outline" },
          { id: "editor", label: "Editor" },
          { id: "validation", label: "Preview" },
        ]}
        active={mobilePane}
        onChange={(id) => setMobilePane(id as typeof mobilePane)}
        className="mx-auto w-full max-w-[1920px]"
      />

      <WizardGrid mobilePane={mobilePane}>
        <TemplateSelectionPanel
          projectId={project.id}
          phaseNumber={wizardHeader.phaseNumber}
          phaseName={wizardHeader.phaseName}
          templates={templateSelections}
          selectedTemplateId={selectedTemplateId}
          sections={sections}
          activeSectionId={activeSection.id}
          formValues={formValues}
          onSelectSection={onSelectSection}
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
          onPrev={onPrevSection}
          onNext={onNextSection}
          onSaveSection={onSaveSection}
        />

        <div data-pane="validation" className="validation-preview-panel">
          <ValidationPanel summary={validationSummary} onIssueClick={onIssueClick} />
          <MarkdownPreview data={markdownPreview} onRegenerate={onRegenerateMarkdown} />
          <JsonEvidencePreview data={jsonEvidence} />
        </div>
      </WizardGrid>

      <WizardActionBar
        autosaveLabel={autosaveLabel}
        onSaveDraft={onSaveDraft}
        onExportMarkdown={onExportMarkdown}
        onExportJson={onExportJson}
        onCancel={onCancel}
        onSaveArtifact={onSaveArtifact}
        onMarkComplete={onMarkComplete}
        saveArtifactDisabledReason={saveArtifactDisabledReason}
        markCompleteDisabledReason={markCompleteDisabledReason}
      />
    </div>
  );
}
