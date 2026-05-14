import type {
  WizardEvidenceItem,
  WizardEvidenceLink,
  WizardEvidenceTarget,
} from "@/types/template-wizard.types";

export function targetKey(target: WizardEvidenceTarget): string {
  switch (target.kind) {
    case "field":
      return `field:${target.fieldName}`;
    case "section":
      return `section:${target.sectionId}`;
    case "artifact":
      return "artifact";
  }
}

export function sameTarget(a: WizardEvidenceTarget, b: WizardEvidenceTarget): boolean {
  return targetKey(a) === targetKey(b);
}

export function evidenceIdsForTarget(
  links: WizardEvidenceLink[],
  target: WizardEvidenceTarget,
): string[] {
  return links
    .filter((link) => sameTarget(link.target, target))
    .map((link) => link.evidenceId);
}

export function targetsForEvidence(
  links: WizardEvidenceLink[],
  evidenceId: string,
): WizardEvidenceTarget[] {
  return links.filter((link) => link.evidenceId === evidenceId).map((l) => l.target);
}

export function linkEvidence(
  links: WizardEvidenceLink[],
  evidenceId: string,
  target: WizardEvidenceTarget,
): WizardEvidenceLink[] {
  if (
    links.some(
      (link) => link.evidenceId === evidenceId && sameTarget(link.target, target),
    )
  ) {
    return links;
  }
  return [...links, { evidenceId, target }];
}

export function unlinkEvidence(
  links: WizardEvidenceLink[],
  evidenceId: string,
  target: WizardEvidenceTarget,
): WizardEvidenceLink[] {
  return links.filter(
    (link) => !(link.evidenceId === evidenceId && sameTarget(link.target, target)),
  );
}

export function deleteEvidence(
  catalog: WizardEvidenceItem[],
  links: WizardEvidenceLink[],
  evidenceId: string,
): { catalog: WizardEvidenceItem[]; links: WizardEvidenceLink[] } {
  return {
    catalog: catalog.filter((item) => item.id !== evidenceId),
    links: links.filter((link) => link.evidenceId !== evidenceId),
  };
}

export function nextStagedEvidenceId(catalog: WizardEvidenceItem[]): string {
  const stagedNumbers = catalog
    .map((item) => /^staged-(\d+)$/.exec(item.id)?.[1])
    .filter((s): s is string => Boolean(s))
    .map((s) => Number.parseInt(s, 10));
  const next = (stagedNumbers.length > 0 ? Math.max(...stagedNumbers) : 0) + 1;
  return `staged-${next}`;
}

export function targetLabel(
  target: WizardEvidenceTarget,
  context: {
    fieldLabels?: Record<string, string>;
    sectionTitles?: Record<string, string>;
    artifactTitle?: string;
  } = {},
): string {
  switch (target.kind) {
    case "field":
      return `Field · ${context.fieldLabels?.[target.fieldName] ?? target.fieldName}`;
    case "section":
      return `Section · ${context.sectionTitles?.[target.sectionId] ?? target.sectionId}`;
    case "artifact":
      return `Artifact · ${context.artifactTitle ?? "this artifact"}`;
  }
}

export function buildPersistedEvidenceLinks(
  links: WizardEvidenceLink[],
): Array<{ evidenceId: string; linkedToSectionId?: string; linkedToFieldName?: string }> {
  return links.map((link) => {
    if (link.target.kind === "field") {
      return { evidenceId: link.evidenceId, linkedToFieldName: link.target.fieldName };
    }
    if (link.target.kind === "section") {
      return { evidenceId: link.evidenceId, linkedToSectionId: link.target.sectionId };
    }
    return { evidenceId: link.evidenceId };
  });
}
