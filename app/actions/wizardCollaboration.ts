"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";

const idSchema = z.string().min(1);
const templateIdSchema = z.string().min(1);

const privilegedCollaborationRoles = new Set([
  "project owner",
  "program admin",
  "administrator",
  "admin",
]);

async function assertProjectAccess(projectId: string, user: { id: string; role: string; active: boolean }) {
  if (!user.active) return false;
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, archivedAt: true },
  });
  if (!p || p.archivedAt) return false;
  if (p.ownerId && p.ownerId !== user.id && !privilegedCollaborationRoles.has(user.role.trim().toLowerCase())) {
    return false;
  }
  return true;
}

export async function addWizardCollaborationComment(input: {
  projectId: string;
  templateId: string;
  artifactId?: string | null;
  sectionId?: string | null;
  fieldName?: string | null;
  body: string;
  visibility?: "internal" | "reviewers";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const schema = z.object({
    projectId: idSchema,
    templateId: templateIdSchema,
    artifactId: z.string().min(1).nullable().optional(),
    sectionId: z.string().min(1).nullable().optional(),
    fieldName: z.string().min(1).max(200).nullable().optional(),
    body: z.string().trim().min(1).max(8000),
    visibility: z.enum(["internal", "reviewers"]).optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const user = await requireCurrentUser();
  if (!(await assertProjectAccess(parsed.data.projectId, user))) {
    return { ok: false, error: "Project not found or access denied." };
  }
  await prisma.wizardCollaborationComment.create({
    data: {
      projectId: parsed.data.projectId,
      templateId: parsed.data.templateId,
      artifactId: parsed.data.artifactId ?? null,
      sectionId: parsed.data.sectionId ?? null,
      fieldName: parsed.data.fieldName ?? null,
      authorId: user.id,
      body: parsed.data.body,
      visibility: parsed.data.visibility ?? "internal",
    },
  });
  await recordAudit({
    action: "wizard.collaboration.comment_added",
    subjectKind: "project",
    subjectId: parsed.data.projectId,
    projectId: parsed.data.projectId,
    metadata: {
      templateId: parsed.data.templateId,
      hasFieldAnchor: Boolean(parsed.data.fieldName),
      hasSectionAnchor: Boolean(parsed.data.sectionId),
    },
  });
  return { ok: true };
}

export async function setWizardCollaborationCommentResolved(input: {
  projectId: string;
  commentId: string;
  resolved: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = z
    .object({
      projectId: idSchema,
      commentId: idSchema,
      resolved: z.boolean(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }
  await requireCurrentUser();
  const row = await prisma.wizardCollaborationComment.findFirst({
    where: { id: parsed.data.commentId, projectId: parsed.data.projectId },
    select: { id: true },
  });
  if (!row) return { ok: false, error: "Comment not found." };
  await prisma.wizardCollaborationComment.update({
    where: { id: row.id },
    data: { resolved: parsed.data.resolved },
  });
  return { ok: true };
}

export async function searchWorkspaceUsersForWizard(projectId: string, q: string): Promise<
  { ok: true; users: { id: string; name: string; email: string; role: string; initials: string }[] } | { ok: false }
> {
  const user = await requireCurrentUser();
  if (!(await assertProjectAccess(projectId, user))) {
    return { ok: false };
  }
  const term = q.trim().toLowerCase();
  if (term.length < 1) {
    return { ok: true, users: [] };
  }
  const users = await prisma.user.findMany({
    where: {
      active: true,
      OR: [
        { email: { contains: term } },
        { name: { contains: term } },
        { role: { contains: term } },
      ],
    },
    select: { id: true, name: true, email: true, role: true, initials: true },
    orderBy: { name: "asc" },
    take: 12,
  });
  return {
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name?.trim() || u.email,
      email: u.email,
      role: u.role,
      initials: u.initials,
    })),
  };
}

export async function listUsersForArtifactReview(projectId: string): Promise<
  | { ok: true; users: { id: string; name: string; email: string; role: string; initials: string }[] }
  | { ok: false; error: string }
> {
  const user = await requireCurrentUser();
  if (!(await assertProjectAccess(projectId, user))) {
    return { ok: false, error: "Project not found or access denied." };
  }
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, role: true, initials: true },
    orderBy: { name: "asc" },
    take: 50,
  });
  return {
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name?.trim() || u.email,
      email: u.email,
      role: u.role,
      initials: u.initials,
    })),
  };
}

export async function assignArtifactReviewerRequest(input: {
  projectId: string;
  templateId: string;
  artifactId?: string | null;
  assigneeUserId: string;
  dueAt?: string | null;
  reviewScope: string;
  instructions?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const schema = z.object({
    projectId: idSchema,
    templateId: templateIdSchema,
    artifactId: z.string().min(1).nullable().optional(),
    assigneeUserId: idSchema,
    dueAt: z.string().optional().nullable(),
    reviewScope: z.string().trim().min(1).max(200),
    instructions: z.string().trim().max(4000).nullable().optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const assigner = await requireCurrentUser();
  if (!(await assertProjectAccess(parsed.data.projectId, assigner))) {
    return { ok: false, error: "Project not found or access denied." };
  }
  const assignee = await prisma.user.findUnique({
    where: { id: parsed.data.assigneeUserId },
    select: { id: true, name: true, role: true },
  });
  if (!assignee) {
    return { ok: false, error: "Assignee not found." };
  }
  let due: Date | null = null;
  const rawDue = parsed.data.dueAt?.trim();
  if (rawDue) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDue)) {
      return { ok: false, error: "Due date must use YYYY-MM-DD format." };
    }
    const d = new Date(`${rawDue}T12:00:00.000Z`);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "Due date is invalid." };
    }
    due = d;
  }
  await prisma.artifactReviewRequest.create({
    data: {
      projectId: parsed.data.projectId,
      templateId: parsed.data.templateId,
      artifactId: parsed.data.artifactId ?? null,
      assigneeUserId: assignee.id,
      assigneeName: assignee.name?.trim() || "Reviewer",
      assigneeRole: assignee.role,
      dueAt: due,
      reviewScope: parsed.data.reviewScope,
      instructions: parsed.data.instructions?.trim() || null,
      assignedById: assigner.id,
    },
  });
  await recordAudit({
    action: "wizard.collaboration.reviewer_assigned",
    subjectKind: "project",
    subjectId: parsed.data.projectId,
    projectId: parsed.data.projectId,
    metadata: {
      templateId: parsed.data.templateId,
      assigneeUserId: assignee.id,
      reviewScope: parsed.data.reviewScope,
      hasDueAt: Boolean(due),
    },
  });
  return { ok: true };
}

export async function recordWizardArtifactShare(input: {
  projectId: string;
  templateId: string;
  permissionLevel: string;
  expirationChoice: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = z
    .object({
      projectId: idSchema,
      templateId: templateIdSchema,
      permissionLevel: z.string().trim().min(1).max(64),
      expirationChoice: z.string().trim().min(1).max(64),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }
  const user = await requireCurrentUser();
  if (!(await assertProjectAccess(parsed.data.projectId, user))) {
    return { ok: false, error: "Project not found or access denied." };
  }
  await recordAudit({
    action: "wizard.collaboration.share",
    subjectKind: "project",
    subjectId: parsed.data.projectId,
    projectId: parsed.data.projectId,
    metadata: {
      templateId: parsed.data.templateId,
      permissionLevel: parsed.data.permissionLevel,
      expirationChoice: parsed.data.expirationChoice,
    },
  });
  return { ok: true };
}
