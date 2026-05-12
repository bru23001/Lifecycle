"use server";

import { redirect } from "next/navigation";

import {
  NEW_PROJECT_LIFECYCLE_MODELS,
  NEW_PROJECT_WORKFLOW_STATUSES,
} from "@/data/new-project.constants";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/prisma";
import { clampWorkspacePhase } from "@/lib/workspacePhases";
import type { ProjectStatus } from "@/types/projects.types";

function slugify(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "project"
  );
}

export type CreateProjectState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

function isLifecycleModel(value: string): value is (typeof NEW_PROJECT_LIFECYCLE_MODELS)[number] {
  return (NEW_PROJECT_LIFECYCLE_MODELS as readonly string[]).includes(value);
}

function isWorkflowStatus(value: string): value is ProjectStatus {
  return (NEW_PROJECT_WORKFLOW_STATUSES as readonly string[]).includes(value);
}

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const name = String(formData.get("name") ?? "").trim();
  const codeSlug = String(formData.get("codeSlug") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  const lifecycleModel = String(formData.get("lifecycleModel") ?? "").trim();
  const workflowStatus = String(formData.get("workflowStatus") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();
  const initialPhaseRaw = String(formData.get("initialPhase") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const storageLocation = String(formData.get("storageLocation") ?? "").trim();

  const fieldErrors: CreateProjectState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Project name is required.";
  if (!codeSlug) fieldErrors.codeSlug = "Project code / slug is required.";
  if (!owner) fieldErrors.owner = "Owner is required.";
  if (!lifecycleModel) fieldErrors.lifecycleModel = "Lifecycle model is required.";
  else if (!isLifecycleModel(lifecycleModel)) {
    fieldErrors.lifecycleModel = "Select a valid lifecycle model.";
  }
  if (!workflowStatus) fieldErrors.workflowStatus = "Status is required.";
  else if (!isWorkflowStatus(workflowStatus)) {
    fieldErrors.workflowStatus = "Select a valid status.";
  }
  if (!scope) fieldErrors.scope = "Scope summary is required.";

  const initialPhaseParsed = Number.parseInt(initialPhaseRaw, 10);
  if (!Number.isFinite(initialPhaseParsed)) {
    fieldErrors.initialPhase = "Initial phase is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const initialPhase = clampWorkspacePhase(initialPhaseParsed);

  const slug = slugify(codeSlug);
  const vaultFolder =
    storageLocation.replace(/\s+/g, "-").slice(0, 64).trim() || "IDEA-0001";

  const applicabilityJson = {
    projectMetadata: {
      owner,
      lifecycleModel,
      workflowStatus,
      scope,
      description: description || undefined,
      storageLocationLabel: storageLocation || undefined,
    },
  };

  let project;
  try {
    project = await prisma.project.create({
      data: {
        name,
        slug,
        vaultFolder,
        currentPhase: initialPhase,
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
    metadata: {
      slug: project.slug,
      vaultFolder: project.vaultFolder,
      currentPhase: project.currentPhase,
      lifecycleModel,
      workflowStatus,
    },
  });

  redirect(`/projects/${project.id}/workspace`);
}
