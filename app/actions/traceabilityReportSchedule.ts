"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/server/audit";
import { requireCurrentUser } from "@/lib/server/current-user";
import { revalidatePath } from "next/cache";

const frequencySchema = z.enum(["daily", "weekly", "monthly", "gate_submission"]);
const formatSchema = z.enum(["csv", "json", "html_print", "zip"]);

const saveSchema = z
  .object({
    projectId: z.string().min(1),
    reportName: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
    frequency: frequencySchema,
    recipientsRaw: z.string().max(4000),
    format: formatSchema,
    includeGapsOnly: z.boolean(),
    includeFullMatrix: z.boolean(),
  })
  .refine((v) => v.includeGapsOnly || v.includeFullMatrix, {
    message: "Select at least one of: include full matrix, or gaps only.",
    path: ["includeFullMatrix"],
  });

function parseRecipientLines(raw: string): string[] {
  const emails = raw
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const out: string[] = [];
  for (const e of emails) {
    if (emailRe.test(e)) out.push(e);
  }
  return Array.from(new Set(out)).slice(0, 25);
}

export type SaveTraceabilityReportScheduleResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveTraceabilityReportSchedule(
  raw: z.input<typeof saveSchema>,
): Promise<SaveTraceabilityReportScheduleResult> {
  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, reportName, frequency, recipientsRaw, format, includeGapsOnly, includeFullMatrix } = parsed.data;
  const recipients = parseRecipientLines(recipientsRaw);
  if (recipients.length === 0) {
    return { ok: false, error: "Add at least one valid email address." };
  }

  const user = await requireCurrentUser();
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const row = await prisma.traceabilityReportSchedule.create({
    data: {
      projectId,
      reportName,
      frequency,
      recipientsJson: JSON.stringify(recipients),
      format,
      includeGapsOnly,
      includeFullMatrix,
      createdByUserId: user.id,
    },
    select: { id: true },
  });

  await recordAudit({
    action: "traceability.report_schedule.created",
    subjectKind: "traceability_report_schedule",
    subjectId: row.id,
    projectId,
    actorId: user.id,
    metadata: { reportName, frequency, format, recipientCount: recipients.length },
  });

  revalidatePath(`/projects/${projectId}/traceability/report`);
  return { ok: true, id: row.id };
}

const deleteSchema = z.object({
  projectId: z.string().min(1),
  scheduleId: z.string().min(1),
});

export type DeleteTraceabilityReportScheduleResult = { ok: true } | { ok: false; error: string };

export async function deleteTraceabilityReportSchedule(
  raw: z.input<typeof deleteSchema>,
): Promise<DeleteTraceabilityReportScheduleResult> {
  const parsed = deleteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { projectId, scheduleId } = parsed.data;
  const user = await requireCurrentUser();

  const existing = await prisma.traceabilityReportSchedule.findFirst({
    where: { id: scheduleId, projectId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "Schedule not found." };
  }

  await prisma.traceabilityReportSchedule.update({
    where: { id: scheduleId },
    data: { active: false },
  });

  await recordAudit({
    action: "traceability.report_schedule.deactivated",
    subjectKind: "traceability_report_schedule",
    subjectId: scheduleId,
    projectId,
    actorId: user.id,
    metadata: {},
  });

  revalidatePath(`/projects/${projectId}/traceability/report`);
  return { ok: true };
}
