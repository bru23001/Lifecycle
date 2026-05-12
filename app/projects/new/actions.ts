"use server";

import { redirect } from "next/navigation";

import { recordAudit } from "@/lib/server/audit";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/current-user";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "project";
}

export type CreateProjectState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const name = String(formData.get("name") ?? "").trim();
  const codeSlug = String(formData.get("codeSlug") ?? "").trim();
  const projectType = String(formData.get("projectType") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  const businessArea = String(formData.get("businessArea") ?? "").trim();
  const lifecycleModel = String(formData.get("lifecycleModel") ?? "").trim();
  const storageLocation = String(formData.get("storageLocation") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const fieldErrors: CreateProjectState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Project name is required.";
  if (!codeSlug) fieldErrors.codeSlug = "Project code / slug is required.";
  if (!owner) fieldErrors.owner = "Owner is required.";
  if (!lifecycleModel) fieldErrors.lifecycleModel = "Lifecycle model is required.";
  if (!storageLocation) fieldErrors.storageLocation = "Storage location is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const slug = slugify(codeSlug);
  const vaultFolder = storageLocation.replace(/\s+/g, "-").slice(0, 64) || "IDEA-0001";

  const applicabilityJson = {
    projectMetadata: {
      projectType: projectType || undefined,
      owner,
      businessArea: businessArea || undefined,
      lifecycleModel,
      description: description || undefined,
      storageLocationLabel: storageLocation,
    },
  };

  let project;
  try {
    project = await prisma.project.create({
      data: {
        name,
        slug,
        vaultFolder,
        currentPhase: 1,
        applicabilityJson,
        ownerId: (await requireCurrentUser()).id,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not create project.";
    if (msg.includes("Unique constraint") || msg.includes("UNIQUE constraint")) {
      return { error: "That project code / slug is already in use. Choose a different code." };
    }
    return { error: msg };
  }

  await recordAudit({
    action: "project.created",
    subjectKind: "project",
    subjectId: project.id,
    projectId: project.id,
    metadata: { slug: project.slug, vaultFolder: project.vaultFolder },
  });

  redirect(`/projects/${project.id}/workspace`);
}
