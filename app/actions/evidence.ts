"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { getCurrentUserDisplay, requireCurrentUser } from "@/lib/server/current-user";
import { toUserMessage } from "@/lib/toUserMessage";

const gateCodeSchema = z
  .string()
  .max(8)
  .optional()
  .nullable()
  .transform((v) => {
    if (!v || v === "—") return null;
    return v.trim().toUpperCase();
  });

const createSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(2),
  description: z.string().max(8000).optional(),
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
  gateCode: gateCodeSchema,
  classification: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
  notes: z.string().max(8000).optional(),
  sourceUrl: z.string().max(2000).optional(),
  linkedArtifactId: z.string().optional(),
  declaredFileName: z.string().max(500).optional(),
});

export type CreateEvidenceResult =
  | { ok: true; evidenceId: string }
  | { ok: false; error: string };

function revalidateEvidenceSurfaces(projectId: string) {
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);
  revalidatePath(`/projects/${projectId}/evidence`);
}

export async function createEvidenceItem(
  raw: z.infer<typeof createSchema>,
): Promise<CreateEvidenceResult> {
  try {
    await requireCurrentUser();
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const {
      projectId,
      name,
      description,
      evidenceType,
      phaseNumber,
      gateCode,
      classification,
      notes,
      sourceUrl,
      linkedArtifactId,
      declaredFileName,
    } = parsed.data;

    const project = await prisma.project.findFirst({
      where: { id: projectId, archivedAt: null },
    });
    if (!project) return { ok: false, error: "Project not found." };

    const viewer = await getCurrentUserDisplay();

    const n = await prisma.evidenceItem.count({ where: { projectId } });
    const evidenceCode = `EV-${new Date().getFullYear()}-${String(n + 1).padStart(4, "0")}`;

    const trimmedUrl = sourceUrl?.trim();
    const source =
      evidenceType === "link" && trimmedUrl && /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : null;

    const noteParts: string[] = [];
    if (notes?.trim()) noteParts.push(notes.trim());
    if (declaredFileName?.trim()) {
      noteParts.push(`Declared upload (metadata only): ${declaredFileName.trim()}`);
    }
    const mergedNotes = noteParts.length > 0 ? noteParts.join("\n\n") : undefined;

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
        uploadedByName: viewer.name,
        notes: mergedNotes,
        source,
        previewHref: source ?? undefined,
        downloadHref: source ?? undefined,
      },
    });

    if (linkedArtifactId?.trim()) {
      const art = await prisma.artifact.findFirst({
        where: { id: linkedArtifactId.trim(), projectId },
      });
      if (art) {
        try {
          await prisma.evidenceArtifactLink.create({
            data: { evidenceId: row.id, artifactId: art.id },
          });
        } catch {
          /* duplicate link */
        }
      }
    }

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

    revalidateEvidenceSurfaces(projectId);
    return { ok: true, evidenceId: row.id };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const linkSchema = z.object({
  evidenceId: z.string().min(1),
  artifactId: z.string().min(1),
});

export async function linkEvidenceToArtifact(
  raw: z.infer<typeof linkSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireCurrentUser();
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

    revalidateEvidenceSurfaces(ev.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const linkPhaseSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  phaseNumber: z.number().int().min(1).max(14),
  gateCode: gateCodeSchema,
  artifactId: z.string().optional().nullable(),
  rationale: z.string().min(1).max(2000),
});

export type LinkEvidencePhaseResult = { ok: true } | { ok: false; error: string };

export async function linkEvidenceToWorkspacePhase(
  raw: z.infer<typeof linkPhaseSchema>,
): Promise<LinkEvidencePhaseResult> {
  try {
    await requireCurrentUser();
    const input = linkPhaseSchema.parse(raw);

    const ev = await prisma.evidenceItem.findFirst({
      where: { id: input.evidenceId, projectId: input.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    const rationaleBlock = `Link rationale (${new Date().toISOString()}): ${input.rationale.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${rationaleBlock}` : rationaleBlock;

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: {
        phaseNumber: input.phaseNumber,
        gateCode: input.gateCode ?? null,
        notes: nextNotes,
        status: "linked",
      },
    });

    if (input.artifactId?.trim()) {
      const art = await prisma.artifact.findFirst({
        where: { id: input.artifactId.trim(), projectId: input.projectId },
      });
      if (art) {
        try {
          await prisma.evidenceArtifactLink.create({
            data: { evidenceId: ev.id, artifactId: art.id },
          });
        } catch {
          /* exists */
        }
      }
    }

    await recordAudit({
      action: "evidence.linked_to_workspace_phase",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: input.projectId,
      metadata: {
        phaseNumber: input.phaseNumber,
        gateCode: input.gateCode ?? null,
        artifactId: input.artifactId ?? null,
      },
    });

    revalidateEvidenceSurfaces(input.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const unlinkSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  reason: z.string().min(1).max(2000),
});

export type UnlinkEvidenceWorkspaceResult = { ok: true } | { ok: false; error: string };

export async function unlinkEvidenceFromWorkspace(
  raw: z.infer<typeof unlinkSchema>,
): Promise<UnlinkEvidenceWorkspaceResult> {
  try {
    await requireCurrentUser();
    const input = unlinkSchema.parse(raw);

    const ev = await prisma.evidenceItem.findFirst({
      where: { id: input.evidenceId, projectId: input.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    const artifactLinkCount = await prisma.evidenceArtifactLink.count({
      where: { evidenceId: ev.id },
    });

    const reasonBlock = `Workspace unlink (${new Date().toISOString()}): ${input.reason.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${reasonBlock}` : reasonBlock;

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: {
        phaseNumber: null,
        gateCode: null,
        notes: nextNotes,
        status: artifactLinkCount > 0 ? "partially_linked" : "unlinked",
      },
    });

    await recordAudit({
      action: "evidence.unlinked_from_workspace_phase",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: input.projectId,
      metadata: { beforePhase: ev.phaseNumber, beforeGate: ev.gateCode },
    });

    revalidateEvidenceSurfaces(input.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}
