"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { ALL_GATES } from "@/lib/server/helpers";
import { getCurrentUserDisplay, requireCurrentUser } from "@/lib/server/current-user";
import { toUserMessage } from "@/lib/toUserMessage";
import type { GateId } from "@/lib/gateRules";
import { getTemplatesForGate } from "@/templates/registry";
import { computeEvidenceLinkStatus } from "@/lib/evidence-link-status";

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

    if (phaseNumber != null && phaseNumber >= 1 && phaseNumber <= 14) {
      try {
        await prisma.evidencePhaseLink.create({
          data: { evidenceId: row.id, phaseNumber },
        });
      } catch {
        /* duplicate */
      }
    }

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

    if (gateCode?.trim()) {
      const gc = gateCode.trim().toUpperCase() as GateId;
      if (ALL_GATES.includes(gc)) {
        try {
          await prisma.evidenceGateLink.create({
            data: { evidenceId: row.id, gateCode: gc },
          });
        } catch {
          /* duplicate */
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
  rationale: z.string().trim().min(1).max(2000).optional(),
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

    if (createdLink && parsed.data.rationale?.trim()) {
      const rationaleBlock = `Artifact link (${new Date().toISOString()}): ${parsed.data.rationale.trim()}`;
      const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${rationaleBlock}` : rationaleBlock;
      await prisma.evidenceItem.update({
        where: { id: ev.id },
        data: { notes: nextNotes },
      });
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

const linkArtifactsBatchSchema = z.object({
  evidenceId: z.string().min(1),
  artifactIds: z.array(z.string().min(1)).min(1).max(50),
  rationale: z.string().trim().min(1).max(2000),
});

export type LinkEvidenceToArtifactsResult =
  | { ok: true; linkedCount: number }
  | { ok: false; error: string };

export async function linkEvidenceToArtifacts(
  raw: z.infer<typeof linkArtifactsBatchSchema>,
): Promise<LinkEvidenceToArtifactsResult> {
  try {
    await requireCurrentUser();
    const parsed = linkArtifactsBatchSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const ev = await prisma.evidenceItem.findUnique({
      where: { id: parsed.data.evidenceId },
    });
    if (!ev) {
      return { ok: false, error: "Evidence item not found." };
    }

    const uniqueIds = [...new Set(parsed.data.artifactIds)];
    const newlyLinked: string[] = [];

    for (const artifactId of uniqueIds) {
      const art = await prisma.artifact.findFirst({
        where: { id: artifactId, projectId: ev.projectId },
      });
      if (!art) continue;
      try {
        await prisma.evidenceArtifactLink.create({
          data: { evidenceId: ev.id, artifactId: art.id },
        });
        newlyLinked.push(art.id);
      } catch {
        /* duplicate */
      }
    }

    if (newlyLinked.length > 0) {
      const rationaleBlock = `Artifact link (${new Date().toISOString()}): ${parsed.data.rationale.trim()}`;
      const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${rationaleBlock}` : rationaleBlock;
      await prisma.evidenceItem.update({
        where: { id: ev.id },
        data: { notes: nextNotes },
      });

      for (const id of newlyLinked) {
        await recordAudit({
          action: "evidence.linked_to_artifact",
          subjectKind: "evidence_item",
          subjectId: ev.id,
          projectId: ev.projectId,
          metadata: { artifactId: id },
        });
      }
    }

    revalidateEvidenceSurfaces(ev.projectId);
    return { ok: true, linkedCount: newlyLinked.length };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const unlinkEvidenceArtifactSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  artifactId: z.string().min(1),
  reason: z.string().trim().min(1).max(2000),
});

export type UnlinkEvidenceArtifactResult = { ok: true } | { ok: false; error: string };

export async function unlinkEvidenceFromArtifact(
  raw: z.infer<typeof unlinkEvidenceArtifactSchema>,
): Promise<UnlinkEvidenceArtifactResult> {
  try {
    await requireCurrentUser();
    const parsed = unlinkEvidenceArtifactSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const ev = await prisma.evidenceItem.findFirst({
      where: { id: parsed.data.evidenceId, projectId: parsed.data.projectId },
    });
    const art = await prisma.artifact.findFirst({
      where: { id: parsed.data.artifactId, projectId: parsed.data.projectId },
    });
    if (!ev || !art) {
      return { ok: false, error: "Evidence or artifact not found for this project." };
    }

    const deleted = await prisma.evidenceArtifactLink.deleteMany({
      where: { evidenceId: ev.id, artifactId: art.id },
    });

    if (deleted.count === 0) {
      revalidateEvidenceSurfaces(parsed.data.projectId);
      return { ok: true };
    }

    const reasonBlock = `Artifact unlink (${new Date().toISOString()}): ${parsed.data.reason.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${reasonBlock}` : reasonBlock;

    const remainingArtifactLinks = await prisma.evidenceArtifactLink.count({
      where: { evidenceId: ev.id },
    });
    const phaseLinkCount = await prisma.evidencePhaseLink.count({
      where: { evidenceId: ev.id },
    });
    const hasWorkspace =
      ev.phaseNumber != null || Boolean(ev.gateCode?.trim()) || phaseLinkCount > 0;
    const nextStatus =
      remainingArtifactLinks === 0 ? (hasWorkspace ? "partially_linked" : "unlinked") : "linked";

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: { notes: nextNotes, status: nextStatus },
    });

    await recordAudit({
      action: "evidence.unlinked_from_artifact",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: ev.projectId,
      metadata: { artifactId: art.id },
    });

    revalidateEvidenceSurfaces(parsed.data.projectId);
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

    try {
      await prisma.evidencePhaseLink.create({
        data: { evidenceId: ev.id, phaseNumber: input.phaseNumber },
      });
    } catch {
      /* duplicate composite */
    }

    if (input.gateCode?.trim()) {
      const gc = input.gateCode.trim().toUpperCase() as GateId;
      if (ALL_GATES.includes(gc)) {
        try {
          await prisma.evidenceGateLink.create({
            data: { evidenceId: ev.id, gateCode: gc },
          });
        } catch {
          /* duplicate composite */
        }
      }
    }

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

    const fresh = await prisma.evidenceItem.findUnique({
      where: { id: ev.id },
      include: { artifactLinks: true, gateLinks: true, phaseLinks: true },
    });
    const nextStatus = fresh ? computeEvidenceLinkStatus(fresh) : null;
    if (nextStatus) {
      await prisma.evidenceItem.update({
        where: { id: ev.id },
        data: { status: nextStatus },
      });
    }

    revalidateEvidenceSurfaces(input.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const linkPhasesBatchSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  phaseNumbers: z.array(z.number().int().min(1).max(14)).min(1),
  gateCode: gateCodeSchema,
  artifactId: z.string().optional().nullable(),
  rationale: z.string().trim().min(1).max(2000),
});

