"use server";

import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { writeVaultMarkdown } from "@/lib/vault";
import { getTemplate } from "@/templates/registry";
import {
  buildMetadataFromArtifactContext,
  buildVaultExportRelativePath,
  composeVaultMarkdownDocument,
  defaultVaultFolderForSlug,
  inferArtifactExportName,
} from "@/lib/markdownExporter";
import { syncArtifactRelations } from "@/lib/syncArtifactRelations";

export type SaveArtifactResult =
  | {
      ok: true;
      artifactId: string;
      localId: string;
      version: number;
      markdownPath: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

const DEFAULT_PROJECT_SLUG = "default";

function shortId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function saveArtifact(input: {
  templateId: string;
  data: unknown;
  projectSlug?: string;
  /** When set, artifact is tied to this project and relational templates sync Requirement/Feature rows. */
  projectId?: string;
}): Promise<SaveArtifactResult> {
  let template;
  try {
    template = getTemplate(input.templateId);
  } catch {
    return { ok: false, error: `Unknown template: ${input.templateId}` };
  }

  const parsed = template.schema.safeParse(input.data);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: "Server validation failed.",
      fieldErrors: flat.fieldErrors,
    };
  }

  const projectSlug = input.projectSlug ?? DEFAULT_PROJECT_SLUG;

  const project = input.projectId
    ? await prisma.project.findUnique({ where: { id: input.projectId } })
    : await prisma.project.upsert({
        where: { slug: projectSlug },
        create: {
          name:
            projectSlug === DEFAULT_PROJECT_SLUG
              ? "Default Project"
              : projectSlug,
          slug: projectSlug,
          vaultFolder: defaultVaultFolderForSlug(projectSlug),
        },
        update: {},
      });

  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const localId = shortId();
  const version = 1;
  const data = parsed.data as Record<string, unknown>;

  const nameSlug = inferArtifactExportName(
    template.templateId,
    data,
    template.title,
  );
  const markdownRelative = buildVaultExportRelativePath({
    vaultFolder: project.vaultFolder,
    templateId: template.templateId,
    nameSlug,
    localId,
  });

  const body = template.toMarkdown(parsed.data);

  const artifactIdForMeta = `${template.templateId}-${localId}-v${version}`;
  const metadata = buildMetadataFromArtifactContext({
    artifactId: artifactIdForMeta,
    template,
    data,
    version,
    status: "Draft",
    generatedAt: new Date(),
  });

  const markdownBody = composeVaultMarkdownDocument({
    metadataBlock: metadata,
    templateBodyMarkdown: body,
  });

  await writeVaultMarkdown(markdownRelative, markdownBody);

  if (input.projectId) {
    await syncArtifactRelations(project.id, template.templateId, data);
  }

  const artifact = await prisma.artifact.create({
    data: {
      projectId: project.id,
      templateId: template.templateId,
      localId,
      version,
      status: "Draft",
      dataJson: parsed.data as Prisma.InputJsonValue,
      markdownPath: markdownRelative,
    },
  });

  return {
    ok: true,
    artifactId: artifact.id,
    localId,
    version,
    markdownPath: markdownRelative,
  };
}
