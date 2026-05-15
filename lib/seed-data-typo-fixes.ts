/**
 * Normalizes known seed/demo typos so they never surface in the UI.
 * Keep replacements narrowly scoped (word-boundary) to avoid corrupting legitimate tokens.
 */
const STRING_TYPOS: readonly { pattern: RegExp; replacement: string }[] = [
  { pattern: /\bRentral\b/gi, replacement: "Rental" },
];

export function applySeedDataTypoFixes(input: string): string {
  let s = input;
  for (const { pattern, replacement } of STRING_TYPOS) {
    s = s.replace(pattern, replacement);
  }
  return s;
}

/** Deep-fix string leaves inside persisted JSON (e.g. artifact `dataJson`). */
export function applySeedDataTypoFixesToJson(value: unknown): unknown {
  if (typeof value === "string") return applySeedDataTypoFixes(value);
  if (Array.isArray(value)) return value.map(applySeedDataTypoFixesToJson);
  if (value !== null && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      out[k] = applySeedDataTypoFixesToJson(v);
    }
    return out;
  }
  return value;
}
