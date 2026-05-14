"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import {
  getWorkspacePhaseDetail,
  parseWorkspacePhaseDetailsJson,
  type WorkspacePhaseDetailsMap,
} from "@/lib/workspacePhaseDetails";
import { toUserMessage } from "@/lib/toUserMessage";

const inputSchema = z.object({
  projectId: z.string().min(1),
  phaseNumber: z.number().int().min(1).max(14),
  checklistItemId: z.string().min(1).max(160),
  targetStatus: z.enum(["complete", "incomplete"]),
  reason: z.string().min(1).max(500),
  comment: z.string().min(1).max(2000),
});

export type RecordChecklistOverrideResult = { ok: true } | { ok: false; error: string };

export async function recordChecklistOverride(
  raw: z.infer<typeof inputSchema>,
): Promise<RecordChecklistOverrideResult> {
  try {
    await requireCurrentUser();
    const input = inputSchema.parse(raw);

    const project = await prisma.project.findFirst({
      where: { id: input.projectId, archivedAt: null },
      select: { id: true, workspacePhaseDetailsJson: true },
    });
    if (!project) {
      return { ok: false, error: "Project not found." };
    }

    const map: WorkspacePhaseDetailsMap = parseWorkspacePhaseDetailsJson(project.workspacePhaseDetailsJson);
    const key = String(input.phaseNumber);
    const prev = getWorkspacePhaseDetail(map, input.phaseNumber);
    const overrides = { ...(prev.checklistOverrides ?? {}) };
    overrides[input.checklistItemId] = {
      targetStatus: input.targetStatus,
      reason: input.reason.trim(),
      comment: input.comment.trim(),
      at: new Date().toISOString(),
    };

    map[key] = {
      ...prev,
      checklistOverrides: overrides,
    };

    await prisma.project.update({
      where: { id: input.projectId },
      data: { workspacePhaseDetailsJson: map as object },
    });

    await recordAudit({
      action: "project.checklist_manual_override",
      subjectKind: "project",
      subjectId: input.projectId,
      projectId: input.projectId,
      metadata: {
        workspacePhase: input.phaseNumber,
        checklistItemId: input.checklistItemId,
        targetStatus: input.targetStatus,
        before: "computed checklist state",
        after: "manual override recorded",
        comment: input.comment.trim().slice(0, 400),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${input.projectId}`);
    revalidatePath(`/projects/${input.projectId}/workspace`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}
