import type {
  ArtifactGateCoverage,
  EvidenceApprovalCoverage,
  GateEvidenceCoverage,
  PhaseArtifactCoverage,
  RequirementDesignCoverage,
  RequirementTestCoverage,
  TraceabilityGap,
  TraceabilityMatrixData,
} from "@/types/traceability.types";

export type TraceabilityExportScope =
  | "current_filters"
  | "full_matrix"
  | "gaps_only"
  | "requirement_coverage"
  | "gate_evidence_only";

export type TraceabilityExportFormat = "csv" | "json" | "pdf" | "zip";

export type TraceabilityExportOptions = {
  includeMetadata: boolean;
  includeGapDetails: boolean;
  includeEvidenceLinks: boolean;
  includeAuditReferences: boolean;
};

/** Row bundles used for `current_filters` exports (matrix client state). */
export type TraceabilityExportFilteredSlices = {
  phaseArtifactLinks: PhaseArtifactCoverage[];
  requirementDesignLinks: RequirementDesignCoverage[];
  requirementTestLinks: RequirementTestCoverage[];
  gateEvidenceLinks: GateEvidenceCoverage[];
  artifactGateLinks: ArtifactGateCoverage[];
  evidenceApprovalLinks: EvidenceApprovalCoverage[];
  traceabilityGaps: TraceabilityGap[];
};

export type TraceabilityExportViewModel = {
  full: TraceabilityMatrixData;
  filtered: TraceabilityExportFilteredSlices;
  /** Snapshot of active filters when the export modal was opened (metadata only). */
  filterSnapshot: TraceabilityMatrixData["filters"];
};

