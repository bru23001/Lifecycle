"use server";

import { prisma } from "@/lib/prisma";

export type GetWizardArtifactSnapshotResult =
  | { ok: true; dataJson: Record<string, unknown>; templateId: string }
  | { ok: false; error: string };

export async function getWizardArtifactSnapshot(input: {
  projectId: string;
  artifactId: string;
}): Promise<GetWizardArtifactSnapshotResult> {
  const row = await prisma.artifact.findFirst({
    where: { id: input.artifactId, projectId: input.projectId },
    select: { dataJson: true, templateId: true },
  });
  if (!row) {
    return { ok: false, error: "Artifact not found for this project." };
  }
  return {
    ok: true,
    dataJson: (row.dataJson ?? {}) as Record<string, unknown>,
    templateId: row.templateId,
  };
}
