import type { AnyLifecycleTemplate } from "./types";
import { ideaCaptureTemplate } from "./A-0-idea";
import { problemDefinitionTemplate } from "./A-0.1-problem";
import { projectSelectionScorecardTemplate } from "./A-3.1-selection";
import { feasibilityAssessmentTemplate } from "./A-3.2-feasibility";
import { businessCaseTemplate } from "./A-3.3-business-case";
import { businessFieldReportTemplate } from "./A-4-business-field";

export const templateRegistry = {
  "A-0": ideaCaptureTemplate,
  "A-0.1": problemDefinitionTemplate,
  "A-3.1": projectSelectionScorecardTemplate,
  "A-3.2": feasibilityAssessmentTemplate,
  "A-3.3": businessCaseTemplate,
  "A-4": businessFieldReportTemplate,
} as Record<string, AnyLifecycleTemplate>;

export type TemplateId = keyof typeof templateRegistry;

export function getTemplate(templateId: string): AnyLifecycleTemplate {

  const template = templateRegistry[templateId as TemplateId];

  if (!template) {

    throw new Error(`Unknown template id: ${templateId}`);

  }

  return template;

}

export function hasTemplate(templateId: string): templateId is TemplateId {

  return templateId in templateRegistry;

}

export function getAllTemplates(): AnyLifecycleTemplate[] {

  return Object.values(templateRegistry);

}

export function getTemplatesForPhase(phase: number): AnyLifecycleTemplate[] {

  return getAllTemplates().filter((template) => template.phase === phase);

}

export function getTemplatesForGate(

  gateId: "G1" | "G2" | "G3",

): AnyLifecycleTemplate[] {

  return getAllTemplates().filter((template) => template.gate === gateId);

}

export function getTemplateIds(): TemplateId[] {

  return Object.keys(templateRegistry) as TemplateId[];

}

export function assertTemplateId(

  templateId: string,

): asserts templateId is TemplateId {

  if (!hasTemplate(templateId)) {

    throw new Error(`Unknown template id: ${templateId}`);

  }

}