function triggerDownload(filename: string, content: string | Blob, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slicesFromFull(d: TraceabilityMatrixData): TraceabilityExportFilteredSlices {
  return {
    phaseArtifactLinks: d.phaseArtifactLinks,
    requirementDesignLinks: d.requirementDesignLinks,
    requirementTestLinks: d.requirementTestLinks,
    gateEvidenceLinks: d.gateEvidenceLinks,
    artifactGateLinks: d.artifactGateLinks,
    evidenceApprovalLinks: d.evidenceApprovalLinks,
    traceabilityGaps: d.traceabilityGaps,
  };
}

function pickSlices(vm: TraceabilityExportViewModel, scope: TraceabilityExportScope): TraceabilityExportFilteredSlices {
  const full = slicesFromFull(vm.full);
  switch (scope) {
    case "current_filters":
      return vm.filtered;
    case "full_matrix":
      return full;
    case "gaps_only":
      return {
        ...full,
        phaseArtifactLinks: [],
        requirementDesignLinks: [],
        requirementTestLinks: [],
        gateEvidenceLinks: [],
        artifactGateLinks: [],
        evidenceApprovalLinks: [],
        traceabilityGaps: vm.full.traceabilityGaps,
      };
    case "requirement_coverage":
      return {
        ...full,
        phaseArtifactLinks: [],
        gateEvidenceLinks: [],
        artifactGateLinks: [],
        evidenceApprovalLinks: [],
        traceabilityGaps: [],
      };
    case "gate_evidence_only":
      return {
        ...full,
        phaseArtifactLinks: [],
        requirementDesignLinks: [],
        requirementTestLinks: [],
        artifactGateLinks: [],
        evidenceApprovalLinks: [],
        traceabilityGaps: [],
      };
    default: {
      const _e: never = scope;
      void _e;
      return full;
    }
  }
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function gapRowToCsv(g: TraceabilityGap, withLinks: boolean): string[] {
  const base = [g.id, g.type, g.objectId, g.objectName, g.issue, g.impact];
  return withLinks ? [...base, g.href] : base;
}

function buildCsv(vm: TraceabilityExportViewModel, scope: TraceabilityExportScope, options: TraceabilityExportOptions): string {
  const s = pickSlices(vm, scope);
  const rows: string[] = [];
  const ev = options.includeEvidenceLinks;

  if (scope === "gaps_only") {
    const header = options.includeGapDetails
      ? ["id", "type", "object_id", "object_name", "issue", "impact", ...(ev ? ["href"] : [])]
      : ["id", "type", "object_id", "impact", ...(ev ? ["href"] : [])];
    rows.push(header.join(","));
    for (const g of s.traceabilityGaps) {
      const cells = options.includeGapDetails
        ? gapRowToCsv(g, ev)
        : [g.id, g.type, g.objectId, g.impact, ...(ev ? [g.href] : [])];
      rows.push(cells.map(escapeCsvCell).join(","));
    }
    return rows.join("\n");
  }

  rows.push("section,label,linked,total,coverage_percent,status" + (ev ? ",href" : ""));
  const pushCov = (section: string, label: string, linked: number, total: number, pct: number, status: string, href: string) => {
    const line = [section, label, String(linked), String(total), String(pct), status, ...(ev ? [href] : [])];
    rows.push(line.map(escapeCsvCell).join(","));
  };

  for (const row of s.phaseArtifactLinks) {
    pushCov(
      "phase_artifact",
      `${row.phaseNumber} ${row.phaseName}`,
      row.artifactsLinked,
      row.totalArtifactsRequired,
      row.coveragePercent,
      row.status,
      row.href,
    );
  }
  for (const row of s.requirementDesignLinks) {
    pushCov("requirement_design", row.label, row.designLinksTotal, row.requirementsTotal, row.coveragePercent, row.status, row.href);
  }
  for (const row of s.requirementTestLinks) {
    pushCov("requirement_test", row.label, row.testLinksTotal, row.requirementsTotal, row.coveragePercent, row.status, row.href);
  }
  for (const row of s.gateEvidenceLinks) {
    pushCov(
      "gate_evidence",
      `${row.gateCode} ${row.gateName}`,
      row.evidenceLinked,
      row.requiredEvidence,
      row.coveragePercent,
      row.status,
      row.href,
    );
  }
  if (s.traceabilityGaps.length > 0 && scope === "full_matrix") {
    rows.push("");
    rows.push("gaps");
    rows.push(
      ["id", "type", "object_id", "object_name", "issue", "impact", ...(ev ? ["href"] : [])].join(","),
    );
    for (const g of s.traceabilityGaps) {
      rows.push(gapRowToCsv(g, ev).map(escapeCsvCell).join(","));
    }
  }
  return rows.join("\n");
}

function enrichGap(g: TraceabilityGap, options: TraceabilityExportOptions): Record<string, unknown> {
  const o: Record<string, unknown> = {
    id: g.id,
    type: g.type,
    objectId: g.objectId,
    objectName: g.objectName,
    impact: g.impact,
  };
  if (options.includeGapDetails) {
    o.issue = g.issue;
  }
  if (options.includeEvidenceLinks) {
    o.href = g.href;
  }
  return o;
}

function stripLinks<T extends Record<string, unknown>>(row: T, keep: boolean): T {
  if (keep) return row;
  const { href, detailHref, ...rest } = row;
  void href;
  void detailHref;
  return rest as T;
}

function buildJsonEnvelope(
  vm: TraceabilityExportViewModel,
  scope: TraceabilityExportScope,
  options: TraceabilityExportOptions,
  slices: TraceabilityExportFilteredSlices,
): Record<string, unknown> {
  const generatedAt = new Date().toISOString();
  const meta: Record<string, unknown> = {
    generatedAt,
    scope,
    project: {
      id: vm.full.project.id,
      code: vm.full.project.code,
      name: vm.full.project.name,
    },
  };
  if (options.includeMetadata) {
    meta.filterSnapshot = vm.filterSnapshot;
    meta.exportOptions = options;
  }
  if (options.includeAuditReferences) {
    meta.auditReferences = [];
    meta.auditReferencesNote =
      "Reserved for future linkage to immutable audit index entries (no IDs exported in this release).";
  }

  if (scope === "gaps_only") {
    return {
      export: meta,
      gaps: slices.traceabilityGaps.map((g) => enrichGap(g, options)),
    };
  }

  const lk = options.includeEvidenceLinks;
  const matrix = {
    phaseArtifactLinks: slices.phaseArtifactLinks.map((r) => stripLinks({ ...r } as Record<string, unknown>, lk)),
    requirementDesignLinks: slices.requirementDesignLinks.map((r) => stripLinks({ ...r } as Record<string, unknown>, lk)),
    requirementTestLinks: slices.requirementTestLinks.map((r) => stripLinks({ ...r } as Record<string, unknown>, lk)),
    gateEvidenceLinks: slices.gateEvidenceLinks.map((r) => stripLinks({ ...r } as Record<string, unknown>, lk)),
    artifactGateLinks: slices.artifactGateLinks.map((r) => stripLinks({ ...r } as Record<string, unknown>, lk)),
    evidenceApprovalLinks: slices.evidenceApprovalLinks.map((r) => stripLinks({ ...r } as Record<string, unknown>, lk)),
    traceabilityGaps: slices.traceabilityGaps.map((g) => enrichGap(g, options)),
    coverageSummary: vm.full.coverageSummary,
  };
  return { export: meta, matrix };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtmlReport(vm: TraceabilityExportViewModel, scope: TraceabilityExportScope, options: TraceabilityExportOptions): string {
  const slices = pickSlices(vm, scope);
  const title = `${escapeHtml(vm.full.project.code)} — Traceability export`;
  const rowsHtml = (headers: string[], body: string[][]) => {
    const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
    const tr = body.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(String(c))}</td>`).join("")}</tr>`).join("");
    return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  };

  let body = "";
  if (scope === "gaps_only") {
    const headers = options.includeGapDetails
      ? ["Type", "Object", "Issue", "Impact", ...(options.includeEvidenceLinks ? ["Link"] : [])]
      : ["Type", "Object", "Impact"];
    const data = slices.traceabilityGaps.map((g) => {
      if (options.includeGapDetails) {
        return [
          g.type,
          `${g.objectId} ${g.objectName}`,
          g.issue,
          g.impact,
          ...(options.includeEvidenceLinks ? [g.href] : []),
        ];
      }
      return [g.type, g.objectId, g.impact];
    });
    body = `<h2>Gaps</h2>${rowsHtml(headers, data)}`;
  } else {
    const sec: string[] = [];
    if (slices.phaseArtifactLinks.length) {
      sec.push(
        `<h2>Phase artifacts</h2>${rowsHtml(
          ["Phase", "Linked", "Required", "%", "Status"],
          slices.phaseArtifactLinks.map((r) => [
            `${r.phaseNumber} ${r.phaseName}`,
            String(r.artifactsLinked),
            String(r.totalArtifactsRequired),
            String(r.coveragePercent),
            r.status,
          ]),
        )}`,
      );
    }
    if (slices.requirementDesignLinks.length) {
      sec.push(
        `<h2>Requirement → design</h2>${rowsHtml(
          ["Family", "Design links", "Requirements", "%", "Status"],
          slices.requirementDesignLinks.map((r) => [
            r.label,
            String(r.designLinksTotal),
            String(r.requirementsTotal),
            String(r.coveragePercent),
            r.status,
          ]),
        )}`,
      );
    }
    if (slices.requirementTestLinks.length) {
      sec.push(
        `<h2>Requirement → tests</h2>${rowsHtml(
          ["Family", "Tests", "Requirements", "%", "Status"],
          slices.requirementTestLinks.map((r) => [
            r.label,
            String(r.testLinksTotal),
            String(r.requirementsTotal),
            String(r.coveragePercent),
            r.status,
          ]),
        )}`,
      );
    }
    if (slices.gateEvidenceLinks.length) {
      sec.push(
        `<h2>Gate evidence</h2>${rowsHtml(
          ["Gate", "Linked", "Required", "%", "Status"],
          slices.gateEvidenceLinks.map((r) => [
            r.gateCode,
            String(r.evidenceLinked),
            String(r.requiredEvidence),
            String(r.coveragePercent),
            r.status,
          ]),
        )}`,
      );
    }
    body = sec.join("") || "<p>No rows in this export scope.</p>";
  }

  const metaBlock = options.includeMetadata
    ? `<pre>${escapeHtml(JSON.stringify({ scope, filters: vm.filterSnapshot }, null, 2))}</pre>`
    : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;font-size:14px}th{background:#f1f5f9}h1{font-size:22px}h2{font-size:16px;margin-top:24px}pre{background:#f8fafc;padding:12px;overflow:auto;font-size:12px}</style></head>
<body><h1>${title}</h1><p>Generated ${escapeHtml(new Date().toISOString())} · Scope: <strong>${escapeHtml(scope)}</strong></p>${metaBlock}${body}<p style="margin-top:32px;font-size:12px;color:#64748b">Use your browser Print dialog → Save as PDF for a PDF copy.</p></body></html>`;
}

export async function runTraceabilityExport(
  vm: TraceabilityExportViewModel,
  scope: TraceabilityExportScope,
  format: TraceabilityExportFormat,
  options: TraceabilityExportOptions,
): Promise<void> {
  const baseName = `${vm.full.project.code.toLowerCase()}-traceability`;
  const csv = buildCsv(vm, scope, options);
  const jsonStr = JSON.stringify(buildJsonEnvelope(vm, scope, options, pickSlices(vm, scope)), null, 2);
  const html = buildHtmlReport(vm, scope, options);

  if (format === "csv") {
    triggerDownload(`${baseName}-${scope}.csv`, csv, "text/csv;charset=utf-8");
    return;
  }
  if (format === "json") {
    triggerDownload(`${baseName}-${scope}.json`, jsonStr, "application/json;charset=utf-8");
    return;
  }
  if (format === "pdf") {
    triggerDownload(`${baseName}-${scope}.html`, html, "text/html;charset=utf-8");
    return;
  }
  if (format === "zip") {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    zip.file("README.txt", [
      "CYBERCUBE traceability export bundle",
      `Project: ${vm.full.project.code} (${vm.full.project.name})`,
      `Scope: ${scope}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      "Files:",
      "- matrix.csv — same layout as single CSV export",
      "- matrix.json — structured export envelope",
      "- report.html — printable report (use Print → Save as PDF)",
    ].join("\n"));
    zip.file("matrix.csv", csv);
    zip.file("matrix.json", jsonStr);
    zip.file("report.html", html);
    const blob = await zip.generateAsync({ type: "blob" });
    triggerDownload(`${baseName}-${scope}.zip`, blob, "application/zip");
    return;
  }
  const never: never = format;
  throw new Error(`Unsupported export format: ${String(never)}`);
}

/** Quick export of the full matrix (legacy one-click buttons). */
export function exportTraceabilityMatrix(data: TraceabilityMatrixData, format: "csv" | "json" | "pdf") {
  const vm: TraceabilityExportViewModel = {
    full: data,
    filtered: slicesFromFull(data),
    filterSnapshot: data.filters,
  };
  const options: TraceabilityExportOptions = {
    includeMetadata: false,
    includeGapDetails: true,
    includeEvidenceLinks: true,
    includeAuditReferences: false,
  };
  void runTraceabilityExport(vm, "full_matrix", format === "pdf" ? "pdf" : format, options).catch(() => {
    /* download errors are surfaced in devtools; modal path uses try/catch */
  });
}
