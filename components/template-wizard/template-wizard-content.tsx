"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, X } from "lucide-react";

import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import { Button, buttonVariants } from "@/components/ui/button";
import { JsonEvidencePreview } from "@/components/template-wizard/json-evidence-preview";
import { MarkdownPreview } from "@/components/template-wizard/markdown-preview";
import { SectionEditorPanel } from "@/components/template-wizard/section-editor-panel";
import { TemplateSelectionPanel } from "@/components/template-wizard/template-selection-panel";
import {
  ValidationIssueDetailDrawer,
  ValidationIssuesDrawer,
  ValidationProgressModal,
} from "@/components/template-wizard/validation-issue-drawers";
import { ValidationPanel } from "@/components/template-wizard/validation-panel";
import { WizardActionBar } from "@/components/template-wizard/wizard-action-bar";
import { WizardCollaborationSection } from "@/components/template-wizard/template-wizard-collaboration";
import { WizardGrid } from "@/components/template-wizard/wizard-grid";
import { WizardHeader } from "@/components/template-wizard/wizard-header";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import { estimateSectionProgress } from "@/lib/template-wizard-computed";
import { cn } from "@/lib/utils";
import type {
  JsonEvidence,
  MarkdownPreviewData,
  OptionalSectionDefinition,
  TemplateSection,
  TemplateSelectionItem,
  ValidationIssue,
  ValidationSummary,
  WizardArtifactVersionSummary,
  WizardCollaborationCommentDto,
  WizardHeaderData,
  WizardPopoverAnchorRect,
  WizardReviewRequestSummaryDto,
} from "@/types/template-wizard.types";

