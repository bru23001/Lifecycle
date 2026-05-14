export type FormFieldDiffRow = {
  fieldName: string;
  change: "added" | "removed" | "changed" | "same";
  currentPreview: string;
  otherPreview: string;
};

function previewValue(value: unknown, max = 96): string {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "string") {
    const t = value.trim();
    return t.length <= max ? t || "(empty)" : `${t.slice(0, max)}…`;
  }
  try {
    const s = JSON.stringify(value);
    return s.length <= max ? s : `${s.slice(0, max)}…`;
  } catch {
    return String(value);
  }
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/** Flat field-level diff for wizard `formValues` maps. */
export function diffFormFieldRecords(
  current: Record<string, unknown>,
  other: Record<string, unknown>,
): FormFieldDiffRow[] {
  const keys = new Set([...Object.keys(current), ...Object.keys(other)]);
  const rows: FormFieldDiffRow[] = [];
  for (const fieldName of [...keys].sort()) {
    const hasC = Object.prototype.hasOwnProperty.call(current, fieldName);
    const hasO = Object.prototype.hasOwnProperty.call(other, fieldName);
    const cv = hasC ? current[fieldName] : undefined;
    const ov = hasO ? other[fieldName] : undefined;
    let change: FormFieldDiffRow["change"];
    if (!hasO && hasC) change = "added";
    else if (hasO && !hasC) change = "removed";
    else if (!valuesEqual(cv, ov)) change = "changed";
    else change = "same";
    rows.push({
      fieldName,
      change,
      currentPreview: previewValue(cv),
      otherPreview: previewValue(ov),
    });
  }
  return rows;
}

export function diffFormFieldRecordsChangedOnly(
  current: Record<string, unknown>,
  other: Record<string, unknown>,
): FormFieldDiffRow[] {
  return diffFormFieldRecords(current, other).filter((r) => r.change !== "same");
}
