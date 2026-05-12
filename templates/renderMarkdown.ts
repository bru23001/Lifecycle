import { buildMarkdownPreview } from "@/lib/template-wizard-computed";
import type { TemplateSection, WizardHeaderData } from "@/types/template-wizard.types";

export function toMarkdown({
  wizardHeader,
  sections,
  formValues,
  generatedAtLabel,
}: {
  wizardHeader: WizardHeaderData;
  sections: TemplateSection[];
  formValues: Record<string, unknown>;
  generatedAtLabel: string;
}) {
  return buildMarkdownPreview(wizardHeader, sections, formValues, generatedAtLabel);
}
