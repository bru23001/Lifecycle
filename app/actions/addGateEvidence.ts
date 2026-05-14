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

const evidenceTypeSchema = z.enum([
  "pdf",
  "spreadsheet",
  "document",
  "image",
  "link",
  "json",
  "markdown",
  "report",
]);

const classificationSchema = z.enum(["public", "internal", "confidential", "restricted"]);

const inputSchema = z
  .object({
    projectId: z.string().min(1),
    gateId: gateIdSchema,
    name: z.string().trim().min(2, "Name is required."),
    evidenceType: evidenceTypeSchema,
    classification: classificationSchema,
    phaseNumber: z.number().int().min(1).max(14),
    externalUrl: z.string().trim().optional(),
    artifactId: z.string().trim().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.evidenceType === "link" && !(val.externalUrl?.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL is required for link evidence.",
        path: ["externalUrl"],
      });
    }
  });

export type AddGateEvidenceResult = { ok: true; evidenceId: string } | { ok: false; error: string };

export async function addGateEvidence(raw: z.input<typeof inputSchema>): Promise<AddGateEvidenceResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, gateId, name, evidenceType, classification, phaseNumber, externalUrl, artifactId } =
    parsed.data;

  const user = await requireCurrentUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const url = externalUrl?.trim() ?? "";
  let resolvedType = evidenceType;
  if (url) {
    resolvedType = "link";
  }

  const evidenceCode = `EV-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.evidenceItem.create({
        data: {
          projectId,
          evidenceCode,
          name,
          description: "",
          evidenceType: resolvedType,
          phaseNumber,
          gateCode: gateId,
          classification,
          status: "linked",
          completenessPercent: 100,
          fileTypeLabel: resolvedType === "link" ? "Link" : "Document",
          downloadHref: url || null,
          previewHref: url || null,
          source: url ? "external_link" : "gate_review",
          uploadedByName: user.name?.trim() || user.email || "User",
        },
      });

      const aid = artifactId?.trim();
      if (aid) {
        const art = await tx.artifact.findFirst({
          where: { id: aid, projectId },
          select: { id: true },
        });
        if (art) {
          await tx.evidenceArtifactLink.create({
            data: { evidenceId: row.id, artifactId: art.id },
          });
        }
      }

      return row;
    });

    await recordAudit({
      action: "gate_review.evidence_added",
      subjectKind: "evidence_item",
      subjectId: created.id,
      projectId,
      metadata: { gateId, evidenceId: created.id, evidenceCode, evidenceType: resolvedType },
    });

    return { ok: true, evidenceId: created.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not save evidence.";
    if (msg.includes("Unique constraint")) {
      return { ok: false, error: "Evidence code collision — retry." };
    }
    return { ok: false, error: msg };
  }
}
