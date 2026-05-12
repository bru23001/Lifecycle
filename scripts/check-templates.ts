/**
 * Validates lifecycle template registry structure (sections, unique fields, schema presence).
 * Empty default values often fail strict Zod schemas — that is expected; we warn only.
 * Run: npm run check-templates
 * Flags: `--quiet-defaults` — log empty-default schema misses as INFO (CI-friendly).
 */
import { buildTemplateDefaultValues } from "@/lib/templateDefaultValues";
import {
  getAllTemplates,
  getTemplate,
  getTemplateIds,
  templateRegistry,
} from "@/templates/registry";
import type { TemplateField } from "@/templates/types";

function collectFieldNames(template: {
  sections: { fields: TemplateField[] }[];
}): string[] {
  const names: string[] = [];
  for (const s of template.sections) {
    for (const f of s.fields) {
      names.push(f.name);
    }
  }
  return names;
}

function assertUniqueFieldNames(templateId: string, names: string[]): string | null {
  const seen = new Set<string>();
  for (const n of names) {
    if (seen.has(n)) {
      return `Duplicate field name "${n}" in template ${templateId}`;
    }
    seen.add(n);
  }
  return null;
}

function main() {
  const quietDefaults =
    process.argv.includes("--quiet-defaults") ||
    process.env.CHECK_TEMPLATES_QUIET_DEFAULTS === "1";

  const ids = getTemplateIds();
  const templates = getAllTemplates();
  const structuralErrors: string[] = [];
  const defaultWarnings: string[] = [];

  if (templates.length === 0) {
    console.error("[check-templates] FAIL: no templates in registry.");
    process.exit(1);
  }

  for (const id of ids) {
    if (!(id in templateRegistry)) {
      structuralErrors.push(`Registry key missing export: ${id}`);
    }
  }

  for (const t of templates) {
    if (!t.templateId?.trim()) {
      structuralErrors.push("Template missing templateId");
      continue;
    }
    if (!Array.isArray(t.sections) || t.sections.length === 0) {
      structuralErrors.push(`${t.templateId}: no sections`);
      continue;
    }
    if (typeof t.schema?.safeParse !== "function") {
      structuralErrors.push(`${t.templateId}: invalid or missing Zod schema`);
      continue;
    }
    if (typeof t.toMarkdown !== "function") {
      structuralErrors.push(`${t.templateId}: missing toMarkdown`);
      continue;
    }

    const names = collectFieldNames(t);
    const dup = assertUniqueFieldNames(t.templateId, names);
    if (dup) structuralErrors.push(dup);

    try {
      getTemplate(t.templateId);
    } catch (e) {
      structuralErrors.push(
        `${t.templateId}: getTemplate threw: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    const defaults = buildTemplateDefaultValues(t);
    const parsed = t.schema.safeParse(defaults);
    if (!parsed.success) {
      defaultWarnings.push(t.templateId);
    }
  }

  if (structuralErrors.length > 0) {
    for (const e of structuralErrors) {
      console.error(`[check-templates] STRUCTURAL FAIL: ${e}`);
    }
    console.error(
      `[check-templates] ${structuralErrors.length} structural error(s).`,
    );
    process.exit(1);
  }

  if (defaultWarnings.length > 0) {
    if (quietDefaults) {
      console.log(
        `[check-templates] INFO: ${defaultWarnings.length} template(s) have empty defaults that do not satisfy strict schema (expected): ${defaultWarnings.join(", ")}`,
      );
    } else {
      console.warn(
        `[check-templates] WARN: empty defaults do not satisfy schema for ${defaultWarnings.length} template(s) (expected for strict forms): ${defaultWarnings.join(", ")}`,
      );
    }
  }

  console.log(
    `check-templates OK: ${templates.length} templates, structure valid.`,
  );
}

main();
