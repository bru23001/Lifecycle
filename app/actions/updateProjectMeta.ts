"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { applicabilityJsonFromForm, type Applicability } from "@/lib/applicability";

const inputSchema = z.object({
  projectId: z.string().min(1),
  applicability: z
    .object({
      data: z.boolean(),
      apis: z.boolean(),
      ui: z.boolean(),
      modules: z.boolean(),
      blueprint: z.boolean(),
    })
    .optional(),
  complexityLevel: z.string().optional(),
  namingConformanceNote: z.string().optional(),
  initialTestSetupNote: z.string().optional(),
});

export type UpdateProjectMetaResult = { ok: true } | { ok: false; error: string };

export async function updateProjectMeta(
  raw: z.infer<typeof inputSchema>,
): Promise<UpdateProjectMetaResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, applicability, complexityLevel, namingConformanceNote, initialTestSetupNote } =
    parsed.data;

  const data: {
    applicabilityJson?: object;
    complexityLevel?: string | null;
    namingConformanceNote?: string | null;
    initialTestSetupNote?: string | null;
  } = {};

  if (applicability) {
    data.applicabilityJson = applicabilityJsonFromForm(applicability as Applicability);
  }
  if (complexityLevel !== undefined) {
    data.complexityLevel = complexityLevel.trim() || null;
  }
  if (namingConformanceNote !== undefined) {
    data.namingConformanceNote = namingConformanceNote.trim() || null;
  }
  if (initialTestSetupNote !== undefined) {
    data.initialTestSetupNote = initialTestSetupNote.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    return { ok: true };
  }

  await prisma.project.update({
    where: { id: projectId },
    data,
  });

  return { ok: true };
}
