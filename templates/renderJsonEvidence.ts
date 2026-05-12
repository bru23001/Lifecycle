import { buildJsonEvidence } from "@/lib/template-wizard-computed";
import type {
  JsonEvidence,
  TemplateSection,
  ValidationSummary,
  WizardHeaderData,
} from "@/types/template-wizard.types";

export function toJsonEvidence({
  wizardHeader,
  selectedTemplate,
  projectId,
  generatedBy,
  sections,
  formValues,
  validationSummary,
}: {
  wizardHeader: WizardHeaderData;
  selectedTemplate: { id: string; code: string; version: string };
  projectId: string;
  generatedBy: string;
  sections: TemplateSection[];
  formValues: Record<string, unknown>;
  validationSummary: ValidationSummary;
}): JsonEvidence {
  return buildJsonEvidence(
    wizardHeader,
    selectedTemplate,
    projectId,
    generatedBy,
    sections,
    formValues,
    validationSummary,
  );
}
