import type { TraceabilityMatrixData } from "@/types/traceability.types";

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildCsv(data: TraceabilityMatrixData): string {
  const rows: string[] = [];
  rows.push("section,label,linked,total,coverage_percent,status");
  for (const row of data.phaseArtifactLinks) {
    rows.push(
      [
        "phase_artifact",
        `${row.phaseNumber} ${row.phaseName}`,
        row.artifactsLinked.toString(),
        row.totalArtifactsRequired.toString(),
        row.coveragePercent.toString(),
        row.status,
      ].join(","),
    );
  }
  for (const row of data.requirementDesignLinks) {
    rows.push(
      [
        "requirement_design",
        row.label,
        row.designLinksTotal.toString(),
        row.requirementsTotal.toString(),
        row.coveragePercent.toString(),
        row.status,
      ].join(","),
    );
  }
  for (const row of data.requirementTestLinks) {
    rows.push(
      [
        "requirement_test",
        row.label,
        row.testLinksTotal.toString(),
        row.requirementsTotal.toString(),
        row.coveragePercent.toString(),
        row.status,
      ].join(","),
    );
  }
  for (const row of data.gateEvidenceLinks) {
    rows.push(
      [
        "gate_evidence",
        `${row.gateCode} ${row.gateName}`,
        row.evidenceLinked.toString(),
        row.requiredEvidence.toString(),
        row.coveragePercent.toString(),
        row.status,
      ].join(","),
    );
  }
  return rows.join("\n");
}

export function exportTraceabilityMatrix(data: TraceabilityMatrixData, format: "csv" | "json" | "pdf") {
  const baseName = `${data.project.code.toLowerCase()}-traceability-matrix`;
  switch (format) {
    case "json":
      triggerDownload(
        `${baseName}.json`,
        JSON.stringify(data, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    case "pdf":
      triggerDownload(
        `${baseName}.pdf`,
        "PDF package placeholder: route this to a backend reporting service.",
        "application/pdf",
      );
      return;
    case "csv":
      triggerDownload(`${baseName}.csv`, buildCsv(data), "text/csv;charset=utf-8");
      return;
    default: {
      const neverValue: never = format;
      throw new Error(`Unsupported export format: ${String(neverValue)}`);
    }
  }
}
