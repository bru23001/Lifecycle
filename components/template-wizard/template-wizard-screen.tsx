"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getWizardArtifactSnapshot } from "@/app/actions/getWizardArtifactSnapshot";
import { saveArtifact } from "@/app/actions/saveArtifact";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import {
  computeValidationSummary,
  deriveSectionStatus,
} from "@/lib/template-wizard-computed";
import {
  buildPersistedEvidenceLinks,
  evidenceIdsForTarget,
  linkEvidence as linkEvidenceInStore,
  nextStagedEvidenceId,
  targetsForEvidence,
  unlinkEvidence as unlinkEvidenceFromStore,
} from "@/lib/wizard-evidence-store";
import type {
  TemplateSelectionItem,
  TemplateWizardData,
  ValidationIssue,
  WizardArtifactVersionSummary,
  WizardEvidenceItem,
  WizardEvidenceLink,
  WizardEvidenceTarget,
} from "@/types/template-wizard.types";
import { toJsonEvidence } from "@/templates/renderJsonEvidence";
import { toMarkdown } from "@/templates/renderMarkdown";
import { EvidenceDetailDrawer } from "@/components/template-wizard/evidence-detail-drawer";
import { LinkEvidenceModal } from "@/components/template-wizard/link-evidence-modal";
import { RemoveEvidenceLinkConfirmationModal } from "@/components/template-wizard/remove-evidence-link-confirmation-modal";
import { TemplateWizardContent } from "@/components/template-wizard/template-wizard-content";
import {
  UploadEvidenceModal,
  type UploadEvidenceDraft,
} from "@/components/template-wizard/upload-evidence-modal";
import {
  WizardEvidenceProvider,
  type WizardEvidenceContextValue,
} from "@/components/template-wizard/wizard-evidence-context";
import {
  AutosaveFailureModal,
  CannotMarkCompleteModal,
  ExportPackageModal,
  MarkCompleteConfirmModal,
  SaveArtifactConfirmModal,
  SubmitGateReviewModal,
} from "@/components/template-wizard/template-wizard-flow-modals";
import {
  RestoreVersionConfirmModal,
  UnsavedLeaveModal,
  VersionCompareModal,
} from "@/components/template-wizard/template-wizard-version-modals";
import { buildTemplateWizardArtifactZip, type ArtifactPackageOptions } from "@/lib/template-wizard-export-package";
import { diffFormFieldRecords } from "@/lib/template-wizard-artifact-diff";
import { buildLocalDraftDownloadPayload, persistLocalDraft } from "@/lib/template-wizard-local-draft";
import { toUserMessage } from "@/lib/toUserMessage";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadFile(filename: string, content: string, mime: string) {
  downloadBlob(filename, new Blob([content], { type: mime }));
}

function inferOptionalSectionIdsFromValues(
  defs: TemplateWizardData["selectedTemplate"]["optionalSections"],
  values: Record<string, unknown>,
): string[] {
  return defs
    .filter((d) =>
      d.section.fields.some((f) => {
        const v = values[f.name];
        return (
          v !== undefined &&
          v !== null &&
          v !== "" &&
          !(Array.isArray(v) && v.length === 0)
        );
      }),
    )
    .map((d) => d.id);
}

const defaultArtifactPackageOptions = (): ArtifactPackageOptions => ({
  includeMarkdown: true,
  includeJsonEvidence: true,
  includeEvidenceManifest: true,
  includeLinkedEvidenceFiles: true,
  includeValidationReport: true,
  includeVersionMetadata: true,
});

