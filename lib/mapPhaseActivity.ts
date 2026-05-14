import type { PhaseActivityRow } from "@/components/lifecycle-workspace/workspace-phase-tools-types";
import { formatWorkspaceDate } from "@/lib/workspacePhaseWorkspaceSlice";

function humanizeAction(action: string): string {
  return action.replace(/\./g, " · ");
}

function summarizeMeta(meta: Record<string, unknown>): string {
  const keys = ["workspacePhase", "fromPhase", "toPhase", "gateCode", "fields", "checklistItemId"];
  const parts: string[] = [];
  for (const k of keys) {
    if (meta[k] !== undefined && meta[k] !== null) {
      parts.push(`${k}: ${String(meta[k])}`);
    }
  }
  if (parts.length === 0) return "—";
  return parts.join(" · ");
}

export function mapProjectAuditToActivity(
  entries: Array<{
    id: string;
    action: string;
    metadata: unknown;
    createdAt: Date;
    actor: { name: string | null } | null;
  }>,
  max = 35,
): PhaseActivityRow[] {
  return entries.slice(0, max).map((e) => {
    const meta =
      e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
        ? (e.metadata as Record<string, unknown>)
        : {};
    const before = meta.before;
    const after = meta.after;
    return {
      id: e.id,
      actor: e.actor?.name ?? "System",
      timestampLabel: formatWorkspaceDate(e.createdAt),
      changedObject: humanizeAction(e.action),
      beforeLabel: typeof before === "string" ? before : "—",
      afterLabel: typeof after === "string" ? after : summarizeMeta(meta),
      comment: typeof meta.comment === "string" ? meta.comment : "—",
      auditRef: e.id,
    };
  });
}
