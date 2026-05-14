"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type {
  WizardEvidenceItem,
  WizardEvidenceLink,
  WizardEvidenceTarget,
} from "@/types/template-wizard.types";
import { evidenceIdsForTarget } from "@/lib/wizard-evidence-store";

export type WizardEvidenceContextValue = {
  catalog: WizardEvidenceItem[];
  links: WizardEvidenceLink[];
  projectId: string;
  /** Map of section id → section title for label rendering. */
  sectionTitles: Record<string, string>;
  /** Map of field name → field label for label rendering. */
  fieldLabels: Record<string, string>;
  /** Artifact display title for label rendering. */
  artifactTitle: string;
  /** Sorted unique evidence types observed across the catalog (for filters). */
  knownEvidenceTypes: WizardEvidenceItem["evidenceType"][];
  /** Currently focused section + phase metadata used to seed Upload modal defaults. */
  currentSectionId: string;
  phaseNumber: number;
  phaseName: string;
  gateCode?: string;
  openLinkModal: (target: WizardEvidenceTarget) => void;
  openUploadModal: (target: WizardEvidenceTarget) => void;
  openDetail: (evidenceId: string) => void;
  requestUnlink: (evidenceId: string, target: WizardEvidenceTarget) => void;
};

const WizardEvidenceContext = createContext<WizardEvidenceContextValue | null>(null);

export function WizardEvidenceProvider({
  value,
  children,
}: {
  value: WizardEvidenceContextValue;
  children: ReactNode;
}) {
  return (
    <WizardEvidenceContext.Provider value={value}>{children}</WizardEvidenceContext.Provider>
  );
}

export function useWizardEvidence(): WizardEvidenceContextValue {
  const ctx = useContext(WizardEvidenceContext);
  if (!ctx) {
    throw new Error("useWizardEvidence must be used within WizardEvidenceProvider");
  }
  return ctx;
}

export function useWizardEvidenceForTarget(target: WizardEvidenceTarget): {
  controller: WizardEvidenceContextValue;
  items: WizardEvidenceItem[];
} {
  const controller = useWizardEvidence();
  const items = useMemo(() => {
    const ids = evidenceIdsForTarget(controller.links, target);
    const byId = new Map(controller.catalog.map((c) => [c.id, c]));
    return ids
      .map((id) => byId.get(id))
      .filter((item): item is WizardEvidenceItem => Boolean(item));
  }, [controller.catalog, controller.links, target]);
  return { controller, items };
}
