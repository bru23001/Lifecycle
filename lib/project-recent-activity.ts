import { formatDateTimeRelative } from "@/lib/datetime-format";
import type { ProjectScreenAuditEntry, SelectedProjectActivity } from "@/types/projects.types";

export type RecentActivityGateRow = {
  gateId: string;
  decision: string;
  authorityName: string | null;
  authorityRole: string | null;
  createdAt: Date;
};

function timeLabelFromDate(d: Date): string {
  return formatDateTimeRelative(d);
}

/**
 * Merges gate decisions and artifact-related audit rows into a single “recent activity” feed
 * (newest first) with deep links for task 15 (artifact detail, gate review).
 */
export function buildSelectedProjectRecentActivity(
  projectId: string,
  gates: RecentActivityGateRow[],
  audit: ProjectScreenAuditEntry[],
  maxItems = 8,
): SelectedProjectActivity[] {
  type Row = SelectedProjectActivity & { _t: number };
  const rows: Row[] = [];

  for (const g of gates) {
    rows.push({
      id: `gate-${g.gateId}-${g.createdAt.getTime()}`,
      title: `${g.gateId} decision recorded — ${g.decision}`,
      meta: `${g.authorityName ?? "Reviewer"} · ${g.authorityRole ?? "Authority"}`,
      timeLabel: timeLabelFromDate(g.createdAt),
      href: `/projects/${projectId}/gates/${g.gateId.toLowerCase()}/review`,
      _t: g.createdAt.getTime(),
    });
  }

  for (const e of audit) {
    if (!e.href) continue;
    const metaBits = [e.actorLabel, e.detail].filter(Boolean);
    rows.push({
      id: `audit-${e.id}`,
      title: e.title,
      meta: metaBits.join(" · "),
      timeLabel: timeLabelFromDate(new Date(e.createdAt)),
      href: e.href,
      _t: new Date(e.createdAt).getTime(),
    });
  }

  rows.sort((a, b) => b._t - a._t);
  return rows.slice(0, maxItems).map((row) => {
    const { id, title, meta, timeLabel, href } = row;
    const out: SelectedProjectActivity = { id, title, meta, timeLabel };
    if (href !== undefined) out.href = href;
    return out;
  });
}
