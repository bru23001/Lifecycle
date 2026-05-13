"use server";

import { revalidatePath } from "next/cache";

import {
  NEW_PROJECT_BUSINESS_AREAS,
  NEW_PROJECT_WORKFLOW_STATUSES,
} from "@/data/new-project.constants";
import { formatProjectCode, normalizeProjectCodeForConfirm } from "@/lib/format-project-code";
import { mergeProjectMetadataPatch } from "@/lib/project-applicability-metadata";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import type { ProjectStatus } from "@/types/projects.types";

export type ProjectProfileActionResult = { ok: true } | { ok: false; error: string };

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

function isBusinessArea(value: string): boolean {
  return (NEW_PROJECT_BUSINESS_AREAS as readonly string[]).includes(value);
}

function isWorkflowStatus(value: string): value is ProjectStatus {
  return (NEW_PROJECT_WORKFLOW_STATUSES as readonly string[]).includes(value);
}

async function loadActiveProject(projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, archivedAt: null },
    include: { owner: { select: { id: true, name: true } } },
  });
}

export async function updateProjectProfile(input: {
  projectId: string;
  name: string;
  slug: string;
  description: string;
  sponsor: string;
  ownerUserId: string;
  businessArea: string;
  priority: string;
  workflowStatus: string;
  targetStartDate: string;
  targetEndDate: string;
}): Promise<ProjectProfileActionResult> {
  await requireCurrentUser();
  const name = input.name.trim();
  const slug = slugify(input.slug);
  if (!name) return { ok: false, error: "Project name is required." };
  if (!slug) return { ok: false, error: "Project code / slug is required." };
  if (!isBusinessArea(input.businessArea.trim())) {
    return { ok: false, error: "Select a valid business area." };
  }
  const ws = input.workflowStatus.trim();
  if (!isWorkflowStatus(ws)) return { ok: false, error: "Select a valid status." };

  const owner = await prisma.user.findFirst({
    where: { id: input.ownerUserId.trim(), active: true },
    select: { id: true },
  });
  if (!owner) return { ok: false, error: "Select a valid owner." };

  const row = await loadActiveProject(input.projectId);
  if (!row) return { ok: false, error: "Project not found or archived." };

  const description = input.description.trim();
  const sponsor = input.sponsor.trim();
  const priority = input.priority.trim();
  const t0 = input.targetStartDate.trim();
  const t1 = input.targetEndDate.trim();

  const metaPatch: Record<string, unknown> = {
    businessArea: input.businessArea.trim(),
    workflowStatus: ws,
    description: description || undefined,
    sponsor: sponsor || undefined,
    priority: priority || undefined,
    targetStartDate: t0 || undefined,
    targetEndDate: t1 || undefined,
  };

  try {
    await prisma.project.update({
      where: { id: row.id },
      data: {
        name,
        slug,
        ownerId: owner.id,
        applicabilityJson: mergeProjectMetadataPatch(row.applicabilityJson, metaPatch),
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Update failed.";
    if (msg.includes("Unique constraint") || msg.includes("UNIQUE constraint")) {
      return { ok: false, error: "That project code / slug is already in use." };
    }
    return { ok: false, error: msg };
  }

  await recordAudit({
    action: "project.profile_updated",
    subjectKind: "project",
    subjectId: row.id,
    projectId: row.id,
    metadata: { slug, workflowStatus: ws },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${row.id}`);
  return { ok: true };
}

export async function changeProjectOwner(input: {
  projectId: string;
  newOwnerUserId: string;
  note?: string;
}): Promise<ProjectProfileActionResult> {
  await requireCurrentUser();
  const row = await loadActiveProject(input.projectId);
  if (!row) return { ok: false, error: "Project not found or archived." };

  const next = await prisma.user.findFirst({
    where: { id: input.newOwnerUserId.trim(), active: true },
    select: { id: true, name: true },
  });
  if (!next) return { ok: false, error: "Select a valid new owner." };

  await prisma.project.update({
    where: { id: row.id },
    data: {
      ownerId: next.id,
      applicabilityJson: mergeProjectMetadataPatch(row.applicabilityJson, {
        owner: null,
        ownerLabel: null,
      }),
    },
  });

  await recordAudit({
    action: "project.owner_changed",
    subjectKind: "project",
    subjectId: row.id,
    projectId: row.id,
    metadata: {
      newOwnerId: next.id,
      note: input.note?.trim() || undefined,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${row.id}`);
  return { ok: true };
}

export async function archiveProject(input: {
  projectId: string;
  reason: string;
}): Promise<ProjectProfileActionResult> {
  await requireCurrentUser();
  const reason = input.reason.trim();
  if (!reason) return { ok: false, error: "Archive reason is required." };

  const row = await loadActiveProject(input.projectId);
  if (!row) return { ok: false, error: "Project not found or already archived." };

  await prisma.project.update({
    where: { id: row.id },
    data: { archivedAt: new Date() },
  });

  await recordAudit({
    action: "project.archived",
    subjectKind: "project",
    subjectId: row.id,
    projectId: row.id,
    metadata: { reason },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${row.id}`);
  return { ok: true };
}

export async function deleteProject(input: {
  projectId: string;
  typedCode: string;
  reason: string;
}): Promise<ProjectProfileActionResult> {
  await requireCurrentUser();
  const reason = input.reason.trim();
  if (!reason) return { ok: false, error: "Delete reason is required." };

  const row = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { id: true, slug: true, vaultFolder: true, archivedAt: true },
  });
  if (!row) return { ok: false, error: "Project not found." };

  const expected = normalizeProjectCodeForConfirm(formatProjectCode(row.slug, row.vaultFolder));
  const got = normalizeProjectCodeForConfirm(input.typedCode);
  if (got !== expected) {
    return { ok: false, error: "Typed code does not match this project's code." };
  }

  await recordAudit({
    action: "project.deleted",
    subjectKind: "project",
    subjectId: row.id,
    projectId: row.id,
    metadata: { reason, wasArchived: Boolean(row.archivedAt) },
  });

  await prisma.project.delete({ where: { id: row.id } });

  revalidatePath("/projects");
  return { ok: true };
}
