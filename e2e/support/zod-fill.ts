import { z } from "zod";

const E2E_DATE = "2026-05-16";
const E2E_TEXT = "E2E lifecycle test value with sufficient length for schema validation.";

type ZodDef = { type?: string; shape?: Record<string, z.ZodType>; element?: z.ZodType; options?: z.ZodType[]; entries?: Record<string, string> };

function zodDef(schema: z.ZodType): ZodDef {
  const inner = schema as z.ZodType & { _zod?: { def?: ZodDef }; _def?: ZodDef };
  return inner._zod?.def ?? inner._def ?? {};
}

function minStringLength(schema: z.ZodString): number {
  const checks = (schema as z.ZodString & { _zod?: { def?: { checks?: { kind?: string; value?: number }[] } } })._zod
    ?.def?.checks ?? [];
  let min = 10;
  for (const check of checks) {
    if (check.kind === "min" && typeof check.value === "number") {
      min = Math.max(min, check.value);
    }
  }
  return min;
}

function fillString(schema: z.ZodString): string {
  const min = minStringLength(schema);
  return E2E_TEXT.length >= min ? E2E_TEXT : E2E_TEXT.padEnd(min, ".");
}

function fillEnum(entries: Record<string, string>): string {
  const values = Object.values(entries);
  const preferred = [
    "Approved",
    "Feasible — Proceed to Requirements",
    "Proceed to Requirements",
    "Accept for Problem Definition",
    "Proceed to Evaluation and Selection",
    "Medium",
    "High",
    "Yes",
    "No",
    "Draft",
  ];
  for (const p of preferred) {
    if (values.includes(p)) return p;
  }
  return values[0] ?? "Approved";
}

export function fillZodValue(schema: z.ZodType, key?: string): unknown {
  const def = zodDef(schema);
  const type = def.type ?? schema.constructor.name;

  if (type === "optional" || type === "nullable") {
    const inner = (schema as z.ZodType & { unwrap: () => z.ZodType }).unwrap?.();
    if (inner) return fillZodValue(inner, key);
    return undefined;
  }

  if (type === "default") {
    const inner = (schema as z.ZodType & { removeDefault: () => z.ZodType }).removeDefault?.();
    if (inner) return fillZodValue(inner, key);
  }

  if (type === "object" && def.shape) {
    const out: Record<string, unknown> = {};
    for (const [field, child] of Object.entries(def.shape)) {
      out[field] = fillZodValue(child, field);
    }
    return out;
  }

  if (type === "array" && def.element) {
    return [fillZodValue(def.element, key)];
  }

  if (type === "string") {
    if (key?.toLowerCase().includes("date")) return E2E_DATE;
    if (key === "prcsPclCode" || key === "prcsCandidateApprovedProductId") return "N/A";
    if (key === "prcsNonApplicabilityRationale") {
      return "N/A for E2E lifecycle project — PRCS metadata not applicable in automated test harness.";
    }
    if (key === "contextDiagramMermaid" || key === "containerDiagramMermaid") {
      return "flowchart LR\n  A[E2E] --> B[Gate]\n  B --> C[Phase]";
    }
    return fillString(schema as z.ZodString);
  }

  if (type === "enum" && def.entries) {
    return fillEnum(def.entries);
  }

  if (type === "number" || type === "coerce") {
    return 3;
  }

  if (type === "boolean") {
    return true;
  }

  if (type === "literal") {
    return (def as { value?: unknown }).value;
  }

  if (type === "union" && def.options?.length) {
    return fillZodValue(def.options[0]!, key);
  }

  return E2E_TEXT;
}

export function buildTemplatePayload(
  schema: z.ZodType,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const base = fillZodValue(schema) as Record<string, unknown>;
  return { ...base, ...overrides };
}
