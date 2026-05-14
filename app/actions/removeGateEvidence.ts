"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";

const gateIdSchema = z.enum([
  "G1",
  "G2",
  "G3",
  "G4",
  "G5",
  "G6",
  "G7",
  "G8",
  "G9",
  "G10",
]);

const inputSchema = z.object({
  projectId: z.string().min(1),
  gateId: gateIdSchema,
  evidenceId: z.string().min(1),
  mode: z.enum(["unlink", "delete"]),
});

export type RemoveGateEvidenceResult = { ok: true } | { ok: false; error: string };

export async function removeGateEvidence(raw: z.input<typeof inputSchema>): Promise<RemoveGateEvidenceResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, gateId, evidenceId, mode } = parsed.data;

  await requireCurrentUser();

  const row = await prisma.evidenceItem.findFirst({
    where: { id: evidenceId, projectId },
    select: { id: true, gateCode: true, name: true },
  });
  if (!row) {
    return { ok: false, error: "Evidence not found." };
  }
  if (row.gateCode !== gateId) {
    return { ok: false, error: "Evidence is not attached to this gate." };
  }

  try {
    if (mode === "unlink") {
      await prisma.evidenceItem.update({
        where: { id: evidenceId },
        data: { gateCode: null },
      });
      await recordAudit({
        action: "gate_review.evidence_unlinked",
        subjectKind: "evidence_item",
        subjectId: evidenceId,
        projectId,
        metadata: { gateId, evidenceName: row.name },
      });
    } else {
      await prisma.evidenceItem.delete({
        where: { id: evidenceId },
      });
      await recordAudit({
        action: "gate_review.evidence_deleted",
        subjectKind: "evidence_item",
        subjectId: evidenceId,
        projectId,
        metadata: { gateId, evidenceName: row.name },
      });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Operation failed." };
  }
}
