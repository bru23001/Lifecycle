/**
 * Master Lifecycle — Appendix A § "Template Metadata Convention"
 * (`28. Appendix A — Template Library.md`).
 *
 * Plain labeled lines at the top of each artifact (not YAML frontmatter).
 */

export type AppendixAMetadataInput = {
  artifactId: string;
  templateId: string;
  artifactTitle: string;
  relatedProductId: string;
  relatedPclCode: string;
  lifecyclePhase: string;
  relatedGates: string;
  owner: string;
  preparedBy: string;
  versionRevision: string;
  dateIso: string;
  status: string;
};

/** Renders the canonical metadata block (no surrounding ``` fence). */
export function buildAppendixAMetadataBlock(
  input: AppendixAMetadataInput,
): string {
  const lines: string[] = [
    `Artifact ID: ${input.artifactId}`,
    `Template ID: ${input.templateId}`,
    `Artifact Title: ${input.artifactTitle}`,
    `Related Product ID (PRD-XXX), if any: ${input.relatedProductId}`,
    `Related PCL Code, if any: ${input.relatedPclCode}`,
    `Lifecycle Phase: ${input.lifecyclePhase}`,
    `Related Gate(s): ${input.relatedGates}`,
    `Owner: ${input.owner}`,
    `Prepared By: ${input.preparedBy}`,
    `Version / Revision: ${input.versionRevision}`,
    `Date: ${input.dateIso}`,
    `Status: ${input.status}`,
  ];
  return lines.join("\n");
}