export async function linkEvidenceToPhases(
  raw: z.infer<typeof linkPhasesBatchSchema>,
): Promise<LinkEvidencePhaseResult> {
  try {
    await requireCurrentUser();
    const input = linkPhasesBatchSchema.parse(raw);
    const uniqueSorted = [...new Set(input.phaseNumbers)].sort((a, b) => a - b);

    const ev = await prisma.evidenceItem.findFirst({
      where: { id: input.evidenceId, projectId: input.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    const rationaleBlock = `Phase links (${new Date().toISOString()}): ${input.rationale.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${rationaleBlock}` : rationaleBlock;

    await prisma.evidencePhaseLink.deleteMany({ where: { evidenceId: ev.id } });
    for (const phaseNumber of uniqueSorted) {
      await prisma.evidencePhaseLink.create({
        data: { evidenceId: ev.id, phaseNumber },
      });
    }

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: {
        notes: nextNotes,
        phaseNumber: uniqueSorted[0] ?? null,
        gateCode: input.gateCode ?? null,
      },
    });

    if (input.gateCode?.trim()) {
      const gc = input.gateCode.trim().toUpperCase() as GateId;
      if (ALL_GATES.includes(gc)) {
        try {
          await prisma.evidenceGateLink.create({
            data: { evidenceId: ev.id, gateCode: gc },
          });
        } catch {
          /* duplicate composite */
        }
      }
    }

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
      action: "evidence.linked_to_phases",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: input.projectId,
      metadata: { phaseNumbers: uniqueSorted, gateCode: input.gateCode ?? null },
    });

    const fresh = await prisma.evidenceItem.findUnique({
      where: { id: ev.id },
      include: { artifactLinks: true, gateLinks: true, phaseLinks: true },
    });
    const nextStatus = fresh ? computeEvidenceLinkStatus(fresh) : null;
    if (nextStatus) {
      await prisma.evidenceItem.update({
        where: { id: ev.id },
        data: { status: nextStatus },
      });
    }

    revalidateEvidenceSurfaces(input.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const unlinkPhaseSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  phaseNumber: z.number().int().min(1).max(14),
  reason: z.string().trim().min(1).max(2000),
});

