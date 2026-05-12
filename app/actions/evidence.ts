"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";

const createSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(2),
  description: z.string().optional(),
  evidenceType: z.enum([
    "pdf",
    "spreadsheet",
    "document",
    "image",
    "link",
    "json",
    "markdown",
    "report",
  ]),
  phaseNumber: z.number().int().min(1).max(14).optional(),
  gateCode: z.enum(["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"]).optional(),
  classification: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
});

export type CreateEvidenceResult =
  | { ok: true; evidenceId: string }
  | { ok: false; error: string };

export async function createEvidenceItem(
  raw: z.infer<typeof createSchema>,
): Promise<CreateEvidenceResult> {
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, name, description, evidenceType, phaseNumber, gateCode, classification } =
    parsed.data;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false, error: "Project not found." };

  const n = await prisma.evidenceItem.count({ where: { projectId } });
  const evidenceCode = `EV-${new Date().getFullYear()}-${String(n + 1).padStart(4, "0")}`;

  const row = await prisma.evidenceItem.create({
    data: {
      projectId,
      evidenceCode,
      name,
      description: description ?? "",
      evidenceType,
      phaseNumber: phaseNumber ?? null,
      gateCode: gateCode ?? null,
      classification: classification ?? "internal",
      status: "linked",
      completenessPercent: 100,
      fileTypeLabel: evidenceType,
      uploadedByName: "Local User",
    },
  });

  await recordAudit({
    action: "evidence.item_created",
    subjectKind: "evidence_item",
    subjectId: row.id,
    projectId,
    metadata: {
      evidenceCode,
      evidenceType,
      phaseNumber: phaseNumber ?? null,
      gateCode: gateCode ?? null,
    },
  });

  return { ok: true, evidenceId: row.id };
}

const linkSchema = z.object({
  evidenceId: z.string().min(1),
  artifactId: z.string().min(1),
});

export async function linkEvidenceToArtifact(
  raw: z.infer<typeof linkSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = linkSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const ev = await prisma.evidenceItem.findUnique({
    where: { id: parsed.data.evidenceId },
  });
  const art = await prisma.artifact.findUnique({
    where: { id: parsed.data.artifactId },
  });
  if (!ev || !art || ev.projectId !== art.projectId) {
    return { ok: false, error: "Evidence or artifact not found for this project." };
  }

  let createdLink = false;
  try {
    await prisma.evidenceArtifactLink.create({
      data: { evidenceId: ev.id, artifactId: art.id },
    });
    createdLink = true;
  } catch {
    /* duplicate composite link */
  }

  if (createdLink) {
    await recordAudit({
      action: "evidence.linked_to_artifact",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: ev.projectId,
      metadata: { artifactId: art.id },
    });
  }

  return { ok: true };
}
