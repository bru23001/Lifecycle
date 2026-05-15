const MS_MINUTE = 60_000;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;
/** Beyond this window, show absolute date/time instead of “Nd ago”. */
const RELATIVE_CAP_DAYS = 7;

export function formatDateTimeAbsolute(d: Date): string {
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDateLabel(d: Date): string {
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

/**
 * Compact recency label for feeds and lists: `Just now` → `59m ago` → `23h ago` → `6d ago`,
 * then falls back to {@link formatDateTimeAbsolute} (same family as server “submitted on” labels).
 */
export function formatDateTimeRelative(d: Date, nowMs: number = Date.now()): string {
  if (Number.isNaN(d.getTime())) return "—";
  const diff = nowMs - d.getTime();
  if (diff < 0) return formatDateTimeAbsolute(d);
  if (diff < 45_000) return "Just now";
  if (diff < MS_HOUR) {
    const m = Math.floor(diff / MS_MINUTE);
    return `${Math.max(1, m)}m ago`;
  }
  if (diff < MS_DAY) {
    const h = Math.floor(diff / MS_HOUR);
    return `${Math.max(1, h)}h ago`;
  }
  if (diff < RELATIVE_CAP_DAYS * MS_DAY) {
    const days = Math.floor(diff / MS_DAY);
    return `${Math.max(1, days)}d ago`;
  }
  return formatDateTimeAbsolute(d);
}

/** Lowercases the “just now” edge case for mid-sentence copy (`Updated …`, `Autosaved …`). */
export function formatTimeAgoFragment(d: Date, nowMs: number = Date.now()): string {
  const r = formatDateTimeRelative(d, nowMs);
  return r === "Just now" ? "just now" : r;
}

/**
 * Best-effort parse for sorting / filtering client-built history rows.
 * Supports absolute locale strings and compact relative labels.
 */
export function parseFlexibleTimestampLabelMs(label: string, nowMs: number = Date.now()): number {
  const trimmed = label.trim();
  if (!trimmed || trimmed === "—") return 0;
  const normalized = trimmed.replace(/\bat\b/gi, ",").replace(/\s+/g, " ");
  let ms = Date.parse(normalized);
  if (!Number.isNaN(ms)) return ms;
  ms = Date.parse(trimmed);
  if (!Number.isNaN(ms)) return ms;
  if (/^just now$/i.test(trimmed)) return nowMs;
  const m = /^(\d+)\s*m\s*ago$/i.exec(trimmed);
  if (m) return nowMs - Number(m[1]) * MS_MINUTE;
  const h = /^(\d+)\s*h\s*ago$/i.exec(trimmed);
  if (h) return nowMs - Number(h[1]) * MS_HOUR;
  const da = /^(\d+)\s*d\s*ago$/i.exec(trimmed);
  if (da) return nowMs - Number(da[1]) * MS_DAY;
  return 0;
}

/** @deprecated Prefer {@link formatDateTimeAbsolute} for new code */
export const formatDateTimeLabel = formatDateTimeAbsolute;
