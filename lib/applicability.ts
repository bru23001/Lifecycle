export type Applicability = {
  data: boolean;
  apis: boolean;
  ui: boolean;
  modules: boolean;
  blueprint: boolean;
};

/** Defaults favor requiring architecture artifacts unless explicitly toggled off. */
export function parseApplicability(json: unknown): Applicability {
  const d =
    json && typeof json === "object"
      ? (json as Record<string, unknown>)
      : {};
  return {
    data: Boolean(d.data ?? true),
    apis: Boolean(d.apis ?? true),
    ui: Boolean(d.ui ?? true),
    modules: Boolean(d.modules ?? true),
    blueprint: Boolean(d.blueprint ?? false),
  };
}

export function applicabilityJsonFromForm(a: Applicability): Record<string, boolean> {
  return {
    data: a.data,
    apis: a.apis,
    ui: a.ui,
    modules: a.modules,
    blueprint: a.blueprint,
  };
}

export function summarizeApplicability(a: Applicability): string {
  return `Applicability — data:${a.data} apis:${a.apis} ui:${a.ui} modules:${a.modules} blueprint:${a.blueprint}`;
}

/** Merge structured ApplicabilityRecord rows over JSON baseline (dual-read). */
export function mergeApplicabilityRecords(
  base: Applicability,
  records: ReadonlyArray<{ key: string; applies: boolean }>,
): Applicability {
  const out: Applicability = { ...base };
  for (const r of records) {
    switch (r.key) {
      case "data":
        out.data = r.applies;
        break;
      case "apis":
        out.apis = r.applies;
        break;
      case "ui":
        out.ui = r.applies;
        break;
      case "modules":
        out.modules = r.applies;
        break;
      case "blueprint":
        out.blueprint = r.applies;
        break;
      default:
        break;
    }
  }
  return out;
}
