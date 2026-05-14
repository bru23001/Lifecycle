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
  ownerName: z.string().max(200),
  targetCompletionIso: z.string().max(32).optional().nullable(),
  phaseNotes: z.string().max(8000),
  priority: z.string().max(40),
  riskLevel: z.string().max(40),
  internalStatus: z.string().max(80),
  contributorNames: z.array(z.string().max(120)).max(50),
});

export type UpdateWorkspacePhaseDetailsResult = { ok: true } | { ok: false; error: string };

export async function updateWorkspacePhaseDetails(
  raw: z.infer<typeof inputSchema>,
): Promise<UpdateWorkspacePhaseDetailsResult> {
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
    map[key] = {
      ...prev,
      ownerName: input.ownerName.trim() || undefined,
      targetCompletionIso: input.targetCompletionIso?.trim() || null,
      phaseNotes: input.phaseNotes.trim() || undefined,
      priority: input.priority.trim() || undefined,
      riskLevel: input.riskLevel.trim() || undefined,
      internalStatus: input.internalStatus.trim() || undefined,
      contributorNames: input.contributorNames.length > 0 ? input.contributorNames : undefined,
    };

    await prisma.project.update({
      where: { id: input.projectId },
      data: { workspacePhaseDetailsJson: map as object },
    });

    await recordAudit({
      action: "project.workspace_phase_details_updated",
      subjectKind: "project",
      subjectId: input.projectId,
      projectId: input.projectId,
      metadata: {
        workspacePhase: input.phaseNumber,
        before: "previous phase workspace metadata",
        after: "updated phase workspace metadata",
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${input.projectId}`);
    revalidatePath(`/projects/${input.projectId}/workspace`);
    revalidatePath(`/projects/${input.projectId}/workspace/phases/${input.phaseNumber}/package`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}
