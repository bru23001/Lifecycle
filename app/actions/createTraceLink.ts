"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { traceLinkConfidenceSchema, traceLinkRelationSchema } from "@/lib/trace-link-relations";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";

const endpointKindSchema = z.enum(["requirement", "feature", "artifact"]);

const inputSchema = z
  .object({
    projectId: z.string().min(1),
    fromKind: endpointKindSchema,
    fromId: z.string().min(1, "Source object is required."),
    toKind: endpointKindSchema,
    toId: z.string().min(1, "Target object is required."),
    relation: traceLinkRelationSchema,
    rationale: z
      .string()
      .trim()
      .min(3, "Rationale is required (3–500 characters).")
      .max(500, "Rationale must be 500 characters or fewer."),
    confidence: traceLinkConfidenceSchema,
    evidenceReference: z.string().trim().max(500).optional().default(""),
  })
  .refine(
    (v) => !(v.fromKind === v.toKind && v.fromId === v.toId),
    {
      message: "Source and target must be different.",
      path: ["toId"],
    },
  );

export type CreateTraceLinkResult =
  | { ok: true; linkId: string }
  | { ok: false; error: string };

type EndpointKind = z.infer<typeof endpointKindSchema>;

async function endpointBelongsToProject(
  kind: EndpointKind,
  id: string,
  projectId: string,
): Promise<boolean> {
  switch (kind) {
    case "requirement": {
      const row = await prisma.requirement.findUnique({
        where: { id },
        select: { projectId: true },
      });
      return row?.projectId === projectId;
    }
    case "feature": {
      const row = await prisma.feature.findUnique({
        where: { id },
        select: { projectId: true },
      });
      return row?.projectId === projectId;
    }
    case "artifact": {
      const row = await prisma.artifact.findUnique({
        where: { id },
        select: { projectId: true },
      });
      return row?.projectId === projectId;
    }
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return false;
    }
  }
}

export async function createTraceLink(
  raw: z.input<typeof inputSchema>,
): Promise<CreateTraceLinkResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, fromKind, fromId, toKind, toId, relation, rationale, confidence, evidenceReference } =
    parsed.data;

  const user = await requireCurrentUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const [fromOk, toOk] = await Promise.all([
    endpointBelongsToProject(fromKind, fromId, projectId),
    endpointBelongsToProject(toKind, toId, projectId),
  ]);
  if (!fromOk) {
    return { ok: false, error: "Source object not found in this project." };
  }
  if (!toOk) {
    return { ok: false, error: "Target object not found in this project." };
  }

  const existing = await prisma.traceLink.findFirst({
    where: { projectId, deletedAt: null, fromKind, fromId, toKind, toId, relation },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "A trace link with these endpoints already exists." };
  }

  const link = await prisma.traceLink.create({
    data: {
      projectId,
      fromKind,
      fromId,
      toKind,
      toId,
      relation,
      rationale,
      confidence,
      evidenceReference: evidenceReference.trim(),
      createdByUserId: user.id,
    },
    select: { id: true },
  });

  await recordAudit({
    action: "trace_link.created",
    subjectKind: "trace_link",
    subjectId: link.id,
    projectId,
    actorId: user.id,
    metadata: {
      fromKind,
      fromId,
      toKind,
      toId,
      relation,
      rationale,
      confidence,
      evidenceReference: evidenceReference.trim(),
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "trace_link.created",
    request_id: requestId,
    projectId,
    linkId: link.id,
    relation,
    rationale_present: true,
  });

  return { ok: true, linkId: link.id };
}