export function TemplateWizardScreen({ initial }: { initial: TemplateWizardData }) {
  const router = useRouter();
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
  const [addedOptionalSectionIds, setAddedOptionalSectionIds] = useState<string[]>([]);

  const initialEvidenceCatalog = useMemo<WizardEvidenceItem[]>(() => {
    const fromInitial = initial.evidenceCatalog ?? [];
    const seenIds = new Set(fromInitial.map((item) => item.id));
    const synthesized: WizardEvidenceItem[] = [];
    for (const link of initial.persistedEvidenceLinks ?? []) {
      if (seenIds.has(link.evidenceId)) continue;
      seenIds.add(link.evidenceId);
      synthesized.push({
        id: link.evidenceId,
        evidenceCode: link.evidenceId,
        name: `Linked evidence ${link.evidenceId}`,
        evidenceType: "document",
        classification: "internal",
        tags: [],
        href: `/projects/${initial.project.id}/evidence/${encodeURIComponent(link.evidenceId)}`,
      });
    }
    return [...fromInitial, ...synthesized];
  }, [initial.evidenceCatalog, initial.persistedEvidenceLinks, initial.project.id]);

  const initialEvidenceLinks = useMemo<WizardEvidenceLink[]>(() => {
    return (initial.persistedEvidenceLinks ?? []).map((link) => {
      if (link.linkedToFieldName) {
        return {
          evidenceId: link.evidenceId,
          target: { kind: "field" as const, fieldName: link.linkedToFieldName },
        };
      }
      if (link.linkedToSectionId) {
        return {
          evidenceId: link.evidenceId,
          target: { kind: "section" as const, sectionId: link.linkedToSectionId },
        };
      }
      return { evidenceId: link.evidenceId, target: { kind: "artifact" as const } };
    });
  }, [initial.persistedEvidenceLinks]);

  const [evidenceCatalog, setEvidenceCatalog] =
    useState<WizardEvidenceItem[]>(initialEvidenceCatalog);
  const [evidenceLinks, setEvidenceLinks] =
    useState<WizardEvidenceLink[]>(initialEvidenceLinks);
  const [linkModalState, setLinkModalState] = useState<{
    open: boolean;
    target: WizardEvidenceTarget | null;
  }>({ open: false, target: null });
  const [uploadModalState, setUploadModalState] = useState<{
    open: boolean;
    target: WizardEvidenceTarget | null;
  }>({ open: false, target: null });
  const [detailEvidenceId, setDetailEvidenceId] = useState<string | null>(null);
  const [removeLink, setRemoveLink] = useState<{
    evidenceId: string;
    target: WizardEvidenceTarget;
  } | null>(null);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<Date | null>(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [autosaveFailure, setAutosaveFailure] = useState<{ message: string } | null>(null);
  const [exportPackageOpen, setExportPackageOpen] = useState(false);
  const [exportPackageBasename, setExportPackageBasename] = useState("");
  const [exportPackageOptions, setExportPackageOptions] = useState<ArtifactPackageOptions>(
    defaultArtifactPackageOptions,
  );
  const [exportPackageBusy, setExportPackageBusy] = useState(false);
  const [saveArtifactOpen, setSaveArtifactOpen] = useState(false);
  const [saveArtifactSaving, setSaveArtifactSaving] = useState(false);
  const [saveArtifactError, setSaveArtifactError] = useState<string | null>(null);
  const [markCompleteOpen, setMarkCompleteOpen] = useState(false);
  const [cannotMarkCompleteOpen, setCannotMarkCompleteOpen] = useState(false);
  const [submitGateOpen, setSubmitGateOpen] = useState(false);
  const [wizardMarkedComplete, setWizardMarkedComplete] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareArtifactId, setCompareArtifactId] = useState<string | null>(null);
  const [compareSnapshot, setCompareSnapshot] = useState<Record<string, unknown> | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareLoadError, setCompareLoadError] = useState<string | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<WizardArtifactVersionSummary | null>(null);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [leaveGuard, setLeaveGuard] = useState<{ href: string; description: string } | null>(null);
  const [leaveSaveBusy, setLeaveSaveBusy] = useState(false);

  const optionalDefinitions = initial.selectedTemplate.optionalSections;

  const sections = useMemo(() => {
    const base = initial.selectedTemplate.sections.map((s) => ({
      ...s,
      status: deriveSectionStatus(s, formValues),
    }));
    const optionalAdded = addedOptionalSectionIds
      .map((id) => optionalDefinitions.find((d) => d.id === id))
      .filter((d): d is (typeof optionalDefinitions)[number] => Boolean(d))
      .map((definition, idx) => {
        const section = {
          ...definition.section,
          order: base.length + idx + 1,
          required: false,
          optional: true,
        };
        return {
          ...section,
          status: deriveSectionStatus(section, formValues),
        };
      });
    return [...base, ...optionalAdded];
  }, [
    initial.selectedTemplate.sections,
    addedOptionalSectionIds,
    optionalDefinitions,
    formValues,
  ]);

  const availableOptionalSections = useMemo(
    () => optionalDefinitions.filter((d) => !addedOptionalSectionIds.includes(d.id)),
    [optionalDefinitions, addedOptionalSectionIds],
  );

  const addOptionalSection = useCallback((definitionId: string) => {
    setAddedOptionalSectionIds((prev) =>
      prev.includes(definitionId) ? prev : [...prev, definitionId],
    );
    setAutosaveLabel("Saving…");
  }, []);

  const removeOptionalSection = useCallback(
    (sectionId: string) => {
      const definition = optionalDefinitions.find((d) => d.section.id === sectionId);
      if (!definition) return;
      setAddedOptionalSectionIds((prev) => prev.filter((id) => id !== definition.id));
      setFormValues((prev) => {
        const next = { ...prev };
        for (const field of definition.section.fields) {
          delete next[field.name];
        }
        return next;
      });
      setActiveSectionId((prev) => (prev === sectionId ? initial.activeSectionId : prev));
      setAutosaveLabel("Saving…");
    },
    [optionalDefinitions, initial.activeSectionId],
  );

  const syncFieldFormValueFromLinks = useCallback(
    (fieldName: string, nextLinks: WizardEvidenceLink[]) => {
      const ids = evidenceIdsForTarget(nextLinks, { kind: "field", fieldName });
      setFormValues((prev) => ({ ...prev, [fieldName]: ids }));
    },
    [],
  );

  const linkExistingEvidence = useCallback(
    (evidenceIds: string[], target: WizardEvidenceTarget) => {
      setEvidenceLinks((prev) => {
        let next = prev;
        for (const id of evidenceIds) {
          next = linkEvidenceInStore(next, id, target);
        }
        if (target.kind === "field") {
          syncFieldFormValueFromLinks(target.fieldName, next);
        }
        return next;
      });
      setAutosaveLabel("Saving…");
    },
    [syncFieldFormValueFromLinks],
  );

  const unlinkOne = useCallback(
    (evidenceId: string, target: WizardEvidenceTarget) => {
      setEvidenceLinks((prev) => {
        const next = unlinkEvidenceFromStore(prev, evidenceId, target);
        if (target.kind === "field") {
          syncFieldFormValueFromLinks(target.fieldName, next);
        }
        return next;
      });
      setAutosaveLabel("Saving…");
    },
    [syncFieldFormValueFromLinks],
  );

  const deleteEvidenceItem = useCallback(
    (evidenceId: string) => {
      let removedFieldTargets: string[] = [];
      setEvidenceLinks((prevLinks) => {
        removedFieldTargets = prevLinks
          .filter((link) => link.evidenceId === evidenceId && link.target.kind === "field")
          .map((link) => (link.target as { kind: "field"; fieldName: string }).fieldName);
        return prevLinks.filter((link) => link.evidenceId !== evidenceId);
      });
      setEvidenceCatalog((prev) => prev.filter((item) => item.id !== evidenceId));
      if (removedFieldTargets.length > 0) {
        setFormValues((prev) => {
          const next = { ...prev };
          for (const name of removedFieldTargets) {
            const existing = Array.isArray(next[name]) ? (next[name] as string[]) : [];
            next[name] = existing.filter((id) => id !== evidenceId);
          }
          return next;
        });
      }
      setAutosaveLabel("Saving…");
    },
    [],
  );

  useEffect(() => {
    setFormValues((prev) => {
      const next = { ...prev };
      let changed = false;
      const grouped = new Map<string, string[]>();
      for (const link of initialEvidenceLinks) {
        if (link.target.kind !== "field") continue;
        const list = grouped.get(link.target.fieldName) ?? [];
        list.push(link.evidenceId);
        grouped.set(link.target.fieldName, list);
      }
      for (const [fieldName, ids] of grouped) {
        const current = Array.isArray(next[fieldName]) ? (next[fieldName] as string[]) : [];
        const merged = Array.from(new Set([...current, ...ids]));
        if (merged.length !== current.length || merged.some((id, i) => current[i] !== id)) {
          next[fieldName] = merged;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // Seed once from initial; subsequent updates are driven by mutators.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageUpload = useCallback(
    (draft: UploadEvidenceDraft, target: WizardEvidenceTarget) => {
      const newId = nextStagedEvidenceId(evidenceCatalog);
      const evidenceCode = newId.toUpperCase();
      const newItem: WizardEvidenceItem = {
        id: newId,
        evidenceCode,
        name: draft.name,
        description: draft.description,
        evidenceType: draft.evidenceType,
        classification: draft.classification,
        source: draft.source,
        retentionPolicyLabel: draft.retentionPolicyLabel,
        tags: draft.tags,
        phaseNumber: draft.phaseNumber,
        phaseName: draft.phaseName,
        gateCode: draft.gateCode,
        uploadedBy: initial.user.name,
        uploadedOnLabel: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        href: `/projects/${initial.project.id}/evidence/${encodeURIComponent(newId)}`,
        staged: true,
      };
      setEvidenceCatalog((prev) => [...prev, newItem]);
      setEvidenceLinks((prev) => {
        const next = linkEvidenceInStore(prev, newId, target);
        if (target.kind === "field") {
          syncFieldFormValueFromLinks(target.fieldName, next);
        }
        return next;
      });
      setAutosaveLabel("Saving…");
    },
    [evidenceCatalog, initial.project.id, initial.user.name, syncFieldFormValueFromLinks],
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

  const persistedEvidenceLinksForPreview = useMemo(
    () => buildPersistedEvidenceLinks(evidenceLinks),
    [evidenceLinks],
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
        persistedArtifactId: initial.persistedArtifactId ?? initial.artifactSaveState.artifactId,
        evidenceLinks: persistedEvidenceLinksForPreview,
      }),
    [
      wizardHeader,
      initial.selectedTemplate,
      initial.project.id,
      initial.user.name,
      initial.persistedArtifactId,
      initial.artifactSaveState.artifactId,
      persistedEvidenceLinksForPreview,
      sections,
      formValues,
      validationSummary,
    ],
  );

  const compareSectionsForPreview = useMemo(() => {
    if (!compareSnapshot) return [];
    return initial.selectedTemplate.sections.map((s) => ({
      ...s,
      status: deriveSectionStatus(s, compareSnapshot),
    }));
  }, [compareSnapshot, initial.selectedTemplate.sections]);

  const compareValidationSummary = useMemo(
    () =>
      compareSnapshot
        ? computeValidationSummary(
            {
              ...initial.wizardHeader,
              completionPercent: initial.wizardHeader.completionPercent,
            },
            compareSectionsForPreview,
            compareSnapshot,
          )
        : validationSummary,
    [compareSnapshot, compareSectionsForPreview, initial.wizardHeader, validationSummary],
  );

  const compareMarkdownBody = useMemo(() => {
    if (!compareSnapshot) return "";
    return toMarkdown({
      wizardHeader,
      sections: compareSectionsForPreview,
      formValues: compareSnapshot,
      generatedAtLabel,
    }).markdown;
  }, [compareSnapshot, compareSectionsForPreview, wizardHeader, generatedAtLabel]);

  const compareJsonBody = useMemo(() => {
    if (!compareSnapshot) return "";
    const ev = toJsonEvidence({
      wizardHeader,
      selectedTemplate: initial.selectedTemplate,
      projectId: initial.project.id,
      generatedBy: initial.user.name,
      sections: compareSectionsForPreview,
      formValues: compareSnapshot,
      validationSummary: compareValidationSummary,
      persistedArtifactId: compareArtifactId ?? undefined,
      evidenceLinks: initial.persistedEvidenceLinks,
    });
    return JSON.stringify(ev, null, 2);
  }, [
    compareSnapshot,
    compareSectionsForPreview,
    wizardHeader,
    initial.selectedTemplate,
    initial.project.id,
    initial.user.name,
    compareValidationSummary,
    compareArtifactId,
    initial.persistedEvidenceLinks,
  ]);

  const compareFieldRows = useMemo(() => {
    if (!compareSnapshot) return [];
    return diffFormFieldRecords(formValues, compareSnapshot);
  }, [formValues, compareSnapshot]);

  const currentJsonBody = useMemo(() => JSON.stringify(jsonEvidence, null, 2), [jsonEvidence]);

  const compareArtifactLabel = useMemo(() => {
    if (!compareArtifactId) return "";
    const row = initial.artifactVersionHistory.find((r) => r.id === compareArtifactId);
    return row
      ? `v${row.version} · ${row.status} · ${new Date(row.createdAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}`
      : "Saved version";
  }, [compareArtifactId, initial.artifactVersionHistory]);

  useEffect(() => {
    if (!compareOpen || !compareArtifactId) {
      setCompareLoading(false);
      return;
    }
    let cancelled = false;
    setCompareLoading(true);
    setCompareSnapshot(null);
    setCompareLoadError(null);
    void getWizardArtifactSnapshot({
      projectId: initial.project.id,
      artifactId: compareArtifactId,
    }).then((res) => {
      if (cancelled) return;
      setCompareLoading(false);
      if (!res.ok) {
        setCompareLoadError(res.error);
        return;
      }
      if (res.templateId !== initial.selectedTemplate.id) {
        setCompareLoadError("That version belongs to a different template.");
        return;
      }
      setCompareSnapshot(res.dataJson);
    });
    return () => {
      cancelled = true;
    };
  }, [compareOpen, compareArtifactId, initial.project.id, initial.selectedTemplate.id]);

  const selectedGateCode = useMemo(() => {
    const sel = initial.templateSelections.find((t) => t.id === initial.selectedTemplate.id);
    return sel?.gateCode ?? null;
  }, [initial.templateSelections, initial.selectedTemplate.id]);

  const gateReviewHref = useMemo(() => {
    if (!selectedGateCode) return "";
    const slug = selectedGateCode.toLowerCase();
    return `/projects/${initial.project.id}/gates/${slug}/review`;
  }, [selectedGateCode, initial.project.id]);

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

  const persistDraftSilent = useCallback(() => {
    const r = persistLocalDraft(storageKey, formValues);
    if (r.ok) {
      setLastDraftSavedAt(r.savedAt);
      setAutosaveFailure(null);
      return true;
    }
    setAutosaveFailure({ message: r.error });
    return false;
  }, [formValues, storageKey]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      persistDraftSilent();
    }, 1000);
    return () => window.clearTimeout(handle);
  }, [formValues, storageKey, persistDraftSilent]);

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
    const ok = persistDraftSilent();
    if (ok) {
      setDraftSavedToast(true);
      window.setTimeout(() => setDraftSavedToast(false), 2200);
      bumpAutosave();
    }
  }, [persistDraftSilent, bumpAutosave]);

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

  useEffect(() => {
    if (!exportPackageOpen) return;
    setExportPackageOptions(defaultArtifactPackageOptions());
    const slug = wizardHeader.templateCode.replace(/[^a-z0-9]+/gi, "-");
    setExportPackageBasename(`${slug}-artifact-package.zip`);
  }, [exportPackageOpen, wizardHeader.templateCode]);

  const runExportArtifactPackage = useCallback(async () => {
    setExportPackageBusy(true);
    try {
      const zipName = exportPackageBasename.trim() || `${wizardHeader.templateCode}-artifact-package.zip`;
      const blob = await buildTemplateWizardArtifactZip({
        packageBasename: zipName,
        markdown: markdownPreview.markdown,
        jsonEvidence,
        validationSummary,
        manifestExtras: {
          templateCode: wizardHeader.templateCode,
          templateName: wizardHeader.templateName,
          phaseNumber: wizardHeader.phaseNumber,
          phaseName: wizardHeader.phaseName,
          artifactVersion: jsonEvidence.artifactVersion,
          templateVersion: jsonEvidence.templateVersion,
          generatedAt: jsonEvidence.generatedAt,
          projectId: initial.project.id,
        },
        options: exportPackageOptions,
      });
      const safe = zipName.toLowerCase().endsWith(".zip") ? zipName : `${zipName}.zip`;
      downloadBlob(safe, blob);
      setExportPackageOpen(false);
    } finally {
      setExportPackageBusy(false);
    }
  }, [
    exportPackageBasename,
    exportPackageOptions,
    initial.project.id,
    jsonEvidence,
    markdownPreview.markdown,
    validationSummary,
    wizardHeader.phaseName,
    wizardHeader.phaseNumber,
    wizardHeader.templateCode,
    wizardHeader.templateName,
  ]);

  const confirmSaveArtifact = useCallback(async () => {
    setSaveArtifactSaving(true);
    setSaveArtifactError(null);
    try {
      const res = await saveArtifact({
        templateId: initial.selectedTemplate.id,
        data: formValues,
        projectId: initial.project.id,
      });
      if (!res.ok) {
        const details =
          res.fieldErrors &&
          Object.entries(res.fieldErrors)
            .filter(([, m]) => m?.length)
            .map(([k, m]) => `${k}: ${m?.join(", ")}`)
            .join(" · ");
        setSaveArtifactError([toUserMessage(res.error), details].filter(Boolean).join(" "));
        return;
      }
      setSaveArtifactOpen(false);
      setDraftSavedToast(true);
      window.setTimeout(() => setDraftSavedToast(false), 2200);
      router.refresh();
    } catch (e) {
      setSaveArtifactError(toUserMessage(e));
    } finally {
      setSaveArtifactSaving(false);
    }
  }, [formValues, initial.project.id, initial.selectedTemplate.id, router]);

  const markCompleteDisabledReason =
    validationSummary.errorCount > 0 || validationSummary.warningCount > 0
      ? "Resolve validation warnings and errors in the Validation Panel."
      : null;

  const saveArtifactDisabledReason = !initial.artifactSaveState.canSave
    ? initial.artifactSaveState.blockers.join("; ") || "Artifact cannot be saved yet."
    : null;

  const handleMarkCompleteClick = useCallback(() => {
    if (markCompleteDisabledReason) {
      setCannotMarkCompleteOpen(true);
    } else {
      setMarkCompleteOpen(true);
    }
  }, [markCompleteDisabledReason]);

  const confirmMarkComplete = useCallback(() => {
    setMarkCompleteOpen(false);
    setWizardMarkedComplete(true);
    setAutosaveLabel("Marked complete · saved");
    saveDraft();
  }, [saveDraft]);

  const handleJumpBlockingIssue = useCallback(
    (issue: ValidationIssue) => {
      setCannotMarkCompleteOpen(false);
      onIssueClick(issue);
    },
    [onIssueClick],
  );

  const hasUnsavedChanges = useMemo(() => {
    const formDirty = JSON.stringify(formValues) !== JSON.stringify(initialFormValues);
    const optionalDirty = addedOptionalSectionIds.length > 0;
    return formDirty || optionalDirty;
  }, [formValues, initialFormValues, addedOptionalSectionIds]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const fn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [hasUnsavedChanges]);

  const guardedNavigate = useCallback(
    (href: string, description: string) => {
      if (hasUnsavedChanges) {
        setLeaveGuard({ href, description });
        return;
      }
      router.push(href);
    },
    [hasUnsavedChanges, router],
  );

  const switchTemplate = useCallback(
    (template: TemplateSelectionItem) => {
      if (template.id === initial.selectedTemplate.id) return;
      router.push(template.href);
    },
    [initial.selectedTemplate.id, router],
  );

  const applyComparePatch = useCallback(
    (updates: Record<string, unknown>, removeKeys: string[]) => {
      setFormValues((prev) => {
        const next = { ...prev, ...updates };
        for (const k of removeKeys) delete next[k];
        return next;
      });
      bumpAutosave();
      setCompareOpen(false);
      setCompareArtifactId(null);
      setCompareSnapshot(null);
      setCompareLoadError(null);
    },
    [bumpAutosave],
  );

  const requestCompareArtifact = useCallback((artifactId: string) => {
    setCompareArtifactId(artifactId);
    setCompareOpen(true);
  }, []);

  const requestRestoreArtifact = useCallback((row: WizardArtifactVersionSummary) => {
    setRestoreTarget(row);
    setRestoreOpen(true);
  }, []);

  const confirmRestoreVersion = useCallback(async () => {
    if (!restoreTarget) return;
    setRestoreBusy(true);
    try {
      const res = await getWizardArtifactSnapshot({
        projectId: initial.project.id,
        artifactId: restoreTarget.id,
      });
      if (!res.ok || res.templateId !== initial.selectedTemplate.id) {
        setRestoreOpen(false);
        setRestoreTarget(null);
        return;
      }
      setFormValues({ ...res.dataJson });
      setAddedOptionalSectionIds(
        inferOptionalSectionIdsFromValues(initial.selectedTemplate.optionalSections, res.dataJson),
      );
      setRestoreOpen(false);
      setRestoreTarget(null);
      bumpAutosave();
    } finally {
      setRestoreBusy(false);
    }
  }, [restoreTarget, initial.project.id, initial.selectedTemplate, bumpAutosave]);

  const closeCompareModal = useCallback(() => {
    setCompareOpen(false);
    setCompareArtifactId(null);
    setCompareSnapshot(null);
    setCompareLoadError(null);
  }, []);

  const discardChangesAndLeave = useCallback(() => {
    if (!leaveGuard) return;
    setFormValues({ ...initialFormValues });
    setAddedOptionalSectionIds([]);
    const href = leaveGuard.href;
    setLeaveGuard(null);
    router.push(href);
  }, [leaveGuard, initialFormValues, router]);

  const saveDraftLocallyAndLeave = useCallback(async () => {
    if (!leaveGuard) return;
    setLeaveSaveBusy(true);
    try {
      persistLocalDraft(storageKey, formValues);
      const href = leaveGuard.href;
      setLeaveGuard(null);
      router.push(href);
    } finally {
      setLeaveSaveBusy(false);
    }
  }, [leaveGuard, storageKey, formValues, router]);

  const requestSaveArtifact = useCallback(() => {
    if (saveArtifactDisabledReason) return;
    setSaveArtifactError(null);
    setSaveArtifactOpen(true);
  }, [saveArtifactDisabledReason]);

  const downloadLocalDraftJson = useCallback(() => {
    const payload = buildLocalDraftDownloadPayload({
      storageKey,
      formValues,
      templateId: initial.selectedTemplate.id,
      projectId: initial.project.id,
    });
    downloadFile(
      `draft-${initial.selectedTemplate.id}-${initial.project.id}.json`,
      payload,
      "application/json;charset=utf-8",
    );
  }, [formValues, initial.project.id, initial.selectedTemplate.id, storageKey]);

  const blockingIssuesForComplete = useMemo(
    () => validationSummary.issues.filter((i) => i.severity === "error" || i.severity === "warning"),
    [validationSummary.issues],
  );

  const showSubmitGateReview = wizardMarkedComplete && Boolean(gateReviewHref);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft();
      }
      if (mod && e.key === "Enter") {
        e.preventDefault();
        if (!saveArtifactDisabledReason) {
          setSaveArtifactOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveDraft, saveArtifactDisabledReason]);

  const phaseSummary = `Phase ${wizardHeader.phaseNumber} · ${wizardHeader.phaseName}`;

  const sectionTitles = useMemo(() => {
    const out: Record<string, string> = {};
    for (const s of sections) out[s.id] = s.title;
    return out;
  }, [sections]);

  const fieldLabels = useMemo(() => {
    const out: Record<string, string> = {};
    for (const s of sections) {
      for (const f of s.fields) out[f.name] = f.label;
    }
    return out;
  }, [sections]);

  const allFields = useMemo(() => {
    const out: { name: string; label: string; sectionId: string }[] = [];
    for (const s of sections) {
      for (const f of s.fields) out.push({ name: f.name, label: f.label, sectionId: s.id });
    }
    return out;
  }, [sections]);

  const phaseOptions = useMemo(
    () => [{ number: wizardHeader.phaseNumber, name: wizardHeader.phaseName }],
    [wizardHeader.phaseNumber, wizardHeader.phaseName],
  );

  const gateOptions = useMemo(
    () => (selectedGateCode ? [{ code: selectedGateCode, label: selectedGateCode }] : []),
    [selectedGateCode],
  );

  const knownEvidenceTypes = useMemo(() => {
    const set = new Set<WizardEvidenceItem["evidenceType"]>();
    for (const item of evidenceCatalog) set.add(item.evidenceType);
    return Array.from(set);
  }, [evidenceCatalog]);

  const evidenceController = useMemo<WizardEvidenceContextValue>(
    () => ({
      catalog: evidenceCatalog,
      links: evidenceLinks,
      projectId: initial.project.id,
      sectionTitles,
      fieldLabels,
      artifactTitle: markdownPreview.artifactTitle,
      knownEvidenceTypes,
      currentSectionId: activeSection.id,
      phaseNumber: wizardHeader.phaseNumber,
      phaseName: wizardHeader.phaseName,
      gateCode: selectedGateCode ?? undefined,
      openLinkModal: (target) => setLinkModalState({ open: true, target }),
      openUploadModal: (target) => setUploadModalState({ open: true, target }),
      openDetail: (evidenceId) => setDetailEvidenceId(evidenceId),
      requestUnlink: (evidenceId, target) => setRemoveLink({ evidenceId, target }),
    }),
    [
      evidenceCatalog,
      evidenceLinks,
      initial.project.id,
      sectionTitles,
      fieldLabels,
      markdownPreview.artifactTitle,
      knownEvidenceTypes,
      activeSection.id,
      wizardHeader.phaseNumber,
      wizardHeader.phaseName,
      selectedGateCode,
    ],
  );

  const detailEvidence = useMemo(
    () => (detailEvidenceId ? evidenceCatalog.find((e) => e.id === detailEvidenceId) ?? null : null),
    [detailEvidenceId, evidenceCatalog],
  );

  const detailLinkedTargets = useMemo(
    () => (detailEvidence ? targetsForEvidence(evidenceLinks, detailEvidence.id) : []),
    [detailEvidence, evidenceLinks],
  );

  const removeEvidence = useMemo(
    () => (removeLink ? evidenceCatalog.find((e) => e.id === removeLink.evidenceId) ?? null : null),
    [removeLink, evidenceCatalog],
  );

  const removeTotalLinkCount = useMemo(
    () =>
      removeLink ? evidenceLinks.filter((l) => l.evidenceId === removeLink.evidenceId).length : 0,
    [removeLink, evidenceLinks],
  );

  const linkModalAlreadyLinkedIds = useMemo(() => {
    if (!linkModalState.target) return [] as string[];
    return evidenceIdsForTarget(evidenceLinks, linkModalState.target);
  }, [linkModalState.target, evidenceLinks]);

  return (
    <div className="contents" data-route-smoke="template-wizard">
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
          userName={initial.user.name}
          userRole={initial.user.role}
          autosaveLabel={autosaveLabel}
        />
        <WizardEvidenceProvider value={evidenceController}>
        <TemplateWizardContent
          project={initial.project}
          responsibleRole={initial.user.role}
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
          availableOptionalSections={availableOptionalSections}
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
          onExportPackage={() => setExportPackageOpen(true)}
          onCancel={() =>
            guardedNavigate(`/projects/${initial.project.id}/workspace`, "Lifecycle Workspace")
          }
          onSwitchTemplate={switchTemplate}
          onSaveArtifact={requestSaveArtifact}
          onMarkComplete={handleMarkCompleteClick}
          showSubmitGateReview={showSubmitGateReview}
          onSubmitGateReview={() => setSubmitGateOpen(true)}
          onAddOptionalSection={addOptionalSection}
          onRemoveOptionalSection={removeOptionalSection}
          hasUnsavedChanges={hasUnsavedChanges}
          saveArtifactDisabledReason={saveArtifactDisabledReason}
          markCompleteDisabledReason={markCompleteDisabledReason}
          artifactVersionHistory={initial.artifactVersionHistory}
          currentArtifactId={initial.persistedArtifactId ?? initial.artifactSaveState.artifactId}
          onRequestCompareArtifact={requestCompareArtifact}
          onRequestRestoreArtifact={requestRestoreArtifact}
          onGuardedNavigate={guardedNavigate}
          persistedArtifactId={
            initial.persistedArtifactId ?? initial.artifactSaveState.artifactId
          }
          collaborationComments={initial.collaborationComments}
          collaborationReviewRequests={initial.collaborationReviewRequests}
        />

        <LinkEvidenceModal
          open={linkModalState.open}
          initialTarget={linkModalState.target}
          catalog={evidenceCatalog}
          alreadyLinkedIds={linkModalAlreadyLinkedIds}
          sections={sections.map((s) => ({ id: s.id, title: s.title }))}
          fields={allFields}
          artifactTitle={markdownPreview.artifactTitle}
          phaseOptions={phaseOptions.map((p) => ({
            number: p.number,
            label: `Phase ${p.number} · ${p.name}`,
          }))}
          gateOptions={gateOptions}
          onClose={() => setLinkModalState({ open: false, target: null })}
          onConfirm={(ids, target) => {
            linkExistingEvidence(ids, target);
            setLinkModalState({ open: false, target: null });
          }}
          onSwitchToUpload={(target) => {
            setLinkModalState({ open: false, target: null });
            setUploadModalState({ open: true, target });
          }}
        />

        <UploadEvidenceModal
          open={uploadModalState.open}
          initialTarget={uploadModalState.target}
          sections={sections.map((s) => ({ id: s.id, title: s.title }))}
          fields={allFields}
          artifactTitle={markdownPreview.artifactTitle}
          defaultPhaseNumber={wizardHeader.phaseNumber}
          defaultPhaseName={wizardHeader.phaseName}
          defaultGateCode={selectedGateCode ?? undefined}
          phaseOptions={phaseOptions}
          gateOptions={gateOptions}
          retentionPolicyOptions={[]}
          onClose={() => setUploadModalState({ open: false, target: null })}
          onUpload={(draft, target) => {
            stageUpload(draft, target);
            setUploadModalState({ open: false, target: null });
          }}
        />

        <EvidenceDetailDrawer
          open={detailEvidence != null}
          evidence={detailEvidence}
          linkedTargets={detailLinkedTargets}
          sectionTitles={sectionTitles}
          fieldLabels={fieldLabels}
          artifactTitle={markdownPreview.artifactTitle}
          onClose={() => setDetailEvidenceId(null)}
          onRequestUnlink={(evidenceId, target) => setRemoveLink({ evidenceId, target })}
        />

        <RemoveEvidenceLinkConfirmationModal
          open={removeLink != null}
          evidence={removeEvidence}
          target={removeLink?.target ?? null}
          totalLinkCount={removeTotalLinkCount}
          isStaged={Boolean(removeEvidence?.staged)}
          sectionTitles={sectionTitles}
          fieldLabels={fieldLabels}
          artifactTitle={markdownPreview.artifactTitle}
          onCancel={() => setRemoveLink(null)}
          onConfirm={(action) => {
            if (!removeLink || !removeEvidence) return;
            if (action === "unlink") {
              unlinkOne(removeLink.evidenceId, removeLink.target);
            } else {
              deleteEvidenceItem(removeLink.evidenceId);
              if (detailEvidenceId === removeLink.evidenceId) setDetailEvidenceId(null);
            }
            setRemoveLink(null);
          }}
        />
        </WizardEvidenceProvider>

        {draftSavedToast ? (
          <div
            role="status"
            aria-live="polite"
            data-testid="template-wizard-draft-saved-toast"
            className="fixed bottom-6 left-1/2 z-[140] -translate-x-1/2 rounded-lg border bg-card px-4 py-2 text-sm shadow-lg"
          >
            Draft saved
          </div>
        ) : null}

        <AutosaveFailureModal
          open={Boolean(autosaveFailure)}
          onClose={() => setAutosaveFailure(null)}
          errorMessage={autosaveFailure?.message ?? ""}
          lastSavedAt={lastDraftSavedAt}
          onRetry={() => {
            if (persistDraftSilent()) {
              setAutosaveFailure(null);
            }
          }}
          onDownloadLocalDraft={downloadLocalDraftJson}
        />

        <ExportPackageModal
          open={exportPackageOpen}
          onClose={() => setExportPackageOpen(false)}
          artifactName={markdownPreview.artifactTitle}
          packageBasename={exportPackageBasename}
          onBasenameChange={setExportPackageBasename}
          options={exportPackageOptions}
          onToggle={(key, value) =>
            setExportPackageOptions((prev) => ({
              ...prev,
              [key]: value,
            }))
          }
          onExport={() => void runExportArtifactPackage()}
          exporting={exportPackageBusy}
        />

        <SaveArtifactConfirmModal
          open={saveArtifactOpen}
          onClose={() => {
            if (!saveArtifactSaving) {
              setSaveArtifactOpen(false);
              setSaveArtifactError(null);
            }
          }}
          onConfirm={() => void confirmSaveArtifact()}
          saving={saveArtifactSaving}
          saveError={saveArtifactError}
          artifactName={markdownPreview.artifactTitle}
          artifactCode={initial.selectedTemplate.id}
          versionLabel={jsonEvidence.artifactVersion}
          statusAfterSave="Draft (saved)"
          phaseLabel={`Phase ${wizardHeader.phaseNumber} · ${wizardHeader.phaseName}`}
          gateLabel={selectedGateCode ?? "—"}
          validationSummary={validationSummary}
          isFirstSave={!initial.persistedArtifactId}
        />

        <MarkCompleteConfirmModal
          open={markCompleteOpen}
          onClose={() => setMarkCompleteOpen(false)}
          onConfirm={confirmMarkComplete}
          validationSummary={validationSummary}
        />

        <CannotMarkCompleteModal
          open={cannotMarkCompleteOpen}
          onClose={() => setCannotMarkCompleteOpen(false)}
          issues={blockingIssuesForComplete}
          onJumpToIssue={handleJumpBlockingIssue}
        />

        <SubmitGateReviewModal
          open={submitGateOpen}
          onClose={() => setSubmitGateOpen(false)}
          onSubmit={() => {
            setSubmitGateOpen(false);
            guardedNavigate(gateReviewHref, "Gate review");
          }}
          projectId={initial.project.id}
          gateHref={gateReviewHref}
          validationSummary={validationSummary}
          artifactName={markdownPreview.artifactTitle}
          approverNote="Approvers are assigned per gate in the gate review workflow."
        />

        <UnsavedLeaveModal
          open={Boolean(leaveGuard)}
          onStay={() => setLeaveGuard(null)}
          onDiscardAndLeave={discardChangesAndLeave}
          onSaveDraftAndLeave={saveDraftLocallyAndLeave}
          saveBusy={leaveSaveBusy}
          targetDescription={leaveGuard?.description ?? ""}
        />

        <VersionCompareModal
          open={compareOpen}
          onClose={closeCompareModal}
          loading={compareLoading}
          loadError={compareLoadError}
          artifactLabel={compareArtifactLabel}
          rows={compareFieldRows}
          currentMarkdown={markdownPreview.markdown}
          otherMarkdown={compareMarkdownBody}
          currentJson={currentJsonBody}
          otherJson={compareJsonBody}
          otherFormValues={compareSnapshot}
          onApplySelected={applyComparePatch}
        />

        <RestoreVersionConfirmModal
          open={restoreOpen}
          onClose={() => {
            if (!restoreBusy) {
              setRestoreOpen(false);
              setRestoreTarget(null);
            }
          }}
          onConfirm={async (reason: string) => {
            void reason;
            await confirmRestoreVersion();
          }}
          busy={restoreBusy}
          versionLabel={
            restoreTarget
              ? `v${restoreTarget.version} · ${restoreTarget.status} (${restoreTarget.localId})`
              : ""
          }
          currentImpactNote="Your open draft will be replaced by the snapshot. Use Save Artifact afterward to record a new version."
          artifactDetailHref={
            restoreTarget ? `/projects/${initial.project.id}/artifacts/${restoreTarget.id}` : undefined
          }
        />
      </AuthenticatedAppShell>
    </div>
  );
}
