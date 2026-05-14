import {
  buildMetadataFromArtifactContext,
  composeVaultMarkdownDocument,
  inferArtifactExportName,
} from "@/lib/markdownExporter";
import type { AnyLifecycleTemplate } from "@/templates/types";

export function buildValidationSummaryMarkdown(
  template: AnyLifecycleTemplate,
  data: Record<string, unknown>,
): string {
  const parsed = template.schema.safeParse(data);
  if (parsed.success) {
    return [
      "## Validation summary",
      "",
      "- **Schema:** valid for the current template",
      "- **Field issues:** none detected",
    ].join("\n");
  }
  const flat = parsed.error.flatten();
  const fieldLines = Object.entries(flat.fieldErrors)
    .filter(([, msgs]) => msgs?.length)
    .map(([key, msgs]) => `- **${key}:** ${(msgs ?? []).join("; ")}`);
  const formMsgs = flat.formErrors.length
    ? flat.formErrors.map((m) => `- ${m}`)
    : [];
  const lines = [
    "## Validation summary",
    "",
    "- **Schema:** invalid",
    "",
    "### Field errors",
    "",
    ...(fieldLines.length > 0 ? fieldLines : ["- _No per-field messages_"]),
  ];
  if (formMsgs.length) {
    lines.push("", "### Form", "", ...formMsgs);
  }
  return lines.join("\n");
}

export type BuildWizardExportMarkdownArgs = {
  template: AnyLifecycleTemplate;
  data: Record<string, unknown>;
  bodyMarkdown: string;
  includeMetadata: boolean;
  includeValidationSummary: boolean;
  /** Logical artifact id for Appendix A block (saved id or preview token). */
  artifactIdForMeta: string;
  version: number;
  status?: string;
  generatedAt?: Date;
};

export function buildWizardExportMarkdown(args: BuildWizardExportMarkdownArgs): string {
  const {
    template,
    data,
    bodyMarkdown,
    includeMetadata,
    includeValidationSummary,
    artifactIdForMeta,
    version,
    status = "Draft",
    generatedAt = new Date(),
  } = args;

  let doc = bodyMarkdown;
  if (includeMetadata) {
    const metadata = buildMetadataFromArtifactContext({
      artifactId: artifactIdForMeta,
      template,
      data,
      version,
      status,
      generatedAt,
    });
    doc = composeVaultMarkdownDocument({
      metadataBlock: metadata,
      templateBodyMarkdown: bodyMarkdown,
    });
  }
  if (includeValidationSummary) {
    const block = buildValidationSummaryMarkdown(template, data);
    doc = `${doc}\n\n---\n\n${block}\n`;
  }
  return doc;
}

export function defaultArtifactBasename(
  template: AnyLifecycleTemplate,
  data: Record<string, unknown>,
): string {
  const slug = inferArtifactExportName(
    template.templateId,
    data,
    template.title,
  );
  return `${template.templateId}_${slug}.md`;
}
