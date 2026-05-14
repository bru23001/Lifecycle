"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";

export type ArchiveProjectArtifactResult = { ok: true } | { ok: false; error: string };

export async function archiveProjectArtifact(input: {
  projectId: string;
  artifactId: string;
}): Promise<ArchiveProjectArtifactResult> {
  await requireCurrentUser();
  const { projectId, artifactId } = input;

  const art = await prisma.artifact.findFirst({
    where: { id: artifactId, projectId },
    select: { id: true, status: true, templateId: true },
  });
  if (!art) {
    return { ok: false, error: "Artifact not found." };
  }
  if (art.status === "Archived") {
    return { ok: true };
  }

  await prisma.artifact.update({
    where: { id: artifactId },
    data: { status: "Archived" },
  });

  await recordAudit({
    action: "artifact.archived",
    subjectKind: "artifact",
    subjectId: artifactId,
    projectId,
    metadata: { templateId: art.templateId },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/artifacts`);
  return { ok: true };
}
