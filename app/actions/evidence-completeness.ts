"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { toUserMessage } from "@/lib/toUserMessage";

const naSchema = z.object({
  projectId: z.string().min(1),
  gateCode: z
    .string()
    .max(8)
    .optional()
    .nullable()
    .transform((v) => (v?.trim() ? v.trim().toUpperCase() : null)),
  scopeLabel: z.string().trim().min(1).max(500),
  justification: z.string().trim().min(1).max(4000),
});

export type EvidenceCompletenessActionResult = { ok: true } | { ok: false; error: string };

function revalidateCompleteness(projectId: string) {
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/evidence`);
  revalidatePath(`/projects/${projectId}/evidence/completeness`);
}

/**
 * Records a documented “not applicable” decision for a completeness / gate-evidence gap
 * (stored as {@link ApplicabilityRecord} with `applies: false`).
 */
export async function recordEvidenceCompletenessNotApplicable(
  raw: z.infer<typeof naSchema>,
): Promise<EvidenceCompletenessActionResult> {
  try {
    await requireCurrentUser();
    const v = naSchema.parse(raw);

    const project = await prisma.project.findFirst({
      where: { id: v.projectId, archivedAt: null },
    });
    if (!project) return { ok: false, error: "Project not found." };

    const key =
      v.gateCode ?
        `evidence-completeness-na-gate-${v.gateCode}`
      : `evidence-completeness-na-${Date.now()}`;

    const rationale = `${v.scopeLabel}\n\nJustification:\n${v.justification}`;

    await prisma.applicabilityRecord.upsert({
      where: { projectId_key: { projectId: v.projectId, key } },
      create: {
        projectId: v.projectId,
        key,
        applies: false,
        rationale,
      },
      update: {
        applies: false,
        rationale,
      },
    });

    await recordAudit({
      action: "evidence.completeness_gap_marked_na",
      subjectKind: "project",
      subjectId: v.projectId,
      projectId: v.projectId,
      metadata: { gateCode: v.gateCode, scopeLabel: v.scopeLabel },
    });

    revalidateCompleteness(v.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}
