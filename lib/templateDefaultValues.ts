import type { RepeaterRowField, TemplateField } from "@/templates/types";

/**
 * Build RHF/validation default object from a template (shared by UI and `check-templates` script).
 */
export function buildTemplateDefaultValues(template: {
  sections: { fields: TemplateField[] }[];
}): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const section of template.sections) {
    for (const field of section.fields) {
      values[field.name] = getDefaultValue(field);
    }
  }
  return values;
}

function getDefaultValue(field: TemplateField): unknown {
  if (field.type === "repeater") return [];
  if (field.type === "refPicker") return field.multi ? [] : "";
  if (field.type === "checkbox") return false;
  if (field.type === "tags") return [];
  if (field.type === "number") return undefined;
  if (field.type === "select" && field.options?.length) {
    return field.options[0]!.value;
  }

  return "";
}

export function rowFieldDefault(rowField: RepeaterRowField): unknown {
  if (rowField.type === "checkbox") return false;
  if (rowField.type === "tags") return [];
  if (rowField.type === "number") return undefined;
  if (rowField.type === "select" && rowField.options?.length) {
    return rowField.options[0]!.value;
  }
  return "";
}
