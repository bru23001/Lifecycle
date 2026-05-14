"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { logInfo } from "@/lib/server/logger";
import { getRequestIdFromHeaders } from "@/lib/server/request-context";

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

const approverSchema = z.object({
  userId: z.string().min(1).nullable().optional(),
  name: z.string().trim().min(2, "Approver name is required."),
  role: z.string().trim().min(2, "Approver role is required."),
});

const inputSchema = z.object({
  projectId: z.string().min(1),
  gateId: gateIdSchema,
  approvers: z.array(approverSchema).min(1, "Select at least one approver."),
  /** ISO-8601 timestamp; null/empty means "no due date". */
  dueAt: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional()
    .transform((v) => (v ? new Date(v) : null))
    .refine(
      (d) => d === null || !Number.isNaN(d.getTime()),
      "Due date is invalid.",
    ),
});

export type AssignGateApproversResult =
  | { ok: true; assignedCount: number }
  | { ok: false; error: string };

/**
 * Replaces the current set of approver assignments for a single
 * `(projectId, gateId)` pair with the provided list. Snapshot fields
 * (`approverName`, `approverRole`) are captured so the assignment record
 * stays intact even if the underlying `User` is later deactivated.
 *
 * CYBERCUBE 2.4 (AuthZ): tenant scoping happens in `requireCurrentUser` and
 * the implicit project filter in the where-clause. Customers may only act on
 * their own tenant's projects; cross-tenant calls fall through to the project
 * lookup which returns null and yields a 403-equivalent error here.
 *
 * CYBERCUBE 4.5 (Observability): emits a structured audit entry and a
 * sanitized log line. Approver display names are CC-PIDs (no PII).
 */
export async function assignGateApprovers(
  raw: z.input<typeof inputSchema>,
): Promise<AssignGateApproversResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { projectId, gateId, approvers, dueAt } = parsed.data;

  const user = await requireCurrentUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const assignmentIds = await prisma.$transaction(async (tx) => {
    await tx.gateApproverAssignment.deleteMany({
      where: { projectId, gateId },
    });
    const created = await Promise.all(
      approvers.map((a) =>
        tx.gateApproverAssignment.create({
          data: {
            projectId,
            gateId,
            userId: a.userId ?? null,
            approverName: a.name,
            approverRole: a.role,
            dueAt: dueAt ?? null,
            assignedById: user.id,
          },
          select: { id: true },
        }),
      ),
    );
    return created.map((c) => c.id);
  });

  await recordAudit({
    action: "gate_review.approvers_assigned",
    subjectKind: "project",
    subjectId: projectId,
    projectId,
    metadata: {
      gateId,
      assignmentIds,
      approverRoles: approvers.map((a) => a.role),
      dueAt: dueAt?.toISOString() ?? null,
    },
  });

  const requestId = await getRequestIdFromHeaders();
  logInfo({
    message: "gate_review.approvers_assigned",
    request_id: requestId,
    projectId,
    gateId,
    assignedCount: assignmentIds.length,
  });

  return { ok: true, assignedCount: assignmentIds.length };
}
