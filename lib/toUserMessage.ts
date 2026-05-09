/**
 * Stable user-facing message for caught rejections / thrown values (avoids "[object Event]" in UI).
 */
export function toUserMessage(value: unknown): string {
  if (value == null) {
    return "Something went wrong.";
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Error) {
    return value.message.trim() || value.name || "Error";
  }
  if (typeof Event !== "undefined" && value instanceof Event) {
    return `Unexpected browser event (${value.type}).`;
  }
  if (typeof value === "object" && "message" in value) {
    const m = (value as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) {
      return m;
    }
  }
  try {
    const s = String(value);
    if (s === "[object Object]") {
      return "Something went wrong.";
    }
    return s;
  } catch {
    return "Something went wrong.";
  }
}
