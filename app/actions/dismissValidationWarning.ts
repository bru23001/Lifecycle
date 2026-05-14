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
import { buildWorkspacePhaseSlice } from "@/lib/workspacePhaseWorkspaceSlice";
import { displayFromCurrentUser, getCurrentUser } from "@/lib/server/current-user";
import { toUserMessage } from "@/lib/toUserMessage";

const inputSchema = z.object({
  projectId: z.string().min(1),
  phaseNumber: z.number().int().min(1).max(14),
  warningId: z.string().min(1).max(120),
  reason: z.string().min(1).max(2000),
});

export type DismissValidationWarningResult = { ok: true } | { ok: false; error: string };

export async function dismissValidationWarning(
  raw: z.infer<typeof inputSchema>,
): Promise<DismissValidationWarningResult> {
  try {
    await requireCurrentUser();
    const input = inputSchema.parse(raw);

    const project = await prisma.project.findFirst({
      where: { id: input.projectId, archivedAt: null },
      select: {
        id: true,
        workspacePhaseDetailsJson: true,
        artifacts: {
          select: {
            id: true,
            templateId: true,
            version: true,
            status: true,
            updatedAt: true,
            markdownPath: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        applicabilityJson: true,
      },
    });
    if (!project) {
      return { ok: false, error: "Project not found." };
    }

    const userDisplay = displayFromCurrentUser(await getCurrentUser());
    const slice = buildWorkspacePhaseSlice(project, input.phaseNumber, userDisplay);
    const match = slice.validationWarnings.find((w) => w.id === input.warningId);
    if (!match) {
      return { ok: false, error: "That warning is not active for this phase." };
    }
    if (match.severity === "error" || match.dismissible === false) {
      return { ok: false, error: "Blocking warnings cannot be dismissed." };
    }

    const map: WorkspacePhaseDetailsMap = parseWorkspacePhaseDetailsJson(project.workspacePhaseDetailsJson);
    const key = String(input.phaseNumber);
    const prev = getWorkspacePhaseDetail(map, input.phaseNumber);
    const prior = [...(prev.dismissedValidationWarnings ?? [])];
    const nextDismissed = prior.filter((d) => d.warningId !== input.warningId);
    nextDismissed.push({
      warningId: input.warningId,
      reason: input.reason.trim(),
      dismissedAt: new Date().toISOString(),
    });

    map[key] = {
      ...prev,
      dismissedValidationWarnings: nextDismissed,
    };

    await prisma.project.update({
      where: { id: input.projectId },
      data: { workspacePhaseDetailsJson: map as object },
    });

    await recordAudit({
      action: "project.validation_warning_dismissed",
      subjectKind: "project",
      subjectId: input.projectId,
      projectId: input.projectId,
      metadata: {
        workspacePhase: input.phaseNumber,
        warningId: input.warningId,
        severity: match.severity,
        reason: input.reason.trim().slice(0, 400),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${input.projectId}`);
    revalidatePath(`/projects/${input.projectId}/workspace`);
    revalidatePath(`/projects/${input.projectId}/workspace/phases/${input.phaseNumber}/validation`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}
