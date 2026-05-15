/**
 * Removes a leading spec-style section index (e.g. "8. ", "9. ") from headings
 * shown in the Approval Center. Preserves the original string when nothing
 * would remain after stripping.
 */
export function stripSpecSectionHeadingPrefix(label: string): string {
  const t = label.trim();
  const stripped = t.replace(/^\d+\.\s+/, "").trim();
  return stripped.length > 0 ? stripped : t;
}
