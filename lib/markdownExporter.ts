import { buildAppendixAMetadataBlock } from "@/lib/markdownAppendixA";
import type { AnyLifecycleTemplate } from "@/templates/types";

function pathPosixJoin(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/");
}

/** Normalize folder name: `PRD-042`, `IDEA-0007`, etc. */
export function normalizeEvidenceRootFolder(raw: string): string {
  const s = raw.trim();
  if (!s) return "IDEA-0001";
  const upper = s.toUpperCase();
  if (/^PRD-[A-Z0-9-]+$/.test(upper)) return upper;
  if (/^IDEA-[A-Z0-9-]+$/.test(upper)) return upper;
  if (/^prd-/i.test(s)) return s.replace(/^prd-/i, "PRD-").replace(/[^A-Z0-9-]/gi, "");
  if (/^idea-/i.test(s)) return s.replace(/^idea-/i, "IDEA-").replace(/[^A-Z0-9-]/gi, "");
  return "IDEA-0001";
}

/** Default vault folder when creating a project from slug (MVP). */
export function defaultVaultFolderForSlug(slug: string): string {
  const s = slug.trim().toLowerCase();
  if (s === "default") return "IDEA-0001";
  if (/^prd-/.test(s)) return normalizeEvidenceRootFolder(slug);
  if (/^idea-/.test(s)) return normalizeEvidenceRootFolder(slug);
  if (/^pr-/.test(s)) return normalizeEvidenceRootFolder(slug);
  return "IDEA-0001";
}

function pickString(data: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

/**
 * Human-readable `name` segment for `{template-id}_{name}.md` (slugified).
 */
export function inferArtifactExportName(
  templateId: string,
  data: Record<string, unknown>,
  templateTitle: string,
): string {
  const byTemplate: Record<string, string[]> = {
    "A-0": ["ideaTitle"],
    "A-0.1": ["problemTitle"],
    "A-3.1": ["scorecardName", "candidateInitiative"],
    "A-3.2": ["projectName", "ideaTitle"],
    "A-3.3": ["executiveSummary"],
    "A-4": ["reportTitle"],
    "A-1": ["packageTitle"],
    "A-2": ["srsTitle"],
    "A-10": ["registerTitle"],
    "A-9": ["inventoryTitle"],
    "A-8": ["packageTitle"],
    "A-7": ["inventoryTitle"],
    "A-6": ["scopeTitle"],
    "A-15": ["planTitle"],
    "ARD-001": ["documentTitle"],
    "A-11": ["erdTitle"],
    "A-12": ["contractTitle"],
    "UXD-001": ["designTitle"],
    "A-13": ["planTitle"],
    "A-14": ["strategyTitle"],
  };
  const keys = byTemplate[templateId] ?? [];
  const picked = pickString(data, keys);
  const base = picked || templateTitle;
  return slugifyForFilename(base);
}

export function slugifyForFilename(raw: string, maxLen = 48): string {
  const s = raw
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
  return s.length > 0 ? s : "artifact";
}

export function buildVaultExportRelativePath(args: {
  vaultFolder: string;
  templateId: string;
  nameSlug: string;
  localId: string;
}): string {
  const folder = normalizeEvidenceRootFolder(args.vaultFolder);
  const safeSlug = slugifyForFilename(args.nameSlug, 44);
  const idPart = args.localId.slice(0, 10);
  const file = `${args.templateId}_${safeSlug}-${idPart}.md`;
  return pathPosixJoin(folder, file);
}

export function buildMetadataFromArtifactContext(args: {
  artifactId: string;
  template: AnyLifecycleTemplate;
  data: Record<string, unknown>;
  version: number;
  status: string;
  generatedAt: Date;
}): string {
  const d = args.data;
  const artifactInstanceTitle =
    pickString(d, [
      "ideaTitle",
      "problemTitle",
      "scorecardName",
      "reportTitle",
      "projectName",
      "packageTitle",
      "documentTitle",
      "planTitle",
      "scopeTitle",
      "strategyTitle",
      "inventoryTitle",
      "registerTitle",
      "erdTitle",
      "contractTitle",
      "srsTitle",
      "designTitle",
    ]) || args.template.title;
  const relatedProduct = pickString(d, [
    "prcsCandidateApprovedProductId",
    "prcsExistingProductId",
    "existingProductId",
    "relatedIdeaId",
  ]);
  const relatedPcl = pickString(d, [
    "prcsPclCode",
    "candidatePclCode",
  ]);
  const owner = pickString(d, ["owner", "projectOwner", "ideaSponsor", "mainExpectedOwner"]);
  const preparedBy = pickString(d, ["preparedBy", "reviewers", "approvedBy"]);

  return buildAppendixAMetadataBlock({
    artifactId: args.artifactId,
    templateId: args.template.templateId,
    artifactTitle: artifactInstanceTitle,
    relatedProductId: relatedProduct || "N/A",
    relatedPclCode: relatedPcl || "N/A",
    lifecyclePhase: `Phase ${args.template.phase}`,
    relatedGates: args.template.gate ?? "—",
    owner: owner || "N/A",
    preparedBy: preparedBy || "N/A",
    versionRevision: String(args.version),
    dateIso: args.generatedAt.toISOString().slice(0, 10),
    status: args.status,
  });
}

/**
 * Full markdown file: Appendix A metadata block + horizontal rule + template body
 * (from `renderTemplateMarkdown` in `templates/markdown.ts`).
 */
export function composeVaultMarkdownDocument(args: {
  metadataBlock: string;
  templateBodyMarkdown: string;
}): string {
  return `${args.metadataBlock}\n\n---\n\n${args.templateBodyMarkdown}`;
}
