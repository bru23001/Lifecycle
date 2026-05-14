import { prisma } from "@/lib/prisma";

export type TraceabilityReportScheduleRow = {
  id: string;
  reportName: string;
  frequency: string;
  recipients: string[];
  format: string;
  includeGapsOnly: boolean;
  includeFullMatrix: boolean;
  active: boolean;
  createdAt: Date;
};

function parseRecipients(json: string): string[] {
  try {
    const v = JSON.parse(json) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((e) => e.trim());
  } catch {
    return [];
  }
}

export async function listTraceabilityReportSchedules(projectId: string): Promise<TraceabilityReportScheduleRow[]> {
  const rows = await prisma.traceabilityReportSchedule.findMany({
    where: { projectId, active: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    reportName: r.reportName,
    frequency: r.frequency,
    recipients: parseRecipients(r.recipientsJson),
    format: r.format,
    includeGapsOnly: r.includeGapsOnly,
    includeFullMatrix: r.includeFullMatrix,
    active: r.active,
    createdAt: r.createdAt,
  }));
}