export type UnlinkEvidencePhaseResult = { ok: true } | { ok: false; error: string };

export async function unlinkEvidenceFromPhase(
  raw: z.infer<typeof unlinkPhaseSchema>,
): Promise<UnlinkEvidencePhaseResult> {
  try {
    await requireCurrentUser();
    const input = unlinkPhaseSchema.parse(raw);

    const ev = await prisma.evidenceItem.findFirst({
      where: { id: input.evidenceId, projectId: input.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    await prisma.evidencePhaseLink.deleteMany({
      where: { evidenceId: ev.id, phaseNumber: input.phaseNumber },
    });

    let nextPrimary: number | null = ev.phaseNumber;
    if (nextPrimary === input.phaseNumber) {
      const rem = await prisma.evidencePhaseLink.findMany({
        where: { evidenceId: ev.id },
        orderBy: { phaseNumber: "asc" },
        select: { phaseNumber: true },
      });
      nextPrimary = rem[0]?.phaseNumber ?? null;
    }

    const reasonBlock = `Phase unlink (${new Date().toISOString()}): ${input.reason.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${reasonBlock}` : reasonBlock;

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: { phaseNumber: nextPrimary, notes: nextNotes },
    });

    const fresh = await prisma.evidenceItem.findUnique({
      where: { id: ev.id },
      include: { artifactLinks: true, gateLinks: true, phaseLinks: true },
    });
    const nextStatus = fresh ? computeEvidenceLinkStatus(fresh) : null;
    if (nextStatus) {
      await prisma.evidenceItem.update({
        where: { id: ev.id },
        data: { status: nextStatus },
      });
    }

    await recordAudit({
      action: "evidence.unlinked_from_phase",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: input.projectId,
      metadata: { phaseNumber: input.phaseNumber },
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

    const reasonBlock = `Workspace unlink (${new Date().toISOString()}): ${input.reason.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${reasonBlock}` : reasonBlock;

    await prisma.evidencePhaseLink.deleteMany({ where: { evidenceId: ev.id } });

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: {
        phaseNumber: null,
        gateCode: null,
        notes: nextNotes,
      },
    });

    const row = await prisma.evidenceItem.findUnique({
      where: { id: ev.id },
      include: { artifactLinks: true, gateLinks: true, phaseLinks: true },
    });
    if (row) {
      const nextStatus = computeEvidenceLinkStatus(row);
      if (nextStatus) {
        await prisma.evidenceItem.update({
          where: { id: ev.id },
          data: { status: nextStatus },
        });
      }
    }

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

const updateMetadataSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  name: z.string().trim().min(2).max(200),
  description: z.string().max(8000),
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
  classification: z.enum(["public", "internal", "confidential", "restricted"]),
  retentionPolicyLabel: z.string().max(120).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  tags: z.array(z.string().max(64)).max(40).default([]),
  source: z.string().max(2000).optional().nullable(),
});

export type EvidenceMutationResult = { ok: true } | { ok: false; error: string };

export async function updateEvidenceMetadata(raw: z.infer<typeof updateMetadataSchema>): Promise<EvidenceMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = updateMetadataSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }
    const v = parsed.data;
    const ev = await prisma.evidenceItem.findFirst({
      where: { id: v.evidenceId, projectId: v.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: {
        name: v.name,
        description: v.description,
        evidenceType: v.evidenceType,
        classification: v.classification,
        retentionPolicyLabel: v.retentionPolicyLabel?.trim() || null,
        notes: v.notes?.trim() || null,
        tagsJson: v.tags,
        fileTypeLabel: v.evidenceType,
        source: v.source?.trim() || null,
      },
    });

    await recordAudit({
      action: "evidence.metadata_updated",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: v.projectId,
      metadata: { evidenceCode: ev.evidenceCode },
    });

    revalidateEvidenceSurfaces(v.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const evidenceIdProjectSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
});

