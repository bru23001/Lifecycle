"use server";

import { z } from "zod";

import { normalizeGateParam } from "@/lib/gateNormalize";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { loadGateAuditTrailViewDataForProject } from "@/lib/server/gate-audit-trail";
import { requireCurrentUser } from "@/lib/server/current-user";
import type { GateAuditTrailViewData } from "@/types/gate-audit.types";

const inputSchema = z.object({
  projectId: z.string().min(1),
  gateCode: z.string().min(2),
});

export type FetchGateAuditTrailForDrawerResult =
  | { ok: true; data: GateAuditTrailViewData }
  | { ok: false; error: string };

export async function fetchGateAuditTrailForDrawer(
  raw: z.infer<typeof inputSchema>,
): Promise<FetchGateAuditTrailForDrawerResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await requireCurrentUser();

  const gate = normalizeGateParam(parsed.data.gateCode);
  if (!gate) {
    return { ok: false, error: "Invalid gate code." };
  }

  const resolvedId = await resolveProjectIdFromRouteParam(parsed.data.projectId);
  if (!resolvedId) {
    return { ok: false, error: "Project not found." };
  }

  const data = await loadGateAuditTrailViewDataForProject(resolvedId, gate);
  if (!data) {
    return { ok: false, error: "Project not found." };
  }

  return { ok: true, data };
}
