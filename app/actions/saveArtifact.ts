"use server";

import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { writeVaultMarkdown } from "@/lib/vault";
import { getTemplate } from "@/templates/registry";

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
  const project = await prisma.project.upsert({
    where: { slug: projectSlug },
    create: {
      name:
        projectSlug === DEFAULT_PROJECT_SLUG
          ? "Default Project"
          : projectSlug,
      slug: projectSlug,
    },
    update: {},
  });

  const localId = shortId();
  const version = 1;
  const markdownRelative = pathPosixJoin(
    project.slug,
    template.templateId,
    `${localId}_v${version}.md`,
  );

  const markdownBody = template.toMarkdown(parsed.data);

  await writeVaultMarkdown(markdownRelative, markdownBody);

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

function pathPosixJoin(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/");
}