const archiveEvidenceSchema = evidenceIdProjectSchema.extend({
  reason: z.string().trim().max(2000).optional(),
});

const deleteEvidenceSchema = evidenceIdProjectSchema.extend({
  reason: z.string().trim().max(2000).optional(),
});

export async function archiveEvidenceItem(raw: z.infer<typeof archiveEvidenceSchema>): Promise<EvidenceMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = archiveEvidenceSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    const { projectId, evidenceId, reason } = parsed.data;
    const reasonText = reason?.trim() || "Confirmed via Evidence Center";

    const ev = await prisma.evidenceItem.findFirst({ where: { id: evidenceId, projectId } });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: { status: "archived" },
    });

    await recordAudit({
      action: "evidence.item_archived",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId,
      metadata: { evidenceCode: ev.evidenceCode, reason: reasonText },
    });

    revalidateEvidenceSurfaces(projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

export async function deleteEvidenceItem(raw: z.infer<typeof deleteEvidenceSchema>): Promise<EvidenceMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = deleteEvidenceSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    const { projectId, evidenceId, reason } = parsed.data;
    const reasonText = reason?.trim() || "Confirmed via Evidence Center";

    const ev = await prisma.evidenceItem.findFirst({ where: { id: evidenceId, projectId } });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    await prisma.evidenceItem.delete({ where: { id: ev.id } });

    await recordAudit({
      action: "evidence.item_deleted",
      subjectKind: "evidence_item",
      subjectId: evidenceId,
      projectId,
      metadata: { evidenceCode: ev.evidenceCode, reason: reasonText },
    });

    revalidateEvidenceSurfaces(projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const linkGatesBatchSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  gateCodes: z.array(z.string().regex(/^G(10|[1-9])$/i)).min(1).max(15),
  rationale: z.string().trim().min(1).max(2000),
  syncPrimaryWorkspace: z.boolean().optional(),
});

export type LinkEvidenceToGatesResult =
  | { ok: true; linkedCount: number }
  | { ok: false; error: string };