function RightDrawer({
  open,
  title,
  onClose,
  children,
  footer,
  testId,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  testId: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close drawer" onClick={onClose} />
      <div
        data-testid={testId}
        className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-[var(--app-bg)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">{children}</div>
        {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="mt-1 text-[13px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export function TemplateWizardContent({
  project,
  responsibleRole,
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
  availableOptionalSections,
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
  onExportPackage,
  onCancel,
  onSwitchTemplate,
  onSaveArtifact,
  onMarkComplete,
  showSubmitGateReview,
  onSubmitGateReview,
  onAddOptionalSection,
  onRemoveOptionalSection,
  hasUnsavedChanges,
  saveArtifactDisabledReason,
  markCompleteDisabledReason,
  artifactVersionHistory,
  currentArtifactId,
  onRequestCompareArtifact,
  onRequestRestoreArtifact,
  onGuardedNavigate,
  persistedArtifactId,
  collaborationComments,
  collaborationReviewRequests,
}: {
  project: { id: string; code: string; name: string };
  responsibleRole: string;
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
  /** Optional sections that are NOT yet added to the artifact draft. */
  availableOptionalSections: OptionalSectionDefinition[];
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
  onExportPackage: () => void;
  onCancel: () => void;
  onSwitchTemplate: (template: TemplateSelectionItem) => void;
  onSaveArtifact: () => void;
  onMarkComplete: () => void;
  showSubmitGateReview?: boolean;
  onSubmitGateReview: () => void;
  onAddOptionalSection: (definitionId: string) => void;
  onRemoveOptionalSection: (sectionId: string) => void;
  hasUnsavedChanges: boolean;
  saveArtifactDisabledReason?: string | null;
  markCompleteDisabledReason?: string | null;
  artifactVersionHistory: WizardArtifactVersionSummary[];
  currentArtifactId?: string;
  onRequestCompareArtifact: (artifactId: string) => void;
  onRequestRestoreArtifact: (row: WizardArtifactVersionSummary) => void;
  onGuardedNavigate: (href: string, description: string) => void;
  persistedArtifactId?: string;
  collaborationComments: WizardCollaborationCommentDto[];
  collaborationReviewRequests: WizardReviewRequestSummaryDto[];
}) {
  const [mobilePane, setMobilePane] = useState<"selection" | "editor" | "validation">("editor");
  const [guideOpen, setGuideOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [artifactHistoryOpen, setArtifactHistoryOpen] = useState(false);
  const [validationSectionId, setValidationSectionId] = useState<string | null>(null);
  const [validationIssueId, setValidationIssueId] = useState<string | null>(null);
  const [validationIssuesOpen, setValidationIssuesOpen] = useState(false);
  const [validationProgressOpen, setValidationProgressOpen] = useState(false);
  const [addOptionalOpen, setAddOptionalOpen] = useState(false);
  const [removeTargetSectionId, setRemoveTargetSectionId] = useState<string | null>(null);
  const [focusFieldKey, setFocusFieldKey] = useState<string | null>(null);
  const [fieldCommentDraft, setFieldCommentDraft] = useState<{
    sectionId: string;
    sectionTitle: string;
    fieldName?: string;
    anchor: WizardPopoverAnchorRect;
  } | null>(null);
  const selectedTemplate =
    templateSelections.find((t) => t.id === selectedTemplateId) ?? templateSelections[0] ?? null;
  const requiredSections = sections.filter((s) => s.required);
  const validationRules = validationSummary.issues.length
    ? validationSummary.issues.map((issue) => issue.message)
    : ["All required fields must be complete before the template is export-ready."];

  const issuesBySection = useMemo(() => {
    const map: Record<string, ValidationIssue[]> = {};
    for (const issue of validationSummary.issues) {
      const sid = issue.sectionId ?? "_unscoped";
      const list = map[sid] ?? [];
      list.push(issue);
      map[sid] = list;
    }
    return map;
  }, [validationSummary.issues]);

  const validationSection = validationSectionId
    ? sections.find((s) => s.id === validationSectionId) ?? null
    : null;
  const selectedValidationIssue = validationIssueId
    ? validationSummary.issues.find((issue) => issue.id === validationIssueId) ?? null
    : null;
  const removeTargetSection = removeTargetSectionId
    ? sections.find((s) => s.id === removeTargetSectionId) ?? null
    : null;

  const validationSectionOptions = useMemo(
    () => sections.map((section) => ({ id: section.id, title: section.title })),
    [sections],
  );
  const validationFieldLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const section of sections) {
      for (const field of section.fields) {
        labels[field.name] = field.label;
      }
    }
    return labels;
  }, [sections]);

  function handleJumpToField(sectionId: string, fieldName?: string) {
    onSelectSection(sectionId);
    setValidationSectionId(null);
    setValidationIssueId(null);
    setValidationIssuesOpen(false);
    if (fieldName) {
      setFocusFieldKey(`${fieldName}|${Date.now()}`);
    }
    setMobilePane("editor");
  }

  function handleOpenValidationIssue(issue: ValidationIssue) {
    setValidationIssueId(issue.id);
    setValidationIssuesOpen(false);
  }

  function handleJumpToIssue(issue: ValidationIssue) {
    if (issue.sectionId) {
      handleJumpToField(issue.sectionId, issue.fieldName);
    }
  }

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
          navGuard={{
            shouldBlock: () => hasUnsavedChanges,
            onBlockedNavigate: (href) => {
              const label =
                href === "/projects"
                  ? "Projects"
                  : href.includes("/workspace")
                    ? "Lifecycle Workspace"
                    : "this page";
              onGuardedNavigate(href, label);
            },
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-3 pt-2">
        <WizardHeader
          data={wizardHeader}
          onTemplateVersionClick={() => setVersionOpen(true)}
          onArtifactVersionHistoryClick={() => setArtifactHistoryOpen(true)}
        />
        <WizardCollaborationSection
          projectId={project.id}
          templateId={selectedTemplateId}
          artifactId={persistedArtifactId}
          comments={collaborationComments}
          reviewRequests={collaborationReviewRequests}
          fieldCommentDraft={fieldCommentDraft}
          onCloseFieldComment={() => setFieldCommentDraft(null)}
        />
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
          phaseNumber={wizardHeader.phaseNumber}
          phaseName={wizardHeader.phaseName}
          templates={templateSelections}
          selectedTemplateId={selectedTemplateId}
          sections={sections}
          activeSectionId={activeSection.id}
          formValues={formValues}
          hasUnsavedChanges={hasUnsavedChanges}
          issuesBySection={issuesBySection}
          hasOptionalSections={availableOptionalSections.length > 0}
          onSelectSection={onSelectSection}
          onSwitchTemplate={onSwitchTemplate}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenSectionValidation={(sectionId) => setValidationSectionId(sectionId)}
          onAddOptionalSection={() => setAddOptionalOpen(true)}
          onRemoveOptionalSection={(sectionId) => setRemoveTargetSectionId(sectionId)}
        />

        <SectionEditorPanel
          section={activeSection}
          sectionIndex={activeIndex}
          sectionCount={sections.length}
          values={formValues}
          errors={sectionErrors}
          idPrefix={`sec-${activeSection.id}`}
          focusFieldKey={focusFieldKey}
          onChange={onFieldChange}
          canGoPrev={activeIndex > 0}
          canGoNext={activeIndex < sections.length - 1}
          onPrev={onPrevSection}
          onNext={onNextSection}
          onSaveSection={onSaveSection}
          onOpenSectionComment={(anchor) =>
            setFieldCommentDraft({
              sectionId: activeSection.id,
              sectionTitle: activeSection.title,
              anchor,
            })
          }
          onFieldComment={(fieldName, anchor) =>
            setFieldCommentDraft({
              sectionId: activeSection.id,
              sectionTitle: activeSection.title,
              fieldName,
              anchor,
            })
          }
        />

        <div data-pane="validation" className="validation-preview-panel">
          <ValidationPanel
            summary={validationSummary}
            onIssueClick={(issue) => {
              onIssueClick(issue);
              handleOpenValidationIssue(issue);
            }}
            onViewAllIssues={() => setValidationIssuesOpen(true)}
            onRunValidation={() => setValidationProgressOpen(true)}
          />
          <MarkdownPreview
            data={markdownPreview}
            onRegenerate={onRegenerateMarkdown}
            artifactDisplayName={markdownPreview.artifactTitle}
          />
          <JsonEvidencePreview data={jsonEvidence} artifactDisplayName={markdownPreview.artifactTitle} />
        </div>
      </WizardGrid>

      <WizardActionBar
        autosaveLabel={autosaveLabel}
        onSaveDraft={onSaveDraft}
        onExportMarkdown={onExportMarkdown}
        onExportJson={onExportJson}
        onExportPackage={onExportPackage}
        onCancel={onCancel}
        onSaveArtifact={onSaveArtifact}
        onMarkComplete={onMarkComplete}
        showSubmitGateReview={showSubmitGateReview}
        onSubmitGateReview={onSubmitGateReview}
        saveArtifactDisabledReason={saveArtifactDisabledReason}
        markCompleteDisabledReason={markCompleteDisabledReason}
      />

      <RightDrawer
        open={guideOpen}
        title="Template Guide"
        onClose={() => setGuideOpen(false)}
        testId="template-guide-drawer"
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setGuideOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <GuideSection title="Template purpose">
            <p>{wizardHeader.purpose}</p>
          </GuideSection>
          <GuideSection title="Owner / responsible role">
            <p>
              {wizardHeader.ownerName} · {responsibleRole}
            </p>
          </GuideSection>
          <GuideSection title="Required sections">
            <ul className="list-inside list-disc space-y-1">
              {requiredSections.map((section) => (
                <li key={section.id}>{section.title}</li>
              ))}
            </ul>
          </GuideSection>
          <GuideSection title="Completion criteria">
            <ul className="list-inside list-disc space-y-1">
              <li>
                {validationSummary.requiredFieldsComplete}/{validationSummary.requiredFieldsTotal} required fields complete.
              </li>
              <li>
                {validationSummary.sectionsComplete}/{validationSummary.sectionsTotal} sections complete.
              </li>
              <li>{validationSummary.exportReady ? "Ready for export." : "Resolve validation issues before final export."}</li>
            </ul>
          </GuideSection>
          <GuideSection title="Evidence expectations">
            <p>
              {validationSummary.evidenceLinksComplete}/{validationSummary.evidenceLinksRequired} evidence links complete. Attach supporting evidence before gate review when the template requests evidence.
            </p>
          </GuideSection>
          <GuideSection title="Validation rules">
            <ul className="list-inside list-disc space-y-1">
              {validationRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </GuideSection>
          <GuideSection title="Example completed output">
            <pre className="max-h-64 overflow-auto rounded-xl border bg-muted/30 p-3 text-[12px] text-foreground">
              {markdownPreview.markdown}
            </pre>
          </GuideSection>
          <GuideSection title="Related lifecycle phase / gate">
            <p>
              Phase {wizardHeader.phaseNumber} · {wizardHeader.phaseName}
              {selectedTemplate?.gateCode ? ` · ${selectedTemplate.gateCode}` : ""}
            </p>
          </GuideSection>
        </div>
      </RightDrawer>

      <RightDrawer
        open={versionOpen}
        title="Template Version Details"
        onClose={() => setVersionOpen(false)}
        testId="template-version-detail-drawer"
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setVersionOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedTemplate ? (
          <div className="space-y-5">
            <GuideSection title="Template version">
              <p>{selectedTemplate.version}</p>
            </GuideSection>
            <GuideSection title="Schema version">
              <p>{selectedTemplate.schemaVersion}</p>
            </GuideSection>
            <GuideSection title="Release date">
              <p>{selectedTemplate.releaseDateLabel}</p>
            </GuideSection>
            <GuideSection title="Change summary">
              <p>{selectedTemplate.changeSummary}</p>
            </GuideSection>
            <GuideSection title="Added fields">
              {selectedTemplate.addedFields.length > 0 ? (
                <ul className="list-inside list-disc space-y-1">
                  {selectedTemplate.addedFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              ) : (
                <p>No added fields recorded for this version.</p>
              )}
            </GuideSection>
            <GuideSection title="Removed / deprecated fields">
              {selectedTemplate.deprecatedFields.length > 0 ? (
                <ul className="list-inside list-disc space-y-1">
                  {selectedTemplate.deprecatedFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              ) : (
                <p>No removed or deprecated fields recorded.</p>
              )}
            </GuideSection>
            <GuideSection title="Compatibility notes">
              <p>{selectedTemplate.compatibilityNotes}</p>
            </GuideSection>
            <GuideSection title="Migration impact">
              <p>{selectedTemplate.migrationImpact}</p>
            </GuideSection>
          </div>
        ) : (
          <p className="text-muted-foreground">No template version details available.</p>
        )}
      </RightDrawer>

      <RightDrawer
        open={artifactHistoryOpen}
        title="Artifact version history"
        onClose={() => setArtifactHistoryOpen(false)}
        testId="template-wizard-artifact-history-drawer"
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setArtifactHistoryOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {artifactVersionHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved versions yet for this template. Use <strong>Save Artifact</strong> to create a version you can
            compare or restore.
          </p>
        ) : (
          <ul className="space-y-2">
            {artifactVersionHistory.map((row) => {
              const isCurrent = row.id === currentArtifactId;
              const created = formatDateTimeAbsolute(new Date(row.createdAt));
              return (
                <li
                  key={row.id}
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm"
                  data-current={isCurrent ? "true" : undefined}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        v{row.version} · {row.status}
                        {isCurrent ? (
                          <span className="ml-2 rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1d4ed8]">
                            Latest loaded
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {created} · local {row.localId}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={`/projects/${project.id}/artifacts/${row.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
                        onClick={() => setArtifactHistoryOpen(false)}
                      >
                        View
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setArtifactHistoryOpen(false);
                          onRequestCompareArtifact(row.id);
                        }}
                      >
                        Compare
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setArtifactHistoryOpen(false);
                          onRequestRestoreArtifact(row);
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </RightDrawer>

      <SectionValidationDrawer
        open={validationSection != null}
        section={validationSection}
        issues={validationSection ? issuesBySection[validationSection.id] ?? [] : []}
        completionPercent={
          validationSection ? estimateSectionProgress(validationSection, formValues) : 0
        }
        evidenceLinksRequired={validationSummary.evidenceLinksRequired}
        evidenceLinksComplete={validationSummary.evidenceLinksComplete}
        onClose={() => setValidationSectionId(null)}
        onJumpToField={handleJumpToField}
      />

      <ValidationIssueDetailDrawer
        open={selectedValidationIssue != null}
        issue={selectedValidationIssue}
        sections={validationSectionOptions}
        fieldLabels={validationFieldLabels}
        onClose={() => setValidationIssueId(null)}
        onJumpToField={handleJumpToIssue}
      />

      <ValidationIssuesDrawer
        open={validationIssuesOpen}
        summary={validationSummary}
        sections={validationSectionOptions}
        fieldLabels={validationFieldLabels}
        onClose={() => setValidationIssuesOpen(false)}
        onOpenIssue={handleOpenValidationIssue}
        onJumpToIssue={handleJumpToIssue}
      />

      <ValidationProgressModal
        open={validationProgressOpen}
        summary={validationSummary}
        onClose={() => setValidationProgressOpen(false)}
      />

      <AddOptionalSectionModal
        open={addOptionalOpen}
        phaseNumber={wizardHeader.phaseNumber}
        phaseName={wizardHeader.phaseName}
        availableSections={availableOptionalSections}
        onClose={() => setAddOptionalOpen(false)}
        onAdd={(definitionId) => {
          setAddOptionalOpen(false);
          onAddOptionalSection(definitionId);
        }}
      />

      <RemoveSectionConfirmationModal
        open={removeTargetSection != null}
        section={removeTargetSection}
        hasFieldValues={
          removeTargetSection
            ? removeTargetSection.fields.some((f) => {
                const v = formValues[f.name];
                return (
                  v !== undefined &&
                  v !== null &&
                  v !== "" &&
                  !(Array.isArray(v) && v.length === 0)
                );
              })
            : false
        }
        onCancel={() => setRemoveTargetSectionId(null)}
        onConfirm={(sectionId) => {
          setRemoveTargetSectionId(null);
          onRemoveOptionalSection(sectionId);
        }}
      />
    </div>
  );
}

function SectionValidationDrawer({
  open,
  section,
  issues,
  completionPercent,
  evidenceLinksRequired,
  evidenceLinksComplete,
  onClose,
  onJumpToField,
}: {
  open: boolean;
  section: TemplateSection | null;
  issues: ValidationIssue[];
  completionPercent: number;
  evidenceLinksRequired: number;
  evidenceLinksComplete: number;
  onClose: () => void;
  onJumpToField: (sectionId: string, fieldName?: string) => void;
}) {
  const missingRequired = section
    ? section.fields.filter((field) => {
        if (!field.required || field.delegateToWorkspace) return false;
        return issues.some(
          (i) =>
            i.fieldName === field.name &&
            i.message.toLowerCase().includes("required"),
        );
      })
    : [];
  const warningIssues = issues.filter((i) => i.severity === "warning");
  const errorIssues = issues.filter((i) => i.severity === "error");
  const evidenceGapFields = section
    ? section.fields.filter(
        (field) =>
          field.required &&
          field.type === "evidence_link" &&
          !field.delegateToWorkspace &&
          issues.some((i) => i.fieldName === field.name),
      )
    : [];
  const recommendedFixes = section
    ? buildRecommendedFixes(section, issues)
    : [];

  return (
    <RightDrawer
      open={open}
      title={section ? `Section validation · ${section.title}` : "Section validation"}
      onClose={onClose}
      testId="section-validation-drawer"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {section ? (
        <div className="space-y-5">
          <div className="rounded-xl border bg-muted/20 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Section
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {section.order}. {section.title}
            </p>
            {section.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Completion
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#2563eb]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {completionPercent}%
              </span>
            </div>
          </div>

          <IssueGroup
            title="Required missing fields"
            tone="neutral"
            emptyMessage="No required fields missing."
            items={missingRequired.map((field) => ({
              id: `missing-${field.name}`,
              label: field.label,
              fieldName: field.name,
              detail: field.helpText,
            }))}
            onJump={(fieldName) => onJumpToField(section.id, fieldName)}
          />
          <IssueGroup
            title="Warning fields"
            tone="warning"
            emptyMessage="No warnings."
            items={warningIssues.map((issue) => ({
              id: issue.id,
              label: issue.message,
              fieldName: issue.fieldName,
            }))}
            onJump={(fieldName) => onJumpToField(section.id, fieldName)}
          />
          <IssueGroup
            title="Error fields"
            tone="error"
            emptyMessage="No errors."
            items={errorIssues.map((issue) => ({
              id: issue.id,
              label: issue.message,
              fieldName: issue.fieldName,
            }))}
            onJump={(fieldName) => onJumpToField(section.id, fieldName)}
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Evidence gaps
            </p>
            {evidenceGapFields.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                No evidence gaps detected in this section.
                {" "}
                ({evidenceLinksComplete}/{evidenceLinksRequired} evidence links overall)
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {evidenceGapFields.map((field) => (
                  <li key={field.name}>
                    <button
                      type="button"
                      onClick={() => onJumpToField(section.id, field.name)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:bg-muted/50"
                    >
                      <span>{field.label}</span>
                      <span className="text-xs font-semibold text-[#2563eb]">Jump to field</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended fixes
            </p>
            {recommendedFixes.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No fixes recommended.</p>
            ) : (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground/90">
                {recommendedFixes.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Select a section to view validation details.</p>
      )}
    </RightDrawer>
  );
}

function IssueGroup({
  title,
  tone,
  emptyMessage,
  items,
  onJump,
}: {
  title: string;
  tone: "neutral" | "warning" | "error";
  emptyMessage: string;
  items: { id: string; label: string; fieldName?: string; detail?: string }[];
  onJump: (fieldName?: string) => void;
}) {
  const toneClasses =
    tone === "error"
      ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
      : tone === "warning"
        ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
        : "border-border bg-muted/30 text-foreground";
  const Icon = tone === "warning" ? AlertTriangle : AlertCircle;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onJump(item.fieldName)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition hover:opacity-90",
                  toneClasses,
                )}
              >
                {tone !== "neutral" ? <Icon className="mt-0.5 size-4 shrink-0" aria-hidden /> : null}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{item.label}</span>
                  {item.detail ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
                  ) : null}
                </span>
                {item.fieldName ? (
                  <span className="shrink-0 text-xs font-semibold text-[#2563eb]">Jump to field</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function buildRecommendedFixes(
  section: TemplateSection,
  issues: ValidationIssue[],
): string[] {
  const fixes: string[] = [];
  if (issues.some((i) => i.severity === "error")) {
    fixes.push("Resolve all errors before requesting gate review.");
  }
  if (issues.some((i) => i.severity === "warning")) {
    fixes.push("Address warnings to improve export readiness.");
  }
  if (
    section.fields.some(
      (f) => f.type === "evidence_link" && f.required && !f.delegateToWorkspace,
    )
  ) {
    fixes.push("Attach supporting evidence for evidence-link fields in this section.");
  }
  if (section.fields.some((f) => f.type === "score_matrix")) {
    fixes.push("Ensure scoring matrix weights total 100% and every cell has a score with justification.");
  }
  return fixes;
}

function AddOptionalSectionModal({
  open,
  phaseNumber,
  phaseName,
  availableSections,
  onClose,
  onAdd,
}: {
  open: boolean;
  phaseNumber: number;
  phaseName: string;
  availableSections: OptionalSectionDefinition[];
  onClose: () => void;
  onAdd: (definitionId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(availableSections[0]?.id ?? null);

  useEffect(() => {
    if (!open) return;
    setSelectedId(availableSections[0]?.id ?? null);
  }, [open, availableSections]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selected = availableSections.find((s) => s.id === selectedId) ?? null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="flex max-h-[min(760px,100vh-2rem)] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        data-testid="add-optional-section-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-optional-section-title"
      >
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="add-optional-section-title" className="text-lg font-semibold text-foreground">
              Add optional section
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Insert an optional section into the artifact draft for Phase {phaseNumber} · {phaseName}.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {availableSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No optional sections are available for this template.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <ul className="space-y-1.5">
                {availableSections.map((definition) => {
                  const active = definition.id === selectedId;
                  return (
                    <li key={definition.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(definition.id)}
                        className={cn(
                          "block w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                          active
                            ? "border-[#2563eb] bg-[#eff6ff] text-[#1e40af]"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <span className="block font-semibold">{definition.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {definition.previewFields.length} fields
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {selected ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Description
                    </p>
                    <p className="mt-1 text-sm text-foreground/90">
                      {selected.description ?? "No description provided for this section."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {selected.requiredByPhase ? (
                      <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 font-semibold uppercase tracking-wide text-[#92400e]">
                        Required by phase
                      </span>
                    ) : null}
                    {selected.requiredByGate ? (
                      <span className="rounded-full bg-[#fee2e2] px-2 py-0.5 font-semibold uppercase tracking-wide text-[#991b1b]">
                        Required by gate {selected.requiredByGate}
                      </span>
                    ) : null}
                    {!selected.requiredByPhase && !selected.requiredByGate ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 font-semibold uppercase tracking-wide text-muted-foreground">
                        Optional
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Preview fields
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {selected.previewFields.map((field) => (
                        <li
                          key={field.name}
                          className="flex items-center justify-between rounded-lg border bg-background px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium text-foreground">{field.label}</span>
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded bg-muted px-1.5 py-0.5">{field.typeLabel}</span>
                            {field.required ? (
                              <span className="font-semibold text-[#b45309]">Required</span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (selected) onAdd(selected.id);
            }}
          >
            Add section
          </Button>
        </footer>
      </div>
    </div>
  );
}

function RemoveSectionConfirmationModal({
  open,
  section,
  hasFieldValues,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  section: TemplateSection | null;
  hasFieldValues: boolean;
  onCancel: () => void;
  onConfirm: (sectionId: string) => void;
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) return;
    setTyped("");
  }, [open, section?.id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || !section) return null;

  const destructive = hasFieldValues;
  const matchesName = !destructive || typed.trim() === section.title;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        data-testid="remove-section-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-section-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="remove-section-title" className="text-lg font-semibold text-foreground">
              Remove section
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{section.title}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
            <p className="font-medium">Removal impact</p>
            <p className="mt-1 text-xs">
              The section will be removed from this artifact draft. Validation totals and gate readiness will be recalculated.
            </p>
          </div>
          {destructive ? (
            <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[#991b1b]">
              <p className="font-medium">Data loss warning</p>
              <p className="mt-1 text-xs">
                This section contains saved field values. Removing it will discard those answers. This cannot be undone after you save the draft.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              This section has no saved values yet.
            </p>
          )}
          {destructive ? (
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Type the section name to confirm:{" "}
                <span className="font-semibold text-foreground">{section.title}</span>
              </span>
              <input
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                data-testid="remove-section-confirm-input"
              />
            </label>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!matchesName}
            data-testid="remove-section-confirm"
            onClick={() => onConfirm(section.id)}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
