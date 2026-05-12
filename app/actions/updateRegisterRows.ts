"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";

const reqStatusSchema = z.enum(["Draft", "Baselined", "Deferred", "Withdrawn"]);

const featPatchSchema = z.object({
  projectId: z.string().min(1),
  featureId: z.string().min(1),
  status: z.enum(["Draft", "Baselined", "Deferred", "Withdrawn"]).optional(),
  scopeStatus: z.enum(["InScope", "OutOfScope", "Deferred"]).optional(),
});

export type RegisterPatchResult = { ok: true } | { ok: false; error: string };

export async function updateRequirementStatus(input: {
  projectId: string;
  requirementId: string;
  status: string;
}): Promise<RegisterPatchResult> {
  const status = reqStatusSchema.safeParse(input.status);
  if (!status.success) {
    return { ok: false, error: "Invalid status." };
  }

  const row = await prisma.requirement.findFirst({
    where: { id: input.requirementId, projectId: input.projectId },
    select: { id: true },
  });
  if (!row) {
    return { ok: false, error: "Requirement not found." };
  }

  await prisma.requirement.update({
    where: { id: row.id },
    data: { status: status.data },
  });

  await recordAudit({
    action: "register.requirement_status_updated",
    subjectKind: "requirement",
    subjectId: row.id,
    projectId: input.projectId,
    metadata: { status: status.data },
  });

  return { ok: true };
}

export async function updateFeatureRow(
  raw: z.infer<typeof featPatchSchema>,
): Promise<RegisterPatchResult> {
  const parsed = featPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, featureId, status, scopeStatus } = parsed.data;
  if (status === undefined && scopeStatus === undefined) {
    return { ok: true };
  }

  const row = await prisma.feature.findFirst({
    where: { id: featureId, projectId },
    select: { id: true },
  });
  if (!row) {
    return { ok: false, error: "Feature not found." };
  }

  await prisma.feature.update({
    where: { id: row.id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(scopeStatus !== undefined ? { scopeStatus } : {}),
    },
  });

  await recordAudit({
    action: "register.feature_row_updated",
    subjectKind: "feature",
    subjectId: row.id,
    projectId,
    metadata: {
      ...(status !== undefined ? { status } : {}),
      ...(scopeStatus !== undefined ? { scopeStatus } : {}),
    },
  });

  return { ok: true };
}