export async function linkEvidenceToGates(
  raw: z.infer<typeof linkGatesBatchSchema>,
): Promise<LinkEvidenceToGatesResult> {
  try {
    await requireCurrentUser();
    const parsed = linkGatesBatchSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const ev = await prisma.evidenceItem.findFirst({
      where: { id: parsed.data.evidenceId, projectId: parsed.data.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    const unique = [...new Set(parsed.data.gateCodes.map((c) => c.trim().toUpperCase()))] as GateId[];
    const validGates = unique.filter((c) => ALL_GATES.includes(c));
    if (validGates.length === 0) {
      return { ok: false, error: "No valid gates selected." };
    }

    const newlyLinked: GateId[] = [];
    for (const gateCode of validGates) {
      try {
        await prisma.evidenceGateLink.create({
          data: { evidenceId: ev.id, gateCode },
        });
        newlyLinked.push(gateCode);
      } catch {
        /* duplicate composite */
      }
    }

    const rationaleBlock = `Gate link (${new Date().toISOString()}): ${parsed.data.rationale.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${rationaleBlock}` : rationaleBlock;

    const updateData: {
      notes: string;
      status?: string;
      phaseNumber?: number;
      gateCode?: string | null;
    } = { notes: nextNotes };
    if (ev.status !== "archived") {
      updateData.status = "linked";
    }

    if (parsed.data.syncPrimaryWorkspace && validGates.length > 0) {
      const primary = validGates[0];
      const templates = getTemplatesForGate(primary);
      updateData.phaseNumber = templates[0]?.phase ?? 1;
      updateData.gateCode = primary;
    }

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: updateData,
    });

    for (const gateCode of newlyLinked) {
      await recordAudit({
        action: "evidence.linked_to_gate",
        subjectKind: "evidence_item",
        subjectId: ev.id,
        projectId: ev.projectId,
        metadata: { gateCode },
      });
    }

    revalidateEvidenceSurfaces(ev.projectId);
    return { ok: true, linkedCount: newlyLinked.length };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const unlinkEvidenceGateSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  gateCode: z.string().regex(/^G(10|[1-9])$/i),
  reason: z.string().trim().min(1).max(2000),
});

export type UnlinkEvidenceGateResult = { ok: true } | { ok: false; error: string };

export async function unlinkEvidenceFromGate(
  raw: z.infer<typeof unlinkEvidenceGateSchema>,
): Promise<UnlinkEvidenceGateResult> {
  try {
    await requireCurrentUser();
    const parsed = unlinkEvidenceGateSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const gate = parsed.data.gateCode.trim().toUpperCase() as GateId;
    if (!ALL_GATES.includes(gate)) {
      return { ok: false, error: "Invalid gate." };
    }

    const ev = await prisma.evidenceItem.findFirst({
      where: { id: parsed.data.evidenceId, projectId: parsed.data.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    const matchedRowGate = ev.gateCode?.trim().toUpperCase() === gate;

    await prisma.evidenceGateLink.deleteMany({
      where: { evidenceId: ev.id, gateCode: gate },
    });

    if (matchedRowGate) {
      await prisma.evidenceItem.update({
        where: { id: ev.id },
        data: { gateCode: null },
      });
    }

    const reasonBlock = `Gate unlink (${new Date().toISOString()}): ${parsed.data.reason.trim()}`;
    const nextNotes = ev.notes?.trim() ? `${ev.notes.trim()}\n\n${reasonBlock}` : reasonBlock;

    const row = await prisma.evidenceItem.findUnique({
      where: { id: ev.id },
      include: { artifactLinks: true, gateLinks: true, phaseLinks: true },
    });
    if (!row) return { ok: false, error: "Evidence item not found." };

    const nextStatus = computeEvidenceLinkStatus(row);

    await prisma.evidenceItem.update({
      where: { id: ev.id },
      data: {
        notes: nextNotes,
        ...(nextStatus ? { status: nextStatus } : {}),
      },
    });

    await recordAudit({
      action: "evidence.unlinked_from_gate",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: ev.projectId,
      metadata: { gateCode: gate },
    });

    revalidateEvidenceSurfaces(parsed.data.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const linkGateOnlySchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  gateCode: z.string().regex(/^G(10|[1-9])$/i),
  rationale: z.string().min(1).max(2000),
});

export async function linkEvidenceToGate(raw: z.infer<typeof linkGateOnlySchema>): Promise<LinkEvidencePhaseResult> {
  try {
    await requireCurrentUser();
    const parsed = linkGateOnlySchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }
    const gate = parsed.data.gateCode.toUpperCase() as GateId;
    if (!ALL_GATES.includes(gate)) {
      return { ok: false, error: "Unsupported gate." };
    }
    const result = await linkEvidenceToGates({
      projectId: parsed.data.projectId,
      evidenceId: parsed.data.evidenceId,
      gateCodes: [gate],
      rationale: parsed.data.rationale,
      syncPrimaryWorkspace: true,
    });
    if (!result.ok) return result;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

const evidenceCommentIdsSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  commentId: z.string().min(1),
});

const createEvidenceCommentSchema = z.object({
  projectId: z.string().min(1),
  evidenceId: z.string().min(1),
  body: z.string().trim().min(1).max(8000),
  visibility: z.enum(["project", "internal", "reviewers"]),
  mentionsRaw: z.string().max(2000).optional(),
  attachmentRef: z.string().max(2000).optional().nullable(),
});

const updateEvidenceCommentSchema = createEvidenceCommentSchema.extend({
  commentId: z.string().min(1),
});

const setEvidenceCommentResolvedSchema = evidenceCommentIdsSchema.extend({
  resolved: z.boolean(),
});

function mentionsFromInput(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
}

async function loadEvidenceCommentForProject(
  projectId: string,
  evidenceId: string,
  commentId: string,
) {
  return prisma.evidenceComment.findFirst({
    where: { id: commentId, evidenceId, evidence: { projectId } },
  });
}

export async function createEvidenceComment(
  raw: z.infer<typeof createEvidenceCommentSchema>,
): Promise<EvidenceMutationResult> {
  try {
    const viewer = await requireCurrentUser();
    const parsed = createEvidenceCommentSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }
    const v = parsed.data;
    const ev = await prisma.evidenceItem.findFirst({
      where: { id: v.evidenceId, projectId: v.projectId },
    });
    if (!ev) return { ok: false, error: "Evidence item not found." };

    await prisma.evidenceComment.create({
      data: {
        evidenceId: ev.id,
        authorId: viewer.id,
        authorName: viewer.name?.trim() || viewer.email,
        body: v.body,
        visibility: v.visibility,
        mentionsJson: mentionsFromInput(v.mentionsRaw),
        attachmentRef: v.attachmentRef?.trim() || null,
      },
    });

    await recordAudit({
      action: "evidence.comment_created",
      subjectKind: "evidence_item",
      subjectId: ev.id,
      projectId: v.projectId,
      metadata: { visibility: v.visibility },
    });

    revalidateEvidenceSurfaces(v.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

export async function updateEvidenceComment(
  raw: z.infer<typeof updateEvidenceCommentSchema>,
): Promise<EvidenceMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = updateEvidenceCommentSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }
    const v = parsed.data;
    const row = await loadEvidenceCommentForProject(v.projectId, v.evidenceId, v.commentId);
    if (!row) return { ok: false, error: "Comment not found." };

    await prisma.evidenceComment.update({
      where: { id: row.id },
      data: {
        body: v.body,
        visibility: v.visibility,
        mentionsJson: mentionsFromInput(v.mentionsRaw),
        attachmentRef: v.attachmentRef?.trim() || null,
      },
    });

    await recordAudit({
      action: "evidence.comment_updated",
      subjectKind: "evidence_item",
      subjectId: v.evidenceId,
      projectId: v.projectId,
      metadata: { commentId: row.id },
    });

    revalidateEvidenceSurfaces(v.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

export async function deleteEvidenceComment(
  raw: z.infer<typeof evidenceCommentIdsSchema>,
): Promise<EvidenceMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = evidenceCommentIdsSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid input." };
    const v = parsed.data;
    const row = await loadEvidenceCommentForProject(v.projectId, v.evidenceId, v.commentId);
    if (!row) return { ok: false, error: "Comment not found." };

    await prisma.evidenceComment.delete({ where: { id: row.id } });

    await recordAudit({
      action: "evidence.comment_deleted",
      subjectKind: "evidence_item",
      subjectId: v.evidenceId,
      projectId: v.projectId,
      metadata: { commentId: v.commentId },
    });

    revalidateEvidenceSurfaces(v.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}

export async function setEvidenceCommentResolved(
  raw: z.infer<typeof setEvidenceCommentResolvedSchema>,
): Promise<EvidenceMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = setEvidenceCommentResolvedSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid input." };
    const v = parsed.data;
    const row = await loadEvidenceCommentForProject(v.projectId, v.evidenceId, v.commentId);
    if (!row) return { ok: false, error: "Comment not found." };

    await prisma.evidenceComment.update({
      where: { id: row.id },
      data: { resolved: v.resolved },
    });

    await recordAudit({
      action: "evidence.comment_resolved",
      subjectKind: "evidence_item",
      subjectId: v.evidenceId,
      projectId: v.projectId,
      metadata: { commentId: row.id, resolved: v.resolved },
    });

    revalidateEvidenceSurfaces(v.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toUserMessage(e) };
  }
}
